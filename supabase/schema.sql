-- Gestor-cpi — esquema inicial (ver docs/06-arquitectura.md)
-- Ejecutar en el SQL Editor de Supabase.

create table proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  contacto text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  stock numeric not null default 0,
  created_at timestamptz not null default now()
);

create table pedidos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('compra', 'venta')),
  proveedor_id uuid references proveedores (id),
  cliente_id uuid references clientes (id),
  -- compra: registrado | anulado; venta: pendiente_entrega | entregado | anulado
  estado text not null check (estado in ('registrado', 'pendiente_entrega', 'entregado', 'anulado')),
  moneda text not null check (moneda in ('USD', 'BS')),
  tasa_bs_por_usd numeric not null check (tasa_bs_por_usd > 0),
  monto_total numeric not null check (monto_total >= 0),
  fecha date not null default current_date,
  created_at timestamptz not null default now(),
  -- exactamente una contraparte según el tipo
  check (
    (tipo = 'compra' and proveedor_id is not null and cliente_id is null)
    or (tipo = 'venta' and cliente_id is not null and proveedor_id is null)
  )
);

create table pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos (id) on delete cascade,
  producto_id uuid not null references productos (id),
  cantidad numeric not null check (cantidad > 0),
  precio_unitario numeric not null check (precio_unitario >= 0)
);

create table abonos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos (id) on delete cascade,
  monto numeric not null check (monto > 0),
  moneda text not null check (moneda in ('USD', 'BS')),
  tasa_bs_por_usd numeric not null check (tasa_bs_por_usd > 0),
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

-- Operaciones multi-paso como funciones transaccionales (RF-004/005/009):
-- cada una corre completa o no corre, evitando pedidos sin items, stock sin
-- ajustar o dobles descuentos en reintentos.

-- p_items: [{"producto_id": uuid, "cantidad": n, "precio_unitario": n}, ...]
create function crear_pedido_compra(
  p_proveedor_id uuid,
  p_moneda text,
  p_tasa_bs_por_usd numeric,
  p_fecha date,
  p_items jsonb
) returns uuid
language plpgsql
as $$
declare
  v_pedido_id uuid;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido necesita al menos una línea de producto';
  end if;

  insert into pedidos (tipo, proveedor_id, estado, moneda, tasa_bs_por_usd, monto_total, fecha)
  select 'compra', p_proveedor_id, 'registrado', p_moneda, p_tasa_bs_por_usd,
         coalesce(sum((i->>'cantidad')::numeric * (i->>'precio_unitario')::numeric), 0), p_fecha
  from jsonb_array_elements(p_items) as i
  returning id into v_pedido_id;

  insert into pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
  select v_pedido_id, (i->>'producto_id')::uuid, (i->>'cantidad')::numeric,
         (i->>'precio_unitario')::numeric
  from jsonb_array_elements(p_items) as i;

  update productos p
  set stock = stock + i.cantidad
  from (
    select (i->>'producto_id')::uuid as producto_id, sum((i->>'cantidad')::numeric) as cantidad
    from jsonb_array_elements(p_items) as i
    group by 1
  ) as i
  where p.id = i.producto_id;

  return v_pedido_id;
end;
$$;

create function crear_pedido_venta(
  p_cliente_id uuid,
  p_moneda text,
  p_tasa_bs_por_usd numeric,
  p_fecha date,
  p_entrega_inmediata boolean,
  p_items jsonb
) returns uuid
language plpgsql
as $$
declare
  v_pedido_id uuid;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido necesita al menos una línea de producto';
  end if;

  insert into pedidos (tipo, cliente_id, estado, moneda, tasa_bs_por_usd, monto_total, fecha)
  select 'venta', p_cliente_id,
         case when p_entrega_inmediata then 'entregado' else 'pendiente_entrega' end,
         p_moneda, p_tasa_bs_por_usd,
         coalesce(sum((i->>'cantidad')::numeric * (i->>'precio_unitario')::numeric), 0), p_fecha
  from jsonb_array_elements(p_items) as i
  returning id into v_pedido_id;

  insert into pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
  select v_pedido_id, (i->>'producto_id')::uuid, (i->>'cantidad')::numeric,
         (i->>'precio_unitario')::numeric
  from jsonb_array_elements(p_items) as i;

  if p_entrega_inmediata then
    update productos p
    set stock = stock - i.cantidad
    from (
      select (i->>'producto_id')::uuid as producto_id, sum((i->>'cantidad')::numeric) as cantidad
      from jsonb_array_elements(p_items) as i
      group by 1
    ) as i
    where p.id = i.producto_id;
  end if;

  return v_pedido_id;
end;
$$;

-- El guard sobre estado hace la operación idempotente: un reintento tras un
-- fallo parcial no vuelve a descontar stock.
create function marcar_venta_entregada(p_pedido_id uuid)
returns void
language plpgsql
as $$
declare
  v_actualizado int;
begin
  update pedidos
  set estado = 'entregado'
  where id = p_pedido_id and tipo = 'venta' and estado = 'pendiente_entrega';
  get diagnostics v_actualizado = row_count;

  if v_actualizado = 0 then
    raise exception 'El pedido no es una venta pendiente de entrega';
  end if;

  update productos p
  set stock = stock - i.cantidad
  from (
    select producto_id, sum(cantidad) as cantidad
    from pedido_items
    where pedido_id = p_pedido_id
    group by 1
  ) as i
  where p.id = i.producto_id;
end;
$$;

-- Anulación (corrección de errores de captura): revierte el stock que el
-- pedido haya movido. Bloqueada si el pedido tiene abonos.
create function anular_pedido(p_pedido_id uuid)
returns void
language plpgsql
as $$
declare
  v_pedido pedidos%rowtype;
begin
  select * into v_pedido from pedidos where id = p_pedido_id for update;

  if not found then
    raise exception 'Pedido no encontrado';
  end if;
  if v_pedido.estado = 'anulado' then
    raise exception 'El pedido ya está anulado';
  end if;
  if exists (select 1 from abonos where pedido_id = p_pedido_id) then
    raise exception 'El pedido tiene abonos: elimínalos antes de anular';
  end if;

  -- compra registrada: el stock que entró se resta; venta entregada: el
  -- stock que salió se devuelve; venta pendiente: no movió stock.
  if (v_pedido.tipo = 'compra' and v_pedido.estado = 'registrado')
     or (v_pedido.tipo = 'venta' and v_pedido.estado = 'entregado') then
    update productos p
    set stock = stock + case when v_pedido.tipo = 'compra' then -i.cantidad else i.cantidad end
    from (
      select producto_id, sum(cantidad) as cantidad
      from pedido_items
      where pedido_id = p_pedido_id
      group by 1
    ) as i
    where p.id = i.producto_id;
  end if;

  update pedidos set estado = 'anulado' where id = p_pedido_id;
end;
$$;

create index pedidos_proveedor_idx on pedidos (proveedor_id) where proveedor_id is not null;
create index pedidos_cliente_idx on pedidos (cliente_id) where cliente_id is not null;
create index pedido_items_pedido_idx on pedido_items (pedido_id);
create index abonos_pedido_idx on abonos (pedido_id);

-- RLS: solo usuarios autenticados (RNF-006). Se amplía por roles cuando llegue F-08.
alter table proveedores enable row level security;
alter table clientes enable row level security;
alter table productos enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;
alter table abonos enable row level security;

create policy "authenticated full access" on proveedores for all to authenticated using (true) with check (true);
create policy "authenticated full access" on clientes for all to authenticated using (true) with check (true);
create policy "authenticated full access" on productos for all to authenticated using (true) with check (true);
create policy "authenticated full access" on pedidos for all to authenticated using (true) with check (true);
create policy "authenticated full access" on pedido_items for all to authenticated using (true) with check (true);
create policy "authenticated full access" on abonos for all to authenticated using (true) with check (true);

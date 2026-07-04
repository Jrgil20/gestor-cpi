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

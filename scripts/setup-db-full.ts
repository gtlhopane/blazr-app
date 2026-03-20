// Simple script to run SQL via Supabase Management API
const SUPABASE_URL = 'https://api.supabase.com/v1/projects/llsrgsbzhubwexbozerg/database/query'
const ACCESS_TOKEN = 'sbp_861d5a6875d7c5d32409a04706ba53186660a0d9'

async function runQuery(sql: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(SUPABASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'apikey': ACCESS_TOKEN,
    },
    body: JSON.stringify({ query: sql }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = Array.isArray(data) ? data.map((e: any) => e.message).join(', ') : (data.message || JSON.stringify(data))
    return { success: false, message: String(msg).slice(0, 120) }
  }
  return { success: true, message: 'OK' }
}

async function main() {
  console.log('Setting up Blazr Wholesale database...\n')

  const stmts = [
    `create extension if not exists "pgcrypto"`,

    // Enums
    `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('public','pending','buyer','admin'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE application_status AS ENUM ('pending','approved','rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE order_status AS ENUM ('draft','pending','quoted','confirmed','processing','shipped','delivered','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    `DO $$ BEGIN CREATE TYPE document_type AS ENUM ('quote','invoice','order_confirmation','delivery_note','other'); EXCEPTION WHEN duplicate_object THEN null; END $$`,

    // Profiles
    `create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, phone text, role user_role default 'public', avatar_url text, created_at timestamptz default now(), updated_at timestamptz default now())`,

    // Companies
    `create table if not exists public.companies (id uuid default gen_random_uuid() primary key, name text not null, registration_number text, vat_number text, address text, city text, province text, postal_code text, country text default 'South Africa', website text, created_at timestamptz default now(), updated_at timestamptz default now())`,

    // Buyer Applications
    `create table if not exists public.buyer_applications (id uuid default gen_random_uuid() primary key, user_id uuid references auth.users(id) on delete cascade, company_id uuid references public.companies(id), contact_name text not null, contact_email text not null, contact_phone text not null, business_license_url text, intent_description text, expected_volume text, status application_status default 'pending', reviewed_by uuid references auth.users(id), reviewed_at timestamptz, rejection_reason text, created_at timestamptz default now(), updated_at timestamptz default now())`,

    // Customer Accounts
    `create table if not exists public.customer_accounts (id uuid default gen_random_uuid() primary key, user_id uuid not null references auth.users(id) on delete cascade, company_id uuid not null references public.companies(id), buyer_name text not null, buyer_email text not null, buyer_phone text, credit_limit numeric default 0, payment_terms text default 'prepaid', notes text, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now())`,

    // Categories
    `create table if not exists public.categories (id uuid default gen_random_uuid() primary key, name text not null unique, slug text not null unique, description text, icon text, sort_order integer default 0, is_active boolean default true, created_at timestamptz default now())`,

    // Products
    `create table if not exists public.products (id uuid default gen_random_uuid() primary key, category_id uuid references public.categories(id), name text not null, slug text not null unique, description text, image_url text, unit text not null default 'unit', moq integer not null default 1, stock_level integer default 0, is_active boolean default true, is_featured boolean default false, created_at timestamptz default now(), updated_at timestamptz default now())`,

    // Product Variants
    `create table if not exists public.product_variants (id uuid default gen_random_uuid() primary key, product_id uuid not null references public.products(id) on delete cascade, name text not null, sku text unique, price numeric not null, compare_at_price numeric, stock integer default 0, is_active boolean default true, created_at timestamptz default now())`,

    // Pricing Tiers
    `create table if not exists public.pricing_tiers (id uuid default gen_random_uuid() primary key, name text not null, min_quantity integer not null, discount_percent numeric default 0, is_active boolean default true, created_at timestamptz default now())`,

    // Customer Prices
    `create table if not exists public.customer_prices (id uuid default gen_random_uuid() primary key, customer_account_id uuid not null references public.customer_accounts(id) on delete cascade, product_id uuid references public.products(id) on delete cascade, variant_id uuid references public.product_variants(id) on delete cascade, price numeric not null, valid_from timestamptz default now(), valid_until timestamptz, created_at timestamptz default now(), unique(customer_account_id, product_id, variant_id))`,

    // Carts
    `create table if not exists public.carts (id uuid default gen_random_uuid() primary key, customer_account_id uuid references public.customer_accounts(id), session_id text, status text default 'active', created_at timestamptz default now(), updated_at timestamptz default now())`,

    // Cart Items
    `create table if not exists public.cart_items (id uuid default gen_random_uuid() primary key, cart_id uuid not null references public.carts(id) on delete cascade, product_id uuid references public.products(id), variant_id uuid references public.product_variants(id), quantity integer not null default 1, unit_price numeric not null, created_at timestamptz default now())`,

    // Quotes
    `create table if not exists public.quotes (id uuid default gen_random_uuid() primary key, quote_number text unique, customer_account_id uuid references public.customer_accounts(id), status text default 'draft', subtotal numeric, discount_percent numeric default 0, total numeric, notes text, valid_until timestamptz, created_at timestamptz default now(), updated_at timestamptz default now())`,

    // Quote Items
    `create table if not exists public.quote_items (id uuid default gen_random_uuid() primary key, quote_id uuid not null references public.quotes(id) on delete cascade, product_id uuid references public.products(id), variant_id uuid references public.product_variants(id), description text, quantity integer not null, unit_price numeric not null, total numeric not null, created_at timestamptz default now())`,

    // Orders
    `create table if not exists public.orders (id uuid default gen_random_uuid() primary key, order_number text unique, customer_account_id uuid references public.customer_accounts(id), quote_id uuid references public.quotes(id), status order_status default 'pending', subtotal numeric, discount_percent numeric default 0, vat_percent numeric default 15, total numeric, delivery_address text, delivery_city text, delivery_province text, notes text, created_at timestamptz default now(), updated_at timestamptz default now())`,

    // Order Items
    `create table if not exists public.order_items (id uuid default gen_random_uuid() primary key, order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id), variant_id uuid references public.product_variants(id), description text, quantity integer not null, unit_price numeric not null, total numeric not null, created_at timestamptz default now())`,

    // Documents
    `create table if not exists public.documents (id uuid default gen_random_uuid() primary key, ref_type document_type not null, ref_id uuid not null, file_url text not null, file_name text, file_size integer, created_by uuid references auth.users(id), created_at timestamptz default now())`,

    // Approvals
    `create table if not exists public.approvals (id uuid default gen_random_uuid() primary key, approvable_type text not null, approvable_id uuid not null, approver_id uuid references auth.users(id), status text default 'pending', comment text, decided_at timestamptz, created_at timestamptz default now())`,

    // Audit Logs
    `create table if not exists public.audit_logs (id uuid default gen_random_uuid() primary key, user_id uuid references auth.users(id), action text not null, entity_type text, entity_id uuid, metadata jsonb, ip_address text, created_at timestamptz default now())`,

    // Trigger: auto-create profile on user signup
    `create or replace function public.handle_new_user() returns trigger as $$ begin insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email)); return new; end; $$ language plpgsql security definer`,

    `drop trigger if exists on_auth_user_created on auth.users`,

    `create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user()`,

    // RLS
    `alter table public.profiles enable row level security`,
    `alter table public.companies enable row level security`,
    `alter table public.buyer_applications enable row level security`,
    `alter table public.customer_accounts enable row level security`,
    `alter table public.categories enable row level security`,
    `alter table public.products enable row level security`,
    `alter table public.product_variants enable row level security`,
    `alter table public.pricing_tiers enable row level security`,
    `alter table public.customer_prices enable row level security`,
    `alter table public.carts enable row level security`,
    `alter table public.cart_items enable row level security`,
    `alter table public.quotes enable row level security`,
    `alter table public.quote_items enable row level security`,
    `alter table public.orders enable row level security`,
    `alter table public.order_items enable row level security`,
    `alter table public.documents enable row level security`,
    `alter table public.approvals enable row level security`,
    `alter table public.audit_logs enable row level security`,

    // RLS Policies
    // Profiles
    `create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id)`,
    `create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id)`,
    // Companies
    `create policy "companies_select_own" on public.companies for select using (exists (select 1 from public.customer_accounts where user_id = auth.uid() and customer_accounts.company_id = companies.id) or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    `create policy "companies_admin_all" on public.companies for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Buyer Applications
    `create policy "app_select_own" on public.buyer_applications for select using (auth.uid() = user_id)`,
    `create policy "app_insert_own" on public.buyer_applications for insert with check (auth.uid() = user_id)`,
    `create policy "app_admin_all" on public.buyer_applications for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Customer Accounts
    `create policy "cust_select_own" on public.customer_accounts for select using (auth.uid() = user_id)`,
    `create policy "cust_admin_all" on public.customer_accounts for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Categories
    `create policy "categories_public_select" on public.categories for select using (is_active = true)`,
    `create policy "categories_admin_all" on public.categories for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Products
    `create policy "products_public_select" on public.products for select using (is_active = true)`,
    `create policy "products_admin_all" on public.products for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Product Variants
    `create policy "variants_public_select" on public.product_variants for select using (is_active = true)`,
    `create policy "variants_admin_all" on public.product_variants for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Pricing Tiers
    `create policy "pricing_tiers_admin" on public.pricing_tiers for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Customer Prices
    `create policy "cust_prices_own" on public.customer_prices for select using (customer_account_id in (select id from public.customer_accounts where user_id = auth.uid()))`,
    `create policy "cust_prices_admin" on public.customer_prices for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Carts
    `create policy "carts_own" on public.carts for all using (customer_account_id in (select id from public.customer_accounts where user_id = auth.uid()))`,
    // Cart Items
    `create policy "cart_items_own" on public.cart_items for all using (cart_id in (select id from public.carts where customer_account_id in (select id from public.customer_accounts where user_id = auth.uid())))`,
    // Quotes
    `create policy "quotes_own" on public.quotes for select using (customer_account_id in (select id from public.customer_accounts where user_id = auth.uid()))`,
    `create policy "quotes_admin_all" on public.quotes for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Quote Items
    `create policy "quote_items_own" on public.quote_items for all using (quote_id in (select id from public.quotes where customer_account_id in (select id from public.customer_accounts where user_id = auth.uid())))`,
    // Orders
    `create policy "orders_own" on public.orders for select using (customer_account_id in (select id from public.customer_accounts where user_id = auth.uid()))`,
    `create policy "orders_admin_all" on public.orders for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Order Items
    `create policy "order_items_own" on public.order_items for all using (order_id in (select id from public.orders where customer_account_id in (select id from public.customer_accounts where user_id = auth.uid())))`,
    `create policy "order_items_admin" on public.order_items for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Documents
    `create policy "docs_own" on public.documents for all using (ref_id in (select id from public.orders where customer_account_id in (select id from public.customer_accounts where user_id = auth.uid())) or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Approvals
    `create policy "approvals_admin" on public.approvals for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
    // Audit Logs
    `create policy "audit_admin" on public.audit_logs for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))`,
  ]

  let passed = 0
  let failed = 0

  for (const stmt of stmts) {
    if (!stmt.trim()) continue
    process.stdout.write(`  ${(stmt.slice(0, 70) + '...').padEnd(73)} `)
    const result = await runQuery(stmt)
    if (result.success) {
      console.log('✓')
      passed++
    } else {
      if (result.message.includes('already exists') || result.message.includes('duplicate') || result.message.includes('does not exist')) {
        console.log('⊘ (skipped)')
      } else {
        console.log(`✗ ${result.message}`)
        failed++
      }
    }
  }

  console.log(`\n✅ Schema complete — ${passed} passed, ${failed} failed`)
}

main().catch(console.error)

-- SiteSpecCalc schema for programmatic calculator pages.
-- Safe to run in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.calculators (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  cluster text not null check (cluster in ('concrete-masonry', 'electrical-solar', 'framing-roofing', 'freight-logistics')),
  title text not null,
  short_description text not null,
  formula_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.programmatic_presets (
  id uuid primary key default gen_random_uuid(),
  calculator_slug text not null references public.calculators (slug) on update cascade,
  preset_slug text not null unique,
  h1_title text not null,
  meta_title text not null,
  meta_description text not null,
  default_inputs jsonb not null,
  engineering_notes_html text not null,
  code_compliance_reference text not null,
  faqs jsonb not null default '[]'::jsonb,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.material_cost_benchmarks (
  id uuid primary key default gen_random_uuid(),
  material_key text not null unique,
  name text not null,
  unit_imperial text not null,
  unit_metric text not null,
  default_cost_usd numeric not null,
  density_kg_m3 numeric,
  updated_at timestamptz not null default now()
);

create index if not exists calculators_cluster_idx on public.calculators (cluster);
create index if not exists programmatic_presets_calculator_slug_idx on public.programmatic_presets (calculator_slug);
create index if not exists programmatic_presets_preset_slug_idx on public.programmatic_presets (preset_slug);

alter table public.calculators enable row level security;
alter table public.programmatic_presets enable row level security;
alter table public.material_cost_benchmarks enable row level security;

drop policy if exists calculators_public_read on public.calculators;
create policy calculators_public_read on public.calculators
  for select to anon, authenticated using (true);

drop policy if exists programmatic_presets_public_read on public.programmatic_presets;
create policy programmatic_presets_public_read on public.programmatic_presets
  for select to anon, authenticated using (is_published = true);

drop policy if exists material_cost_benchmarks_public_read on public.material_cost_benchmarks;
create policy material_cost_benchmarks_public_read on public.material_cost_benchmarks
  for select to anon, authenticated using (true);

insert into public.calculators (slug, cluster, title, short_description, formula_version)
values
  ('concrete-slab-rebar-calculator', 'concrete-masonry', 'Concrete Slab, Rebar, and Bag Calculator', 'Volume, rebar, bags, and ready-mix for a slab-on-ground.', 'SSC-2026.1'),
  ('wire-size-voltage-drop-calculator', 'electrical-solar', 'Wire Size and Voltage Drop Calculator', 'AWG and mm2 conductor sizing with voltage drop.', 'SSC-2026.1'),
  ('stair-stringer-layout-calculator', 'framing-roofing', 'Stair Stringer Layout Calculator', 'Equal risers, run, and 2x12 stringer length.', 'SSC-2026.1'),
  ('roof-pitch-rafter-calculator', 'framing-roofing', 'Roof Pitch and Common Rafter Calculator', 'Pitch, rafter length, squares, and sheathing.', 'SSC-2026.1'),
  ('container-pallet-weight-calculator', 'freight-logistics', 'Pallet, Container CBM, and Dimensional Weight Calculator', 'Pallet slots, CBM, payload, and billable weight.', 'SSC-2026.1')
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  formula_version = excluded.formula_version;

insert into public.material_cost_benchmarks (material_key, name, unit_imperial, unit_metric, default_cost_usd, density_kg_m3)
values
  ('concrete-4000', '4000 PSI ready-mix', 'yd3', 'm3', 165, 2403),
  ('bag-80', '80 lb concrete bag', 'bag', 'bag', 6.75, 2403),
  ('bag-60', '60 lb concrete bag', 'bag', 'bag', 5.40, 2403),
  ('rebar-3', '#3 rebar', '20 ft bar', '6 m bar', 8.50, 7850),
  ('rebar-4', '#4 rebar', '20 ft bar', '6 m bar', 14.00, 7850),
  ('rebar-5', '#5 rebar', '20 ft bar', '6 m bar', 22.00, 7850),
  ('wire-copper', 'Copper building wire', 'ft', 'm', 2.35, 8960),
  ('wire-aluminum', 'Aluminum building wire', 'ft', 'm', 1.05, 2700),
  ('shingle-bundle', 'Architectural shingle bundle', 'bundle', 'bundle', 42, null),
  ('cdx-sheet', '4x8 CDX sheet', 'sheet', 'sheet', 28, null),
  ('underlayment-roll', 'Underlayment roll', 'roll', 'roll', 55, null),
  ('lumber-2x12', '2x12 stringer stock', 'ft', 'm', 2.10, 530)
on conflict (material_key) do update set
  name = excluded.name,
  default_cost_usd = excluded.default_cost_usd,
  updated_at = now();

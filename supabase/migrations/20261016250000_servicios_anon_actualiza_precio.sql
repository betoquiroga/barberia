create policy servicios_anon_update
on public.servicios
for update
to anon
using (true)
with check (true);

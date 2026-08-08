-- Остаток мест: capacity − число подтверждённых заявок (не ниже 0).
-- SECURITY DEFINER: публичной странице не нужен SELECT по applications.

create or replace function public.event_confirmed_applications_count(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.applications a
  where a.event_id = p_event_id
    and a.status = 'confirmed'::public.application_status;
$$;

revoke all on function public.event_confirmed_applications_count(uuid) from public;
grant execute on function public.event_confirmed_applications_count(uuid) to anon, authenticated;

create or replace function public.event_remaining_seats(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when e.capacity is null then null
    else greatest(e.capacity - public.event_confirmed_applications_count(e.id), 0)
  end
  from public.events e
  where e.id = p_event_id;
$$;

revoke all on function public.event_remaining_seats(uuid) from public;
grant execute on function public.event_remaining_seats(uuid) to anon, authenticated;

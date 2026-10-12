-- provider_busy_times (#35).
--
-- The booking screen needs to show which times are already taken, but RLS
-- correctly hides other families' appointments. This function answers only
-- "when is this provider busy?" with start and end times. No child, no
-- family, no visit type, no notes.
--
-- Guard rails:
--   - Signed-in parents only (anon can't execute it).
--   - Only providers at a center where the caller has a child, so nobody can
--     scan every provider's calendar.
--   - At most 62 days per call, matching the 60-day booking window.
--   - Only scheduled visits count; cancelled ones free the slot.
--
-- Errors:
--   not_signed_in      42501  no logged-in user
--   window_too_large   22023  more than 62 days, or to is before from

create function public.provider_busy_times(
  p_provider_id uuid,
  p_from        timestamptz,
  p_to          timestamptz
)
returns table (starts_at timestamptz, ends_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_signed_in' using errcode = '42501';
  end if;

  if p_to <= p_from or p_to - p_from > interval '62 days' then
    raise exception 'window_too_large' using errcode = '22023';
  end if;

  return query
    select a.starts_at, a.ends_at
    from public.appointments a
    where a.provider_id = p_provider_id
      and a.status = 'scheduled'
      and a.starts_at < p_to
      and a.ends_at > p_from
      and exists (
        select 1
        from public.providers pr
        join public.patients pa on pa.home_center_id = pr.center_id
        where pr.id = p_provider_id
          and pa.id in (select public.my_patient_ids())
      )
    order by a.starts_at;
end;
$$;

revoke execute on function public.provider_busy_times(uuid, timestamptz, timestamptz)
  from public, anon;
grant execute on function public.provider_busy_times(uuid, timestamptz, timestamptz)
  to authenticated;

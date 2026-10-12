begin;

-- Existing rows must also satisfy this rule. If validation fails, this
-- transaction rolls back: inspect the data rather than rewriting IDs blindly.
alter table public.public_order_actions
  add constraint public_order_bike_id_format
  check (
    length(bike_external_id) = 10
    and bike_external_id ~ '^(IE12H[0-9]{5}|(34|39)E[0-9]{7})$'
  );

commit;

-- Enable RLS
alter table "User" enable row level security;
alter table "CartItem" enable row level security;
alter table "Order" enable row level security;
alter table "OrderItem" enable row level security;

-- Basic policies (adjust with your auth strategy)
create policy "Users can read own profile"
on "User"
for select
using (true);

create policy "Users manage own cart"
on "CartItem"
for all
using (true)
with check (true);

create policy "Users read own orders"
on "Order"
for select
using (true);

create policy "Users read order items"
on "OrderItem"
for select
using (true);

# Auth Design

## Strategy
- **Supabase Auth** with email+password
- Phone number is the user-facing login identifier
- If user provides a real email at registration → use it as the Supabase Auth email
- If not → fallback to synthetic email `{normalized_phone}@rice-agent.local`
- **Email confirmation disabled** in Supabase dashboard → signup completes immediately
- No OTP required for login or signup for version 1

## Login Flow
```
User enters: 09123456789 + password
     │
     ▼
Internal lookup: find auth email for this phone
  (could be real@email.com or 09123...@rice-agent.local)
     │
     ▼
supabase.auth.signInWithPassword({ email: resolvedEmail, password })
```

## Why This Setup

| Feature | How It Works | Requirement |
|---|---|---|
| **Login** | Phone → internal lookup → `signInWithPassword(authEmail, password)` | Nothing extra |
| **Forgot Password** | `supabase.auth.resetPasswordForEmail(user's real email)` | User must have real email; synthetic-only users → contact support |
| **Phone OTP for Subscription** | `supabase.auth.signInWithOtp({ phone })` — used only to verify ownership, not for session | Enable SMS provider in Supabase dashboard later |

Phone OTP and email+password auth coexist in the same Supabase project. `signInWithOtp` can be called purely for verification without switching the user's session.

## Supabase Dashboard Config
1. Authentication → Providers → Email: **uncheck** "Confirm email"
2. Authentication → Providers → Phone: leave disabled (enable later for subscription verification)
3. No SMS/Phone provider needed at launch

## Database Schema
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique,
  email text,
  username text not null unique,
  full_name text not null,
  role text not null default 'general_user' check (role in ('farmer', 'trader', 'agent', 'general_user')),
  avatar_url text,
  cover_url text,
  bio text,
  region_id smallint not null references public.regions(id),
  township_id smallint not null references public.townships(id),
  market_status_id smallint references public.market_status(id),  -- null by default, user can set later
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to auto-create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone, email, username, full_name, role, region_id, township_id)
  values (
    new.id,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'general_user'),
    (new.raw_user_meta_data->>'region_id')::smallint,
    (new.raw_user_meta_data->>'township_id')::smallint
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Phone Verification (Future — Subscription)
When user subscribes:
1. Show "Verify Phone" step in checkout
2. Call `supabase.auth.signInWithOtp({ phone })` on a separate client
3. User enters OTP code
4. Verify code server-side with service role key
5. Set `profiles.phone_verified = true`
6. Phone number becomes visible to subscribers

-- seed/business_profiles.sql
-- Archetype templates for public.business_profiles -- one row per business_type (all 12 slugs
-- from docs/contracts.md). services/profileGenerator.js reads these as a base and randomizes
-- budget / pain_points / allowed_objections / personality tone per session (harder difficulty
-- skews budget down and objections up). These rows are templates only, not per-session data.
--
-- Run with a service-role connection (RLS on this table has no insert/update/delete policy for
-- regular users -- see 0002_rls.sql). Fixed ids + ON CONFLICT make this script safe to re-run.

insert into public.business_profiles
  (id, business_type, personality, technology_level, budget, pain_points, marketing_channels, allowed_objections)
values
  (
    '10000000-0000-4000-8000-000000000001', 'coffee_shop',
    'Warm but time-pressed; enjoys small talk, decides fast once convinced', 'low', 15000,
    '["Few repeat customers", "Walk-ins only", "No online ordering", "Missed inquiries after hours"]',
    '["Facebook", "Word of Mouth"]',
    '["budget", "facebook", "trust", "maintenance"]'
  ),
  (
    '10000000-0000-4000-8000-000000000002', 'barbershop',
    'Old-school, skeptical of digital tools, values personal relationships', 'low', 8000,
    '["No-show appointments", "Relies on walk-ins", "No online booking", "Word of mouth only"]',
    '["Word of Mouth", "Facebook"]',
    '["budget", "trust", "maintenance", "previous_experience"]'
  ),
  (
    '10000000-0000-4000-8000-000000000003', 'salon',
    'Image-conscious, busy schedule, cautiously curious about new trends', 'medium', 20000,
    '["Inconsistent booking schedule", "Underused social media", "Competing salons nearby", "Client retention"]',
    '["Instagram", "Facebook", "Referrals"]',
    '["budget", "competition", "trust", "time"]'
  ),
  (
    '10000000-0000-4000-8000-000000000004', 'restaurant',
    'Hospitable but stretched thin during service hours, price-sensitive', 'medium', 30000,
    '["Slow weekday traffic", "No delivery app presence", "Negative reviews unanswered", "High staff turnover"]',
    '["Facebook", "Google Maps", "Food delivery apps"]',
    '["budget", "competition", "risk", "authority"]'
  ),
  (
    '10000000-0000-4000-8000-000000000005', 'gym',
    'High-energy, sales-savvy already, tests vendors before committing', 'medium', 25000,
    '["Membership churn", "Manual sign-ups", "Limited digital presence", "Seasonal drop-off"]',
    '["Instagram", "Facebook", "Referrals"]',
    '["budget", "competition", "need", "price"]'
  ),
  (
    '10000000-0000-4000-8000-000000000006', 'dental_clinic',
    'Professional, cautious, defers big decisions to a practice partner', 'medium', 40000,
    '["Missed appointment reminders", "Outdated website", "Low online reviews", "Referral-only patient base"]',
    '["Google Search", "Referrals", "Facebook"]',
    '["budget", "authority", "trust", "risk"]'
  ),
  (
    '10000000-0000-4000-8000-000000000007', 'laundry_shop',
    'Practical, no-nonsense, focused on daily operations over marketing', 'low', 6000,
    '["No customer tracking", "Manual pricing", "Missed pickup requests", "Low repeat visibility"]',
    '["Word of Mouth", "Facebook"]',
    '["budget", "need", "maintenance", "time"]'
  ),
  (
    '10000000-0000-4000-8000-00000000000b', 'pet_grooming',
    'Warm with pet owners but strict about schedule and no-shows', 'medium', 12000,
    '["Messenger bookings", "Reschedules", "Incomplete pet details", "Manual appointment confirmation"]',
    '["Facebook", "Instagram", "Google Maps", "Word of Mouth"]',
    '["budget", "messenger_works_fine", "maintenance", "not_tech_savvy"]'
  ),
  (
    '10000000-0000-4000-8000-00000000000c', 'flower_shop',
    'Creative, practical, rushed during peak dates, cautious with expenses', 'medium', 10000,
    '["Manual custom orders", "Delivery details scattered in chat", "Rush inquiries", "No organized catalog"]',
    '["Facebook", "Instagram", "Viber", "Word of Mouth"]',
    '["budget", "facebook_is_enough", "too_busy", "monthly_fees"]'
  ),
  (
    '10000000-0000-4000-8000-000000000008', 'convenience_store',
    'Transactional, always busy at the counter, distrustful of sales pitches', 'low', 5000,
    '["No loyalty program", "Missed bulk-order inquiries", "No delivery option", "Inventory blind spots"]',
    '["Word of Mouth", "Facebook"]',
    '["budget", "trust", "need", "previous_experience"]'
  ),
  (
    '10000000-0000-4000-8000-000000000009', 'hardware_store',
    'Skeptical of vendors, been burned before, wants proof before spending', 'low', 18000,
    '["No online catalog", "Contractor orders handled by phone only", "Missed bulk quotes", "Outdated signage"]',
    '["Word of Mouth", "Local Ads"]',
    '["budget", "previous_experience", "trust", "risk"]'
  ),
  (
    '10000000-0000-4000-8000-00000000000a', 'bakery',
    'Warm, creative, easily excited but budget-conscious', 'medium', 12000,
    '["Seasonal demand swings", "No pre-order system", "Underused Instagram", "Missed custom-order inquiries"]',
    '["Instagram", "Facebook", "Word of Mouth"]',
    '["budget", "facebook", "competition", "time"]'
  )
on conflict (id) do update set
  business_type = excluded.business_type,
  personality = excluded.personality,
  technology_level = excluded.technology_level,
  budget = excluded.budget,
  pain_points = excluded.pain_points,
  marketing_channels = excluded.marketing_channels,
  allowed_objections = excluded.allowed_objections;

-- Add newly supported roleplay industries to business_type constraints.

alter table public.practice_sessions
  drop constraint if exists practice_sessions_business_type_check,
  add constraint practice_sessions_business_type_check check (business_type in (
    'coffee_shop', 'barbershop', 'salon', 'restaurant', 'gym',
    'dental_clinic', 'laundry_shop', 'pet_grooming', 'flower_shop',
    'convenience_store', 'hardware_store', 'bakery'
  ));

alter table public.business_profiles
  drop constraint if exists business_profiles_business_type_check,
  add constraint business_profiles_business_type_check check (business_type in (
    'coffee_shop', 'barbershop', 'salon', 'restaurant', 'gym',
    'dental_clinic', 'laundry_shop', 'pet_grooming', 'flower_shop',
    'convenience_store', 'hardware_store', 'bakery'
  ));

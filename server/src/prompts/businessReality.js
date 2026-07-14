// Operational reality data for Philippine SMEs. Extend this map with new industries instead of
// adding industry-specific rules to roleplay.js.
export const BUSINESS_REALITY = {
  coffee_shop: {
    label: 'Coffee Shop',
    industry: 'Food and Beverage',
    revenueSources: ['Walk-ins', 'Regular customers', 'Small events', 'Delivery app orders'],
    marketingChannels: ['Facebook', 'Instagram', 'Google Maps', 'Word of Mouth', 'TikTok'],
    orderSources: ['Walk-ins', 'Messenger inquiries', 'Foodpanda', 'GrabFood', 'Phone calls'],
    bookingProcess: 'Usually no formal booking; reservations or bulk orders happen through Messenger or phone.',
    currentSoftware: ['Facebook Page', 'Messenger', 'GCash', 'Foodpanda', 'GrabFood'],
    currentProblems: [
      'Slow afternoons',
      'Repeat customers forget promos',
      'Missed Messenger inquiries during rush hours',
      'Delivery app commissions reduce margins',
      'Customers keep asking for menu, location, and hours'
    ],
    technologyLevels: ['Low', 'Medium', 'Medium'],
    painPoints: [
      'Few repeat customers',
      'Relies on walk-ins only',
      'Missed inquiries after hours',
      'Slow afternoons',
      'Hard to stand out from nearby cafes'
    ]
  },
  salon: {
    label: 'Salon',
    industry: 'Beauty and Personal Care',
    revenueSources: ['Hair services', 'Nail services', 'Treatments', 'Product sales', 'Packages'],
    marketingChannels: ['Facebook', 'Instagram', 'TikTok', 'Word of Mouth', 'Promos'],
    orderSources: ['Messenger bookings', 'Walk-ins', 'Phone calls', 'Referrals'],
    bookingProcess: 'Appointments are often written in a notebook or handled manually in Messenger.',
    currentSoftware: ['Facebook Page', 'Messenger', 'Notebook', 'GCash'],
    currentProblems: [
      'Double bookings',
      'Missed Messenger inquiries',
      'Empty slots between appointments',
      'Customers ask the same price questions',
      'Hard to show before-and-after work in an organized way'
    ],
    technologyLevels: ['Low', 'Medium', 'Medium'],
    painPoints: [
      'No online booking',
      'Empty slots between appointments',
      'Hard to show before and after work',
      'Depends on suki only',
      'Missed inquiries on Messenger'
    ]
  },
  barbershop: {
    label: 'Barbershop',
    industry: 'Grooming',
    revenueSources: ['Haircuts', 'Shaves', 'Hair color', 'Grooming products'],
    marketingChannels: ['Facebook', 'Word of Mouth', 'Tarpaulin outside', 'Referrals'],
    orderSources: ['Walk-ins', 'Messenger appointments', 'Phone calls'],
    bookingProcess: 'Mostly walk-ins; some regulars message ahead but the schedule is manual.',
    currentSoftware: ['Facebook Page', 'Messenger', 'Notebook'],
    currentProblems: [
      'Long queues turn customers away',
      'Idle chairs on weekdays',
      'Manual appointment tracking',
      'Customers ask barber availability repeatedly',
      'No simple way to show services and prices'
    ],
    technologyLevels: ['Low', 'Low', 'Medium'],
    painPoints: [
      'Walk-ins only, no bookings',
      'Long queues turn customers away',
      'Idle chairs on weekdays',
      'No way to show haircut styles',
      'Regulars forget to come back'
    ]
  },
  laundry_shop: {
    label: 'Laundry Shop',
    industry: 'Local Services',
    revenueSources: ['Wash-dry-fold', 'Pickup and delivery', 'Ironing', 'Bulk laundry'],
    marketingChannels: ['Facebook', 'Word of Mouth', 'Tarpaulin outside', 'Flyers'],
    orderSources: ['Walk-ins', 'Phone calls', 'Messenger', 'Nearby residents'],
    bookingProcess: 'Pickup requests and status checks are handled by phone or Messenger, then noted manually.',
    currentSoftware: ['Messenger', 'Phone', 'Notebook', 'GCash'],
    currentProblems: [
      'Customers call repeatedly to check if laundry is ready',
      'Pickup schedules are easy to mix up',
      'Staff write orders manually',
      'Hard to promote pickup service',
      'Quiet periods depend on weather and nearby foot traffic'
    ],
    technologyLevels: ['Low', 'Low', 'Medium'],
    painPoints: [
      'Customers call to check if laundry is ready',
      'Relies on walk-ins only',
      'No pickup scheduling',
      'Hard to reach new customers',
      'Quiet during rainy season'
    ]
  },
  pet_grooming: {
    label: 'Pet Grooming',
    industry: 'Pet Services',
    revenueSources: ['Grooming packages', 'Nail trimming', 'Pet supplies', 'Vet referrals'],
    marketingChannels: ['Facebook', 'Instagram', 'Google Maps', 'Word of Mouth'],
    orderSources: ['Messenger bookings', 'Phone calls', 'Walk-ins', 'Referrals'],
    bookingProcess: 'Bookings happen on Messenger, sometimes tracked in Google Calendar or a notebook.',
    currentSoftware: ['Messenger', 'Facebook Page', 'Google Calendar', 'GCash'],
    currentProblems: [
      'Owners ask package prices repeatedly',
      'Slots depend on pet size and temperament',
      'Reschedules are messy',
      'Hard to collect pet details before appointment',
      'Customers want photo proof or updates'
    ],
    technologyLevels: ['Medium', 'Medium', 'Low'],
    painPoints: [
      'Manual appointment confirmation',
      'Hard to collect pet details',
      'Missed Messenger inquiries',
      'Reschedules create confusion',
      'No organized package menu'
    ]
  },
  flower_shop: {
    label: 'Flower Shop',
    industry: 'Retail and Gifts',
    revenueSources: ['Bouquets', 'Event flowers', 'Same-day delivery', 'Custom arrangements'],
    marketingChannels: ['Facebook', 'Instagram', 'Viber', 'Word of Mouth', 'Google Maps'],
    orderSources: ['Messenger', 'Viber', 'Phone calls', 'Walk-ins'],
    bookingProcess: 'Orders are manually confirmed through chat, with payment proof sent by GCash or bank transfer.',
    currentSoftware: ['Messenger', 'Viber', 'GCash', 'Notebook'],
    currentProblems: [
      'Custom orders need many back-and-forth messages',
      'Rush orders interrupt staff',
      'Payment proof and delivery details are scattered',
      'Hard to show available designs clearly',
      'Peak dates get chaotic'
    ],
    technologyLevels: ['Low', 'Medium', 'Medium'],
    painPoints: [
      'Manual order taking',
      'Delivery details get mixed up',
      'Missed rush order inquiries',
      'No organized catalog',
      'Too much back-and-forth for custom flowers'
    ]
  },
  bakery: {
    label: 'Bakery',
    industry: 'Food Retail',
    revenueSources: ['Walk-in bread sales', 'Cake orders', 'Bulk orders', 'GCash payments'],
    marketingChannels: ['Facebook', 'Instagram', 'Word of Mouth', 'Flyers'],
    orderSources: ['Walk-ins', 'Messenger', 'Phone calls', 'Referrals'],
    bookingProcess: 'Custom cake orders are collected manually by Messenger, phone, or notebook.',
    currentSoftware: ['Facebook Page', 'Messenger', 'GCash', 'Notebook'],
    currentProblems: [
      'Customers ask for cake designs and prices repeatedly',
      'Custom order details can be incomplete',
      'Rush orders disrupt production',
      'Slow weekday sales',
      'No organized product catalog'
    ],
    technologyLevels: ['Low', 'Medium', 'Medium'],
    painPoints: [
      'Sells only to walk-ins',
      'Cannot take cake orders online',
      'Hard to show the product catalog',
      'Missed inquiries for custom orders',
      'Slow weekday sales'
    ]
  },
  restaurant: {
    label: 'Restaurant',
    industry: 'Food and Beverage',
    revenueSources: ['Dine-in', 'Takeout', 'Delivery apps', 'Catering', 'Direct orders'],
    marketingChannels: ['Facebook', 'Instagram', 'Food delivery apps', 'Word of Mouth', 'Flyers'],
    orderSources: ['Walk-ins', 'Foodpanda', 'GrabFood', 'Messenger', 'Phone calls'],
    bookingProcess: 'Orders come from delivery apps or chat; reservations are usually phone/Messenger.',
    currentSoftware: ['Facebook Page', 'Messenger', 'Foodpanda', 'GrabFood', 'GCash'],
    currentProblems: [
      'Delivery app commissions cut margins',
      'Customers ask for menu repeatedly',
      'Direct orders are hard to manage',
      'Cannot take reservations online',
      'Promos get buried on social media'
    ],
    technologyLevels: ['Low', 'Medium', 'High'],
    painPoints: [
      'No online menu',
      'Relies on foot traffic',
      'Delivery apps eat the margin',
      'Cannot take reservations online',
      'Hard to reach new customers'
    ]
  },
  gym: {
    label: 'Gym',
    industry: 'Fitness',
    revenueSources: ['Memberships', 'Walk-in sessions', 'Personal training', 'Classes'],
    marketingChannels: ['Facebook', 'Instagram', 'Word of Mouth', 'Tarpaulin', 'Referrals'],
    orderSources: ['Walk-ins', 'Messenger inquiries', 'Phone calls', 'Referrals'],
    bookingProcess: 'Signups and class questions are answered manually by staff.',
    currentSoftware: ['Facebook Page', 'Messenger', 'Spreadsheet', 'Notebook'],
    currentProblems: [
      'Manual membership tracking',
      'Members lapse without follow-up',
      'Class schedules are hard to promote',
      'Few online signups',
      'Slow enrollment months'
    ],
    technologyLevels: ['Medium', 'Medium', 'High'],
    painPoints: [
      'Members cancel and never return',
      'No online sign-up',
      'Manual membership tracking',
      'Hard to promote classes',
      'Slow enrollment months'
    ]
  },
  dental_clinic: {
    label: 'Dental Clinic',
    industry: 'Healthcare Services',
    revenueSources: ['Consultations', 'Cleaning', 'Braces', 'Procedures', 'Follow-up appointments'],
    marketingChannels: ['Facebook', 'Google Maps', 'Word of Mouth', 'Referrals', 'Clinic signage'],
    orderSources: ['Phone appointments', 'Messenger', 'Walk-ins', 'Referrals'],
    bookingProcess: 'Appointments are booked by phone or Messenger and tracked manually.',
    currentSoftware: ['Facebook Page', 'Messenger', 'Phone', 'Notebook'],
    currentProblems: [
      'No-shows waste chair time',
      'Patients ask service prices repeatedly',
      'Clinic is hard to find online',
      'Appointment slots are handled manually',
      'Few new patients from search'
    ],
    technologyLevels: ['Low', 'Medium', 'Medium'],
    painPoints: [
      'Appointments booked only by phone',
      'No-shows waste chair time',
      'Patients cannot find the clinic online',
      'No way to show services and prices',
      'Few new patients'
    ]
  },
  convenience_store: {
    label: 'Convenience Store',
    industry: 'Retail',
    revenueSources: ['Walk-in purchases', 'Nearby residents', 'Load/GCash services', 'Small delivery requests'],
    marketingChannels: ['Word of Mouth', 'Facebook', 'Tarpaulin', 'Flyers'],
    orderSources: ['Walk-ins', 'Phone calls', 'Messenger from nearby customers'],
    bookingProcess: 'No formal booking; some customers ask availability through chat or phone.',
    currentSoftware: ['Facebook Page', 'Messenger', 'GCash'],
    currentProblems: [
      'Thin margins',
      'Customers ask if items are available',
      'Hard to advertise promos',
      'Competes with bigger stores',
      'Depends only on nearby residents'
    ],
    technologyLevels: ['Low', 'Low', 'Medium'],
    painPoints: [
      'Depends only on nearby residents',
      'No way to advertise promos',
      'Cannot take orders online',
      'Competing with bigger stores',
      'Thin margins'
    ]
  },
  hardware_store: {
    label: 'Hardware Store',
    industry: 'Retail and Construction Supply',
    revenueSources: ['Walk-ins', 'Contractor orders', 'Bulk materials', 'Phone inquiries'],
    marketingChannels: ['Word of Mouth', 'Referrals', 'Facebook', 'Tarpaulin'],
    orderSources: ['Walk-ins', 'Phone calls', 'Messenger', 'Contractor referrals'],
    bookingProcess: 'Customers call or message to ask stock and prices; staff check manually.',
    currentSoftware: ['Facebook Page', 'Messenger', 'Phone', 'Manual inventory notes'],
    currentProblems: [
      'Customers ask stock availability repeatedly',
      'No online catalog',
      'Price checks interrupt staff',
      'Competes with bigger hardware chains',
      'Hard to reach new contractors'
    ],
    technologyLevels: ['Low', 'Low', 'Medium'],
    painPoints: [
      'Customers call to ask if items are in stock',
      'No online catalog',
      'Relies on nearby contractors',
      'Hard to reach new buyers',
      'Competing with bigger hardware chains'
    ]
  }
};

export const GENERIC_BUSINESS_REALITY = {
  label: 'Small Business',
  industry: 'Local SME',
  revenueSources: ['Walk-ins', 'Repeat customers', 'Referrals'],
  marketingChannels: ['Facebook', 'Word of Mouth', 'Flyers'],
  orderSources: ['Walk-ins', 'Messenger', 'Phone calls'],
  bookingProcess: 'Customer inquiries and scheduling are handled manually.',
  currentSoftware: ['Facebook Page', 'Messenger', 'Notebook'],
  currentProblems: [
    'Relies on walk-ins only',
    'Hard to reach new customers',
    'Missed online inquiries',
    'No easy way to show the business online'
  ],
  technologyLevels: ['Low', 'Medium'],
  painPoints: [
    'Relies on walk-ins only',
    'Hard to reach new customers',
    'Missed online inquiries',
    'No easy way to show the business online'
  ]
};

export function getBusinessReality(businessType) {
  const reality = BUSINESS_REALITY[businessType];
  if (reality) return reality;
  return {
    ...GENERIC_BUSINESS_REALITY,
    label: titleCase(businessType)
  };
}

export function renderBusinessReality(profile = {}) {
  const reality = profile.businessReality || getBusinessReality(profile.businessType);
  return `# BUSINESS REALITY
- Industry: ${profile.industry || reality.industry}
- Revenue sources: ${formatList(profile.revenueSources || reality.revenueSources)}
- Marketing channels: ${formatList(profile.marketingChannels || profile.marketing || reality.marketingChannels)}
- Order/inquiry sources: ${formatList(profile.orderSources || reality.orderSources)}
- Booking/order process: ${profile.currentBookingSystem || reality.bookingProcess}
- Current software/tools: ${formatList(profile.currentSoftware || reality.currentSoftware)}
- Technology level: ${profile.technologyLevel || 'Medium'}
- Current problems available privately: ${formatList(profile.currentBusinessProblems || profile.painPoints || reality.currentProblems)}

Use these facts as realism anchors. Do not recite them all to the seller.`;
}

function formatList(value) {
  return Array.isArray(value) && value.length ? value.join(', ') : 'Not specified';
}

function titleCase(value) {
  return String(value || 'business')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

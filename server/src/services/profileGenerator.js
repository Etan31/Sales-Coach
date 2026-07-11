// Generates a per-session business_profile jsonb snapshot for the roleplay.
// Self-contained: draws from internal archetypes per businessType (never queries the DB).
// Deterministic-testable via the injected rng (defaults to Math.random).

// Per-businessType archetype: display label + pools to sample pain points, marketing, tech level.
const ARCHETYPES = {
  coffee_shop: {
    label: 'Coffee Shop',
    painPoints: [
      'Few repeat customers',
      'Relies on walk-ins only',
      'Missed inquiries after hours',
      'Slow afternoons',
      'Hard to stand out from nearby cafes'
    ],
    marketing: ['Facebook', 'Word of Mouth', 'Instagram', 'Flyers', 'Loyalty cards'],
    techLevels: ['Low', 'Medium', 'Medium']
  },
  barbershop: {
    label: 'Barbershop',
    painPoints: [
      'Walk-ins only, no bookings',
      'Long queues turn customers away',
      'Idle chairs on weekdays',
      'No way to show haircut styles',
      'Regulars forget to come back'
    ],
    marketing: ['Word of Mouth', 'Facebook', 'Tarpaulin outside', 'Referrals'],
    techLevels: ['Low', 'Low', 'Medium']
  },
  salon: {
    label: 'Salon',
    painPoints: [
      'No online booking',
      'Empty slots between appointments',
      'Hard to show before and after work',
      'Depends on suki only',
      'Missed inquiries on Messenger'
    ],
    marketing: ['Facebook', 'Instagram', 'Word of Mouth', 'Promos', 'TikTok'],
    techLevels: ['Low', 'Medium', 'Medium']
  },
  restaurant: {
    label: 'Restaurant',
    painPoints: [
      'No online menu',
      'Relies on foot traffic',
      'Delivery apps eat the margin',
      'Cannot take reservations online',
      'Hard to reach new customers'
    ],
    marketing: ['Facebook', 'Food delivery apps', 'Word of Mouth', 'Instagram', 'Flyers'],
    techLevels: ['Low', 'Medium', 'High']
  },
  gym: {
    label: 'Gym',
    painPoints: [
      'Members cancel and never return',
      'No online sign-up',
      'Manual membership tracking',
      'Hard to promote classes',
      'Slow enrollment months'
    ],
    marketing: ['Facebook', 'Instagram', 'Word of Mouth', 'Tarpaulin', 'Referrals'],
    techLevels: ['Medium', 'Medium', 'High']
  },
  dental_clinic: {
    label: 'Dental Clinic',
    painPoints: [
      'Appointments booked only by phone',
      'No-shows waste chair time',
      'Patients cannot find the clinic online',
      'No way to show services and prices',
      'Few new patients'
    ],
    marketing: ['Facebook', 'Word of Mouth', 'Referrals', 'Clinic signage'],
    techLevels: ['Low', 'Medium', 'Medium']
  },
  laundry_shop: {
    label: 'Laundry Shop',
    painPoints: [
      'Customers call to check if laundry is ready',
      'Relies on walk-ins only',
      'No pickup scheduling',
      'Hard to reach new customers',
      'Quiet during rainy season'
    ],
    marketing: ['Word of Mouth', 'Facebook', 'Tarpaulin outside', 'Flyers'],
    techLevels: ['Low', 'Low', 'Medium']
  },
  convenience_store: {
    label: 'Convenience Store',
    painPoints: [
      'Depends only on nearby residents',
      'No way to advertise promos',
      'Cannot take orders online',
      'Competing with bigger stores',
      'Thin margins'
    ],
    marketing: ['Word of Mouth', 'Facebook', 'Tarpaulin', 'Flyers'],
    techLevels: ['Low', 'Low', 'Medium']
  },
  hardware_store: {
    label: 'Hardware Store',
    painPoints: [
      'Customers call to ask if items are in stock',
      'No online catalog',
      'Relies on nearby contractors',
      'Hard to reach new buyers',
      'Competing with bigger hardware chains'
    ],
    marketing: ['Word of Mouth', 'Referrals', 'Facebook', 'Tarpaulin'],
    techLevels: ['Low', 'Low', 'Medium']
  },
  bakery: {
    label: 'Bakery',
    painPoints: [
      'Sells only to walk-ins',
      'Cannot take cake orders online',
      'Hard to show the product catalog',
      'Missed inquiries for custom orders',
      'Slow weekday sales'
    ],
    marketing: ['Facebook', 'Word of Mouth', 'Instagram', 'Flyers'],
    techLevels: ['Low', 'Medium', 'Medium']
  }
};

// Fallback archetype for an unrecognized businessType (label is derived from the key).
const GENERIC_ARCHETYPE = {
  painPoints: [
    'Relies on walk-ins only',
    'Hard to reach new customers',
    'Missed online inquiries',
    'No easy way to show the business online'
  ],
  marketing: ['Facebook', 'Word of Mouth', 'Flyers'],
  techLevels: ['Low', 'Medium']
};

const FILIPINO_NAMES = [
  'Carlos', 'Maria', 'Jose', 'Ana', 'Ramon', 'Luz', 'Ricardo', 'Elena',
  'Manny', 'Rosa', 'Nestor', 'Divina', 'Efren', 'Cora', 'Grace', 'Dennis',
  'Lita', 'Arturo', 'Marites', 'Edwin', 'Josie', 'Rey', 'Nena', 'Tonyo'
];

// Personality + emotion pools skew tougher and more skeptical as difficulty rises.
const DIFFICULTY_TRAITS = {
  easy: ['Friendly', 'Curious', 'Tech Savvy', 'Busy'],
  medium: ['Busy', 'Curious', 'Budget Conscious', 'Traditional', 'Skeptical'],
  hard: ['Busy', 'Skeptical', 'Impatient', 'Budget Conscious', 'Traditional'],
  impossible: ['Skeptical', 'Impatient', 'Old School', 'Budget Conscious', 'Busy']
};

// Budget ceiling (PHP) by difficulty: easier owners can spend more.
const BUDGET_RANGES = {
  easy: [15000, 30000],
  medium: [8000, 15000],
  hard: [3000, 8000],
  impossible: [0, 3000]
};

// Allowed objection categories by difficulty: harder = more and tougher push-backs.
const OBJECTION_SETS = {
  easy: { pool: ['facebook', 'need', 'time', 'maintenance'], min: 1, max: 2 },
  medium: { pool: ['budget', 'facebook', 'need', 'time', 'maintenance', 'authority', 'price'], min: 2, max: 3 },
  hard: {
    pool: ['budget', 'price', 'facebook', 'trust', 'competition', 'maintenance', 'time', 'previous_experience'],
    min: 3,
    max: 4
  },
  // Impossible always carries the toughest core set, plus 0-2 extras.
  impossible: { base: ['budget', 'price', 'trust', 'competition', 'need', 'risk'], extra: ['previous_experience', 'authority'] }
};

// Tech-level bias mixed into the archetype's own levels, by difficulty.
const TECH_BIAS = {
  easy: ['Medium', 'High'],
  medium: ['Low', 'Medium'],
  hard: ['Low', 'Low', 'Medium'],
  impossible: ['Low', 'Low']
};

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function shuffle(rng, arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickSome(rng, arr, min, max) {
  if (!arr.length) return [];
  const count = Math.min(arr.length, randInt(rng, min, max));
  return shuffle(rng, arr).slice(0, count);
}

function titleCase(value) {
  return String(value || 'Business')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildAllowedObjections(rng, difficulty) {
  const spec = OBJECTION_SETS[difficulty] || OBJECTION_SETS.medium;
  if (spec.base) {
    const extras = pickSome(rng, spec.extra, 0, spec.extra.length);
    return [...spec.base, ...extras];
  }
  return pickSome(rng, spec.pool, spec.min, spec.max);
}

function buildMarketing(rng, archetype, hasFacebook) {
  const pool = archetype.marketing.filter((channel) => channel !== 'Facebook');
  const chosen = pickSome(rng, pool, 1, 3);
  const marketing = hasFacebook ? ['Facebook', ...chosen] : chosen;
  return [...new Set(marketing)];
}

/**
 * Build a randomized business_profile jsonb snapshot for a session.
 * @param {string} businessType - enum key (e.g. 'coffee_shop').
 * @param {string} difficulty - 'easy' | 'medium' | 'hard' | 'impossible'.
 * @param {() => number} [rng] - injectable RNG for deterministic tests.
 * @returns {object} business_profile matching the contracts snapshot shape.
 */
export function generateBusinessProfile(businessType, difficulty, rng = Math.random) {
  const level = BUDGET_RANGES[difficulty] ? difficulty : 'medium';
  const archetype = ARCHETYPES[businessType] || GENERIC_ARCHETYPE;
  const label = archetype.label || titleCase(businessType);

  const traits = DIFFICULTY_TRAITS[level];
  const [budgetMin, budgetMax] = BUDGET_RANGES[level];

  const hasFacebook = rng() < 0.8;
  // The prospect rarely already has a website (it is what the seller is pitching).
  const hasWebsite = rng() < 0.12;

  const technologyLevel = pick(rng, [...archetype.techLevels, ...(TECH_BIAS[level] || [])]);

  return {
    business: label,
    ownerName: pick(rng, FILIPINO_NAMES),
    ownerAge: randInt(rng, 30, 60),
    personality: pick(rng, traits),
    technologyLevel,
    budget: randInt(rng, budgetMin, budgetMax),
    website: hasWebsite,
    facebook: hasFacebook,
    marketing: buildMarketing(rng, archetype, hasFacebook),
    painPoints: pickSome(rng, archetype.painPoints, 2, 4),
    allowedObjections: buildAllowedObjections(rng, level),
    emotion: pick(rng, traits)
  };
}

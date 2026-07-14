// Generates a per-session business_profile jsonb snapshot for the roleplay.
// Self-contained and deterministic-testable via injected rng (defaults to Math.random).
import { getBusinessReality } from '../prompts/businessReality.js';
import { RECEPTIONIST_ROLES } from '../prompts/receptionistMode.js';

const FILIPINO_NAMES = [
  'Carlos', 'Maria', 'Jose', 'Ana', 'Ramon', 'Luz', 'Ricardo', 'Elena',
  'Manny', 'Rosa', 'Nestor', 'Divina', 'Efren', 'Cora', 'Grace', 'Dennis',
  'Lita', 'Arturo', 'Marites', 'Edwin', 'Josie', 'Rey', 'Nena', 'Tonyo'
];

const DIFFICULTY_TRAITS = {
  easy: ['Friendly', 'Curious', 'Tech Savvy', 'Busy'],
  medium: ['Busy', 'Curious', 'Budget Conscious', 'Traditional', 'Skeptical'],
  hard: ['Busy', 'Skeptical', 'Impatient', 'Budget Conscious', 'Traditional'],
  impossible: ['Skeptical', 'Impatient', 'Old School', 'Budget Conscious', 'Busy']
};

const BUDGET_RANGES = {
  easy: [15000, 30000],
  medium: [8000, 15000],
  hard: [3000, 8000],
  impossible: [0, 3000]
};

const TECH_BIAS = {
  easy: ['Medium', 'High'],
  medium: ['Low', 'Medium'],
  hard: ['Low', 'Low', 'Medium'],
  impossible: ['Low', 'Low']
};

const OBJECTION_SETS = {
  easy: {
    pool: ['facebook_is_enough', 'no_need', 'too_busy', 'maintenance', 'messenger_works_fine'],
    min: 2,
    max: 3
  },
  medium: {
    pool: [
      'budget',
      'facebook_is_enough',
      'no_need',
      'too_busy',
      'maintenance',
      'need_partner_approval',
      'monthly_fees',
      'google_maps',
      'messenger_works_fine'
    ],
    min: 3,
    max: 5
  },
  hard: {
    pool: [
      'budget',
      'facebook_is_enough',
      'trust',
      'already_have_someone',
      'maintenance',
      'too_busy',
      'scammed_before',
      'roi',
      'not_tech_savvy',
      'monthly_fees'
    ],
    min: 4,
    max: 6
  },
  impossible: {
    base: ['budget', 'trust', 'already_have_someone', 'no_need', 'roi', 'scammed_before'],
    extra: [
      'need_partner_approval',
      'not_tech_savvy',
      'monthly_fees',
      'facebook_is_enough',
      'messenger_works_fine'
    ]
  }
};

const DELIVERY_BUSINESS_TYPES = new Set(['coffee_shop', 'restaurant', 'bakery', 'flower_shop']);
const APPOINTMENT_BUSINESS_TYPES = new Set(['salon', 'barbershop', 'dental_clinic', 'pet_grooming', 'gym']);

const SCRIPT_GUIDANCE = [
  'Discovery First',
  'Consultative',
  'Problem First',
  'Commission Savings',
  'Online Booking',
  'Branding',
  'Google Search Visibility',
  'Facebook Conversion',
  'Messenger Automation',
  'Time Saving',
  'Professional Image',
  'Appointment Automation',
  'Repeat Customers',
  'Lead Capture',
  'Customer Database',
  'Email Marketing'
];

const COMMUNICATION_CHANNELS = ['Messenger', 'Viber', 'Phone call', 'Email', 'Facebook Page'];
const DECISION_AUTHORITIES = ['Owner decides', 'Needs partner approval', 'Needs family approval', 'Needs franchise approval'];

const OWNER_DIMENSION_POOLS = {
  technologyConfidence: ['Low', 'Medium', 'High'],
  patience: ['Very Low', 'Low', 'Medium', 'High'],
  businessKnowledge: ['Practical', 'Experienced', 'New Owner', 'Numbers-Focused', 'Relationship-Focused'],
  websiteKnowledge: ['None', 'Basic', 'Heard of It', 'Has Tried Before', 'Comfortable'],
  salesResistance: ['Low', 'Medium', 'High', 'Very High'],
  riskTolerance: ['Low', 'Medium', 'High'],
  decisionSpeed: ['Slow', 'Careful', 'Fast if obvious', 'Needs approval'],
  communicationStyle: ['Warm but busy', 'Direct', 'Chatty', 'Guarded', 'Formal', 'Dismissive'],
  busyLevel: ['Calm', 'Working', 'Rushed', 'Interrupted', 'Overloaded']
};

const DIFFICULTY_PERSONALITY_BIAS = {
  easy: {
    patience: ['Medium', 'High'],
    salesResistance: ['Low', 'Medium'],
    riskTolerance: ['Medium', 'High'],
    salesOpenness: ['Medium', 'High']
  },
  medium: {
    patience: ['Low', 'Medium'],
    salesResistance: ['Medium', 'High'],
    riskTolerance: ['Low', 'Medium'],
    salesOpenness: ['Low', 'Medium']
  },
  hard: {
    patience: ['Very Low', 'Low'],
    salesResistance: ['High', 'Very High'],
    riskTolerance: ['Low', 'Medium'],
    salesOpenness: ['Low', 'Very Low']
  },
  impossible: {
    patience: ['Very Low'],
    salesResistance: ['Very High'],
    riskTolerance: ['Low'],
    salesOpenness: ['Very Low']
  }
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

function buildAllowedObjections(rng, difficulty, businessType, hasWebsite) {
  const spec = OBJECTION_SETS[difficulty] || OBJECTION_SETS.medium;
  const industryObjections = [
    ...(DELIVERY_BUSINESS_TYPES.has(businessType) ? ['food_delivery_apps_are_enough'] : []),
    ...(APPOINTMENT_BUSINESS_TYPES.has(businessType) ? ['messenger_works_fine'] : []),
    ...(hasWebsite ? ['already_have_website'] : [])
  ];

  if (spec.base) {
    const extras = pickSome(rng, [...spec.extra, ...industryObjections], 0, Math.min(3, spec.extra.length + industryObjections.length));
    return [...new Set([...spec.base, ...extras])];
  }

  return [...new Set(pickSome(rng, [...spec.pool, ...industryObjections], spec.min, spec.max))];
}

function buildMarketing(rng, reality, hasFacebook) {
  const pool = reality.marketingChannels.filter((channel) => channel !== 'Facebook');
  const chosen = pickSome(rng, pool, 1, 3);
  const marketing = hasFacebook ? ['Facebook', ...chosen] : chosen;
  return [...new Set(marketing)];
}

function buildOwnerPersonality(rng, difficulty, technologyLevel) {
  const bias = DIFFICULTY_PERSONALITY_BIAS[difficulty] || DIFFICULTY_PERSONALITY_BIAS.medium;
  return {
    technologyConfidence: technologyLevel,
    patience: pick(rng, bias.patience),
    businessKnowledge: pick(rng, OWNER_DIMENSION_POOLS.businessKnowledge),
    websiteKnowledge: pick(rng, OWNER_DIMENSION_POOLS.websiteKnowledge),
    salesResistance: pick(rng, bias.salesResistance),
    riskTolerance: pick(rng, bias.riskTolerance),
    decisionSpeed: pick(rng, OWNER_DIMENSION_POOLS.decisionSpeed),
    communicationStyle: pick(rng, OWNER_DIMENSION_POOLS.communicationStyle),
    busyLevel: pick(rng, OWNER_DIMENSION_POOLS.busyLevel)
  };
}

function buildReceptionistAvailability(rng, difficulty, businessType) {
  const availableChance = difficulty === 'easy' ? 0.2 : difficulty === 'medium' ? 0.35 : difficulty === 'hard' ? 0.5 : 0.65;
  const available = rng() < availableChance;
  const role = pick(rng, preferredReceptionistRoles(businessType));

  return {
    available,
    role,
    ownerBusyReason: pick(rng, [
      'the owner is handling customers',
      'the owner is inside doing inventory',
      'the owner is with a supplier',
      'the owner stepped out',
      'the owner is working on a client'
    ]),
    transferLikelihood: pick(rng, difficulty === 'easy' ? ['Medium', 'High'] : ['Low', 'Medium']),
    messageReliability: pick(rng, difficulty === 'impossible' ? ['Low', 'Low', 'Medium'] : ['Low', 'Medium', 'High'])
  };
}

function preferredReceptionistRoles(businessType) {
  const byBusiness = {
    coffee_shop: ['Barista', 'Cashier', 'Assistant'],
    restaurant: ['Cashier', 'Receptionist', 'Assistant'],
    salon: ['Salon Staff', 'Receptionist', 'Assistant'],
    barbershop: ['Barber', 'Assistant', 'Cashier'],
    laundry_shop: ['Laundry Staff', 'Cashier', 'Assistant'],
    pet_grooming: ['Pet Groomer Assistant', 'Receptionist', 'Assistant'],
    flower_shop: ['Flower Shop Staff', 'Sales Clerk', 'Assistant'],
    hardware_store: ['Sales Clerk', 'Cashier', 'Assistant'],
    convenience_store: ['Cashier', 'Sales Clerk', 'Assistant']
  };
  return byBusiness[businessType] || RECEPTIONIST_ROLES;
}

function buildScriptGuidance(rng, businessType) {
  const weighted = [
    'Discovery First',
    'Consultative',
    'Problem First',
    'Facebook Conversion',
    'Messenger Automation',
    'Time Saving',
    'Professional Image',
    ...(DELIVERY_BUSINESS_TYPES.has(businessType) ? ['Commission Savings'] : []),
    ...(APPOINTMENT_BUSINESS_TYPES.has(businessType) ? ['Online Booking', 'Appointment Automation'] : []),
    ...SCRIPT_GUIDANCE
  ];
  return pick(rng, weighted);
}

function titleCase(value) {
  return String(value || 'Business')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  const reality = getBusinessReality(businessType);
  const label = reality.label || titleCase(businessType);
  const traits = DIFFICULTY_TRAITS[level];
  const [budgetMin, budgetMax] = BUDGET_RANGES[level];

  const hasFacebook = rng() < 0.85;
  const hasWebsite = rng() < 0.12;
  const technologyLevel = pick(rng, [...reality.technologyLevels, ...(TECH_BIAS[level] || [])]);
  const ownerPersonality = buildOwnerPersonality(rng, level, technologyLevel);
  const marketing = buildMarketing(rng, reality, hasFacebook);
  const currentProblems = pickSome(rng, reality.currentProblems, 2, 4);
  const painPoints = pickSome(rng, reality.painPoints, 2, 4);
  const decisionAuthority = pick(rng, DECISION_AUTHORITIES);

  return {
    // Legacy/public fields already consumed by the app and evaluation prompt.
    business: label,
    ownerName: pick(rng, FILIPINO_NAMES),
    ownerAge: randInt(rng, 30, 60),
    personality: pick(rng, traits),
    technologyLevel,
    budget: randInt(rng, budgetMin, budgetMax),
    website: hasWebsite,
    facebook: hasFacebook,
    marketing,
    painPoints,
    allowedObjections: buildAllowedObjections(rng, level, businessType, hasWebsite),
    emotion: pick(rng, traits),

    // Extended modular roleplay fields.
    businessType,
    industry: reality.industry,
    ownerPersonality,
    receptionistAvailability: buildReceptionistAvailability(rng, level, businessType),
    difficulty: level,
    language: 'taglish',
    technologyConfidence: ownerPersonality.technologyConfidence,
    websiteKnowledge: ownerPersonality.websiteKnowledge,
    budgetSensitivity: level === 'easy' ? 'Medium' : level === 'medium' ? 'High' : 'Very High',
    decisionAuthority,
    salesOpenness: pick(rng, DIFFICULTY_PERSONALITY_BIAS[level].salesOpenness),
    scriptGuidance: buildScriptGuidance(rng, businessType),
    currentBusinessProblems: currentProblems,
    marketingChannels: marketing,
    customerAcquisition: pickSome(rng, [...reality.marketingChannels, ...reality.orderSources], 2, 5),
    orderSources: pickSome(rng, reality.orderSources, 2, Math.min(4, reality.orderSources.length)),
    currentBookingSystem: reality.bookingProcess,
    currentSoftware: pickSome(rng, reality.currentSoftware, 2, Math.min(4, reality.currentSoftware.length)),
    revenueSources: pickSome(rng, reality.revenueSources, 2, Math.min(4, reality.revenueSources.length)),
    preferredCommunication: pick(rng, COMMUNICATION_CHANNELS),
    businessReality: reality
  };
}


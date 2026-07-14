// Receptionist Mode creates realistic gatekeeper conversations before the seller reaches the owner.
export const RECEPTIONIST_ROLES = [
  'Receptionist',
  'Cashier',
  'Barista',
  'Salon Staff',
  'Barber',
  'Assistant',
  'Sales Clerk',
  'Laundry Staff',
  'Flower Shop Staff',
  'Pet Groomer Assistant',
  'Computer Shop Employee'
];

export const GATEKEEPER_BEHAVIORS = [
  'The owner is busy and cannot talk right now.',
  'The staff member cannot decide on websites, systems, budget, or proposals.',
  'They may ask the caller name, company, purpose, contact number, Facebook page, Viber, or email.',
  'They may transfer the call only if the seller sounds relevant and respectful.',
  'They may politely reject and ask the seller to send details instead.',
  'They may promise a callback without certainty.',
  'They may forget to forward the message if the seller is vague or pushy.',
  'They should sound like real staff doing their job, not like a trained sales evaluator.'
];

export function renderReceptionistMode(profile = {}, { contactMethod = 'cold_call' } = {}) {
  const gatekeeper = profile.receptionistAvailability || {};
  const role = gatekeeper.role || profile.receptionistRole || 'Receptionist';
  const ownerName = profile.ownerName || 'the owner';
  const transferLikelihood = gatekeeper.transferLikelihood || 'Medium';
  const messageReliability = gatekeeper.messageReliability || 'Medium';
  const busyReason = gatekeeper.ownerBusyReason || 'the owner is handling customers';

  return `# MODE: RECEPTIONIST / GATEKEEPER
Start as the ${role}, not the owner, unless the transcript clearly shows the call has already been transferred to ${ownerName}.

Gatekeeper situation:
- Owner: ${ownerName}
- Owner availability: ${busyReason}
- Contact method: ${contactMethod}
- Transfer likelihood: ${transferLikelihood}
- Chance the message is actually forwarded: ${messageReliability}

Gatekeeper behavior:
${GATEKEEPER_BEHAVIORS.map((rule) => `- ${rule}`).join('\n')}

What the staff can say naturally:
- Ask "Sino po sila?", "Anong company po?", "Ano pong purpose?", "May contact number po kayo?", or "Pwede niyo po send sa Facebook/Viber?"
- If the seller is vague, keep them away from the owner.
- If the seller identifies a specific operational issue and keeps it short, you may offer to pass the message or transfer.
- If transferred, continue the roleplay as the owner from that point onward and keep all prior context.`;
}

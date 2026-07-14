// Coaching stages define how the simulated prospect should respond to seller behavior.
// Progression is based on conversational quality, never raw turn count.
export const COACHING_STAGES = {
  DISCOVERY: {
    goal: 'The prospect mainly answers practical questions, but only with surface-level facts.',
    behavior:
      'Answer direct questions briefly. Do not volunteer hidden pain points. If the seller pitches too early, become more skeptical.'
  },
  PAIN_DISCOVERY: {
    goal: 'Operational problems become visible only after good discovery.',
    behavior:
      'Reveal one realistic problem at a time after the seller asks about workflow, missed inquiries, bookings, orders, or customer friction.'
  },
  VALUE_BUILDING: {
    goal: 'The prospect becomes slightly more open when value is tied to a real business problem.',
    behavior:
      'Soften a little if the seller connects the solution to time saved, fewer missed bookings, lower commissions, or easier customer follow-up.'
  },
  OBJECTION_HANDLING: {
    goal: 'The prospect raises practical Filipino SME concerns.',
    behavior:
      'Raise one objection at a time. Keep it grounded in budget, Facebook habits, family/partner approval, time, trust, or maintenance.'
  },
  QUALIFICATION: {
    goal: 'Timing, decision authority, and budget become discussable only after trust improves.',
    behavior:
      'Give vague but realistic signals about timing and authority. Never reveal the exact private budget ceiling.'
  },
  CLOSING: {
    goal: 'Interest appears only when the seller earned trust and proposed a low-friction next step.',
    behavior:
      'At most agree to review a short proposal, visual link, Viber message, Messenger note, or email. Do not overcommit.'
  }
};

export const STAGE_PROGRESS_RULES = [
  'Start in DISCOVERY unless the seller immediately pitches, in which case lean into OBJECTION_HANDLING.',
  'Move toward PAIN_DISCOVERY only after the seller asks sincere questions about the actual business process.',
  'Move toward VALUE_BUILDING when the seller reflects a specific pain point accurately.',
  'Move toward QUALIFICATION only after the seller has earned enough trust for timing or budget to feel relevant.',
  'Move toward CLOSING only after a specific, short, low-risk next step is offered.',
  'Move backward if the seller becomes pushy, generic, ignores answers, or talks mostly about features.'
];

export function renderCoachingContext() {
  return `# COACHING STAGES
The simulation should naturally progress based on salesperson behavior, not turn count.
${Object.entries(COACHING_STAGES)
  .map(([name, stage]) => `- ${name}: ${stage.goal} ${stage.behavior}`)
  .join('\n')}

Stage movement rules:
${STAGE_PROGRESS_RULES.map((rule) => `- ${rule}`).join('\n')}`;
}

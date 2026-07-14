// Example sales dialogue patterns used only as style influence for the roleplay model.
// The owner/staff must not copy these lines verbatim; promptBuilder states that explicitly.
export const SCRIPT_EXAMPLES = {
  phone_intro: {
    cold: [
      'Good afternoon po, this is Jay. Quick question lang, kayo po ba yung owner ng shop?',
      'Hi maam, sorry sa istorbo. I help small businesses manage bookings online, may I ask one quick question?'
    ],
    warm: [
      'Boss, nakita ko po Facebook page niyo. I had an idea that might help with inquiries, okay lang po ba one minute?',
      'Maam, I noticed marami kayong comments asking for prices. May quick suggestion lang po ako.'
    ]
  },
  messenger_intro: {
    cold: [
      'Hi po, I saw your page and wanted to ask if you handle bookings manually right now.',
      'Good day po. Quick question lang, do customers usually message here for prices or appointments?'
    ],
    visual_followup: [
      'I can send a short sample link po para makita niyo, no long pitch.',
      'Pwede ko po i-send yung mockup dito, tapos kayo na bahala if useful.'
    ]
  },
  email_intro: {
    cold: [
      'I noticed your business uses Facebook for customer inquiries and wanted to suggest a simple booking flow.',
      'Sharing a short idea for reducing missed messages and making your services easier to find on Google.'
    ],
    concise: [
      'Keeping this brief: one page, booking/contact button, prices, map, and Messenger handoff.',
      'No pressure; this is just a visual proposal you can review when convenient.'
    ]
  },
  discovery_questions: [
    'How do customers usually contact you now?',
    'Ano po usually nangyayari kapag sabay-sabay yung messages?',
    'Do people ask the same questions about price, schedule, or location?',
    'May times po ba na may na-mi-miss kayong inquiries after closing?',
    'How do you currently track bookings or orders?'
  ],
  rapport_examples: [
    'Gets ko po, most shops really start with Facebook kasi nandun na customers.',
    'That makes sense, especially if walk-ins are still strong.',
    'Hindi ko po pipilitin website agad; gusto ko muna maintindihan yung actual process niyo.',
    'Fair point po, kung hindi siya makakatipid ng oras or gastos, hindi worth it.'
  ],
  handling_gatekeeper: [
    'Kayo po ba usually tumatanggap ng booking messages, or si owner po?',
    'No worries po. Pwede ko ba malaman best way to send a short sample for Maam/Sir?',
    'Ano pong name ng owner para tama yung attention sa proposal?',
    'May Viber or email po ba kayo where a short link is okay?',
    'I can keep it to one screenshot and one paragraph po.'
  ],
  qualifying_questions: [
    'If this saved staff time on Messenger, would that be useful this month or later pa?',
    'Do you already spend on ads, delivery app commissions, or booking tools?',
    'Who usually decides po kapag may new system or website expense?',
    'May budget range po ba kayo for small improvements, or case-by-case?',
    'What would make this worth trying for your business?'
  ],
  website_pitch: [
    'Instead of replacing Facebook, the page can organize prices, map, reviews, and booking buttons so Messenger has fewer repetitive questions.',
    'For food shops, the goal could be direct orders for repeat customers so not every order goes through high commission apps.',
    'For salons and barbershops, the useful part is not just a website; it is a simple appointment flow that reduces double bookings.'
  ],
  pricing_discussion: [
    'We can start small po, just the part that saves time first.',
    'If there is monthly cost, it should be tied to maintenance or automation, not hidden fees.',
    'I would rather show a specific option after seeing your current process than throw a random package price.'
  ],
  closing_examples: [
    'Would it be okay if I send a short visual link on Viber, then you can ignore it if it is not useful?',
    'If the sample shows your exact booking flow, can we talk for five minutes tomorrow?',
    'Should I send it to your Messenger page or email po?',
    'No commitment po; just a quick sample based on what you told me.'
  ]
};

export function renderScriptExamples() {
  return `# SCRIPT EXAMPLES - style influence only
These are examples of seller approaches the roleplay may react to. NEVER copy these lines word-for-word, and never make the business owner sound like the seller.
- Good discovery asks how customers contact, book, order, and ask repeat questions.
- Good rapport accepts that Facebook, Messenger, Grab, Foodpanda, and walk-ins already work for many SMEs.
- Good pitches are specific to the business process, not generic "you need a website" claims.
- Good closes ask permission to send a short Viber/Messenger/email visual, not force a meeting.

Example discovery themes:
${SCRIPT_EXAMPLES.discovery_questions.map((line) => `- ${line}`).join('\n')}

Example gatekeeper themes:
${SCRIPT_EXAMPLES.handling_gatekeeper.map((line) => `- ${line}`).join('\n')}`;
}

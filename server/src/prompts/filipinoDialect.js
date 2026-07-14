// Natural dialogue snippets and language rules for Philippine SME roleplay.
// These phrases influence style only; the model must vary wording and avoid robotic repetition.
export const LANGUAGE_RULES = {
  english: 'Speak ONLY in English. Do not use Tagalog words.',
  tagalog:
    'Speak in natural, conversational Tagalog/Filipino. Common English business words like "website", "budget", "Facebook", "booking", and "delivery" are acceptable.',
  taglish:
    'Speak in natural everyday Taglish, mixing Filipino and English like a real small-business owner or staff member would.'
};

export const FILIPINO_DIALECT_SNIPPETS = {
  soft_agreement: [
    'Ah, gets ko naman.',
    'Oo, may point ka naman diyan.',
    'Sige po, naiintindihan ko.',
    'Pwede rin, depende siguro.',
    'Okay, naririnig ko naman sinasabi niyo.'
  ],
  polite_rejection: [
    'Ay sir, hindi pa priority ngayon.',
    'Pass muna kami, boss.',
    'Sige po, send niyo na lang kung may time ako tignan.',
    'Hindi muna kami kukuha ngayon.',
    'Maybe next time na lang po.'
  ],
  busy_responses: [
    'Busy lang talaga ngayon.',
    'May customer ako ngayon, quick lang po.',
    'Naka-line up kasi yung mga tao dito.',
    'Hawak ko pa yung client ngayon eh.',
    'Medyo toxic sa shop today.'
  ],
  curious_responses: [
    'Ano ba exactly ginagawa niyan?',
    'Paano makakatulong sa amin yun?',
    'May sample ka ba na mabilis makita?',
    'So hindi siya replacement ng Facebook?',
    'Ano difference niyan sa Messenger lang?'
  ],
  budget_concerns: [
    'Wala pa sa budget.',
    'May monthly ba?',
    'Baka mahal yan ah.',
    'Magkano ba usually ganyan?',
    'Kailangan sulit talaga kung gagastos kami.'
  ],
  trust_concerns: [
    'Hindi pa kita kilala, sir.',
    'Paano kung after payment wala na?',
    'May mga na-scam na rin kasi online.',
    'May legit portfolio ka ba?',
    'Saan ka based?'
  ],
  technology_concerns: [
    'Hindi ako masyadong techie.',
    'Sino mag-aayos kung may mali?',
    'Baka mahirap gamitin yan.',
    'Staff ko Facebook lang alam.',
    'Ayoko ng dagdag trabaho sa amin.'
  ]
};

export function renderFilipinoDialect(language = 'taglish') {
  const languageRule = LANGUAGE_RULES[language] || LANGUAGE_RULES.taglish;
  return `# LANGUAGE AND FILIPINO SME VOICE
- ${languageRule}
- Use authentic everyday phrasing. Natural fillers are allowed: "Ah", "Eh", "Kasi po", "Gets ko naman", "Sige po", "Yung...", "Boss", "Sir/Maam".
- Be polite but practical. If annoyed, stay dismissive without becoming theatrical.
- Use snippets only as style inspiration, never as mandatory exact lines.

Style examples:
${Object.entries(FILIPINO_DIALECT_SNIPPETS)
  .map(([category, lines]) => `- ${category}: ${lines.slice(0, 4).join(' | ')}`)
  .join('\n')}`;
}

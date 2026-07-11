const LANGUAGE_TO_BCP47 = {
  english: 'en-US',
  tagalog: 'fil-PH',
  taglish: 'fil-PH'
};

/** Maps the app's `language` enum (english|tagalog|taglish) to a BCP-47 tag for the Web Speech APIs. */
export function appLangToBcp47(language) {
  return LANGUAGE_TO_BCP47[language] || 'en-US';
}

export default appLangToBcp47;

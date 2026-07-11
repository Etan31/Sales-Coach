// Categorized bank of realistic Filipino small-business-owner objections (Taglish).
// Used to steer the roleplay prompt so the AI owner pushes back in an authentic voice.
// Keyed by category; each value is a set of natural example lines a real owner might say.
export const objectionLibrary = {
  budget: [
    'Wala kaming budget para diyan.',
    'Medyo mahal para sa amin ngayon.',
    'Baka next year na lang kami mag-website.',
    'Maliit lang kasi kita namin, di kaya sa ngayon.',
    'Sa ngayon, wala talaga kaming pambayad diyan.'
  ],
  facebook: [
    'Meron naman kaming Facebook page, ayos na yun.',
    'Sapat na sa amin ang Facebook, dun kami nakikita.',
    'Dun kasi lahat nagme-message sa amin, sa Messenger.',
    'Bakit pa website eh andiyan naman ang Facebook, libre pa.'
  ],
  trust: [
    'Paano kung mawala ka after mabayaran?',
    'Paano kung may problema, sino tatawagan ko?',
    'Marami na kasing nangako sa akin, tapos wala rin.',
    'Hindi pa kita kilala, paano ako makakasigurado?'
  ],
  competition: [
    'Pinsan ko gumagawa ng website, siya na lang siguro.',
    'May mas mura akong nakita online.',
    'May kakilala kami na mas barato mag-offer.',
    'Yung isa kanina, mas mababa yung presyo niya.'
  ],
  need: [
    'Hindi namin kailangan ng website.',
    'Okay naman kami kahit wala niyan.',
    'Walk-in lang naman customers namin, di kailangan.',
    'Ayos na kami sa ngayon, di na namin kailangan.'
  ],
  maintenance: [
    'Sino mag-a-update niyan? Wala kaming tao para diyan.',
    'Di ako marunong mag-manage ng ganyan.',
    'Paano kapag kailangan baguhin? Ako pa gagawa?',
    'Wala akong oras mag-update araw-araw.'
  ],
  time: [
    'Busy kami ngayon, sa susunod na lang.',
    'Wala akong oras pag-usapan yan ngayon.',
    'May inaasikaso pa ako, saglit lang ha.',
    'Grabe dami ko trabaho, di ko kaya isipin yan.'
  ],
  previous_experience: [
    'Nasubukan na namin dati, di gumana.',
    'May nag-set up na dati, sayang lang pera.',
    'Dati may ganyan kami, walang nangyari.',
    'Nagbayad na kami minsan, wala rin naman nangyari.'
  ],
  authority: [
    'Kailangan ko muna tanungin partner ko.',
    'Di ako makakapag-desisyon mag-isa dito.',
    'Asawa ko ang bahala diyan sa mga ganyan.',
    'Kausapin mo muna yung kasosyo ko.'
  ],
  price: [
    'Bakit ganyan kamahal? Ang taas naman.',
    'Pwede pa bang tawad? Sobra yata presyo.',
    'Ang mahal para sa isang website lang ah.',
    'Bakit ang laki ng singil niyo?'
  ],
  risk: [
    'Hindi ako sigurado kung magwo-work sa amin.',
    'Paano kung walang mangyari after ko magbayad?',
    'Baka sayang lang pera ko dito.',
    'Di ko alam kung sulit ba talaga to.'
  ]
};

// Return the example lines for the given category keys, flattened. Unknown keys are ignored.
export function getObjectionsForCategories(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.flatMap((category) => objectionLibrary[category] || []);
}

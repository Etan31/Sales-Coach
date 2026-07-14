// Categorized bank of realistic Filipino SME objections. The primary keys are scalable
// snake_case categories; legacy keys remain as aliases for older generated profiles.
const budget = [
  'Wala kaming budget para diyan ngayon.',
  'Medyo mahal yan para sa amin, sir.',
  'Baka next year na lang kami mag-website.',
  'Maliit lang kita namin, hindi kaya sa ngayon.',
  'Sa ngayon, wala talaga kaming extra pambayad.',
  'Unahin muna namin rent at sweldo ng staff.',
  'Kung gastos yan monthly, mahirap sa amin.',
  'Bago pa lang shop namin, tipid muna kami.',
  'Hindi ko kaya maglabas ng malaking amount agad.',
  'May ibang priority pa kami sa business.',
  'Kung hindi sure ang balik, hindi ako makakapag-budget.',
  'Mahal na nga supplies ngayon, dagdag gastos pa yan.',
  'Pwede siguro pag malakas na ulit sales.',
  'Kailangan ko muna makita kung sulit bago gumastos.',
  'Baka sa ads ko na lang ilagay kung may budget man.'
];

const noNeed = [
  'Hindi namin kailangan ng website sa ngayon.',
  'Okay naman kami kahit wala niyan.',
  'Walk-in lang naman customers namin, hindi kailangan.',
  'Maliit na shop lang kami, baka sobra na yan.',
  'Hindi pa priority yan para sa amin.',
  'Parang hindi bagay sa klase ng business namin.',
  'May customers naman kami kahit Facebook lang.',
  'Hindi ko nakikita bakit kailangan pa.',
  'Hindi naman kami malaking company.',
  'Suki-suki lang customers namin dito.',
  'Ayos na yung current setup namin.',
  'Hindi pa namin naiisip yan kasi hindi naman problema.',
  'Kung may naghahanap, tumatawag naman sila.',
  'Hindi naman kami online business talaga.',
  'Baka dagdag trabaho lang yan sa amin.'
];

const tooBusy = [
  'Busy kami ngayon, sa susunod na lang.',
  'May customer ako ngayon, bilisan mo na lang.',
  'Wala akong oras pag-usapan yan ngayon.',
  'Naka-line up kasi customers dito.',
  'Mamaya na, may inaasikaso pa ako.',
  'Hindi ko kaya mag-long call ngayon.',
  'Nag-aayos pa kami ng orders.',
  'Hawak ko pa client ngayon eh.',
  'Peak hours namin ngayon, sir.',
  'Staff kulang today, ako lahat gumagalaw.',
  'May delivery pa kaming inaasikaso.',
  'Hindi ako makakapag-focus sa explanation mo.',
  'Send mo na lang, hindi ko kaya makinig ngayon.',
  'May supplier akong kausap after nito.',
  'Kung mahaba yan, next time na lang.'
];

const alreadyHaveSomeone = [
  'May kakilala na kami na gumagawa niyan.',
  'Pinsan ko marunong gumawa ng website.',
  'May kausap na akong ibang developer.',
  'Yung anak ng friend ko IT, siya na lang siguro.',
  'May nag-offer na sa amin dati.',
  'May existing contact na kami for computer stuff.',
  'Sa kakilala na lang ako para sure.',
  'May trusted person na kami pag ganyan.',
  'May nagma-manage na ng page namin.',
  'May social media person na kami kahit part-time.',
  'Yung supplier namin may referral na developer.',
  'May package na kaming tinitignan from another vendor.',
  'Ayoko muna mag-entertain kasi may kausap na kami.',
  'Friend ng family namin gumagawa nyan.',
  'Kung kukuha man kami, sa kilala muna.'
];

const facebookIsEnough = [
  'Meron naman kaming Facebook page, okay na yun.',
  'Sapat na Facebook kasi nandun customers namin.',
  'Dun lahat nagme-message sa Messenger.',
  'Bakit pa website eh andiyan naman Facebook, libre pa.',
  'Mas active customers namin sa Facebook kaysa website.',
  'Pag may promo, pinopost lang namin sa page.',
  'Nakikita naman kami sa Facebook search.',
  'May pictures na kami sa albums, okay na yun.',
  'Kung may tanong, message lang sila sa page.',
  'Ayoko ilipat customers sa ibang site pa.',
  'Libre Facebook, bakit ako gagastos?',
  'Hindi naman marunong customers namin mag-website.',
  'Mas mabilis mag-reply sa Messenger.',
  'Doon na sanay staff ko.',
  'May reviews na kami sa Facebook, sayang naman.'
];

const notTechSavvy = [
  'Hindi ako masyadong techie.',
  'Hindi ko alam paano i-manage yan.',
  'Baka mahirapan staff ko gamitin.',
  'Facebook lang alam namin dito.',
  'Ayoko ng system na kailangan aralin pa.',
  'Sino mag-aayos kapag may mali?',
  'Hindi ako sanay sa dashboard-dashboard.',
  'Baka makalimutan lang namin password niyan.',
  'Kung complicated yan, hindi namin magagamit.',
  'Hindi kami marunong mag-update ng website.',
  'Baka magulo lang sa staff.',
  'Ayoko ng dagdag app na kailangan bantayan.',
  'Hindi ako comfortable sa online setup.',
  'Kailangan sobrang simple kung sakali.',
  'Paano kung mawala yung data?'
];

const needPartnerApproval = [
  'Kailangan ko muna tanungin partner ko.',
  'Hindi ako makakapag-desisyon mag-isa dito.',
  'Kasosyo ko humahawak ng budget.',
  'Pag-usapan muna namin ng business partner ko.',
  'Hindi pwede ako lang mag-approve.',
  'Si partner ang mas maalam sa online stuff.',
  'Kailangan pareho kaming okay diyan.',
  'Send mo muna para ma-forward ko sa partner ko.',
  'Kung may presyo, kailangan makita niya muna.',
  'Partner ko usually nag-aasikaso ng suppliers.',
  'Hindi ako pwede mag-commit without approval.',
  'May meeting pa kami bago mag-decide.',
  'Sa partner ko manggagaling final say.',
  'Kailangan niya muna maintindihan benefit.',
  'Balikan kita pag napag-usapan namin.'
];

const needFamilyApproval = [
  'Asawa ko ang bahala sa mga gastos.',
  'Family business ito, kailangan ko muna tanungin sila.',
  'Si misis/mister muna makaka-decide niyan.',
  'Anak ko mas marunong sa online, siya muna tatanungin ko.',
  'Kailangan approval ng family kasi shared budget ito.',
  'Hindi ako basta gumagastos without telling my spouse.',
  'Yung kapatid ko humahawak ng page namin.',
  'Parents ko owner talaga, ako lang nagbabantay.',
  'Pag-usapan muna namin sa bahay.',
  'Family decision yan, hindi instant.',
  'Send mo muna details para mapakita ko sa asawa ko.',
  'Si anak ko titingin kung legit yan.',
  'Hindi ako final decision maker dito.',
  'Kailangan muna namin i-check as family.',
  'Balikan ka namin kung okay sa kanila.'
];

const needFranchiseApproval = [
  'Franchise ito, kailangan approval ng main office.',
  'Hindi kami pwede basta gumawa ng sariling website.',
  'May brand guidelines kami from head office.',
  'Kailangan muna ipa-approve sa franchisor.',
  'Baka bawal yan sa franchise agreement.',
  'Head office ang may hawak ng online presence.',
  'Hindi kami allowed mag-post ng sariling promos minsan.',
  'Corporate muna ang dapat kausapin diyan.',
  'May official website na yung brand.',
  'Hindi branch level ang decision niyan.',
  'Kailangan ko muna itanong sa area manager.',
  'May standard system na kami from franchise.',
  'Baka ma-issue kami kung gumawa kami separately.',
  'Marketing team ng franchise ang humahawak niyan.',
  'Send mo details, pero no guarantee kasi head office yan.'
];

const noTime = [
  'Wala talaga akong time asikasuhin yan.',
  'Hindi ko kaya mag-meeting about website.',
  'Kung kailangan maraming input from me, pass muna.',
  'Wala akong time mag-send ng content at pictures.',
  'Hindi ko kaya bantayan yung project.',
  'Next month na siguro, loaded kami ngayon.',
  'Hindi pa kami ready mag-start ng ganyan.',
  'Kung maraming requirements, hindi ko maasikaso.',
  'Busy season namin ngayon.',
  'Short-staffed kami kaya wala akong time.',
  'Hindi ko kaya mag-review ng proposal ngayon.',
  'Kung mabilis lang sana, pero baka mahaba process.',
  'May renovation/permit/supplier issue pa kami.',
  'Hindi ko kaya idagdag sa plate ko.',
  'Send mo na lang, pero baka matagal ko ma-check.'
];

const alreadyHaveWebsite = [
  'May website na kami dati pa.',
  'Meron na kaming site, hindi lang masyado updated.',
  'May existing website na yung business.',
  'May page na kami sa Google, okay na muna.',
  'May ginawa na sa amin before.',
  'Hindi ko alam kung kailangan pa palitan.',
  'May domain na kami, pero hindi ko nabubuksan lagi.',
  'May website yung main brand namin.',
  'Meron na, kaso simple lang.',
  'Hindi na priority kasi may existing na.',
  'May landing page na kami from previous developer.',
  'May online menu na kami somewhere.',
  'Baka duplicate lang kung gagawa pa.',
  'May link na kami sa bio.',
  'Existing site muna ayusin namin bago bago ulit.'
];

const scammedBefore = [
  'Na-scam na kami dati sa online service.',
  'May nagpagawa kami before, nawala after payment.',
  'Nagbayad kami dati, walang natapos.',
  'May bad experience na kami sa developer.',
  'Marami nang nangako, pero hindi tumupad.',
  'Takot na ako magbayad upfront.',
  'Dati may gumawa, hindi naman gumana.',
  'Sayang pera namin last time.',
  'Hindi na ako basta nagtitiwala sa ganyan.',
  'May nanghingi ng downpayment tapos ghosted kami.',
  'Hindi malinaw yung maintenance dati.',
  'Nagkaproblema kami sa access ng account before.',
  'Ayoko maulit yung nangyari sa amin.',
  'Kailangan may proof talaga bago ako maniwala.',
  'Mahirap magtiwala kapag stranger online.'
];

const roi = [
  'Paano ko mababawi gastos diyan?',
  'May guarantee ba na dadami customers?',
  'Kung website lang, paano siya kikita?',
  'Ilang orders kailangan bago sulit?',
  'Hindi ako sure kung may return yan.',
  'Baka views lang, walang sales.',
  'Mas direct pa siguro mag-boost ng Facebook post.',
  'Paano mo mapapatunayang may dagdag kita?',
  'Kung walang immediate result, mahirap justify.',
  'Ano difference niyan sa ordinary post lang?',
  'Will it bring paying customers or likes lang?',
  'Hindi enough na maganda tingnan; kailangan may sales.',
  'Paano kung walang mag-book through website?',
  'Kung hindi measurable, risky siya.',
  'Kailangan makita ko paano magiging benta yan.'
];

const maintenance = [
  'Sino mag-a-update niyan?',
  'Wala kaming tao para mag-maintain.',
  'Paano kapag kailangan baguhin prices?',
  'Ako pa ba gagawa ng updates?',
  'Baka outdated agad yan pag hindi na-update.',
  'May bayad ba every change?',
  'Kung may promo kami, paano ilalagay?',
  'Sino sasagot kapag down yung website?',
  'Paano kapag may bagong service or menu?',
  'Ayoko ng kailangan bantayan araw-araw.',
  'Kung may technical issue, hindi namin kaya.',
  'Kailangan ba lagi kang tatawagan?',
  'Baka maging another responsibility lang.',
  'Paano kung may typo or wrong price?',
  'May support ba after launch?'
];

const monthlyFees = [
  'May monthly ba yan?',
  'Ayoko ng may recurring na gastos.',
  'Magkano hosting monthly?',
  'May maintenance fee pa ba bukod sa setup?',
  'Baka mura sa umpisa tapos may monthly pala.',
  'Hindi kami comfortable sa subscription.',
  'Kung monthly yan, kailangan maliit lang.',
  'May lock-in ba?',
  'Paano kung gusto namin itigil?',
  'May hidden charges ba?',
  'Domain, hosting, maintenance, magkano lahat?',
  'Ayoko ng surprise billing.',
  'Kung may automation, may extra fee ba?',
  'May bayad ba kapag may changes?',
  'One-time lang ba or tuloy-tuloy?'
];

const trust = [
  'Hindi pa kita kilala, paano ako makakasigurado?',
  'Paano kung mawala ka after mabayaran?',
  'May portfolio ka ba na local business din?',
  'Saan ka based?',
  'May business permit or invoice ka ba?',
  'Paano ko alam legit ka?',
  'May references ka ba?',
  'Hindi ako comfortable magbigay ng access agad.',
  'Baka makuha mo yung Facebook account namin.',
  'May contract ba yan?',
  'Paano kung hindi ko gusto output?',
  'May sample ka ba na actual, hindi template?',
  'Marami kasing nagme-message na ganito.',
  'Bakit ikaw ang kukunin ko?',
  'Kailangan ko muna makita credibility mo.'
];

const seoSkepticism = [
  'SEO? Hindi ko masyado gets yan.',
  'Baka matagal bago may result sa Google.',
  'Hindi naman kami naghahabol ng ranking.',
  'Parang pang malaking company yung SEO.',
  'May guarantee ba na lalabas kami sa taas?',
  'Hindi ba Google Maps lang kailangan?',
  'Baka puro technical words lang yan.',
  'Kung months bago gumana, mahirap sa amin.',
  'Customers namin nasa Facebook, hindi Google.',
  'Hindi ko alam kung may naghahanap sa Google ng shop namin.',
  'Baka dagdag bayad lang yan.',
  'May ads na kami minsan, bakit SEO pa?',
  'Hindi ko makita direct sales diyan.',
  'Paano kung competitors pa rin nasa taas?',
  'Explain mo simple, kasi ayoko ng jargon.'
];

const googleMaps = [
  'May Google Maps na kami, okay na yun.',
  'Nakikita naman kami sa map.',
  'Reviews namin nasa Google already.',
  'Bakit pa website kung may Google Business Profile?',
  'Directions lang naman hinahanap ng customers.',
  'Phone number nasa Google na.',
  'Mas ginagamit nila Maps kaysa website.',
  'May photos na kami sa Google.',
  'Kung search, lumalabas naman kami minsan.',
  'Libre din Google Maps.',
  'Ayusin na lang siguro Maps namin, hindi website.',
  'Hindi ko alam difference ng website sa Google listing.',
  'Customers just click call sa Maps.',
  'May address na doon, sapat na.',
  'Kung online presence lang, meron na kami sa Maps.'
];

const messengerWorksFine = [
  'Messenger works fine naman.',
  'Dun kami mabilis kausap ng customers.',
  'Sanay na customers mag-message sa page.',
  'Kung may tanong, reply lang kami.',
  'Ayoko nang ilipat sila sa form.',
  'Mas personal sa Messenger.',
  'Nakikita ko agad notifications.',
  'Staff ko marunong na sa Messenger.',
  'Pwede naman i-pin yung menu sa chat.',
  'Hindi kailangan ng separate booking system.',
  'Kung website pa, baka doble bantayan.',
  'Customers prefer chat, not forms.',
  'May auto-reply na kami sa page.',
  'Okay naman response time namin.',
  'Messenger na ang pinaka-simple for us.'
];

const foodDeliveryAppsEnough = [
  'May Foodpanda/Grab na kami, sila na bahala sa riders.',
  'Okay na delivery apps kahit may commission.',
  'At least sa GrabFood may customer base na.',
  'Hindi namin kaya mag-manage sariling delivery.',
  'Kung direct orders, sino maghahanap ng rider?',
  'Foodpanda handles payment and delivery.',
  'Customers already look for us on apps.',
  'Kahit 20%-30% cut, less hassle.',
  'Ayoko ng dagdag order system kung apps work naman.',
  'Delivery apps na rin marketing namin.',
  'Kung direct website orders, baka magulo operations.',
  'May tablet na kami from delivery apps.',
  'Hindi kami ready mag-own delivery flow.',
  'Mas trusted ng customers ang Grab/Foodpanda.',
  'For now, okay na kami sa app commissions.'
];

export const objectionLibrary = {
  budget,
  no_need: noNeed,
  too_busy: tooBusy,
  already_have_someone: alreadyHaveSomeone,
  facebook_is_enough: facebookIsEnough,
  not_tech_savvy: notTechSavvy,
  need_partner_approval: needPartnerApproval,
  need_family_approval: needFamilyApproval,
  need_franchise_approval: needFranchiseApproval,
  no_time: noTime,
  already_have_website: alreadyHaveWebsite,
  scammed_before: scammedBefore,
  roi,
  maintenance,
  monthly_fees: monthlyFees,
  trust,
  seo_skepticism: seoSkepticism,
  google_maps: googleMaps,
  messenger_works_fine: messengerWorksFine,
  food_delivery_apps_are_enough: foodDeliveryAppsEnough,

  // Legacy aliases used by older generated profiles.
  facebook: facebookIsEnough,
  need: noNeed,
  time: tooBusy,
  previous_experience: scammedBefore,
  authority: needPartnerApproval,
  price: budget,
  risk: roi,
  competition: alreadyHaveSomeone
};

// Return the example lines for the given category keys, flattened. Unknown keys are ignored.
export function getObjectionsForCategories(categories) {
  if (!Array.isArray(categories)) return [];
  return categories.flatMap((category) => objectionLibrary[category] || []);
}

export const PRIMARY_OBJECTION_CATEGORIES = [
  'budget',
  'no_need',
  'too_busy',
  'already_have_someone',
  'facebook_is_enough',
  'not_tech_savvy',
  'need_partner_approval',
  'need_family_approval',
  'need_franchise_approval',
  'no_time',
  'already_have_website',
  'scammed_before',
  'roi',
  'maintenance',
  'monthly_fees',
  'trust',
  'seo_skepticism',
  'google_maps',
  'messenger_works_fine',
  'food_delivery_apps_are_enough'
];

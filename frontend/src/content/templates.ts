/** Ready-made scripts people can start from in the studio. */
export type Template = {
  id: string;
  title: string;
  language: "English" | "Hindi" | "Urdu";
  voice: string; // suggested voice id
  music?: string; // suggested music id
  text: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "yt-intro", title: "YouTube channel intro", language: "English", voice: "grace", music: "uplifting",
    text: "Hey everyone, and welcome back to the channel!\nIf you're new here, we make simple, useful videos every week.\nIn today's video, I'm going to show you something that will save you time and money.\nSo grab a cup of tea, sit back, and let's get started.",
  },
  {
    id: "yt-outro", title: "Ending and subscribe reminder", language: "English", voice: "grace", music: "uplifting",
    text: "And that's it for today's video!\nIf you found it helpful, give it a like, it really helps the channel.\nDon't forget to subscribe and turn on notifications, so you never miss a new video.\nThank you for watching, and I'll see you in the next one.",
  },
  {
    id: "podcast", title: "Podcast conversation (2 voices)", language: "English", voice: "grace", music: "lofi",
    text: "Grace: Welcome to Creator Talk, the show for new YouTubers. I'm Grace.\nRyan: And I'm Ryan. Today's big question: do you need to show your face to grow a channel?\nGrace: Short answer? No. Some of the biggest channels never show a face at all. [pause 1s]\nRyan: So what do they do instead?\nGrace: Great scripts, clear voiceovers, and simple visuals. Let's break it down.",
  },
  {
    id: "motivation", title: "Motivational Short", language: "English", voice: "ryan", music: "cinematic",
    text: "Nobody is coming to save you.\nNot your friends. Not luck. Not tomorrow.\nEvery big change starts with one small step, taken today.\nWake up a little earlier. Work a little harder. Quit a little less.\nOne year from now, you'll wish you had started today.\nSo start. Right now.",
  },
  {
    id: "facts", title: "Amazing facts Short", language: "English", voice: "jake", music: "tech",
    text: "Here are three facts that sound fake, but are completely true.\nNumber one: honey never goes bad. Archaeologists have found honey in ancient tombs that is still safe to eat.\nNumber two: octopuses have three hearts and blue blood.\nNumber three: a day on Venus is longer than a year on Venus.\nFollow for more facts like these!",
  },
  {
    id: "product-ad", title: "Product advert (30 seconds)", language: "English", voice: "bella", music: "uplifting",
    text: "Tired of tangled cables and a phone that's always on five percent?\nMeet the new PowerGo charger. Small enough for your pocket, strong enough to charge your phone three times.\nFast charging, two ports, and a two-year guarantee.\nOrder today and get free delivery. PowerGo. Power that goes with you.",
  },
  {
    id: "history", title: "History explainer opening", language: "English", voice: "george", music: "cinematic",
    text: "Five hundred years ago, a small group of traders set sail with one simple goal: to buy spices.\nWhat happened next would change the map of the world forever.\nThis is the story of how a trading company became more powerful than most countries.\nAnd it all started with pepper.",
  },
  {
    id: "kids-story", title: "Kids bedtime story", language: "English", voice: "oliver", music: "kids",
    text: "Once upon a time, in a little village by the river, there lived a curious rabbit named Pip.\nEvery night, Pip looked up at the moon and wondered what it would be like to visit.\nOne evening, a kind old owl landed beside him and said, \"Pip, would you like to go on an adventure?\"\nPip's ears stood straight up. \"Yes, please!\" he whispered.\nAnd so their journey began.",
  },
  {
    id: "urdu-intro", title: "یوٹیوب چینل کا تعارف", language: "Urdu", voice: "hindi-female", music: "uplifting",
    text: "السلام علیکم دوستو، اور ہمارے چینل میں خوش آمدید۔\nاگر آپ یہاں نئے ہیں تو چینل کو سبسکرائب ضرور کریں۔\nآج کی ویڈیو میں ہم آپ کو ایک بہت کام کی بات بتانے والے ہیں۔\nتو چلیے، شروع کرتے ہیں۔",
  },
  {
    id: "urdu-outro", title: "ویڈیو کا اختتام", language: "Urdu", voice: "hindi-female", music: "uplifting",
    text: "تو دوستو، آج کی ویڈیو بس یہیں تک۔\nاگر ویڈیو اچھی لگی ہو تو لائک ضرور کریں اور اپنے دوستوں کے ساتھ شیئر کریں۔\nچینل کو سبسکرائب کریں اور بیل آئیکن دبائیں۔\nاپنا خیال رکھیں، اللہ حافظ۔",
  },
  {
    id: "urdu-story", title: "سبق آموز کہانی", language: "Urdu", voice: "hindi-male", music: "calm",
    text: "ایک گاؤں میں ایک غریب لکڑہارا رہتا تھا۔\nایک دن اس کی کلہاڑی دریا میں گر گئی۔\nوہ بہت پریشان ہوا، کیونکہ یہی اس کی روزی کا واحد سہارا تھی۔\nلیکن اس نے سچ بولنا نہیں چھوڑا، اور اسی سچائی نے اس کی زندگی بدل دی۔\nآئیے سنتے ہیں کہ آگے کیا ہوا۔",
  },
  {
    id: "urdu-recipe", title: "کھانے کی ترکیب", language: "Urdu", voice: "anaya", music: "lofi",
    text: "السلام علیکم! آج ہم بنائیں گے مزیدار چکن کڑاہی۔\nاس کے لیے آپ کو چاہیے آدھا کلو چکن، تین ٹماٹر، ادرک لہسن اور ہری مرچ۔\nسب سے پہلے کڑاہی میں تیل گرم کریں اور چکن ڈال کر ہلکا سا بھون لیں۔\nپھر ٹماٹر ڈالیں اور ڈھک کر دس منٹ پکائیں۔",
  },
  {
    id: "hindi-intro", title: "यूट्यूब चैनल इंट्रो", language: "Hindi", voice: "hindi-female", music: "uplifting",
    text: "नमस्ते दोस्तों, और हमारे चैनल में आपका स्वागत है।\nअगर आप यहाँ नए हैं, तो चैनल को सब्सक्राइब ज़रूर करें।\nआज के वीडियो में हम आपको एक बहुत काम की बात बताने वाले हैं।\nतो चलिए, शुरू करते हैं।",
  },
  {
    id: "hindi-motivation", title: "मोटिवेशनल शॉर्ट", language: "Hindi", voice: "rohan", music: "cinematic",
    text: "कोई आपको बचाने नहीं आएगा।\nहर बड़ा बदलाव एक छोटे कदम से शुरू होता है।\nथोड़ा जल्दी उठिए, थोड़ी ज़्यादा मेहनत कीजिए।\nएक साल बाद आप खुद को धन्यवाद देंगे।\nतो आज ही शुरू कीजिए।",
  },
  {
    id: "hindi-facts", title: "रोचक तथ्य", language: "Hindi", voice: "hindi-male", music: "tech",
    text: "क्या आप जानते हैं? शहद कभी खराब नहीं होता।\nऑक्टोपस के तीन दिल होते हैं।\nऔर शुक्र ग्रह पर एक दिन, वहाँ के एक साल से भी लंबा होता है।\nऐसे ही और तथ्यों के लिए फॉलो करें।",
  },
];

/** Content for SEO tool pages, use-case pages, services and the blog. */

export type ToolPage = {
  slug: string;
  title: string;
  h1: string;
  intro: string;
  defaultVoice: string;
  sample: string;
  tips: string[];
  /** A short line in the page's own language (e.g. Urdu), shown under the intro. */
  local?: { text: string; lang: string; dir?: "rtl" | "ltr" };
  /** Questions people search for; also shown in Google results as FAQs. */
  faq?: { q: string; a: string }[];
};

export const TOOL_PAGES: ToolPage[] = [
  {
    slug: "hindi-text-to-speech",
    title: "Free Hindi Text to Speech – Natural AI Voice | VoiceDost",
    h1: "Free Hindi text to speech",
    intro: "Type Hindi text and hear it in a natural male or female voice. Download the MP3 for Reels, Shorts and YouTube.",
    defaultVoice: "hindi-female",
    sample: "नमस्ते दोस्तों! आज के वीडियो में हम सीखेंगे कुछ आसान टिप्स।",
    tips: ["Write in Devanagari script for the best pronunciation.", "Use full stops (।) to add natural pauses.", "Keep sentences short for clear narration."],
  },
  {
    slug: "ai-voiceover-for-youtube",
    title: "AI Voiceover for YouTube Videos – Free to Try | VoiceDost",
    h1: "AI voiceover for YouTube",
    intro: "Turn your video script into a clear, natural voiceover in seconds. Perfect for faceless channels, explainers and Shorts.",
    defaultVoice: "george",
    sample: "Welcome back to the channel! Today we're looking at three facts you probably didn't know.",
    tips: ["Split your script into short lines so you can redo any line.", "Use a slightly slower speed for explainers.", "Add a pause between sections to give viewers time."],
  },
  {
    slug: "british-accent-text-to-speech",
    title: "British Accent Text to Speech – Free AI Voices | VoiceDost",
    h1: "British accent text to speech",
    intro: "Natural British English voices, male and female, for narration, training videos and podcasts.",
    defaultVoice: "emma",
    sample: "Good morning, and welcome to today's lesson. Let's get started.",
    tips: ["George suits calm narration; Emma suits friendly tutorials.", "British spellings like 'colour' read naturally.", "Write numbers as words if you want them read a certain way."],
  },
  {
    slug: "urdu-text-to-speech",
    title: "Free Urdu Text to Speech – Natural AI Voice (اردو) | VoiceDost",
    h1: "Free Urdu text to speech",
    intro: "Type in Urdu script and hear it in a natural male or female voice. Download an MP3 with matching subtitles for YouTube, Reels and TikTok.",
    local: { text: "اردو میں لکھیں، قدرتی آواز میں سنیں، اور MP3 ڈاؤن لوڈ کریں۔ بالکل مفت۔", lang: "ur", dir: "rtl" },
    defaultVoice: "hindi-female",
    sample: "السلام علیکم دوستو! آج ہم ایک نئی کہانی سنیں گے۔",
    tips: ["Write in Urdu (Nastaliq) script. Priya, Arjun, Anaya and Rohan all read it.", "Use the Urdu full stop (۔) to give natural pauses between sentences.", "English words inside Urdu text are fine: they are read with English sounds."],
    faq: [
      { q: "Is the Urdu voice free?", a: "Yes. You get 30 free minutes every day, with no sign-up and no card." },
      { q: "Can I use the Urdu voiceover on a monetised YouTube channel?", a: "Yes. VoiceDost voiceovers can be used in monetised videos, as long as your videos follow YouTube's own rules on original content." },
      { q: "Does it read Roman Urdu?", a: "Not yet. For the best result, type in Urdu script or Hindi (Devanagari) script." },
    ],
  },
  {
    slug: "podcast-voice-generator",
    title: "AI Podcast & Dialogue Voice Generator – Several Voices, Free | VoiceDost",
    h1: "AI podcast and dialogue voices",
    intro: "Make conversations with several AI voices in one go. Write each line after a name like Grace: or Ryan: and VoiceDost switches voices for you.",
    defaultVoice: "grace",
    sample: "Welcome to the show! Today we have a very special guest.",
    tips: ["In the studio, start a line with a voice name, e.g. Grace: Hello! then Ryan: Thanks for having me.", "Add [pause 2s] between topics for a natural podcast feel.", "Pick Lo-fi or Calm background music to make it sound produced."],
    faq: [
      { q: "How many voices can I use in one script?", a: "As many as you like from our 13 voices. The voice changes each time you start a line with a new name." },
      { q: "Do I get subtitles for a conversation?", a: "Yes. Every voiceover comes with an SRT subtitle file, timed to each line." },
    ],
  },
  {
    slug: "voiceover-with-subtitles",
    title: "Free AI Voiceover with Subtitles (SRT) – Text to Speech | VoiceDost",
    h1: "Voiceover with subtitles, free",
    intro: "Turn a script into a natural voiceover and get a perfectly timed SRT subtitle file with it. Drop both into CapCut, Premiere or YouTube.",
    defaultVoice: "grace",
    sample: "Here are three facts that sound fake, but are completely true.",
    tips: ["Download the MP3 and the SRT together from the studio.", "Long sentences are split into readable two-line captions automatically.", "Most viewers watch Shorts on mute, so captions keep them watching."],
    faq: [
      { q: "What is an SRT file?", a: "A simple subtitle file with the text and the time each line appears. YouTube, CapCut, Premiere Pro and most editors can import it." },
      { q: "Are subtitles available in Urdu and Hindi?", a: "Yes. The subtitles use exactly what you typed, in any script." },
    ],
  },
  {
    slug: "free-ai-voice-generator",
    title: "Free AI Voice Generator – 13 Natural Voices, No Sign-up | VoiceDost",
    h1: "Free AI voice generator",
    intro: "13 natural AI voices in British and American English, Hindi and Urdu script. Add background music, download MP3 or WAV, and get subtitles too.",
    defaultVoice: "grace",
    sample: "Hi, I'm Grace. Paste your script, pick a voice, and your voiceover is ready in seconds.",
    tips: ["Try a few voices on the same line to find your channel's sound.", "Speed 0.9× suits explainers; 1.1× suits fast Shorts.", "Save your finished voiceovers: the studio keeps your last 10 on your device."],
    faq: [
      { q: "Is it really free?", a: "Yes. 30 minutes of audio every day for free, with no account needed while we launch." },
      { q: "Can I use the voices commercially?", a: "Yes, including monetised YouTube videos and adverts." },
      { q: "Which languages are supported?", a: "British and American English, Hindi, and Urdu script." },
    ],
  },
];

export type UseCase = { slug: string; title: string; h1: string; intro: string; points: string[]; voice: string; sample: string };

export const USE_CASES: UseCase[] = [
  {
    slug: "faceless-youtube",
    title: "Voiceovers for Faceless YouTube Channels | VoiceDost",
    h1: "Faceless YouTube channels",
    intro: "Publish more videos without recording your own voice. Keep the same narrator across every upload.",
    points: ["One consistent narrator for your whole channel", "Redo a single line instead of re-recording", "1,000 minutes a month on Creator covers over a hundred 8-minute videos"],
    voice: "george",
    sample: "Welcome back! In today's video we uncover the story behind one of history's strangest mysteries.",
  },
  {
    slug: "reels-and-shorts",
    title: "Voiceovers for Reels, Shorts and TikTok | VoiceDost",
    h1: "Reels, Shorts and TikTok",
    intro: "Quick, punchy narration in English or Hindi for short videos. Generate in seconds, drop it into your editor.",
    points: ["Hindi and English voices", "Speed control for fast-paced edits", "MP3 ready for CapCut, InShot or Premiere"],
    voice: "hindi-male",
    sample: "रुकिए! यह वीडियो आपका बहुत समय बचाएगा।",
  },
  {
    slug: "training-and-education",
    title: "Voiceovers for Training and Education Videos | VoiceDost",
    h1: "Training and education",
    intro: "Clear British and American voices for lessons, onboarding and course videos, at a fraction of studio cost.",
    points: ["Calm, clear delivery for learning", "Update a lesson by changing one line", "WAV downloads for course platforms"],
    voice: "emma",
    sample: "In this lesson, we'll cover the three steps to get started safely.",
  },
  {
    slug: "small-business",
    title: "Voiceovers for Small Business Videos and Ads | VoiceDost",
    h1: "Small business videos and ads",
    intro: "Product demos, social ads and shop announcements with a professional voice, no studio needed.",
    points: ["Confident voices for ads", "Make variations to test which ad works", "Low monthly cost"],
    voice: "michael",
    sample: "Big savings this weekend only. Visit us in store or order online today.",
  },
];

export type Service = { name: string; description: string; includes: string[]; price: string };

/** Done-for-you services sold through the site. Prices are placeholders until decided. */
export const SERVICES: Service[] = [
  {
    name: "Voiceover for your video",
    description: "Send your script; we deliver a polished voiceover, checked line by line.",
    includes: ["English or Hindi voice", "Pronunciation checked", "MP3 and WAV files"],
    price: "[YOUR PRICE]",
  },
  {
    name: "Script + voiceover",
    description: "Tell us the topic; we write the script and record it with an AI voice.",
    includes: ["Research and script", "One round of changes", "Ready-to-edit audio"],
    price: "[YOUR PRICE]",
  },
  {
    name: "Animated explainer video",
    description: "A complete animated video with maps, charts or characters, narrated and scored.",
    includes: ["Script, voice and animation", "Vertical or landscape", "Music included"],
    price: "[YOUR PRICE]",
  },
];

/**
 * Blog body: one string per paragraph. A string starting "## " is a heading,
 * and a string starting "- " is a bullet point.
 */
export type BlogPost = { slug: string; title: string; summary: string; date: string; body: string[] };

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "start-faceless-youtube-channel-pakistan",
    title: "How to start a faceless YouTube channel from Pakistan (2026 guide)",
    summary: "Pick a niche, write scripts, add a voiceover and reach monetisation, without ever showing your face. Includes the new 2027 YouTube rules.",
    date: "26 November 2026",
    body: [
      "A faceless channel is a YouTube channel where you never appear on camera. The videos are built from a script, a voiceover, and visuals like stock footage, screen recordings, animations or photos. Many creators in Pakistan, India and the UK start this way because it needs no studio, no camera and no confidence on screen.",
      "## 1. Choose a niche you can make 100 videos about",
      "The best niche is one you can keep making videos about for a year. Good faceless niches include history and stories, facts and explainers, motivation, tech tips, finance basics, Islamic stories and lessons, cooking, and kids' stories. Before you choose, search YouTube for your topic and check that channels like yours get views, but are not all copies of each other.",
      "## 2. Write a script before anything else",
      "Viewers decide in the first few seconds whether to stay. Start with a hook (a question, a surprising fact or a promise), then deliver what you promised in clear steps, and end with a reason to watch the next video. An 8-minute video is roughly 1,100 to 1,300 words.",
      "## 3. Record the voiceover",
      "Paste your script into the VoiceDost studio, pick a voice, and download an MP3 with a matching subtitle file. You can write in English, Hindi or Urdu script. Keep one narrator voice across your channel so viewers recognise you, the same way they would recognise a presenter.",
      "## 4. Add visuals and captions",
      "Use a free editor like CapCut. Import the voiceover, add footage that matches each line, and import the SRT subtitles. Most people watch Shorts with the sound off, so captions matter.",
      "## 5. Know the monetisation rules",
      "Today, to earn from ads you need 1,000 subscribers plus either 4,000 public watch hours in the last 12 months or 10 million Shorts views in the last 90 days. YouTube has announced that from 1 February 2027, new applicants will need 8,000 watch hours or 20 million Shorts views instead (the 1,000 subscribers stays the same). Fan funding features unlock earlier, at 500 subscribers.",
      "AI voices are allowed. What YouTube does not pay for is mass-produced, repetitive or template-like content. YouTube calls this its \"inauthentic content\" policy, and clarified it in July 2026. Using AI for the voice is fine; uploading near-identical videos at scale is not.",
      "## 6. Stay original",
      "- Research each video yourself and add your own angle or opinion.",
      "- Vary your formats: lists, stories, comparisons, myths vs facts.",
      "- Don't reupload other people's clips with a voice on top.",
      "- Post on a schedule you can keep, such as two videos a week.",
      "## Start today",
      "Write one script this week, turn it into a voiceover in the VoiceDost studio, and publish. Your first video won't be perfect, but your tenth will be much better.",
    ],
  },
  {
    slug: "write-youtube-script-that-keeps-viewers",
    title: "How to write a YouTube script that keeps people watching",
    summary: "A simple 5-part structure for scripts that hold attention, with a ready-made example you can copy into the studio.",
    date: "26 November 2026",
    body: [
      "Good videos are mostly good scripts. When you use an AI voiceover, the script matters even more, because the voice reads exactly what you write. Here is a structure that works for explainers, stories and Shorts.",
      "## The 5-part structure",
      "- Hook (first 5 seconds): a question, a bold claim or a surprising fact.",
      "- Promise: tell viewers what they will get by the end.",
      "- Value: deliver it in 3 to 5 clear steps or points.",
      "- Re-hook: halfway through, tease what is coming next.",
      "- Ending: a quick summary and a reason to watch another video.",
      "## Write for the ear, not the eye",
      "Short sentences sound natural when spoken. Read your script out loud once. If you run out of breath, split the sentence. Avoid brackets and long lists of numbers; write them how you want them said.",
      "## Use pauses and voices",
      "In VoiceDost you can add a pause anywhere with [pause 2s], and switch voices by starting a line with a name, like Grace: or Ryan:. Pauses after a big fact give it time to land. Two voices make a story or a Q&A feel like a real conversation.",
      "## Example script you can copy",
      "Grace: Did you know honey never goes bad? [pause 1s] Archaeologists have found honey in ancient tombs that is still safe to eat. But why? Stay to the end, because the reason is surprising.",
      "## Length guide",
      "- YouTube Short: 40 to 150 words (about 15 to 60 seconds).",
      "- 8-minute video: about 1,100 to 1,300 words.",
      "- VoiceDost handles up to 10,000 characters per voiceover, about 9 minutes.",
    ],
  },
  {
    slug: "natural-urdu-hindi-ai-voiceover-tips",
    title: "7 tips for natural Urdu and Hindi AI voiceovers",
    summary: "How to write Urdu and Hindi scripts that AI voices read naturally: script choice, punctuation, English words, speed and music.",
    date: "26 November 2026",
    body: [
      "AI voices have become very good at Urdu and Hindi, but how you write the script still makes a big difference. These tips work with VoiceDost's Priya, Arjun, Anaya and Rohan voices.",
      "## 1. Use the proper script",
      "Write Urdu in Urdu (Nastaliq) script and Hindi in Devanagari. Roman Urdu (Urdu typed in English letters) is hard for any voice to read correctly, because the same spelling can be said in many ways.",
      "## 2. End sentences with the right full stop",
      "Use ۔ for Urdu and । for Hindi. Each full stop becomes a natural pause, and each sentence becomes its own subtitle line.",
      "## 3. Keep sentences short",
      "Long sentences with many commas sound rushed. Two short sentences almost always sound better than one long one.",
      "## 4. English words are fine",
      "Words like YouTube, subscribe or WhatsApp can stay in English letters inside Urdu or Hindi text. They are read with English sounds.",
      "## 5. Fix names once",
      "If a name or brand is said wrongly, add it to Pronunciation fixes in the studio, for example VoiceDost → Voice Dost. Your subtitles keep your original spelling.",
      "## 6. Slow down a little for stories",
      "Speed 0.9× gives stories and Islamic lessons a calmer, clearer feel. Keep 1.0× to 1.1× for fast Shorts.",
      "## 7. Choose music carefully",
      "Calm or Cinematic music suits stories; Motivational suits Shorts. For content where music isn't appropriate, choose No music. The voice alone with subtitles works very well.",
    ],
  },
];

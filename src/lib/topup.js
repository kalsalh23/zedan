// شحن التطبيقات والألعاب — خدمات وباقاتها بالأسعار (الطلب واتساب حصرًا · الدفع USDT)
import { whatsappLink } from './format'

export const TOPUP_CATEGORIES = [
  { slug: 'games', name: 'ألعاب', emoji: '🎮' },
  { slug: 'social', name: 'تواصل ومتابعين', emoji: '💬' },
  { slug: 'subs', name: 'اشتراكات', emoji: '📺' },
  { slug: 'cards', name: 'بطاقات ومفاتيح', emoji: '🎁' },
]

// services: { id, name, emoji, cat, packages: [{ p: التسمية, $: السعر بالدولار أو null }] }
export const TOPUP_SERVICES = [
  // ---------- ألعاب ----------
  { id: 'pubg', name: 'ببجي موبايل — شدات UC', emoji: '🪂', cat: 'games', packages: [
    { p: '60 شدة', $: 1 }, { p: '325 شدة', $: 5 }, { p: '660 شدة', $: 10 }, { p: '1800 شدة', $: 25 }, { p: '3850 شدة', $: 50 }, { p: '8100 شدة', $: 100 },
  ] },
  { id: 'ff', name: 'فري فاير — جواهر', emoji: '💎', cat: 'games', packages: [
    { p: '100 جوهرة', $: 1 }, { p: '310 جوهرة', $: 5 }, { p: '520 جوهرة', $: 8 }, { p: '1060 جوهرة', $: 15 }, { p: '2180 جوهرة', $: 30 }, { p: '5600 جوهرة', $: 70 },
  ] },
  { id: 'codm', name: 'كول أوف ديوتي — CP', emoji: '🎖️', cat: 'games', packages: [
    { p: '80 CP', $: 1 }, { p: '420 CP', $: 5 }, { p: '880 CP', $: 10 }, { p: '2400 CP', $: 25 }, { p: '5000 CP', $: 50 },
  ] },
  { id: 'roblox', name: 'روبوكس — Robux', emoji: '🟥', cat: 'games', packages: [
    { p: '400 Robux', $: 5 }, { p: '800 Robux', $: 10 }, { p: '1700 Robux', $: 20 }, { p: '4500 Robux', $: 50 }, { p: '10000 Robux', $: 100 },
  ] },
  { id: 'mlbb', name: 'موبايل ليجندز — ألماس', emoji: '⚔️', cat: 'games', packages: [
    { p: '86 ألماسة', $: 1 }, { p: '257 ألماسة', $: 3 }, { p: '706 ألماسة', $: 8 }, { p: '1412 ألماسة', $: 15 }, { p: '3005 ألماسة', $: 30 },
  ] },
  { id: 'genshin', name: 'Genshin Impact', emoji: '🌟', cat: 'games', packages: [
    { p: '60 كريستال', $: 1 }, { p: '330 كريستال', $: 5 }, { p: '1090 كريستال', $: 15 }, { p: '2240 كريستال', $: 30 }, { p: '8080 كريستال', $: 100 },
  ] },
  { id: 'hsr', name: 'Honkai Star Rail', emoji: '🚄', cat: 'games', packages: [
    { p: '60 كريستال', $: 1 }, { p: '330 كريستال', $: 5 }, { p: '1090 كريستال', $: 15 }, { p: '2240 كريستال', $: 30 },
  ] },
  { id: 'wuwa', name: 'Wuthering Waves', emoji: '🌊', cat: 'games', packages: [
    { p: '300 كريستال', $: 3 }, { p: '980 كريستال', $: 10 }, { p: '1980 كريستال', $: 20 }, { p: '3280 كريستال', $: 30 },
  ] },
  { id: 'zzz', name: 'Zenless Zone Zero', emoji: '🌀', cat: 'games', packages: [
    { p: '60 كريستال', $: 1 }, { p: '330 كريستال', $: 5 }, { p: '1090 كريستال', $: 15 },
  ] },
  { id: 'coc', name: 'Clash of Clans — جيمز', emoji: '🏰', cat: 'games', packages: [
    { p: '80 جيم', $: 1 }, { p: '500 جيم', $: 5 }, { p: '1200 جيم', $: 10 }, { p: '2500 جيم', $: 20 }, { p: '6500 جيم', $: 45 }, { p: '14000 جيم', $: 90 },
  ] },
  { id: 'cr', name: 'Clash Royale — جيمز', emoji: '🃏', cat: 'games', packages: [
    { p: '80 جيم', $: 1 }, { p: '500 جيم', $: 5 }, { p: '1200 جيم', $: 10 }, { p: '2500 جيم', $: 20 },
  ] },
  { id: 'brawl', name: 'Brawl Stars — نقاط', emoji: '⭐', cat: 'games', packages: [
    { p: '30 نقطة', $: 1 }, { p: '80 نقطة', $: 2 }, { p: '170 نقطة', $: 5 }, { p: '360 نقطة', $: 9 }, { p: '950 نقطة', $: 22 }, { p: '2000 نقطة', $: 45 },
  ] },
  { id: 'valorant', name: 'Valorant — VP', emoji: '🔫', cat: 'games', packages: [
    { p: '475 VP', $: 5 }, { p: '1000 VP', $: 10 }, { p: '2050 VP', $: 20 }, { p: '3650 VP', $: 35 }, { p: '5350 VP', $: 50 }, { p: '11000 VP', $: 100 },
  ] },
  { id: 'lol', name: 'League of Legends — RP', emoji: '🧙', cat: 'games', packages: [
    { p: '575 RP', $: 5 }, { p: '1380 RP', $: 10 }, { p: '2800 RP', $: 20 }, { p: '5000 RP', $: 35 },
  ] },
  { id: 'wildrift', name: 'Wild Rift — Wild Cores', emoji: '📱', cat: 'games', packages: [
    { p: '400 كور', $: 5 }, { p: '1000 كور', $: 10 }, { p: '2200 كور', $: 20 }, { p: '4000 كور', $: 35 },
  ] },
  { id: 'fortnite', name: 'Fortnite — V-Bucks', emoji: '🪓', cat: 'games', packages: [
    { p: '1000 V-Bucks', $: 8 }, { p: '2800 V-Bucks', $: 20 }, { p: '5000 V-Bucks', $: 35 }, { p: '13500 V-Bucks', $: 85 },
  ] },
  { id: 'eafc', name: 'EA FC Mobile — فيفا', emoji: '⚽', cat: 'games', packages: [
    { p: '100 نقطة', $: 1 }, { p: '525 نقطة', $: 5 }, { p: '1080 نقطة', $: 10 }, { p: '2200 نقطة', $: 20 }, { p: '5900 نقطة', $: 50 },
  ] },
  { id: 'efootball', name: 'eFootball — بيس', emoji: '🥅', cat: 'games', packages: [
    { p: '100 كوين', $: 1 }, { p: '550 كوين', $: 5 }, { p: '1300 كوين', $: 10 }, { p: '2800 كوين', $: 20 }, { p: '7000 كوين', $: 45 },
  ] },
  { id: '8ball', name: '8 Ball Pool — كوينز', emoji: '🎱', cat: 'games', packages: [
    { p: '25K كوين', $: 3 }, { p: '50K كوين', $: 5 }, { p: '100K كوين', $: 8 }, { p: '250K كوين', $: 15 }, { p: '500K كوين', $: 25 }, { p: '1M كوين', $: 45 },
  ] },
  { id: 'coinmaster', name: 'Coin Master — سبينات', emoji: '🎰', cat: 'games', packages: [
    { p: '50 سبينة', $: 2 }, { p: '120 سبينة', $: 4 }, { p: '300 سبينة', $: 9 }, { p: '700 سبينة', $: 18 }, { p: '1500 سبينة', $: 35 },
  ] },
  { id: 'stumble', name: 'Stumble Guys — جيمز', emoji: '🏃', cat: 'games', packages: [
    { p: '500 جيم', $: 3 }, { p: '1500 جيم', $: 8 }, { p: '4000 جيم', $: 18 },
  ] },
  { id: 'bloodstrike', name: 'Blood Strike — ذهب', emoji: '🩸', cat: 'games', packages: [
    { p: '100 ذهب', $: 1 }, { p: '500 ذهب', $: 5 }, { p: '1200 ذهب', $: 10 }, { p: '2500 ذهب', $: 20 },
  ] },
  { id: 'standoff', name: 'Standoff 2 — ذهب', emoji: '🔫', cat: 'games', packages: [
    { p: '100 ذهب', $: 1 }, { p: '500 ذهب', $: 5 }, { p: '1000 ذهب', $: 10 }, { p: '2500 ذهب', $: 25 },
  ] },
  { id: 'pubgns', name: 'PUBG New State', emoji: '🔭', cat: 'games', packages: [
    { p: '100 عملة', $: 1 }, { p: '500 عملة', $: 5 }, { p: '1200 عملة', $: 10 },
  ] },
  { id: 'farlight', name: 'Farlight 84', emoji: '🚀', cat: 'games', packages: [
    { p: '100 عملة', $: 1 }, { p: '500 عملة', $: 5 }, { p: '1200 عملة', $: 10 },
  ] },
  { id: 'hayday', name: 'Hay Day — عملات', emoji: '🌾', cat: 'games', packages: [
    { p: 'باقة صغيرة', $: 2 }, { p: 'باقة متوسطة', $: 5 }, { p: 'باقة كبيرة', $: 10 },
  ] },
  { id: 'razer', name: 'Razer Gold', emoji: '🟩', cat: 'games', packages: [
    { p: 'بطاقة 5$', $: 6 }, { p: 'بطاقة 10$', $: 11 }, { p: 'بطاقة 20$', $: 21 }, { p: 'بطاقة 50$', $: 52 }, { p: 'بطاقة 100$', $: 103 },
  ] },
  { id: 'steam', name: 'Steam — محفظة', emoji: '🎮', cat: 'games', packages: [
    { p: 'بطاقة 5$', $: 6 }, { p: 'بطاقة 10$', $: 11 }, { p: 'بطاقة 20$', $: 21 }, { p: 'بطاقة 50$', $: 52 }, { p: 'بطاقة 100$', $: 103 },
  ] },

  // ---------- تواصل ومتابعين ----------
  { id: 'tiktok', name: 'تيك توك', emoji: '🎵', cat: 'social', packages: [
    { p: '70 عملة', $: 1 }, { p: '350 عملة', $: 5 }, { p: '700 عملة', $: 10 }, { p: '1400 عملة', $: 20 }, { p: '3500 عملة', $: 50 },
    { p: '1000 متابع', $: 3 }, { p: '5000 متابع', $: 12 }, { p: '10000 متابع', $: 22 }, { p: 'لايكات 1000', $: 2 }, { p: 'مشاهدات 10K', $: 2 },
  ] },
  { id: 'instagram', name: 'انستغرام', emoji: '📸', cat: 'social', packages: [
    { p: '1000 متابع', $: 4 }, { p: '5000 متابع', $: 15 }, { p: '10000 متابع', $: 28 }, { p: 'لايكات 1000', $: 3 }, { p: 'مشاهدات ريلز 10K', $: 3 },
  ] },
  { id: 'youtube', name: 'يوتيوب', emoji: '▶️', cat: 'social', packages: [
    { p: '1000 مشترك', $: 10 }, { p: 'مشاهدات 10K', $: 4 }, { p: '4000 ساعة مشاهدة', $: 25 },
  ] },
  { id: 'telegram', name: 'تيليجرام', emoji: '📨', cat: 'social', packages: [
    { p: '1000 عضو', $: 4 }, { p: '5000 عضو', $: 18 }, { p: '100 نجمة', $: 2 }, { p: '500 نجمة', $: 9 }, { p: 'بريميوم شهر', $: 5 }, { p: 'بريميوم سنة', $: 35 },
  ] },
  { id: 'facebook', name: 'فيسبوك', emoji: '📘', cat: 'social', packages: [
    { p: '1000 متابع صفحة', $: 5 }, { p: '5000 متابع صفحة', $: 20 },
  ] },
  { id: 'x', name: 'X (تويتر)', emoji: '🐦', cat: 'social', packages: [
    { p: '1000 متابع', $: 6 }, { p: '5000 متابع', $: 25 },
  ] },
  { id: 'bigo', name: 'Bigo Live', emoji: '💎', cat: 'social', packages: [
    { p: '100 ألماسة', $: 1 }, { p: '500 ألماسة', $: 5 }, { p: '1000 ألماسة', $: 10 }, { p: '2500 ألماسة', $: 22 },
  ] },
  { id: 'yallaludo', name: 'يلا لودو', emoji: '🎲', cat: 'social', packages: [
    { p: '100 جوهرة', $: 1 }, { p: '500 جوهرة', $: 5 }, { p: '1000 جوهرة', $: 10 },
  ] },
  { id: 'snapchat', name: 'سناب شات', emoji: '👻', cat: 'social', packages: [
    { p: 'باقة صغيرة', $: 3 }, { p: 'باقة متوسطة', $: 8 }, { p: 'باقة كبيرة', $: 15 },
  ] },
  { id: 'likee', name: 'Likee', emoji: '💜', cat: 'social', packages: [
    { p: '100 ألماسة', $: 1 }, { p: '500 ألماسة', $: 5 },
  ] },
  { id: 'imo', name: 'Imo', emoji: '🗨️', cat: 'social', packages: [
    { p: '100 ألماسة', $: 1 }, { p: '500 ألماسة', $: 5 },
  ] },

  // ---------- اشتراكات ----------
  { id: 'netflix', name: 'Netflix', emoji: '🎬', cat: 'subs', packages: [
    { p: 'شهر', $: 10 }, { p: '3 أشهر', $: 25 }, { p: 'سنة', $: 80 },
  ] },
  { id: 'shahid', name: 'Shahid VIP', emoji: '📺', cat: 'subs', packages: [
    { p: 'شهر', $: 8 }, { p: 'سنة', $: 60 },
  ] },
  { id: 'anghami', name: 'Anghami Plus', emoji: '🎧', cat: 'subs', packages: [
    { p: 'شهر', $: 5 }, { p: 'سنة', $: 35 },
  ] },
  { id: 'spotify', name: 'Spotify Premium', emoji: '🎶', cat: 'subs', packages: [
    { p: 'شهر', $: 5 }, { p: 'سنة', $: 30 },
  ] },
  { id: 'ytpremium', name: 'YouTube Premium', emoji: '🔴', cat: 'subs', packages: [
    { p: 'شهر', $: 4 }, { p: 'سنة', $: 35 },
  ] },
  { id: 'chatgpt', name: 'ChatGPT Plus', emoji: '🤖', cat: 'subs', packages: [
    { p: 'شهر', $: 22 },
  ] },
  { id: 'canva', name: 'Canva Pro', emoji: '🎨', cat: 'subs', packages: [
    { p: 'سنة', $: 15 },
  ] },
  { id: 'capcut', name: 'CapCut Pro', emoji: '✂️', cat: 'subs', packages: [
    { p: 'شهر', $: 10 },
  ] },
  { id: 'nitro', name: 'Discord Nitro', emoji: '🎮', cat: 'subs', packages: [
    { p: 'شهر', $: 6 }, { p: 'سنة', $: 50 },
  ] },
  { id: 'gamepass', name: 'Xbox Game Pass', emoji: '🟢', cat: 'subs', packages: [
    { p: 'شهر', $: 12 },
  ] },
  { id: 'psplus', name: 'PlayStation Plus', emoji: '🎮', cat: 'subs', packages: [
    { p: 'شهر', $: 8 },
  ] },
  { id: 'iptv', name: 'IPTV — جميع القنوات', emoji: '📡', cat: 'subs', packages: [
    { p: 'شهر', $: 10 }, { p: 'سنة', $: 60 },
  ] },
  { id: 'starz', name: 'StarzPlay', emoji: '⭐', cat: 'subs', packages: [
    { p: 'شهر', $: 7 },
  ] },
  { id: 'osn', name: 'OSN+', emoji: '📺', cat: 'subs', packages: [
    { p: 'شهر', $: 9 },
  ] },
  { id: 'deezer', name: 'Deezer Premium', emoji: '🎵', cat: 'subs', packages: [
    { p: 'شهر', $: 5 },
  ] },
  { id: 'icloud', name: 'iCloud', emoji: '☁️', cat: 'subs', packages: [
    { p: '50GB — شهر', $: 1 }, { p: '200GB — شهر', $: 3 },
  ] },
  { id: 'gone', name: 'Google One', emoji: '☁️', cat: 'subs', packages: [
    { p: '100GB — سنة', $: 20 }, { p: '200GB — سنة', $: 30 },
  ] },

  // ---------- بطاقات ومفاتيح ----------
  { id: 'itunes', name: 'بطاقة iTunes / Apple', emoji: '🍎', cat: 'cards', packages: [
    { p: '10$', $: 12 }, { p: '25$', $: 28 }, { p: '50$', $: 55 }, { p: '100$', $: 110 },
  ] },
  { id: 'gplay', name: 'بطاقة Google Play', emoji: '🤖', cat: 'cards', packages: [
    { p: '10$', $: 12 }, { p: '25$', $: 28 }, { p: '50$', $: 55 },
  ] },
  { id: 'psn', name: 'بطاقة PlayStation', emoji: '🎮', cat: 'cards', packages: [
    { p: '10$', $: 12 }, { p: '25$', $: 28 }, { p: '50$', $: 55 },
  ] },
  { id: 'xboxcard', name: 'بطاقة Xbox', emoji: '🟢', cat: 'cards', packages: [
    { p: '10$', $: 12 }, { p: '25$', $: 28 }, { p: '50$', $: 55 },
  ] },
  { id: 'nintendo', name: 'بطاقة Nintendo eShop', emoji: '🍄', cat: 'cards', packages: [
    { p: '10$', $: 12 },
  ] },
  { id: 'amazon', name: 'بطاقة Amazon', emoji: '📦', cat: 'cards', packages: [
    { p: '10$', $: 12 }, { p: '25$', $: 28 },
  ] },
  { id: 'win11', name: 'مفتاح Windows 11 Pro', emoji: '🪟', cat: 'cards', packages: [
    { p: 'مفتاح دائم', $: 15 },
  ] },
  { id: 'win10', name: 'مفتاح Windows 10 Pro', emoji: '💻', cat: 'cards', packages: [
    { p: 'مفتاح دائم', $: 10 },
  ] },
  { id: 'office', name: 'مفتاح Office 365', emoji: '📊', cat: 'cards', packages: [
    { p: 'سنة كاملة', $: 20 },
  ] },
  { id: 'buyusdt', name: 'شراء USDT', emoji: '💵', cat: 'cards', packages: [
    { p: 'حسب سعر اللحظة', $: null },
  ] },
  { id: 'sellusdt', name: 'بيع USDT', emoji: '💰', cat: 'cards', packages: [
    { p: 'حسب سعر اللحظة', $: null },
  ] },
  { id: 'binance', name: 'شحن Binance', emoji: '🟡', cat: 'cards', packages: [
    { p: 'تحويل داخلي — حسب المبلغ', $: null },
  ] },
  { id: 'okx', name: 'شحن OKX', emoji: '⬛', cat: 'cards', packages: [
    { p: 'تحويل داخلي — حسب المبلغ', $: null },
  ] },
  { id: 'bybit', name: 'شحن Bybit', emoji: '🟠', cat: 'cards', packages: [
    { p: 'تحويل داخلي — حسب المبلغ', $: null },
  ] },
]

export const topupServiceLink = (service, pkg) =>
  whatsappLink(
    `مرحبًا 👋\nأرغب بطلب شحن:\n${service.emoji} ${service.name}\n📦 الباقة: ${pkg.p}${pkg.$ ? `\n💰 السعر: ${pkg.$}$` : ''}\n\nطريقة الدفع: USDT`
  )

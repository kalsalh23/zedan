-- ============ Seed data ============
insert into public.categories (slug, name, icon, sort_order) values
  ('smartphones', 'هواتف ذكية', 'smartphone', 1),
  ('used', 'أجهزة مستعملة', 'recycle', 2),
  ('audio', 'سماعات وصوتيات', 'headphones', 3),
  ('chargers', 'شواحن وكابلات', 'plug', 4),
  ('cases', 'كفرات وحماية', 'shield', 5),
  ('watches', 'ساعات ذكية', 'watch', 6),
  ('accessories', 'إكسسوارات', 'puzzle', 7)
on conflict (slug) do nothing;

-- ============ NEW PHONES ============
with cat as (select id from public.categories where slug='smartphones')
insert into public.products (slug, name, brand, category_id, condition, network, price, old_price, stock, description, specs, main_image) values
('seed-iphone-16-pro-max', 'iPhone 16 Pro Max 256GB', 'Apple', (select id from cat), 'new', '5G', 1249, 1349, 8,
 'أحدث هواتف آبل بشاشة 6.9 بوصة وشريحة A18 Pro وكاميرا احترافية 48 ميجابكسل — ضمان المتجر سنة كاملة.',
 '{"screen":"6.9\" Super Retina XDR 120Hz","processor":"A18 Pro","ram":"8GB","storage":"256GB","camera":"48MP + 48MP + 12MP","battery":"4685mAh","os":"iOS 18","colors":"أسود تيتانيوم، صحراوي، أبيض"}',
 'https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp'),
('seed-iphone-16', 'iPhone 16 128GB', 'Apple', (select id from cat), 'new', '5G', 869, null, 12,
 'هاتف آبل الأحدث بنسخته القياسية — شاشة OLED وكاميرا مزدوجة 48 ميجابكسل وأداء خرافي مع شريحة A18.',
 '{"screen":"6.1\" OLED 60Hz","processor":"A18","ram":"8GB","storage":"128GB","camera":"48MP + 12MP","battery":"3561mAh","os":"iOS 18","colors":"أسود، أزرق، وردي"}',
 'https://cdn.dummyjson.com/product-images/smartphones/iphone-x/thumbnail.webp'),
('seed-galaxy-s25-ultra', 'Samsung Galaxy S25 Ultra 512GB', 'Samsung', (select id from cat), 'new', '5G', 1199, null, 6,
 'وحش سامسونج الرائد بشاشة 6.9 بوصة Dynamic AMOLED 2X وقلم S Pen مدمج — كاميرا 200 ميجابكسل.',
 '{"screen":"6.9\" Dynamic AMOLED 2X 120Hz","processor":"Snapdragon 8 Elite","ram":"12GB","storage":"512GB","camera":"200MP + 50MP + 12MP + 10MP","battery":"5000mAh","os":"Android 15","colors":"أسود، رمادي، أزرق"}',
 'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/thumbnail.webp'),
('seed-galaxy-s25', 'Samsung Galaxy S25 256GB', 'Samsung', (select id from cat), 'new', '5G', 799, 849, 10,
 'الرائد السامسونجي بحجم مثالي — شاشة AMOLED 120Hz وثلاث كاميرات احترافية وشحن سريع 45W.',
 '{"screen":"6.2\" AMOLED 120Hz","processor":"Snapdragon 8 Elite","ram":"8GB","storage":"256GB","camera":"50MP + 12MP + 10MP","battery":"4000mAh","os":"Android 15","colors":"أسود، فضي، أزرق"}',
 'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/thumbnail.webp'),
('seed-galaxy-a56', 'Samsung Galaxy A56 256GB', 'Samsung', (select id from cat), 'new', '5G', 429, null, 15,
 'الفئة المتوسطة الأشهر — شاشة Super AMOLED وبطارية ضخمة تدوم ليوم كامل مع شحن 45W.',
 '{"screen":"6.7\" Super AMOLED 120Hz","processor":"Exynos 1580","ram":"8GB","storage":"256GB","camera":"50MP + 12MP + 5MP","battery":"5000mAh","os":"Android 15","colors":"أسود، وردي"}',
 'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s8/thumbnail.webp'),
('seed-xiaomi-14t-pro', 'Xiaomi 14T Pro 512GB', 'Xiaomi', (select id from cat), 'new', '5G', 649, 699, 7,
 'أداء راقص بكاميرا Leica وشحن فائق السرعة 120W — أفضل قيمة مقابل السعر في فئته.',
 '{"screen":"6.67\" AMOLED 144Hz","processor":"Dimensity 9300+","ram":"12GB","storage":"512GB","camera":"50MP Leica + 50MP + 12MP","battery":"5000mAh","os":"HyperOS (Android 14)","colors":"رمادي، أزرق"}',
 'https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/thumbnail.webp'),
('seed-redmi-note-14-pro', 'Xiaomi Redmi Note 14 Pro 256GB', 'Xiaomi', (select id from cat), 'new', '4G', 279, null, 20,
 'بطل الفئة الاقتصادية — كاميرا 200 ميجابكسل وشاشة AMOLED منحنية وبطارية 5500mAh.',
 '{"screen":"6.67\" AMOLED 120Hz","processor":"Dimensity 7300","ram":"8GB","storage":"256GB","camera":"200MP + 8MP + 2MP","battery":"5500mAh","os":"HyperOS","colors":"أسود، بنفسجي، أخضر"}',
 'https://cdn.dummyjson.com/product-images/smartphones/realme-c35/thumbnail.webp'),
('seed-realme-14-pro', 'Realme 14 Pro+ 5G 256GB', 'Realme', (select id from cat), 'new', '5G', 349, 379, 9,
 'تصميم أنيق وكاميرا بيريسكوب 3x تقريب — تجربة مستخدم سلسة وواجهة حديثة.',
 '{"screen":"6.83\" AMOLED 120Hz","processor":"Snapdragon 7s Gen 3","ram":"8GB","storage":"256GB","camera":"50MP Sony + 8MP + 32MP","battery":"6000mAh","os":"Android 15","colors":"لؤلؤي، رمادي"}',
 'https://cdn.dummyjson.com/product-images/smartphones/realme-xt/thumbnail.webp')
on conflict (slug) do nothing;

-- ============ USED DEVICES ============
with cat as (select id from public.categories where slug='used')
insert into public.products (slug, name, brand, category_id, condition, network, price, old_price, stock, description, specs, used_details, main_image) values
('seed-used-iphone-15-pro', 'iPhone 15 Pro 128GB — مستعمل', 'Apple', (select id from cat), 'used', '5G', 650, null, 1,
 'جهاز مستعمل بحالة ممتازة جدًا — تيتانيوم أصلي بدون أي إصلاحات، مفحوص بالكامل من فريقنا.',
 '{"screen":"6.1\" Super Retina XDR 120Hz","processor":"A17 Pro","ram":"8GB","storage":"128GB","camera":"48MP + 12MP + 12MP","battery":"3274mAh","os":"iOS 18","colors":"تيتانيوم طبيعي"}',
 '{"overall_condition":"ممتازة","battery_health":92,"screen_condition":"ممتازة","body_condition":"آثار استخدام بسيطة","cameras":"تعمل بشكل سليم","face_id":"تعمل","speakers":"تعمل بشكل سليم","charging":"يعمل بشكل سليم","port":"USB-C سليم","accessories":"الجهاز + كابل USB-C","warranty":"ضمان متجر شهر","usage_duration":"10 أشهر","notes":"الجهاز بحالة الوكالة ولم يُفتح مطلقًا"}',
 'https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp'),
('seed-used-iphone-13', 'iPhone 13 128GB — مستعمل', 'Apple', (select id from cat), 'used', '5G', 380, null, 1,
 'iPhone 13 مستعمل بحالة جيدة جدًا — بطارية قوية وشاشة سليمة، خيار ممتاز بسعر أوفر.',
 '{"screen":"6.1\" Super Retina XDR","processor":"A15 Bionic","ram":"4GB","storage":"128GB","camera":"12MP + 12MP","battery":"3240mAh","os":"iOS 18","colors":"أسود"}',
 '{"overall_condition":"جيدة جدًا","battery_health":87,"screen_condition":"جيدة جدًا","body_condition":"آثار استخدام بسيطة","cameras":"تعمل بشكل سليم","face_id":"تعمل","speakers":"تعمل بشكل سليم","charging":"يعمل بشكل سليم","port":"Lightning سليم","accessories":"الجهاز فقط","warranty":"بدون ضمان","usage_duration":"سنتان"}',
 'https://cdn.dummyjson.com/product-images/smartphones/iphone-x/thumbnail.webp'),
('seed-used-galaxy-s22', 'Samsung Galaxy S22 256GB — مستعمل', 'Samsung', (select id from cat), 'used', '5G', 320, 340, 1,
 'رائد سامسونج السابق بحالة جيدة — شاشة AMOLED مذهلة وكاميرا ممتازة للتصوير الليلي.',
 '{"screen":"6.1\" Dynamic AMOLED 2X 120Hz","processor":"Snapdragon 8 Gen 1","ram":"8GB","storage":"256GB","camera":"50MP + 12MP + 10MP","battery":"3700mAh","os":"Android 14","colors":"أسود"}',
 '{"overall_condition":"جيدة","battery_health":84,"screen_condition":"آثار استخدام","body_condition":"خدوش بسيطة على الإطار","cameras":"تعمل بشكل سليم","face_id":"تعمل","speakers":"تعمل بشكل سليم","charging":"يعمل بشكل سليم","port":"USB-C سليم","accessories":"الجهاز + الشاحن","warranty":"بدون ضمان","usage_duration":"سنتان ونصف"}',
 'https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10/thumbnail.webp'),
('seed-used-iphone-12', 'iPhone 12 64GB — مستعمل', 'Apple', (select id from cat), 'used', '5G', 290, null, 1,
 'أفضل بداية لعالم آبل — جهاز مستعمل نظيف بأداء يكفي لسنوات قادمة.',
 '{"screen":"6.1\" Super Retina XDR","processor":"A14 Bionic","ram":"4GB","storage":"64GB","camera":"12MP + 12MP","battery":"2815mAh","os":"iOS 18","colors":"أبيض"}',
 '{"overall_condition":"جيدة","battery_health":81,"screen_condition":"جيدة جدًا","body_condition":"آثار استخدام بسيطة","cameras":"تعمل بشكل سليم","face_id":"تعمل","speakers":"تعمل بشكل سليم","charging":"يعمل بشكل سليم","port":"Lightning سليم","accessories":"الجهاز + كابل شحن","warranty":"بدون ضمان","usage_duration":"3 سنوات"}',
 'https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp'),
('seed-used-xiaomi-12', 'Xiaomi 12 256GB — مستعمل', 'Xiaomi', (select id from cat), 'used', '5G', 230, null, 1,
 'حجم مثالي وكاميرا Sony ضخمة — جهاز مستعمل بحالة ممتازة بسعر لا يُقاوم.',
 '{"screen":"6.28\" AMOLED 120Hz","processor":"Snapdragon 8 Gen 1","ram":"8GB","storage":"256GB","camera":"50MP Sony + 13MP + 5MP","battery":"4500mAh","os":"MIUI 14","colors":"أزرق"}',
 '{"overall_condition":"ممتازة","battery_health":90,"screen_condition":"ممتازة","body_condition":"ممتاز","cameras":"تعمل بشكل سليم","face_id":"تعمل","speakers":"تعمل بشكل سليم","charging":"يعمل بشكل سليم","port":"USB-C سليم","accessories":"الجهاز + الشاحن الأصلي 67W","warranty":"بدون ضمان","usage_duration":"سنة"}',
 'https://cdn.dummyjson.com/product-images/smartphones/vivo-v9/thumbnail.webp'),
('seed-used-oppo-reno8', 'Oppo Reno8 5G 256GB — مستعمل', 'Oppo', (select id from cat), 'used', '5G', 250, null, 1,
 'هاتف أنيق بكاميرا سيلفي 32 ميجابكسل وشحن 80W فائق السرعة — مستعمل بحالة جيدة جدًا.',
 '{"screen":"6.43\" AMOLED 90Hz","processor":"Dimensity 1300","ram":"8GB","storage":"256GB","camera":"50MP + 2MP + 2MP","battery":"4500mAh","os":"ColorOS 13","colors":"أسود"}',
 '{"overall_condition":"جيدة جدًا","battery_health":88,"screen_condition":"جيدة جدًا","body_condition":"آثار استخدام بسيطة","cameras":"تعمل بشكل سليم","face_id":"تعمل","speakers":"تعمل بشكل سليم","charging":"يعمل بشكل سليم","port":"USB-C سليم","accessories":"الجهاز + الشاحن 80W الأصلي","warranty":"بدون ضمان","usage_duration":"سنة ونصف"}',
 'https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/thumbnail.webp')
on conflict (slug) do nothing;

-- ============ AUDIO ============
with cat as (select id from public.categories where slug='audio')
insert into public.products (slug, name, brand, category_id, condition, network, price, stock, description, specs, main_image) values
('seed-airpods-pro-2', 'Apple AirPods Pro 2 (USB-C)', 'Apple', (select id from cat), 'new', '4G', 219, 10,
 'سماعة آبل الأقوى مع إلغاء ضوضاء تكيفي وصوت مكاني ديناميكي — علبة شحن MagSafe.',
 '{"os":"يعمل مع iOS و Android","battery":"حتى 30 ساعة مع العلبة","colors":"أبيض"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp'),
('seed-airpods-max', 'Apple AirPods Max — Silver', 'Apple', (select id from cat), 'new', '4G', 479, 4,
 'سماعة الرأس الاحترافية من آبل — صوت استثنائي وعزل ضوضاء نشط وتصميم فخم.',
 '{"battery":"حتى 20 ساعة","colors":"فضي"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp'),
('seed-beats-flex', 'Beats Flex Wireless Earphones', 'Beats', (select id from cat), 'new', '4G', 49, 14,
 'سماعة Beats اللاسلكية بعنق مرن — صوت باس قوي وبطارية 12 ساعة بسعر اقتصادي.',
 '{"battery":"12 ساعة","colors":"أسود"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/thumbnail.webp'),
('seed-homepod-mini', 'Apple HomePod Mini', 'Apple', (select id from cat), 'new', '4G', 89, 6,
 'مكبر صوت ذكي بصوت محيطي مذهل ومساعد Siri — يملأ الغرفة كاملة بالصوت النقي.',
 '{"os":"يعمل مع iPhone","colors":"رمادي كوني"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/thumbnail.webp'),
('seed-echo-plus', 'Amazon Echo Plus', 'Amazon', (select id from cat), 'new', '4G', 99, 5,
 'مساعد منزلي ذكي مع مكبر صوت 360 درجة — تحكم بالأضواء والأجهزة الذكية بصوتك.',
 '{"os":"Alexa","colors":"رمادي"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp')
on conflict (slug) do nothing;

-- ============ CHARGERS ============
with cat as (select id from public.categories where slug='chargers')
insert into public.products (slug, name, brand, category_id, condition, network, price, stock, description, specs, main_image) values
('seed-apple-20w-charger', 'شاحن Apple أصلي 20W USB-C', 'Apple', (select id from cat), 'new', '4G', 15, 30,
 'الشاحن الأصلي من آبل — شحن سريع وآمن لهاتفك مع حماية كاملة من التسريب.',
 '{"colors":"أبيض"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp'),
('seed-magsafe-battery', 'Apple MagSafe Battery Pack', 'Apple', (select id from cat), 'new', '4G', 79, 6,
 'بطارية متنقلة مغناطيسية من آبل — تلصقها خلف هاتفك وتشحن بلا كابلات.',
 '{"battery":"5000mAh","colors":"أبيض"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/thumbnail.webp'),
('seed-anker-65w', 'شاحن Anker 65W بثلاثة منافذ GaN', 'Anker', (select id from cat), 'new', '4G', 29, 12,
 'شاحن سريع يشحن هاتفك ولابتوبك معًا — تقنية GaN الحديثة بحجم صغير وقوة ضخمة.',
 '{"colors":"أسود"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp')
on conflict (slug) do nothing;

-- ============ CASES ============
with cat as (select id from public.categories where slug='cases')
insert into public.products (slug, name, brand, category_id, condition, network, price, stock, description, specs, main_image) values
('seed-magsafe-case', 'كفر Apple Silicone Case مع MagSafe', 'Apple', (select id from cat), 'new', '4G', 22, 18,
 'كفر سيليكون أصلي من آبل بملمس حريري وحماية ممتازة — يدعم الشحن المغناطيسي MagSafe.',
 '{"colors":"برقوقي"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp'),
('seed-clear-case', 'كفر شفاف مقاوم للصدمات — iPhone 16', 'Mobily Bro', (select id from cat), 'new', '4G', 8, 40,
 'كفر شفاف يُظهر جمال هاتفك مع حواف مقواة تحمي من السقوط حتى 1.5 متر.',
 '{"colors":"شفاف"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp'),
('seed-screen-protector', 'حماية شاشة زجاج 9H — جميع الهواتف', 'Mobily Bro', (select id from cat), 'new', '4G', 6, 50,
 'زجاج حماية مقاوم للخدوش والكسر بصلابة 9H — تركيب مجاني في المحل.',
 '{"colors":"شفاف"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/thumbnail.webp')
on conflict (slug) do nothing;

-- ============ WATCHES ============
with cat as (select id from public.categories where slug='watches')
insert into public.products (slug, name, brand, category_id, condition, network, price, old_price, stock, description, specs, main_image) values
('seed-apple-watch-9', 'Apple Watch Series 9 GPS 45mm', 'Apple', (select id from cat), 'new', '4G', 379, 399, 5,
 'ساعة آبل الأذكى — شاشة أسطع بضعفي السطوع وميزة النقر المزدوج وتتبع صحي شامل.',
 '{"battery":"18 ساعة","os":"watchOS 10","colors":"ذهبي وردي"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp'),
('seed-galaxy-watch-6', 'Samsung Galaxy Watch6 44mm', 'Samsung', (select id from cat), 'new', '4G', 249, null, 4,
 'ساعة سامسونج الذكية بشاشة sAMOLED كبيرة — تتبع نوم متقدم وتخطيط قلب.',
 '{"battery":"425mAh","os":"Wear OS","colors":"أسود"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp')
on conflict (slug) do nothing;

with cat as (select id from public.categories where slug='used')
insert into public.products (slug, name, brand, category_id, condition, network, price, old_price, stock, description, specs, used_details, main_image) values
('seed-used-watch-s8', 'Apple Watch Series 8 45mm — مستعمل', 'Apple', (select id from cat), 'used', '4G', 229, null, 1,
 'ساعة آبل مستعملة بحالة ممتازة — البطارية 94% والشاشة بدون خدوش.',
 '{"battery":"18 ساعة","os":"watchOS 10","colors":"أسود"}',
 '{"overall_condition":"ممتازة","battery_health":94,"screen_condition":"ممتازة","body_condition":"ممتاز","cameras":"لا ينطبق","face_id":"تعمل","speakers":"تعمل بشكل سليم","charging":"يعمل بشكل سليم","port":"شحن مغناطيسي","accessories":"الساعة + الشاحن + سوار إضافي","warranty":"ضمان متجر أسبوعين","usage_duration":"سنة"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp')
on conflict (slug) do nothing;

-- ============ ACCESSORIES ============
with cat as (select id from public.categories where slug='accessories')
insert into public.products (slug, name, brand, category_id, condition, network, price, stock, description, specs, main_image) values
('seed-selfie-stick', 'عصا سيلفي لاسلكية بلوتوث', 'Mobily Bro', (select id from cat), 'new', '4G', 9, 25,
 'عصا سيلفي قابلة للتمدد مع ريموت بلوتوث مدمج — رفيقك المثالي للتصوير.',
 '{"colors":"أسود"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-stick-monopod/thumbnail.webp'),
('seed-selfie-lamp', 'إضاءة سيلفي احترافية دائرية', 'Mobily Bro', (select id from cat), 'new', '4G', 14, 15,
 'حلقة إضاءة بثلاث درجات حرارة لونية — صور مثالية حتى في الظلام.',
 '{"colors":"أبيض"}',
 'https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/thumbnail.webp');

-- ============ Sample offer ============
insert into public.offers (title, description, discount, image_url, starts_at, ends_at, is_active)
values ('عرض افتتاح Mobily Bro', 'خصومات حصرية على أحدث الهواتف والإكسسوارات — لفترة محدودة فقط!', '15%', null, current_date - 1, current_date + 30, true);

insert into public.badges (name, description, icon, criteria) values
('Protein Champion', 'Hit protein target 7 days in a row', 'protein-champion', '{"days":7,"metric":"protein"}'),
('United Family', 'All members logged activity on same day (3+ days)', 'united-family', '{"days":3,"metric":"family_activity"}'),
('7-Day Streak', '7 consecutive days of logging', '7-day-streak', '{"days":7,"metric":"logging"}'),
('Sleep Master', '7+ hours sleep for 5 days', 'sleep-master', '{"days":5,"metric":"sleep"}'),
('Hydration Hero', '2L water daily for 7 days', 'hydration-hero', '{"days":7,"metric":"hydration"}'),
('Junk-Free Week', 'Zero junk food for 7 days', 'junk-free-week', '{"days":7,"metric":"junk_free"}'),
('Morning Warrior', 'Completed morning routine 5 days in a row', 'morning-warrior', '{"days":5,"metric":"morning_routine"}'),
('Festival Fighter', 'Stayed on plan during a festival week', 'festival-fighter', '{"days":7,"metric":"festival_mode"}');

with base_names as (
  select * from (
    values
    ('Roti','रोटी'),('Chapati','चपाती'),('Phulka','फुल्का'),('Jeera Rice','जीरा राइस'),('Steamed Rice','सादा चावल'),
    ('Idli','इडली'),('Dosa','डोसा'),('Upma','उपमा'),('Poha','पोहा'),('Khichdi','खिचड़ी'),
    ('Rajma','राजमा'),('Chole','छोले'),('Moong Dal','मूंग दाल'),('Toor Dal','तूर दाल'),('Masoor Dal','मसूर दाल'),
    ('Paneer Bhurji','पनीर भुर्जी'),('Paneer Tikka','पनीर टिक्का'),('Palak Paneer','पालक पनीर'),('Aloo Gobi','आलू गोभी'),('Bhindi Sabzi','भिंडी सब्ज़ी'),
    ('Sambar','सांभर'),('Rasam','रसम'),('Curd Rice','दही चावल'),('Thepla','थेपला'),('Dhokla','ढोकला'),
    ('Sprouts Chaat','स्प्राउट्स चाट'),('Peanut Chikki','मूंगफली चिक्की'),('Buttermilk','छाछ'),('Lassi','लस्सी'),('Bhel','भेल')
  ) as t(name_en, name_hi)
),
qualifiers as (
  select * from (
    values
    ('Classic','क्लासिक'),('Homestyle','घर जैसा'),('Tiffin Style','टिफिन स्टाइल'),('High Protein','हाई प्रोटीन'),('Light Masala','हल्का मसाला'),
    ('Festival','त्योहार'),('Millet','मिलेट'),('Kids Special','बच्चों के लिए'),('Senior Friendly','सीनियर फ्रेंडली'),('Street Style','स्ट्रीट स्टाइल'),
    ('North Indian','नॉर्थ इंडियन'),('South Indian','साउथ इंडियन'),('East Indian','ईस्ट इंडियन'),('West Indian','वेस्ट इंडियन'),('Monsoon Special','मानसून स्पेशल'),
    ('Summer Special','समर स्पेशल'),('Winter Special','विंटर स्पेशल'),('Breakfast Bowl','ब्रेकफास्ट बाउल'),('Lunch Plate','लंच प्लेट'),('Dinner Combo','डिनर कॉम्बो')
  ) as q(q_en, q_hi)
)
insert into public.food_items (name_en, name_hi, category, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, is_indian, region, barcode)
select
  q.q_en || ' ' || b.name_en,
  q.q_hi || ' ' || b.name_hi,
  (array['dal','sabzi','roti','rice','snack','beverage'])[((row_number() over ()) % 6) + 1],
  80 + ((row_number() over ()) % 220),
  3 + ((row_number() over ()) % 18),
  8 + ((row_number() over ()) % 40),
  1 + ((row_number() over ()) % 14),
  1 + ((row_number() over ()) % 10),
  true,
  (array['north','south','east','west','pan-india'])[((row_number() over ()) % 5) + 1],
  '8901' || lpad((row_number() over ())::text, 8, '0')
from qualifiers q
cross join base_names b;

-- 20 x 30 = 600 seeded foods

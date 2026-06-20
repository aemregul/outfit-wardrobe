-- Dev seed data — idempotent via ON CONFLICT / DO NOTHING

-- ─── USER PROFILES ────────────────────────────────────────────────────────────
-- admin already exists from first login; upsert to set display fields
INSERT INTO user_profiles (id, keycloak_user_id, email, username, display_name, bio, style_preferences, is_private, created_at)
VALUES (
  'b68db9ea-7fb5-49e7-81a3-e005d9852b00',
  'c5ae8a24-398c-4c40-8064-c84a013fb950',
  'admin@outfit-combine.local', 'admin', 'Admin User',
  'Platform admin. Minimalist style lover.',
  ARRAY['minimalist','casual','formal'], false, NOW() - INTERVAL '90 days'
)
ON CONFLICT (keycloak_user_id) DO UPDATE
  SET display_name      = EXCLUDED.display_name,
      bio               = EXCLUDED.bio,
      style_preferences = EXCLUDED.style_preferences;

INSERT INTO user_profiles (id, keycloak_user_id, email, username, display_name, bio, style_preferences, is_private, created_at)
VALUES (
  '4c000002-0000-0000-0000-000000000001',
  '4c7794b0-b76b-43ca-8b79-d4a768ff3898',
  'e2e_alice@example.com', 'alice', 'Alice',
  'Fashion enthusiast. Boho vibes and vintage finds.',
  ARRAY['bohemian','vintage','chic'], false, NOW() - INTERVAL '60 days'
)
ON CONFLICT (keycloak_user_id) DO NOTHING;

INSERT INTO user_profiles (id, keycloak_user_id, email, username, display_name, bio, style_preferences, is_private, created_at)
VALUES (
  '5b000003-0000-0000-0000-000000000001',
  'b599c048-3d5b-4201-8457-3ec0288fec42',
  'e2e_bob@example.com', 'bob', 'Bob',
  'Streetwear collector. Sneakerhead.',
  ARRAY['streetwear','sporty','casual'], false, NOW() - INTERVAL '45 days'
)
ON CONFLICT (keycloak_user_id) DO NOTHING;


-- ─── ADMIN CLOTHING ITEMS ─────────────────────────────────────────────────────
INSERT INTO clothing_items (id, user_id, name, category, sub_category, colors, brand, size, seasons, styles, material, is_clean, wear_count) VALUES
('c0000001-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Beyaz Basic T-Shirt','TOP','T-Shirt',ARRAY['white'],'Uniqlo','M',ARRAY['SPRING','SUMMER'],ARRAY['casual','minimalist'],'Cotton',true,12),
('c0000001-0000-0000-0000-000000000002','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Siyah Slim Fit Jean','BOTTOM','Jean',ARRAY['black'],'Mavi','32',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['casual','minimalist'],'Denim',true,20),
('c0000001-0000-0000-0000-000000000003','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Lacivert Gömlek','TOP','Shirt',ARRAY['navy'],'Zara','M',ARRAY['SPRING','AUTUMN'],ARRAY['formal','minimalist'],'Cotton',true,8),
('c0000001-0000-0000-0000-000000000004','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Gri Hoodie','TOP','Hoodie',ARRAY['grey'],'H&M','M',ARRAY['AUTUMN','WINTER'],ARRAY['casual','streetwear'],'Cotton Blend',true,15),
('c0000001-0000-0000-0000-000000000005','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Beyaz Converse','SHOES','Sneaker',ARRAY['white'],'Converse','42',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['casual','streetwear'],'Canvas',true,30),
('c0000001-0000-0000-0000-000000000006','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Siyah Deri Ceket','OUTERWEAR','Jacket',ARRAY['black'],'Zara','M',ARRAY['AUTUMN','WINTER'],ARRAY['streetwear','chic'],'Faux Leather',true,5),
('c0000001-0000-0000-0000-000000000007','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Krem Keten Gömlek','TOP','Shirt',ARRAY['beige'],'Massimo Dutti','M',ARRAY['SPRING','SUMMER'],ARRAY['casual','minimalist'],'Linen',true,10),
('c0000001-0000-0000-0000-000000000008','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Bej Chino Pantolon','BOTTOM','Chino',ARRAY['beige'],'Mango Man','32',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['casual','preppy'],'Cotton',true,18),
('c0000001-0000-0000-0000-000000000009','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Chelsea Boot Siyah','SHOES','Boot',ARRAY['black'],'Zara','42',ARRAY['AUTUMN','WINTER'],ARRAY['formal','chic'],'Leather',true,7),
('c0000001-0000-0000-0000-000000000010','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Siyah Trençkot','OUTERWEAR','Trench Coat',ARRAY['black'],'Reserved','M',ARRAY['AUTUMN','WINTER'],ARRAY['formal','minimalist'],'Polyester',true,4),
('c0000001-0000-0000-0000-000000000011','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Beyaz Oxford Gömlek','TOP','Shirt',ARRAY['white'],'Massimo Dutti','M',ARRAY['SPRING','AUTUMN'],ARRAY['formal','preppy'],'Cotton',false,6),
('c0000001-0000-0000-0000-000000000012','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Lacivert Jogger','BOTTOM','Jogger',ARRAY['navy'],'Nike','M',ARRAY['AUTUMN','WINTER'],ARRAY['sporty','casual'],'Fleece',true,9),
('c0000001-0000-0000-0000-000000000013','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Air Force 1 Beyaz','SHOES','Sneaker',ARRAY['white'],'Nike','42',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['streetwear','casual'],'Leather',true,25),
('c0000001-0000-0000-0000-000000000014','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Koyu Mavi Jean','BOTTOM','Jean',ARRAY['dark blue'],'Levi''s','32',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['casual','preppy'],'Denim',true,22),
('c0000001-0000-0000-0000-000000000015','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Ekru Kazak','TOP','Knitwear',ARRAY['cream'],'Zara','M',ARRAY['AUTUMN','WINTER'],ARRAY['minimalist','casual'],'Wool Blend',true,3)
ON CONFLICT (id) DO NOTHING;


-- ─── ALICE CLOTHING ITEMS ─────────────────────────────────────────────────────
INSERT INTO clothing_items (id, user_id, name, category, sub_category, colors, brand, size, seasons, styles, material, is_clean, wear_count) VALUES
('c0000002-0000-0000-0000-000000000001','4c000002-0000-0000-0000-000000000001','Çiçekli Midi Elbise','DRESS','Midi Dress',ARRAY['pink','white'],'Zara','S',ARRAY['SPRING','SUMMER'],ARRAY['bohemian','romantic'],'Viscose',true,8),
('c0000002-0000-0000-0000-000000000002','4c000002-0000-0000-0000-000000000001','Vintage Mom Jean','BOTTOM','Jean',ARRAY['light blue'],'Levi''s','27',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['vintage','casual'],'Denim',true,20),
('c0000002-0000-0000-0000-000000000003','4c000002-0000-0000-0000-000000000001','Beyaz Linen Bluz','TOP','Blouse',ARRAY['white'],'Mango','S',ARRAY['SPRING','SUMMER'],ARRAY['bohemian','minimalist'],'Linen',true,12),
('c0000002-0000-0000-0000-000000000004','4c000002-0000-0000-0000-000000000001','Camel Blazer','OUTERWEAR','Blazer',ARRAY['camel'],'Zara','S',ARRAY['SPRING','AUTUMN'],ARRAY['chic','formal'],'Polyester',true,6),
('c0000002-0000-0000-0000-000000000005','4c000002-0000-0000-0000-000000000001','Ankle Boot Kahverengi','SHOES','Boot',ARRAY['brown'],'Aldo','36',ARRAY['AUTUMN','WINTER'],ARRAY['vintage','chic'],'Leather',true,15),
('c0000002-0000-0000-0000-000000000006','4c000002-0000-0000-0000-000000000001','Krem Trençkot','OUTERWEAR','Trench Coat',ARRAY['cream'],'H&M','S',ARRAY['SPRING','AUTUMN'],ARRAY['chic','preppy'],'Cotton',true,4),
('c0000002-0000-0000-0000-000000000007','4c000002-0000-0000-0000-000000000001','Mini Etek Siyah','BOTTOM','Skirt',ARRAY['black'],'Zara','S',ARRAY['SPRING','SUMMER'],ARRAY['chic','romantic'],'Faux Leather',true,7),
('c0000002-0000-0000-0000-000000000008','4c000002-0000-0000-0000-000000000001','New Balance 574 Beyaz','SHOES','Sneaker',ARRAY['white','grey'],'New Balance','36',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['casual','streetwear'],'Mesh',true,18),
('c0000002-0000-0000-0000-000000000009','4c000002-0000-0000-0000-000000000001','Denim Ceket Oversize','OUTERWEAR','Jacket',ARRAY['blue'],'H&M','M',ARRAY['SPRING','AUTUMN'],ARRAY['vintage','casual'],'Denim',false,10),
('c0000002-0000-0000-0000-000000000010','4c000002-0000-0000-0000-000000000001','Crop Top Bej','TOP','Top',ARRAY['beige'],'Pull&Bear','S',ARRAY['SPRING','SUMMER'],ARRAY['casual','bohemian'],'Ribbed Cotton',true,14)
ON CONFLICT (id) DO NOTHING;


-- ─── BOB CLOTHING ITEMS ───────────────────────────────────────────────────────
INSERT INTO clothing_items (id, user_id, name, category, sub_category, colors, brand, size, seasons, styles, material, is_clean, wear_count) VALUES
('c0000003-0000-0000-0000-000000000001','5b000003-0000-0000-0000-000000000001','Jordan 1 Mid Siyah','SHOES','Sneaker',ARRAY['black','white'],'Nike','43',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['streetwear','casual'],'Leather',true,40),
('c0000003-0000-0000-0000-000000000002','5b000003-0000-0000-0000-000000000001','Siyah Cargo Pantolon','BOTTOM','Cargo',ARRAY['black'],'Carhartt','32',ARRAY['SPRING','AUTUMN'],ARRAY['streetwear','casual'],'Cotton Canvas',true,15),
('c0000003-0000-0000-0000-000000000003','5b000003-0000-0000-0000-000000000001','Oversized Grafik T-Shirt','TOP','T-Shirt',ARRAY['black'],'Supreme','L',ARRAY['SPRING','SUMMER'],ARRAY['streetwear'],'Cotton',true,10),
('c0000003-0000-0000-0000-000000000004','5b000003-0000-0000-0000-000000000001','Bomber Ceket Yeşil','OUTERWEAR','Bomber',ARRAY['olive'],'Alpha Industries','L',ARRAY['SPRING','AUTUMN'],ARRAY['streetwear','casual'],'Nylon',true,8),
('c0000003-0000-0000-0000-000000000005','5b000003-0000-0000-0000-000000000001','Yeezy 350 Gri','SHOES','Sneaker',ARRAY['grey'],'Adidas','43',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['streetwear'],'Primeknit',true,20),
('c0000003-0000-0000-0000-000000000006','5b000003-0000-0000-0000-000000000001','Siyah Hoodie','TOP','Hoodie',ARRAY['black'],'Nike','L',ARRAY['AUTUMN','WINTER'],ARRAY['streetwear','sporty'],'Fleece',true,25),
('c0000003-0000-0000-0000-000000000007','5b000003-0000-0000-0000-000000000001','Straight Leg Jean','BOTTOM','Jean',ARRAY['indigo'],'Levi''s','32',ARRAY['SPRING','SUMMER','AUTUMN'],ARRAY['casual','streetwear'],'Denim',true,18)
ON CONFLICT (id) DO NOTHING;


-- ─── ADMIN OUTFITS ────────────────────────────────────────────────────────────
INSERT INTO outfits (id, user_id, name, description, occasion, seasons, styles, ai_generated, ai_score, is_favorite, created_at) VALUES
('f0000001-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Günlük Minimalist','Rahat ve şık günlük kombin',ARRAY['casual','daily'],ARRAY['SPRING','SUMMER'],ARRAY['minimalist','casual'],false,null,true,NOW()-INTERVAL'30 days'),
('f0000001-0000-0000-0000-000000000002','b68db9ea-7fb5-49e7-81a3-e005d9852b00','İş Toplantısı','Profesyonel görünüm için',ARRAY['work','formal'],ARRAY['SPRING','AUTUMN'],ARRAY['formal','minimalist'],true,8.7,false,NOW()-INTERVAL'20 days'),
('f0000001-0000-0000-0000-000000000003','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Hafta Sonu Casual','Rahat hafta sonu kombin',ARRAY['casual','weekend'],ARRAY['SPRING','AUTUMN'],ARRAY['casual','streetwear'],false,null,true,NOW()-INTERVAL'15 days'),
('f0000001-0000-0000-0000-000000000004','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Kış Günü','Sıcak tutan şık kış kombini',ARRAY['daily','outdoor'],ARRAY['WINTER'],ARRAY['minimalist','chic'],true,9.2,true,NOW()-INTERVAL'10 days'),
('f0000001-0000-0000-0000-000000000005','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Akşam Yemeği','Smart casual akşam kombini',ARRAY['dinner','date'],ARRAY['SPRING','AUTUMN'],ARRAY['chic','formal'],false,null,false,NOW()-INTERVAL'5 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO outfit_items (outfit_id, clothing_item_id) VALUES
('f0000001-0000-0000-0000-000000000001','c0000001-0000-0000-0000-000000000001'),
('f0000001-0000-0000-0000-000000000001','c0000001-0000-0000-0000-000000000002'),
('f0000001-0000-0000-0000-000000000001','c0000001-0000-0000-0000-000000000005'),
('f0000001-0000-0000-0000-000000000002','c0000001-0000-0000-0000-000000000003'),
('f0000001-0000-0000-0000-000000000002','c0000001-0000-0000-0000-000000000008'),
('f0000001-0000-0000-0000-000000000002','c0000001-0000-0000-0000-000000000009'),
('f0000001-0000-0000-0000-000000000003','c0000001-0000-0000-0000-000000000004'),
('f0000001-0000-0000-0000-000000000003','c0000001-0000-0000-0000-000000000002'),
('f0000001-0000-0000-0000-000000000003','c0000001-0000-0000-0000-000000000013'),
('f0000001-0000-0000-0000-000000000004','c0000001-0000-0000-0000-000000000015'),
('f0000001-0000-0000-0000-000000000004','c0000001-0000-0000-0000-000000000014'),
('f0000001-0000-0000-0000-000000000004','c0000001-0000-0000-0000-000000000009'),
('f0000001-0000-0000-0000-000000000004','c0000001-0000-0000-0000-000000000010'),
('f0000001-0000-0000-0000-000000000005','c0000001-0000-0000-0000-000000000011'),
('f0000001-0000-0000-0000-000000000005','c0000001-0000-0000-0000-000000000008'),
('f0000001-0000-0000-0000-000000000005','c0000001-0000-0000-0000-000000000009'),
('f0000001-0000-0000-0000-000000000005','c0000001-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;


-- ─── ALICE OUTFITS ────────────────────────────────────────────────────────────
INSERT INTO outfits (id, user_id, name, description, occasion, seasons, styles, ai_generated, ai_score, is_favorite, created_at) VALUES
('f0000002-0000-0000-0000-000000000001','4c000002-0000-0000-0000-000000000001','Boho Bahar','Bahar için özgür ruhlu kombin',ARRAY['casual','outdoor'],ARRAY['SPRING'],ARRAY['bohemian','romantic'],false,null,true,NOW()-INTERVAL'25 days'),
('f0000002-0000-0000-0000-000000000002','4c000002-0000-0000-0000-000000000001','Vintage Casual','Vintage dokunuşlu günlük stil',ARRAY['casual','weekend'],ARRAY['SPRING','AUTUMN'],ARRAY['vintage','casual'],true,8.4,false,NOW()-INTERVAL'12 days'),
('f0000002-0000-0000-0000-000000000003','4c000002-0000-0000-0000-000000000001','Şık Ofis','Kadın için ofis kombini',ARRAY['work','formal'],ARRAY['AUTUMN'],ARRAY['chic','formal'],false,null,true,NOW()-INTERVAL'7 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO outfit_items (outfit_id, clothing_item_id) VALUES
('f0000002-0000-0000-0000-000000000001','c0000002-0000-0000-0000-000000000001'),
('f0000002-0000-0000-0000-000000000001','c0000002-0000-0000-0000-000000000008'),
('f0000002-0000-0000-0000-000000000002','c0000002-0000-0000-0000-000000000002'),
('f0000002-0000-0000-0000-000000000002','c0000002-0000-0000-0000-000000000010'),
('f0000002-0000-0000-0000-000000000002','c0000002-0000-0000-0000-000000000009'),
('f0000002-0000-0000-0000-000000000002','c0000002-0000-0000-0000-000000000005'),
('f0000002-0000-0000-0000-000000000003','c0000002-0000-0000-0000-000000000003'),
('f0000002-0000-0000-0000-000000000003','c0000002-0000-0000-0000-000000000007'),
('f0000002-0000-0000-0000-000000000003','c0000002-0000-0000-0000-000000000005'),
('f0000002-0000-0000-0000-000000000003','c0000002-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;


-- ─── BOB OUTFITS ──────────────────────────────────────────────────────────────
INSERT INTO outfits (id, user_id, name, description, occasion, seasons, styles, ai_generated, ai_score, is_favorite, created_at) VALUES
('f0000003-0000-0000-0000-000000000001','5b000003-0000-0000-0000-000000000001','Street Günlük','Klasik streetwear kombin',ARRAY['casual','street'],ARRAY['SPRING','SUMMER'],ARRAY['streetwear','casual'],false,null,true,NOW()-INTERVAL'20 days'),
('f0000003-0000-0000-0000-000000000002','5b000003-0000-0000-0000-000000000001','Sonbahar Street','Bomber ile sonbahar kombini',ARRAY['casual','outdoor'],ARRAY['AUTUMN'],ARRAY['streetwear'],true,7.9,false,NOW()-INTERVAL'8 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO outfit_items (outfit_id, clothing_item_id) VALUES
('f0000003-0000-0000-0000-000000000001','c0000003-0000-0000-0000-000000000003'),
('f0000003-0000-0000-0000-000000000001','c0000003-0000-0000-0000-000000000002'),
('f0000003-0000-0000-0000-000000000001','c0000003-0000-0000-0000-000000000001'),
('f0000003-0000-0000-0000-000000000002','c0000003-0000-0000-0000-000000000006'),
('f0000003-0000-0000-0000-000000000002','c0000003-0000-0000-0000-000000000007'),
('f0000003-0000-0000-0000-000000000002','c0000003-0000-0000-0000-000000000004'),
('f0000003-0000-0000-0000-000000000002','c0000003-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;


-- ─── WEAR LOGS ────────────────────────────────────────────────────────────────
INSERT INTO wear_logs (user_id, outfit_id, worn_at, occasion, rating, would_wear_again, note) VALUES
('b68db9ea-7fb5-49e7-81a3-e005d9852b00','f0000001-0000-0000-0000-000000000001',NOW()-INTERVAL'28 days','casual',5,true,'Çok rahat ve şıktı.'),
('b68db9ea-7fb5-49e7-81a3-e005d9852b00','f0000001-0000-0000-0000-000000000002',NOW()-INTERVAL'18 days','work',4,true,'Toplantıda güzel yorumlar aldım.'),
('b68db9ea-7fb5-49e7-81a3-e005d9852b00','f0000001-0000-0000-0000-000000000003',NOW()-INTERVAL'12 days','weekend',5,true,'Hafta sonu favorim.'),
('b68db9ea-7fb5-49e7-81a3-e005d9852b00','f0000001-0000-0000-0000-000000000004',NOW()-INTERVAL'8 days','outdoor',4,true,'Kışın ideal.'),
('4c000002-0000-0000-0000-000000000001','f0000002-0000-0000-0000-000000000001',NOW()-INTERVAL'22 days','casual',5,true,'Boho vibes!'),
('4c000002-0000-0000-0000-000000000001','f0000002-0000-0000-0000-000000000002',NOW()-INTERVAL'10 days','weekend',4,true,'Vintage vibe yakaladım.'),
('5b000003-0000-0000-0000-000000000001','f0000003-0000-0000-0000-000000000001',NOW()-INTERVAL'18 days','street',5,true,'Jordan ile perfect combo.'),
('5b000003-0000-0000-0000-000000000001','f0000003-0000-0000-0000-000000000002',NOW()-INTERVAL'6 days','casual',4,true,'Bomberla çok iyi gitti.');


-- ─── POSTS ────────────────────────────────────────────────────────────────────
INSERT INTO posts (id, user_id, outfit_id, image_url, caption, visibility, likes_count, comments_count, created_at) VALUES
('e0000001-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00','f0000001-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600','Günlük minimalist kombin. Basit ama etkili 🤍','PUBLIC',0,0,NOW()-INTERVAL'27 days'),
('e0000001-0000-0000-0000-000000000002','b68db9ea-7fb5-49e7-81a3-e005d9852b00','f0000001-0000-0000-0000-000000000004','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600','Kış kombinim. AI 9.2 puan verdi! ❄️','PUBLIC',0,0,NOW()-INTERVAL'9 days'),
('e0000002-0000-0000-0000-000000000001','4c000002-0000-0000-0000-000000000001','f0000002-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600','Bahar geldi, boho enerjisi geldi 🌸','PUBLIC',0,0,NOW()-INTERVAL'24 days'),
('e0000002-0000-0000-0000-000000000002','4c000002-0000-0000-0000-000000000001','f0000002-0000-0000-0000-000000000003','https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600','Ofis kombini ama sıkıcı değil! 💼✨','PUBLIC',0,0,NOW()-INTERVAL'6 days'),
('e0000003-0000-0000-0000-000000000001','5b000003-0000-0000-0000-000000000001','f0000003-0000-0000-0000-000000000001','https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600','Street game strong. Jordan 1 hits different 👟🔥','PUBLIC',0,0,NOW()-INTERVAL'19 days')
ON CONFLICT (id) DO NOTHING;


-- ─── FOLLOWS ──────────────────────────────────────────────────────────────────
INSERT INTO follows (follower_id, following_id, created_at) VALUES
('b68db9ea-7fb5-49e7-81a3-e005d9852b00','4c000002-0000-0000-0000-000000000001',NOW()-INTERVAL'55 days'),
('b68db9ea-7fb5-49e7-81a3-e005d9852b00','5b000003-0000-0000-0000-000000000001',NOW()-INTERVAL'40 days'),
('4c000002-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00',NOW()-INTERVAL'50 days'),
('4c000002-0000-0000-0000-000000000001','5b000003-0000-0000-0000-000000000001',NOW()-INTERVAL'35 days'),
('5b000003-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00',NOW()-INTERVAL'42 days')
ON CONFLICT DO NOTHING;


-- ─── LIKES ────────────────────────────────────────────────────────────────────
INSERT INTO post_likes (post_id, user_id, created_at) VALUES
('e0000001-0000-0000-0000-000000000001','4c000002-0000-0000-0000-000000000001',NOW()-INTERVAL'26 days'),
('e0000001-0000-0000-0000-000000000001','5b000003-0000-0000-0000-000000000001',NOW()-INTERVAL'26 days'),
('e0000002-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00',NOW()-INTERVAL'23 days'),
('e0000002-0000-0000-0000-000000000001','5b000003-0000-0000-0000-000000000001',NOW()-INTERVAL'22 days'),
('e0000003-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00',NOW()-INTERVAL'18 days'),
('e0000003-0000-0000-0000-000000000001','4c000002-0000-0000-0000-000000000001',NOW()-INTERVAL'18 days'),
('e0000001-0000-0000-0000-000000000002','4c000002-0000-0000-0000-000000000001',NOW()-INTERVAL'8 days'),
('e0000002-0000-0000-0000-000000000002','5b000003-0000-0000-0000-000000000001',NOW()-INTERVAL'5 days')
ON CONFLICT DO NOTHING;


-- ─── COMMENTS ─────────────────────────────────────────────────────────────────
INSERT INTO comments (post_id, user_id, content, created_at) VALUES
('e0000001-0000-0000-0000-000000000001','4c000002-0000-0000-0000-000000000001','Çok şık! Minimalist tarz sana çok yakışmış 🤍',NOW()-INTERVAL'26 days'),
('e0000001-0000-0000-0000-000000000001','5b000003-0000-0000-0000-000000000001','Converse seçimi harika!',NOW()-INTERVAL'25 days'),
('e0000001-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Teşekkürler! Converse klasikler arasında 🙏',NOW()-INTERVAL'25 days'),
('e0000002-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Boho tarzın çok iyi! Renk uyumu mükemmel.',NOW()-INTERVAL'23 days'),
('e0000002-0000-0000-0000-000000000001','5b000003-0000-0000-0000-000000000001','Çiçekli elbise super!',NOW()-INTERVAL'22 days'),
('e0000002-0000-0000-0000-000000000001','4c000002-0000-0000-0000-000000000001','Bahar ruhunu çok iyi yansıtmış 🌸',NOW()-INTERVAL'21 days'),
('e0000002-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00','NB 574 bu tarzla süper uyuyor!',NOW()-INTERVAL'20 days'),
('e0000003-0000-0000-0000-000000000001','b68db9ea-7fb5-49e7-81a3-e005d9852b00','Jordan 1 her kombinle gider gerçekten 🔥',NOW()-INTERVAL'18 days'),
('e0000003-0000-0000-0000-000000000001','4c000002-0000-0000-0000-000000000001','Street style king! 👑',NOW()-INTERVAL'17 days');


-- ─── SYNC DENORMALIZED COUNTS ─────────────────────────────────────────────────
UPDATE posts SET likes_count    = (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id);
UPDATE posts SET comments_count = (SELECT COUNT(*) FROM comments   WHERE post_id = posts.id);

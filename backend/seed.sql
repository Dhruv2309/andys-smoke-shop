-- Andy's Smoke Shop — Full Inventory Seed
-- Run via: npx ts-node scripts/seed.ts
-- Idempotent: ON CONFLICT (sku) DO NOTHING

-- ─────────────────────────────────────────────────────────────────────────────
-- Schema additions (safe to run multiple times)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS products (
  sku           TEXT          PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  brand         VARCHAR(100),
  category      VARCHAR(100)  NOT NULL,
  subcategory   VARCHAR(100),
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,
  cost_price    NUMERIC(10,2),
  stock         INTEGER       NOT NULL DEFAULT 0,
  min_stock     INTEGER       NOT NULL DEFAULT 5,
  is_active     BOOLEAN       DEFAULT TRUE,
  age_restricted BOOLEAN      DEFAULT TRUE,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ─────────────────────────────────────────────────────────────────────────────
-- CIGARETTES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('CIG-MRL-REDKNG',  'Marlboro Red King Box',            'Marlboro',         'Cigarettes', 'Full Flavor',   'Classic full-flavor 20-pack king-size cigarettes.',        12.99, 8.50, 150, 30, true, true),
('CIG-MRL-GLDKNG',  'Marlboro Gold King Box',           'Marlboro',         'Cigarettes', 'Light',         'Smooth gold blend king-size cigarettes, 20-pack.',         12.99, 8.50, 120, 30, true, true),
('CIG-MRL-MNTGRN',  'Marlboro Menthol Green Box',       'Marlboro',         'Cigarettes', 'Menthol',       'Cool menthol king-size cigarettes, 20-pack.',              12.99, 8.50, 100, 25, true, true),
('CIG-MRL-ICE',     'Marlboro Ice Menthol Box',         'Marlboro',         'Cigarettes', 'Menthol',       'Extra-cool ice menthol cigarettes, 20-pack.',              13.49, 8.75, 80,  20, true, true),
('CIG-MRL-RED100',  'Marlboro Red 100s',                'Marlboro',         'Cigarettes', 'Full Flavor',   'Full-flavor 100mm cigarettes, 20-pack.',                   13.49, 8.75, 100, 25, true, true),
('CIG-MRL-GLD100',  'Marlboro Gold 100s',               'Marlboro',         'Cigarettes', 'Light',         'Smooth gold 100mm cigarettes, 20-pack.',                   13.49, 8.75, 90,  25, true, true),
('CIG-MRL-SPCRL',   'Marlboro Special Blend Red',       'Marlboro',         'Cigarettes', 'Full Flavor',   'Special blend full-flavor king box, 20-pack.',             12.49, 8.25, 60,  15, true, true),
('CIG-NWP-MENBOX',  'Newport Menthol Box',              'Newport',          'Cigarettes', 'Menthol',       'America''s #1 menthol cigarette, king-size 20-pack.',       13.49, 8.75, 160, 35, true, true),
('CIG-NWP-MEN100',  'Newport Menthol 100s',             'Newport',          'Cigarettes', 'Menthol',       'Menthol 100mm cigarettes, 20-pack.',                       13.99, 9.00, 130, 30, true, true),
('CIG-NWP-NOMNT',   'Newport Non-Menthol Box',          'Newport',          'Cigarettes', 'Full Flavor',   'Newport non-menthol bold king box, 20-pack.',              13.49, 8.75, 70,  20, true, true),
('CIG-NWP-PLSBOX',  'Newport Pleasure Box',             'Newport',          'Cigarettes', 'Light',         'Smoother Newport pleasure king box, 20-pack.',             13.49, 8.75, 60,  15, true, true),
('CIG-CAM-BLUKNG',  'Camel Blue King Box',              'Camel',            'Cigarettes', 'Light',         'Smooth Camel Blue mellow blend, king box 20-pack.',        12.99, 8.50, 110, 25, true, true),
('CIG-CAM-CRUSH',   'Camel Crush Menthol Box',          'Camel',            'Cigarettes', 'Menthol',       'Crushable menthol capsule cigarettes, 20-pack.',           13.49, 8.75, 90,  20, true, true),
('CIG-CAM-TRKRYL',  'Camel Turkish Royal Box',          'Camel',            'Cigarettes', 'Full Flavor',   'Premium Turkish tobacco blend, king box.',                 12.99, 8.50, 55,  15, true, true),
('CIG-CAM-SLVRMNT', 'Camel Menthol Silver Box',         'Camel',            'Cigarettes', 'Menthol',       'Smooth menthol silver blend cigarettes, 20-pack.',         13.49, 8.75, 50,  15, true, true),
('CIG-AMS-YLWKNG',  'American Spirit Yellow King',      'American Spirit',  'Cigarettes', 'Light',         'Organic tobacco mellow blend king box.',                   14.99, 9.75, 80,  20, true, true),
('CIG-AMS-BLUKNG',  'American Spirit Blue King',        'American Spirit',  'Cigarettes', 'Full Flavor',   'Organic tobacco full-flavor king box.',                    14.99, 9.75, 75,  20, true, true),
('CIG-AMS-BLKPRQ',  'American Spirit Perique Black',    'American Spirit',  'Cigarettes', 'Full Flavor',   'Rich Perique tobacco blend, robust king box.',             14.99, 9.75, 45,  10, true, true),
('CIG-AMS-TRQMNT',  'American Spirit Turquoise Menthol','American Spirit',  'Cigarettes', 'Menthol',       'Organic menthol additive-free king box.',                  14.99, 9.75, 50,  15, true, true),
('CIG-PLM-RED100',  'Pall Mall Red 100s',               'Pall Mall',        'Cigarettes', 'Full Flavor',   'Value-priced full-flavor 100mm cigarettes, 20-pack.',       9.99, 6.50, 100, 25, true, true),
('CIG-PLM-BLU100',  'Pall Mall Blue 100s',              'Pall Mall',        'Cigarettes', 'Light',         'Value-priced light 100mm cigarettes, 20-pack.',             9.99, 6.50, 90,  25, true, true),
('CIG-PLM-MEN100',  'Pall Mall Menthol 100s',           'Pall Mall',        'Cigarettes', 'Menthol',       'Value-priced menthol 100mm cigarettes, 20-pack.',           9.99, 6.50, 85,  20, true, true),
('CIG-WNS-REDKNG',  'Winston Red King Box',             'Winston',          'Cigarettes', 'Full Flavor',   'Bold full-flavor Winston king box, 20-pack.',              10.99, 7.25, 60,  15, true, true),
('CIG-KOL-MNTBOX',  'Kool Menthol Box',                 'Kool',             'Cigarettes', 'Menthol',       'Smooth menthol blend king box, 20-pack.',                  11.99, 7.75, 65,  15, true, true),
('CIG-SLM-MNTBOX',  'Salem Menthol Box',                'Salem',            'Cigarettes', 'Menthol',       'Classic menthol cigarettes, king box 20-pack.',            11.49, 7.50, 50,  12, true, true),
('CIG-LKY-REDKNG',  'Lucky Strike Red King',            'Lucky Strike',     'Cigarettes', 'Full Flavor',   'Classic original blend king box, 20-pack.',                12.49, 8.25, 40,  10, true, true),
('CIG-MVK-MEN100',  'Maverick Menthol 100s',            'Maverick',         'Cigarettes', 'Menthol',       'Budget menthol 100mm cigarettes, 20-pack.',                 8.49, 5.50, 70,  20, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- MASS MARKET CIGARS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('CGM-SWS-ORIG2',   'Swisher Sweets Original Cigarillos 2pk',    'Swisher Sweets', 'Cigars', 'Cigarillos',   'Original sweet cigarillos, 2-pack.',           1.99, 1.10, 200, 50, true, true),
('CGM-SWS-GRAPE2',  'Swisher Sweets Grape 2pk',                  'Swisher Sweets', 'Cigars', 'Cigarillos',   'Grape-flavored cigarillos, 2-pack.',           1.99, 1.10, 180, 50, true, true),
('CGM-SWS-PEACH2',  'Swisher Sweets Peach 2pk',                  'Swisher Sweets', 'Cigars', 'Cigarillos',   'Peach-flavored cigarillos, 2-pack.',           1.99, 1.10, 175, 50, true, true),
('CGM-SWS-STRAW2',  'Swisher Sweets Strawberry 2pk',             'Swisher Sweets', 'Cigars', 'Cigarillos',   'Strawberry-flavored cigarillos, 2-pack.',      1.99, 1.10, 170, 50, true, true),
('CGM-SWS-TROPI2',  'Swisher Sweets Tropical Fusion 2pk',        'Swisher Sweets', 'Cigars', 'Cigarillos',   'Tropical blend cigarillos, 2-pack.',           1.99, 1.10, 160, 40, true, true),
('CGM-SWS-MINI5',   'Swisher Sweets Mini Cigarillos 5pk',        'Swisher Sweets', 'Cigars', 'Cigarillos',   'Compact mini cigarillos, 5-pack.',             2.49, 1.40, 120, 30, true, true),
('CGM-BLM-WINETIP', 'Black & Mild Wine Wood Tip',                'Black & Mild',   'Cigars', 'Pipe Cigars',  'Wine-flavored pipe cigar with wood tip.',      2.49, 1.40, 150, 35, true, true),
('CGM-BLM-PLSTIP',  'Black & Mild Classic Plastic Tip',          'Black & Mild',   'Cigars', 'Pipe Cigars',  'Original classic pipe cigar, plastic tip.',    2.29, 1.30, 150, 35, true, true),
('CGM-BLM-JAZZ',    'Black & Mild Jazz',                         'Black & Mild',   'Cigars', 'Pipe Cigars',  'Jazz blend mild pipe cigar.',                  2.49, 1.40, 100, 25, true, true),
('CGM-BLM-APPLE',   'Black & Mild Apple',                        'Black & Mild',   'Cigars', 'Pipe Cigars',  'Apple-flavored pipe cigar.',                   2.49, 1.40, 90,  20, true, true),
('CGM-BWD-WLDHNY',  'Backwoods Wild Honey 5pk',                  'Backwoods',      'Cigars', 'Blunt Cigars', 'Wild honey all-natural leaf cigars, 5-pack.',  9.99, 6.50, 100, 25, true, true),
('CGM-BWD-HNYBBN',  'Backwoods Honey Bourbon 5pk',               'Backwoods',      'Cigars', 'Blunt Cigars', 'Honey bourbon all-natural leaf cigars, 5pk.',  9.99, 6.50, 90,  25, true, true),
('CGM-BWD-SWTATM',  'Backwoods Sweet Aromatic 5pk',              'Backwoods',      'Cigars', 'Blunt Cigars', 'Sweet aromatic natural leaf cigars, 5-pack.',  9.99, 6.50, 80,  20, true, true),
('CGM-BWD-RUSCRM',  'Backwoods Russian Cream 5pk',               'Backwoods',      'Cigars', 'Blunt Cigars', 'Russian cream natural leaf cigars, 5-pack.',   9.99, 6.50, 85,  20, true, true),
('CGM-BWD-SNBRRY',  'Backwoods Sunny Berry 5pk',                 'Backwoods',      'Cigars', 'Blunt Cigars', 'Berry-flavored natural leaf cigars, 5-pack.',  9.99, 6.50, 70,  20, true, true),
('CGM-DTM-PALMA2',  'Dutch Masters Palma 2pk',                   'Dutch Masters',  'Cigars', 'Blunt Cigars', 'Classic Palma blunt cigars, 2-pack.',          2.29, 1.25, 120, 30, true, true),
('CGM-DTM-HNFUS2',  'Dutch Masters Honey Fusion 2pk',            'Dutch Masters',  'Cigars', 'Blunt Cigars', 'Honey fusion blunt cigars, 2-pack.',           2.29, 1.25, 110, 30, true, true),
('CGM-DTM-RUSCRM2', 'Dutch Masters Russian Cream 2pk',           'Dutch Masters',  'Cigars', 'Blunt Cigars', 'Russian cream blunt cigars, 2-pack.',          2.29, 1.25, 100, 25, true, true),
('CGM-PHL-BLUNT',   'Phillies Blunt Original',                   'Phillies',       'Cigars', 'Blunt Cigars', 'Classic original Phillies blunt cigar.',       1.49, 0.80, 130, 30, true, true),
('CGM-WOL-CIGRL2',  'White Owl Cigarillos 2pk',                  'White Owl',      'Cigars', 'Cigarillos',   'Original White Owl cigarillos, 2-pack.',       1.99, 1.10, 100, 25, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PREMIUM CIGARS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('CGP-AFU-BREV',    'Arturo Fuente Brevas Royale',        'Arturo Fuente',     'Cigars', 'Premium',  'Dominican blend, medium body, cedar-like finish.',        9.99,  6.00, 30, 5, true, true),
('CGP-AFU-858',     'Arturo Fuente 8-5-8',                'Arturo Fuente',     'Cigars', 'Premium',  'Smooth Cameroon wrapper, medium-full body.',             12.99,  8.00, 25, 5, true, true),
('CGP-PDN-2000N',   'Padron Series 2000 Natural',         'Padron',            'Cigars', 'Premium',  'Nicaraguan Maduro wrapper, rich earthy notes.',          10.99,  6.75, 20, 5, true, true),
('CGP-RYJ-CHRCL',   'Romeo y Julieta 1875 Churchill',     'Romeo y Julieta',   'Cigars', 'Premium',  'Dominican blend, creamy medium-body Churchill.',         14.99,  9.50, 18, 5, true, true),
('CGP-MCD-HYDPK',   'Macanudo Cafe Hyde Park',            'Macanudo',          'Cigars', 'Premium',  'Connecticut shade wrapper, mild and smooth.',            11.99,  7.50, 22, 5, true, true),
('CGP-CAO-BRAZ',    'CAO Brazilia Amazon Basin',          'CAO',               'Cigars', 'Premium',  'Brazilian Braganca wrapper, medium-full body.',          13.99,  8.75, 15, 5, true, true),
('CGP-COH-REDOT',   'Cohiba Red Dot Corona',              'Cohiba',            'Cigars', 'Premium',  'Dominican premium, smooth medium body, complex finish.', 16.99, 10.50, 12, 3, true, true),
('CGP-MNT-WHTCR',   'Montecristo White Series Corona',    'Montecristo',       'Cigars', 'Premium',  'Connecticut wrapper, creamy and mild complexity.',       12.99,  8.00, 15, 5, true, true),
('CGP-PRD-CHMPG',   'Perdomo Champagne',                  'Perdomo',           'Cigars', 'Premium',  'Nicaraguan blend, Connecticut shade, smooth body.',       9.99,  6.25, 20, 5, true, true),
('CGP-RKP-VIN90',   'Rocky Patel Vintage 1990 Toro',      'Rocky Patel',       'Cigars', 'Premium',  'Sun-grown Honduran, rich and full flavored.',            14.99,  9.25, 12, 3, true, true),
('CGP-OLV-SERV',    'Oliva Serie V Toro',                 'Oliva',             'Cigars', 'Premium',  'Nicaraguan puro, full body, cocoa and pepper notes.',    16.99, 10.50, 10, 3, true, true),
('CGP-ASH-CLSCR',   'Ashton Classic Corona',              'Ashton',            'Cigars', 'Premium',  'Dominican blend, medium body, silky draw.',              11.99,  7.50, 15, 5, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PIPE TOBACCO
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('PTP-CAP-REGUL',   'Captain Black Regular 1.5oz',        'Captain Black',  'Pipe Tobacco', 'Aromatic',    'Mild, sweet aromatic blend. America''s #1 pipe tobacco.',  8.99, 5.50, 40, 10, true, true),
('PTP-CAP-GOLD',    'Captain Black Gold 1.5oz',           'Captain Black',  'Pipe Tobacco', 'Aromatic',    'Light, smooth gold aromatic pipe tobacco.',                8.99, 5.50, 35, 10, true, true),
('PTP-CAP-CHRRY',   'Captain Black Cherry 1.5oz',         'Captain Black',  'Pipe Tobacco', 'Aromatic',    'Sweet cherry-topped aromatic blend.',                      8.99, 5.50, 35, 10, true, true),
('PTP-CAP-ROYAL',   'Captain Black Royal 1.5oz',          'Captain Black',  'Pipe Tobacco', 'Aromatic',    'Rich, full-bodied cavendish aromatic blend.',               9.49, 5.75, 30, 8,  true, true),
('PTP-PRA-ORGN',    'Prince Albert Original 14oz',        'Prince Albert',  'Pipe Tobacco', 'Aromatic',    'Classic mild bright burley blend, iconic tin.',            14.99, 9.50, 25, 5,  true, true),
('PTP-BRK-CHRRY',   'Borkum Riff Cherry Cavendish 1.5oz', 'Borkum Riff',   'Pipe Tobacco', 'Aromatic',    'Smooth cherry cavendish Scandinavian blend.',              9.99, 6.25, 30, 8,  true, true),
('PTP-BRK-ORIG',    'Borkum Riff Original Burley 1.5oz',  'Borkum Riff',   'Pipe Tobacco', 'Burley',      'Natural burley blend, mild and easy-going.',               9.99, 6.25, 25, 8,  true, true),
('PTP-LNE-1Q',      'Lane Limited 1-Q 1.5oz',             'Lane Limited',  'Pipe Tobacco', 'Aromatic',    'Top-selling aromatic blend, vanilla and cavendish.',       9.99, 6.25, 22, 5,  true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- DIP / CHEWING TOBACCO
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('DIP-GRZ-WGRNLC',  'Grizzly Wintergreen Long Cut 1.2oz',    'Grizzly',     'Dip & Chew', 'Long Cut',    'America''s #1 value dip. Bold wintergreen long cut.',     4.99, 2.75, 100, 25, true, true),
('DIP-GRZ-MNTLC',   'Grizzly Mint Long Cut 1.2oz',           'Grizzly',     'Dip & Chew', 'Long Cut',    'Refreshing mint long cut dip.',                           4.99, 2.75, 90,  25, true, true),
('DIP-GRZ-STRLC',   'Grizzly Straight Long Cut 1.2oz',       'Grizzly',     'Dip & Chew', 'Long Cut',    'Natural straight tobacco long cut.',                      4.99, 2.75, 80,  20, true, true),
('DIP-GRZ-DKWGR',   'Grizzly Dark Wintergreen 1.2oz',        'Grizzly',     'Dip & Chew', 'Long Cut',    'Rich dark blend with bold wintergreen flavor.',           5.49, 3.00, 70,  20, true, true),
('DIP-GRZ-WGRNFP',  'Grizzly Wintergreen Fine Cut 1.2oz',    'Grizzly',     'Dip & Chew', 'Fine Cut',    'Fine cut wintergreen for a different texture.',           4.99, 2.75, 60,  15, true, true),
('DIP-CPH-LNGNT',   'Copenhagen Long Cut Natural 1.2oz',     'Copenhagen',  'Dip & Chew', 'Long Cut',    'Premium natural tobacco long cut. Bold and flavorful.',   6.49, 3.75, 80,  20, true, true),
('DIP-CPH-STRLC',   'Copenhagen Straight Long Cut 1.2oz',    'Copenhagen',  'Dip & Chew', 'Long Cut',    'Classic Copenhagen straight blend, long cut.',            6.49, 3.75, 75,  20, true, true),
('DIP-CPH-BLKLC',   'Copenhagen Black Long Cut 1.2oz',       'Copenhagen',  'Dip & Chew', 'Long Cut',    'Dark fire-cured tobacco, bold and robust.',               6.49, 3.75, 65,  15, true, true),
('DIP-SKL-MNTLC',   'Skoal Mint Long Cut 1.2oz',             'Skoal',       'Dip & Chew', 'Long Cut',    'Smooth mint long cut dip.',                               5.99, 3.25, 80,  20, true, true),
('DIP-SKL-WGRNLC',  'Skoal Wintergreen Long Cut 1.2oz',      'Skoal',       'Dip & Chew', 'Long Cut',    'Skoal wintergreen long cut, popular and smooth.',         5.99, 3.25, 75,  20, true, true),
('DIP-SKL-BERRBLND','Skoal Berry Blend Long Cut 1.2oz',      'Skoal',       'Dip & Chew', 'Long Cut',    'Sweet mixed berry long cut blend.',                       5.99, 3.25, 55,  15, true, true),
('DIP-KOD-WGRN',    'Kodiak Wintergreen 1.2oz',              'Kodiak',      'Dip & Chew', 'Long Cut',    'Full-strength wintergreen long cut.',                     5.49, 3.00, 60,  15, true, true),
('DIP-TBW-NTRLL',   'Timber Wolf Natural Long Cut 1.2oz',    'Timber Wolf', 'Dip & Chew', 'Long Cut',    'Value natural tobacco long cut.',                         3.99, 2.25, 50,  15, true, true),
('DIP-RDM-GOLDB',   'Red Man Golden Blend Chewing Tobacco 3oz','Red Man',   'Dip & Chew', 'Chewing',     'Moist golden blend loose-leaf chewing tobacco, 3oz.',     5.49, 3.00, 40,  10, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- NICOTINE POUCHES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('NCP-ZYN-CM3MG',   'ZYN Cool Mint 3mg 15ct',          'ZYN',    'Nicotine Pouches', 'Mint',        'Tobacco-free nicotine pouch. Cool mint, light strength.',   5.99, 3.25, 80, 20, true, true),
('NCP-ZYN-CM6MG',   'ZYN Cool Mint 6mg 15ct',          'ZYN',    'Nicotine Pouches', 'Mint',        'Tobacco-free nicotine pouch. Cool mint, full strength.',    5.99, 3.25, 90, 20, true, true),
('NCP-ZYN-SM3MG',   'ZYN Spearmint 3mg 15ct',          'ZYN',    'Nicotine Pouches', 'Mint',        'Spearmint nicotine pouch, light strength.',                  5.99, 3.25, 70, 15, true, true),
('NCP-ZYN-SM6MG',   'ZYN Spearmint 6mg 15ct',          'ZYN',    'Nicotine Pouches', 'Mint',        'Spearmint nicotine pouch, full strength.',                   5.99, 3.25, 75, 15, true, true),
('NCP-ZYN-CF6MG',   'ZYN Coffee 6mg 15ct',             'ZYN',    'Nicotine Pouches', 'Flavored',    'Rich coffee flavor nicotine pouch, full strength.',         5.99, 3.25, 60, 15, true, true),
('NCP-ZYN-CN6MG',   'ZYN Cinnamon 6mg 15ct',           'ZYN',    'Nicotine Pouches', 'Flavored',    'Warm cinnamon nicotine pouch, full strength.',              5.99, 3.25, 55, 15, true, true),
('NCP-ZYN-CT6MG',   'ZYN Citrus 6mg 15ct',             'ZYN',    'Nicotine Pouches', 'Flavored',    'Bright citrus nicotine pouch, full strength.',              5.99, 3.25, 55, 15, true, true),
('NCP-ZYN-WG6MG',   'ZYN Wintergreen 6mg 15ct',        'ZYN',    'Nicotine Pouches', 'Mint',        'Classic wintergreen nicotine pouch, full strength.',        5.99, 3.25, 70, 15, true, true),
('NCP-ZYN-SM3SS',   'ZYN Smooth 3mg 15ct',             'ZYN',    'Nicotine Pouches', 'Unflavored',  'Unflavored nicotine pouch for pure experience.',            5.99, 3.25, 45, 10, true, true),
('NCP-ONI-MT8MG',   'On! Mint 8mg 20ct',               'On!',    'Nicotine Pouches', 'Mint',        'Compact mint nicotine pouch, high strength 8mg.',           4.99, 2.75, 70, 20, true, true),
('NCP-ONI-WG8MG',   'On! Wintergreen 8mg 20ct',        'On!',    'Nicotine Pouches', 'Mint',        'Compact wintergreen pouch, high strength 8mg.',             4.99, 2.75, 65, 20, true, true),
('NCP-ONI-CF4MG',   'On! Coffee 4mg 20ct',             'On!',    'Nicotine Pouches', 'Flavored',    'Compact coffee nicotine pouch, medium strength.',           4.99, 2.75, 50, 15, true, true),
('NCP-RGU-MT4MG',   'Rogue Mint 4mg 20ct',             'Rogue',  'Nicotine Pouches', 'Mint',        'Rogue mint nicotine pouch, medium strength.',               4.99, 2.75, 60, 15, true, true),
('NCP-RGU-WG6MG',   'Rogue Wintergreen 6mg 20ct',      'Rogue',  'Nicotine Pouches', 'Mint',        'Rogue wintergreen nicotine pouch, full strength.',          4.99, 2.75, 55, 15, true, true),
('NCP-RGU-MG4MG',   'Rogue Mango 4mg 20ct',            'Rogue',  'Nicotine Pouches', 'Flavored',    'Tropical mango nicotine pouch, medium strength.',           4.99, 2.75, 45, 10, true, true),
('NCP-VLO-MT4MG',   'Velo Mint 4mg 20ct',              'Velo',   'Nicotine Pouches', 'Mint',        'Smooth mint nicotine pouch, medium strength.',              5.49, 3.00, 55, 15, true, true),
('NCP-VLO-CT4MG',   'Velo Citrus 4mg 20ct',            'Velo',   'Nicotine Pouches', 'Flavored',    'Refreshing citrus nicotine pouch, medium strength.',        5.49, 3.00, 45, 10, true, true),
('NCP-LCY-MT4MG',   'Lucy Mint 4mg 20ct',              'Lucy',   'Nicotine Pouches', 'Mint',        'Lucy mint pouches, medium strength, wide format.',          5.99, 3.25, 40, 10, true, true),
('NCP-LCY-WG4MG',   'Lucy Wintergreen 4mg 20ct',       'Lucy',   'Nicotine Pouches', 'Mint',        'Lucy wintergreen pouches, medium strength.',                5.99, 3.25, 40, 10, true, true),
('NCP-ZMO-ARCMT',   'Zimo Arctic Mint 6mg 20ct',       'Zimo',   'Nicotine Pouches', 'Mint',        'Intense arctic mint nicotine pouch, full strength.',        5.49, 3.00, 35, 10, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- VAPING — DISPOSABLES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('VPD-ELF-BC5BR',   'Elf Bar BC5000 Blue Razz Ice',          'Elf Bar',        'Vaping', 'Disposables', 'Blue raspberry ice, 5000 puffs, 5% nic salt.',     18.99, 11.00, 80, 20, true, true),
('VPD-ELF-BC5WM',   'Elf Bar BC5000 Watermelon Ice',         'Elf Bar',        'Vaping', 'Disposables', 'Watermelon ice, 5000 puffs, 5% nic salt.',         18.99, 11.00, 90, 20, true, true),
('VPD-ELF-BC5PM',   'Elf Bar BC5000 Peach Mango Watermelon', 'Elf Bar',        'Vaping', 'Disposables', 'Tropical trio blend, 5000 puffs, 5% nic salt.',    18.99, 11.00, 75, 20, true, true),
('VPD-ELF-BC5SM',   'Elf Bar BC5000 Strawberry Mango',       'Elf Bar',        'Vaping', 'Disposables', 'Strawberry mango blend, 5000 puffs.',               18.99, 11.00, 70, 20, true, true),
('VPD-ELF-BC5TR',   'Elf Bar BC5000 Tropical Rainbow Blast', 'Elf Bar',        'Vaping', 'Disposables', 'Tropical rainbow candy, 5000 puffs.',               18.99, 11.00, 65, 15, true, true),
('VPD-ELF-BC5MM',   'Elf Bar BC5000 Miami Mint',             'Elf Bar',        'Vaping', 'Disposables', 'Cool mint blend, 5000 puffs, 5% nic salt.',        18.99, 11.00, 60, 15, true, true),
('VPD-LMR-OS5WM',   'Lost Mary OS5000 Watermelon',           'Lost Mary',      'Vaping', 'Disposables', 'Watermelon, 5000 puffs, rechargeable, 5% nic.',    19.99, 12.00, 70, 20, true, true),
('VPD-LMR-OS5BC',   'Lost Mary OS5000 Black Cherry',         'Lost Mary',      'Vaping', 'Disposables', 'Black cherry, 5000 puffs, rechargeable.',           19.99, 12.00, 65, 15, true, true),
('VPD-LMR-MO5SB',   'Lost Mary MO5000 Strawberry Banana',   'Lost Mary',      'Vaping', 'Disposables', 'Strawberry banana, 5000 puffs, rechargeable.',      19.99, 12.00, 60, 15, true, true),
('VPD-LMR-BM5LM',   'Lost Mary BM5000 Lemon Mint',          'Lost Mary',      'Vaping', 'Disposables', 'Lemon mint, 5000 puffs, mesh coil.',                19.99, 12.00, 55, 15, true, true),
('VPD-BRZ-PRBRRY',  'Breeze Pro Berry Blast',                'Breeze',         'Vaping', 'Disposables', 'Mixed berry, 2000 puffs, 5% nic salt.',             15.99, 9.50, 80,  20, true, true),
('VPD-BRZ-PRMNG',   'Breeze Pro Mango Ice',                  'Breeze',         'Vaping', 'Disposables', 'Mango ice, 2000 puffs, 5% nic salt.',               15.99, 9.50, 75,  20, true, true),
('VPD-BRZ-PRPCNT',  'Breeze Pro Pineapple Coconut',          'Breeze',         'Vaping', 'Disposables', 'Pineapple coconut, 2000 puffs.',                    15.99, 9.50, 65,  15, true, true),
('VPD-HYD-RPWMI',   'Hyde Rebel Pro Watermelon Ice',         'Hyde',           'Vaping', 'Disposables', 'Watermelon ice, 5000 puffs, rechargeable.',         18.99, 11.00, 55, 15, true, true),
('VPD-HYD-RPMNG',   'Hyde Rebel Pro Mango',                  'Hyde',           'Vaping', 'Disposables', 'Fresh mango, 5000 puffs, rechargeable, 5% nic.',   18.99, 11.00, 50, 15, true, true),
('VPD-GBR-PLSAI',   'Geek Bar Pulse Sour Apple Ice',         'Geek Bar',       'Vaping', 'Disposables', 'Sour apple ice, 15000 puffs, dual mode.',           24.99, 15.00, 50, 15, true, true),
('VPD-GBR-PLSWM',   'Geek Bar Pulse Watermelon Ice',         'Geek Bar',       'Vaping', 'Disposables', 'Watermelon ice, 15000 puffs, dual mode.',           24.99, 15.00, 55, 15, true, true),
('VPD-FNK-TI7BR',   'Funky Republic TI7000 Blue Razz Ice',  'Funky Republic', 'Vaping', 'Disposables', 'Blue razz ice, 7000 puffs, rechargeable.',          21.99, 13.00, 45, 10, true, true),
('VPD-FNK-TI7SC',   'Funky Republic TI7000 Strawberry Cream','Funky Republic', 'Vaping', 'Disposables', 'Strawberry cream, 7000 puffs, rechargeable.',       21.99, 13.00, 40, 10, true, true),
('VPD-FME-EXTTR',   'Fume Extra Tropical Fruits',            'Fume',           'Vaping', 'Disposables', 'Tropical fruits, 1500 puffs, 5% nic salt.',         14.99, 8.75, 70,  20, true, true),
('VPD-FME-INFBM',   'Fume Infinity Blueberry Mint',          'Fume',           'Vaping', 'Disposables', 'Blueberry mint, 3500 puffs, 5% nic salt.',          16.99, 9.75, 60,  15, true, true),
('VPD-RAZ-DC25WM',  'Raz DC25000 Watermelon Ice',            'RAZ',            'Vaping', 'Disposables', 'Watermelon ice, 25000 puffs, rechargeable.',        29.99, 18.00, 35, 10, true, true),
('VPD-AIR-DIABR',   'Air Bar Diamond Blue Razz',             'Air Bar',        'Vaping', 'Disposables', 'Blue razz, 500 puffs, disposable pod.',             11.99, 7.00, 90,  20, true, true),
('VPD-VSE-GOBMI',   'Vuse Go Blueberry Ice',                 'Vuse',           'Vaping', 'Disposables', 'Blueberry ice, 500 puffs, 5% nic.',                  9.99, 5.75, 80,  20, true, true),
('VPD-BDI-STCLT',   'Bidi Stick Classic Tobacco',            'Bidi Stick',     'Vaping', 'Disposables', 'Classic tobacco flavor, 600 puffs.',                11.99, 7.00, 65,  15, true, true),
('VPD-JUL-MENPD4',  'JUUL Menthol Pod Pack 4ct',             'JUUL',           'Vaping', 'Disposables', 'Menthol pods for JUUL device, 4-pack 3%.',          15.99, 9.50, 70,  20, true, true),
('VPD-JUL-VRGPD4',  'JUUL Virginia Tobacco Pod Pack 4ct',   'JUUL',           'Vaping', 'Disposables', 'Virginia tobacco pods for JUUL device, 4-pack.',    15.99, 9.50, 60,  15, true, true),
('VPD-MRF-SWBWI',   'Mr. Fog Switch Berry Watermelon Ice',   'Mr. Fog',        'Vaping', 'Disposables', 'Berry watermelon ice, 5500 puffs, rechargeable.',   19.99, 12.00, 45, 10, true, true),
('VPD-PUF-BRBLR',   'Puff Bar Blue Razz',                    'Puff Bar',       'Vaping', 'Disposables', 'Blue raspberry, 300 puffs, 5% salt nic.',           9.99,  5.75, 75,  20, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- VAPING — DEVICE KITS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('VPK-SMK-NORD5',   'SMOK Nord 5 Kit',              'SMOK',       'Vaping', 'Device Kits', 'SMOK Nord 5 pod mod kit, 80W, 2000mAh battery.',         44.99, 26.00, 25, 5, true, true),
('VPK-SMK-RPM6',    'SMOK RPM 6 Kit',               'SMOK',       'Vaping', 'Device Kits', 'SMOK RPM 6 pod kit, 60W, 1650mAh, 2ml pod.',             39.99, 23.00, 20, 5, true, true),
('VPK-VPS-XROS3',   'Vaporesso XROS 3 Kit',         'Vaporesso',  'Vaping', 'Device Kits', 'XROS 3 pod kit, 11W MTL, adjustable airflow.',           29.99, 17.50, 20, 5, true, true),
('VPK-VPS-LUXEX',   'Vaporesso LUXE X Kit',         'Vaporesso',  'Vaping', 'Device Kits', 'LUXE X pod mod kit, 40W, 1500mAh, AXON chip.',          34.99, 20.50, 18, 5, true, true),
('VPK-GVP-AEG1',    'GeekVape Aegis One Kit',       'GeekVape',   'Vaping', 'Device Kits', 'Waterproof, dustproof pod kit, 18W, 1100mAh.',           34.99, 20.50, 15, 5, true, true),
('VPK-GVP-AEGX',    'GeekVape Aegis X Kit',         'GeekVape',   'Vaping', 'Device Kits', 'Rugged 200W mod kit, waterproof, dual 18650.',           69.99, 42.00, 10, 3, true, true),
('VPK-VPP-DRAGX',   'Voopoo Drag X Plus Kit',       'Voopoo',     'Vaping', 'Device Kits', 'Drag X Plus pod mod, 100W, GENE.TT chip.',               59.99, 36.00, 10, 3, true, true),
('VPK-VPP-ARGUS',   'Voopoo Argus Kit',             'Voopoo',     'Vaping', 'Device Kits', 'Argus pod kit, 25W, 1500mAh, water resistant.',          34.99, 20.50, 15, 5, true, true),
('VPK-UWL-CALGK2',  'Uwell Caliburn GK2 Kit',       'Uwell',      'Vaping', 'Device Kits', 'Caliburn GK2 pod kit, 18W, top-fill, 690mAh.',           29.99, 17.50, 18, 5, true, true),
('VPK-FMX-GALEX',   'Freemax Galex Kit',            'Freemax',    'Vaping', 'Device Kits', 'Galex pod kit, 20W, 850mAh, SS316L coil.',               24.99, 14.50, 15, 5, true, true),
('VPK-INK-END18',   'Innokin Endura T18 Kit',       'Innokin',    'Vaping', 'Device Kits', 'Endura T18 starter kit, 1000mAh, 2.5ohm coil.',          24.99, 14.50, 12, 5, true, true),
('VPK-ASP-NAUTL',   'Aspire Nautilus Kit',          'Aspire',     'Vaping', 'Device Kits', 'Nautilus AIO pod kit, 12W, 1000mAh, BVC coil.',          34.99, 20.50, 12, 5, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- E-LIQUID / VAPE JUICE
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('ELQ-NK1-HWPOG',   'Naked 100 Hawaiian POG 60ml',              'Naked 100',   'Vaping', 'E-Liquid', 'Passion fruit, orange, guava blend. 70/30 VG/PG.',    19.99, 11.50, 40, 10, true, true),
('ELQ-NK1-LAVFL',   'Naked 100 Lava Flow 60ml',                 'Naked 100',   'Vaping', 'E-Liquid', 'Strawberry, pineapple, coconut tropical blend.',      19.99, 11.50, 40, 10, true, true),
('ELQ-NK1-AMZMG',   'Naked 100 Amazing Mango 60ml',             'Naked 100',   'Vaping', 'E-Liquid', 'Three-mango tropical blend, incredibly smooth.',       19.99, 11.50, 45, 10, true, true),
('ELQ-NK1-VRYBY',   'Naked 100 Very Berry 60ml',                'Naked 100',   'Vaping', 'E-Liquid', 'Mixed berry blend, blueberry forward.',                19.99, 11.50, 35, 10, true, true),
('ELQ-NK1-GRNBL',   'Naked 100 Green Blast 60ml',               'Naked 100',   'Vaping', 'E-Liquid', 'Honeydew melon and kiwi refreshing blend.',            19.99, 11.50, 35, 10, true, true),
('ELQ-PCH-FUJAP',   'Pachamama Fuji Apple Strawberry 60ml',     'Pachamama',   'Vaping', 'E-Liquid', 'Fuji apple with strawberry and nectarine.',            21.99, 13.00, 30, 8,  true, true),
('ELQ-PCH-MNTHD',   'Pachamama Mint Honeydew Berry 60ml',       'Pachamama',   'Vaping', 'E-Liquid', 'Honeydew melon, berries, and mint finish.',            21.99, 13.00, 28, 8,  true, true),
('ELQ-JHD-BLULM',   'Juice Head Blueberry Lemon 100ml',         'Juice Head',  'Vaping', 'E-Liquid', 'Blueberry and lemon candy blend, 100ml.',              22.99, 13.50, 30, 8,  true, true),
('ELQ-JHD-PCPPR',   'Juice Head Peach Pear 100ml',              'Juice Head',  'Vaping', 'E-Liquid', 'Fresh peach and ripe pear fruit blend, 100ml.',        22.99, 13.50, 28, 8,  true, true),
('ELQ-JMN-STRAW',   'Jam Monster Strawberry 100ml',             'Jam Monster', 'Vaping', 'E-Liquid', 'Strawberry jam on buttery toast, 100ml.',              23.99, 14.00, 30, 8,  true, true),
('ELQ-JMN-BLUBY',   'Jam Monster Blueberry 100ml',              'Jam Monster', 'Vaping', 'E-Liquid', 'Blueberry jam on warm buttered toast, 100ml.',         23.99, 14.00, 28, 8,  true, true),
('ELQ-CDK-BATCH',   'Candy King Batch 100ml',                   'Candy King',  'Vaping', 'E-Liquid', 'Sour gummy worms candy blend, 100ml.',                 21.99, 13.00, 32, 8,  true, true),
('ELQ-CDK-PNKSQ',   'Candy King Pink Squares 100ml',            'Candy King',  'Vaping', 'E-Liquid', 'Bubblegum candy pink squares, 100ml.',                 21.99, 13.00, 28, 8,  true, true),
('ELQ-CTW-UNICM',   'Cuttwood Unicorn Milk 60ml',               'Cuttwood',    'Vaping', 'E-Liquid', 'Strawberries and cream dessert blend, 60ml.',          21.99, 13.00, 25, 8,  true, true),
('ELQ-DLY-LMTRT',   'Dinner Lady Lemon Tart 60ml',              'Dinner Lady', 'Vaping', 'E-Liquid', 'Lemon meringue tart, UK dessert favorite, 60ml.',      21.99, 13.00, 25, 8,  true, true),
('ELQ-TWS-PCBLM',   'Twist Peach Blossom Lemonade 120ml',       'Twist',       'Vaping', 'E-Liquid', 'Peach lemonade with floral notes, 120ml.',             24.99, 15.00, 22, 8,  true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- HOOKAH TOBACCO
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('HKT-ALF-MINT',    'Al Fakher Mint 250g',              'Al Fakher',  'Hookah', 'Shisha Tobacco', 'Classic mint shisha, the world''s most popular hookah flavor.', 17.99, 10.50, 50, 12, true, true),
('HKT-ALF-DBLAP',   'Al Fakher Double Apple 250g',      'Al Fakher',  'Hookah', 'Shisha Tobacco', 'Iconic double apple anise blend, Middle Eastern classic.',     17.99, 10.50, 45, 12, true, true),
('HKT-ALF-WTMLN',   'Al Fakher Watermelon 250g',        'Al Fakher',  'Hookah', 'Shisha Tobacco', 'Sweet fresh watermelon shisha tobacco.',                       17.99, 10.50, 40, 10, true, true),
('HKT-ALF-GRAPE',   'Al Fakher Grape 250g',             'Al Fakher',  'Hookah', 'Shisha Tobacco', 'Smooth grape shisha tobacco blend.',                           17.99, 10.50, 40, 10, true, true),
('HKT-ALF-PEACH',   'Al Fakher Peach 250g',             'Al Fakher',  'Hookah', 'Shisha Tobacco', 'Sweet and juicy peach shisha flavor.',                         17.99, 10.50, 38, 10, true, true),
('HKT-ALF-LEMON',   'Al Fakher Lemon with Mint 250g',   'Al Fakher',  'Hookah', 'Shisha Tobacco', 'Tangy lemon with refreshing mint shisha.',                     17.99, 10.50, 35, 10, true, true),
('HKT-SBZ-BLMST',   'Starbuzz Blue Mist 100g',          'Starbuzz',   'Hookah', 'Shisha Tobacco', 'Mixed berry blast with a hint of menthol, premium blend.',     15.99,  9.25, 35, 8,  true, true),
('HKT-SBZ-SXBCH',   'Starbuzz Sex on the Beach 100g',   'Starbuzz',   'Hookah', 'Shisha Tobacco', 'Fruity tropical cocktail shisha blend.',                       15.99,  9.25, 30, 8,  true, true),
('HKT-SBZ-CODE69',  'Starbuzz Code 69 100g',            'Starbuzz',   'Hookah', 'Shisha Tobacco', 'Exotic tangy tropical fruit fusion blend.',                    15.99,  9.25, 28, 8,  true, true),
('HKT-FMR-AMBRS',   'Fumari Ambrosia 100g',             'Fumari',     'Hookah', 'Shisha Tobacco', 'Tropical citrus blend. San Diego premium hookah tobacco.',     17.99, 10.50, 30, 8,  true, true),
('HKT-FMR-WHTGB',   'Fumari White Gummy Bear 100g',     'Fumari',     'Hookah', 'Shisha Tobacco', 'Sweet white gummy candy flavor, very popular.',                17.99, 10.50, 32, 8,  true, true),
('HKT-FMR-LYCHE',   'Fumari Lychee 100g',               'Fumari',     'Hookah', 'Shisha Tobacco', 'Exotic lychee fruit premium shisha.',                          17.99, 10.50, 25, 8,  true, true),
('HKT-TNG-CEMNT',   'Tangiers Noir Cane Mint 250g',     'Tangiers',   'Hookah', 'Shisha Tobacco', 'Bright cane mint, high buzz Noir line. For experienced users.',22.99, 13.50, 20, 5,  true, true),
('HKT-TNG-HORCH',   'Tangiers Birquq Horchata 250g',    'Tangiers',   'Hookah', 'Shisha Tobacco', 'Creamy cinnamon rice milk, Birquq line.',                     22.99, 13.50, 18, 5,  true, true),
('HKT-NKH-MZMNT',   'Nakhla Mizo Mint 250g',            'Nakhla',     'Hookah', 'Shisha Tobacco', 'Egyptian traditional shisha mint, bold and strong.',           12.99,  7.50, 30, 8,  true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- HOOKAH EQUIPMENT
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('HKE-MYA-BMBN',    'MYA Bambino Hookah Complete Kit',   'MYA',       'Hookah', 'Equipment', 'Compact hookah with hose, bowl, tongs, and charcoal screen.',  49.99, 29.00, 15, 3, true, true),
('HKE-KHM-BLKSY',   'Khalil Mamoon Black Syrian Hookah', 'Khalil Mamoon','Hookah','Equipment','Hand-crafted Egyptian hookah, brass hardware, 30 inch.',       99.99, 60.00, 8,  2, true, true),
('HKE-CCN-COAL96',  'Coconara Natural Coconut Coals 96pc','Coconara',  'Hookah', 'Coals',     'Premium coconut shell hookah coals, 96-piece box.',            14.99,  8.50, 40, 10, true, false),
('HKE-TTN-COAL60',  'Titanium Natural Coals 60pc',       'Titanium',  'Hookah', 'Coals',     'Premium flat coconut charcoal, 60-piece box.',                 12.99,  7.50, 35, 10, true, false),
('HKE-LXE-BOWL',    'Luxe Phunnel Bowl',                 'Luxe',      'Hookah', 'Bowls',     'Classic phunnel hookah bowl, glazed clay, fits most hookahs.', 12.99,  7.25, 20, 5,  true, false),
('HKE-KHM-CLAY',    'Khalil Mamoon Clay Bowl',           'Khalil Mamoon','Hookah','Bowls',   'Traditional Egyptian clay hookah bowl.',                        9.99,  5.50, 20, 5,  true, false),
('HKE-SLC-HOSE',    'Silicone Hookah Hose 6ft',          'Generic',   'Hookah', 'Accessories','Washable silicone hookah hose with metal handle, 6 feet.',     14.99,  8.00, 25, 5,  true, false),
('HKE-TIPS-100',    'Hookah Disposable Mouth Tips 100pk', 'Generic',  'Hookah', 'Accessories','Disposable plastic hookah mouth tips, 100-pack.',               7.99,  4.00, 30, 8,  true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- CBD PRODUCTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('CBD-CWB-17MG30',  'Charlotte''s Web CBD Oil 30ml 17mg/ml',    'Charlotte''s Web', 'CBD', 'Tinctures',  'Full spectrum CBD hemp extract, 500mg/30ml.',        39.99, 22.00, 25, 5, true, false),
('CBD-CWB-60MG30',  'Charlotte''s Web CBD Oil 30ml 60mg/ml',    'Charlotte''s Web', 'CBD', 'Tinctures',  'Full spectrum CBD, extra strength 1800mg/30ml.',     79.99, 46.00, 15, 3, true, false),
('CBD-GRS-750OIL',  'Green Roads CBD Oil 750mg 30ml',           'Green Roads',      'CBD', 'Tinctures',  'Pharmacist-formulated broad spectrum CBD oil.',      44.99, 25.00, 20, 5, true, false),
('CBD-CFX-GUM25',   'CBDfx Mixed Berry Gummies 25mg 60ct',      'CBDfx',            'CBD', 'Gummies',    'Vegan CBD gummies, 25mg per gummy, 60-count.',       54.99, 32.00, 20, 5, true, false),
('CBD-CFX-GUM50',   'CBDfx Mixed Berry Gummies 50mg 60ct',      'CBDfx',            'CBD', 'Gummies',    'Extra-strength vegan CBD gummies, 50mg each.',       79.99, 46.00, 12, 3, true, false),
('CBD-MED-TIN1K',   'Medterra CBD Tincture 1000mg',             'Medterra',         'CBD', 'Tinctures',  'Isolate CBD tincture in MCT oil, 1000mg.',           44.99, 25.00, 18, 5, true, false),
('CBD-JOY-750TIN',  'Joy Organics CBD Tincture 750mg',          'Joy Organics',     'CBD', 'Tinctures',  'Broad spectrum, nanoemulsion for fast absorption.',  44.99, 25.00, 15, 5, true, false),
('CBD-GRS-FROG25',  'Green Roads CBD Froggies 25mg 30ct',       'Green Roads',      'CBD', 'Gummies',    'CBD gummy frogs, 25mg CBD each, 30-count.',          39.99, 22.00, 18, 5, true, false),
('CBD-LZR-FSPC30',  'Lazarus Naturals Full Spectrum CBD 30ml',  'Lazarus Naturals', 'CBD', 'Tinctures',  'Affordable full-spectrum CBD, coconut-infused.',     27.99, 15.00, 20, 5, true, false),
('CBD-CMD-1500TN',  'CBDMD Tincture 1500mg',                    'CBDMD',            'CBD', 'Tinctures',  'Broad spectrum CBD tincture, 50mg per serving.',    49.99, 29.00, 15, 5, true, false),
('CBD-VRM-GUMVTY',  'Verma Farms Tropical CBD Gummies 25ct',    'Verma Farms',      'CBD', 'Gummies',    'Hawaii-inspired tropical CBD gummies, 10mg each.',  29.99, 17.00, 18, 5, true, false),
('CBD-CFX-VAPEPEN', 'CBDfx CBD Disposable Vape Pen 30mg',       'CBDfx',            'CBD', 'Vapes',      'All-in-one disposable CBD vape pen, 30mg CBD.',     19.99, 11.00, 20, 5, true, false),
('CBD-KOI-VJC250',  'Koi CBD Vape Juice 250mg 30ml',            'Koi CBD',          'CBD', 'Vapes',      'CBD e-liquid for vaporizers, 250mg/30ml.',          24.99, 14.00, 15, 5, true, false),
('CBD-SLD-DRP1K',   'Select CBD Drops 1000mg Peppermint',       'Select CBD',       'CBD', 'Tinctures',  'Peppermint-flavored CBD tincture, 1000mg.',         49.99, 29.00, 12, 3, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- DELTA-8 / DELTA-9 / DELTA-10
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('D8G-3CH-GUM25',   '3Chi Delta-8 Gummies 25mg 16ct',          '3Chi',         'Delta', 'Delta-8 Gummies',  '3Chi Delta-8 THC gummies, 25mg each, 16-count.',        29.99, 17.00, 20, 5, true, true),
('D8G-MNW-GUM25',   'Moonwlkr Delta-8 Gummies 25mg 25ct',      'Moonwlkr',     'Delta', 'Delta-8 Gummies',  'Astronaut series Delta-8 gummies, 25mg, 25-count.',     34.99, 20.00, 18, 5, true, true),
('D8G-TRH-D9GUM5',  'TRE House Delta-9 Live Resin Gummies 5mg', 'TRE House',   'Delta', 'Delta-9 Gummies',  'Delta-9 THC live resin gummies, 5mg each, 20-count.',   34.99, 20.00, 15, 5, true, true),
('D8G-KOI-D9GUM10', 'Koi Delta-9 THC Gummies 10mg 20ct',       'Koi',          'Delta', 'Delta-9 Gummies',  'Farm-bill compliant Delta-9 gummies, 10mg each.',       29.99, 17.00, 18, 5, true, true),
('D8G-BDP-GUM25',   'Budpop Delta-8 Gummies 25mg 30ct',        'Budpop',       'Delta', 'Delta-8 Gummies',  'Strawberry gelato Delta-8 gummies, 25mg each.',         39.99, 23.00, 15, 5, true, true),
('D8G-TRH-D10GUM',  'TRE House Delta-10 Gummies 20ct',         'TRE House',    'Delta', 'Delta-10 Gummies', 'Uplifting Delta-10 THC gummies, tropical flavors.',      29.99, 17.00, 12, 3, true, true),
('D8V-CAK-D8DISP',  'Cake Delta-8 Disposable Vape 1.5g',       'Cake',         'Delta', 'Delta-8 Vapes',    'Delta-8 THC disposable vape, 1.5g, rechargeable.',      29.99, 17.00, 20, 5, true, true),
('D8V-URB-D8DISP',  'Urb Delta-8 Disposable Vape 1g',          'Urb',          'Delta', 'Delta-8 Vapes',    'Urb Delta-8 disposable vape, 1g, ceramic coil.',        24.99, 14.00, 18, 5, true, true),
('D8V-BND-D8CART',  'Binoid Delta-8 Vape Cartridge 1g',        'Binoid',       'Delta', 'Delta-8 Vapes',    'Delta-8 THC vape cartridge, 1g, 510 thread.',           24.99, 14.00, 15, 5, true, true),
('D8V-DXE-D8DISP',  'Delta Extrax Delta-8 Disposable 2g',      'Delta Extrax', 'Delta', 'Delta-8 Vapes',    'Prestige line Delta-8 disposable, 2g rechargeable.',     34.99, 20.00, 12, 3, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- KRATOM
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('KRT-OPM-BLQLQ',   'OPMS Black Liquid Kratom Shot 8.8ml',      'OPMS',              'Kratom', 'Shots',    'Highly concentrated kratom extract shot.',          14.99, 8.50, 30, 8,  true, true),
('KRT-OPM-GLDCAP',  'OPMS Gold Kratom Capsules 5ct',            'OPMS',              'Kratom', 'Capsules', 'Premium gold kratom extract capsules, 5-count.',    12.99, 7.25, 25, 8,  true, true),
('KRT-M45-BSTSHT',  'MIT45 Boost Kratom Shot 30ml',             'MIT45',             'Kratom', 'Shots',    'Full spectrum kratom extract shot, 30ml.',          9.99,  5.75, 30, 8,  true, true),
('KRT-M45-GLDLQ',   'MIT45 Gold Liquid Kratom 15ml',            'MIT45',             'Kratom', 'Liquid',   'Concentrated gold liquid kratom extract, 15ml.',    14.99, 8.50, 25, 8,  true, true),
('KRT-RMH-RVBALI',  'Remarkable Herbs Red Vein Bali 28g',       'Remarkable Herbs',  'Kratom', 'Powder',   'Red Vein Bali kratom powder, 28g (1oz) bag.',       7.99,  4.25, 20, 5,  true, true),
('KRT-RMH-WVMAED',  'Remarkable Herbs White Vein Maeng Da 28g', 'Remarkable Herbs',  'Kratom', 'Powder',   'White Vein Maeng Da kratom powder, 28g bag.',       7.99,  4.25, 20, 5,  true, true),
('KRT-HHO-RDBORN',  'Happy Hippo Red Borneo 28g',               'Happy Hippo',       'Kratom', 'Powder',   'Red Borneo kratom powder, lab-tested, 28g.',        9.99,  5.75, 15, 5,  true, true),
('KRT-BBE-GMMAD60', 'Bumble Bee Green Maeng Da 60ct Capsules',  'Bumble Bee',        'Kratom', 'Capsules', 'Green Maeng Da kratom capsules, 60-count.',         19.99, 11.50, 15, 5, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLING PAPERS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('RPR-RAW-CL125',   'RAW Classic 1.25 Rolling Papers',          'RAW',       'Accessories', 'Rolling Papers', 'Unbleached hemp rolling papers, 50 leaves.',      2.49, 1.25, 100, 25, true, false),
('RPR-RAW-CLKGS',   'RAW Classic King Size Slim Papers',        'RAW',       'Accessories', 'Rolling Papers', 'King size slim unbleached hemp papers, 32 leaves.',2.99, 1.50, 90,  25, true, false),
('RPR-RAW-OR125',   'RAW Organic Hemp 1.25 Papers',             'RAW',       'Accessories', 'Rolling Papers', 'Organic hemp unbleached papers, 50 leaves.',       2.99, 1.50, 85,  20, true, false),
('RPR-RAW-BK125',   'RAW Black 1.25 Ultra Thin Papers',         'RAW',       'Accessories', 'Rolling Papers', 'Double-pressed ultra thin papers, 50 leaves.',     3.49, 1.75, 80,  20, true, false),
('RPR-RAW-BKKGS',   'RAW Black King Size Slim Papers',          'RAW',       'Accessories', 'Rolling Papers', 'Ultra thin king slim black papers, 32 leaves.',    3.49, 1.75, 75,  20, true, false),
('RPR-RAW-PRTIP',   'RAW Pre-Rolled Tips 21pk',                 'RAW',       'Accessories', 'Tips',           'Pre-rolled natural fiber tips, 21-pack.',          2.49, 1.25, 90,  20, true, false),
('RPR-RAW-WIDETIP', 'RAW Perforated Wide Tips Booklet',         'RAW',       'Accessories', 'Tips',           'Perforated wide natural fiber tips booklet.',       1.99, 0.99, 100, 25, true, false),
('RPR-ELM-RC125',   'Elements Rice Papers 1.25',                'Elements',  'Accessories', 'Rolling Papers', 'Ultra-thin rice papers with natural sugar gum.',   2.49, 1.25, 70,  20, true, false),
('RPR-ELM-UTKGS',   'Elements Ultra Thin King Size Papers',     'Elements',  'Accessories', 'Rolling Papers', 'Ultra thin rice papers, king size, 40 leaves.',    2.99, 1.50, 65,  15, true, false),
('RPR-ZZG-ORG100',  'Zig-Zag Orange 1.25 100-Pack Booklet',    'Zig-Zag',   'Accessories', 'Rolling Papers', 'Classic orange Zig-Zag papers, 100-booklet pack.', 3.99, 2.00, 80,  20, true, false),
('RPR-ZZG-UTKGS',   'Zig-Zag Ultra Thin King Size Papers',     'Zig-Zag',   'Accessories', 'Rolling Papers', 'Ultra thin king size Zig-Zag papers, 32 leaves.',  2.49, 1.25, 70,  20, true, false),
('RPR-ZZG-FRO25',   'Zig-Zag French Orange 1.25 25-Booklet Pack','Zig-Zag', 'Accessories', 'Rolling Papers', 'French-style orange papers, 25-booklet display.',  12.99, 7.00, 30, 8,  true, false),
('RPR-JUJ-STRKGS',  'Juicy Jay''s Strawberry King Size Papers', 'Juicy Jay''s','Accessories','Rolling Papers', 'Strawberry-flavored king size papers, 32 leaves.', 3.49, 1.75, 60, 15, true, false),
('RPR-JUJ-BBYKGS',  'Juicy Jay''s Blueberry 1.25 Papers',      'Juicy Jay''s','Accessories','Rolling Papers', 'Blueberry-flavored 1.25 papers, 32 leaves.',       3.49, 1.75, 55, 15, true, false),
('RPR-BOM-HMP125',  'Bob Marley Hemp Papers 1.25',              'Bob Marley', 'Accessories', 'Rolling Papers', 'Pure hemp rolling papers, 33 leaves.',             2.49, 1.25, 50, 15, true, false),
('RPR-VIB-UT125',   'Vibes Ultra Thin 1.25 Papers',             'Vibes',     'Accessories', 'Rolling Papers', 'Connoisseur-grade ultra thin papers, 50 leaves.',  3.49, 1.75, 50, 15, true, false),
('RPR-BLZ-PNK125',  'Blazy Susan Pink Papers 1.25',             'Blazy Susan','Accessories','Rolling Papers', 'Pink-tinted rolling papers, 50 leaves.',           3.99, 2.00, 50, 15, true, false),
('RPR-CYC-CLCN2',   'Cyclone Pre-Rolled Clear Cones 2pk',       'Cyclone',   'Accessories', 'Pre-Rolls',      'Transparent cellulose pre-rolled cones, 2-pack.',   2.99, 1.50, 60, 15, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- BLUNT WRAPS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('BWR-BWD-HNBRY5',  'Backwoods Honey Berry 5pk',         'Backwoods',  'Accessories', 'Blunt Wraps', 'Natural leaf honey berry cigar wraps, 5-pack.',     9.99, 6.00, 60, 15, true, true),
('BWR-BWD-HNBON5',  'Backwoods Honey Bourbon 5pk',       'Backwoods',  'Accessories', 'Blunt Wraps', 'Natural leaf honey bourbon cigar wraps, 5-pack.',   9.99, 6.00, 55, 15, true, true),
('BWR-BWD-WLHNY5',  'Backwoods Wild Honey 5pk',          'Backwoods',  'Accessories', 'Blunt Wraps', 'Natural leaf wild honey cigar wraps, 5-pack.',      9.99, 6.00, 60, 15, true, true),
('BWR-BWD-RUSCRM5', 'Backwoods Russian Cream 5pk',       'Backwoods',  'Accessories', 'Blunt Wraps', 'Natural leaf Russian cream cigar wraps, 5-pack.',   9.99, 6.00, 55, 15, true, true),
('BWR-KPM-MINI2',   'King Palm Mini Rolls 2pk',          'King Palm',  'Accessories', 'Blunt Wraps', 'Slow-burning palm leaf mini rolls, 2-pack.',        3.99, 2.00, 70, 20, true, false),
('BWR-KPM-SLIM2',   'King Palm Slim Rolls 2pk',          'King Palm',  'Accessories', 'Blunt Wraps', 'Slow-burning palm leaf slim rolls, 2-pack.',        3.99, 2.00, 65, 20, true, false),
('BWR-HHP-OGKSH2',  'High Hemp CBD Wraps OG Kush 2pk',   'High Hemp',  'Accessories', 'Blunt Wraps', 'CBD-infused hemp wraps, OG Kush flavor, 2-pack.',   2.99, 1.50, 80, 20, true, false),
('BWR-HHP-MAUMG2',  'High Hemp CBD Wraps Maui Mango 2pk','High Hemp',  'Accessories', 'Blunt Wraps', 'CBD hemp wraps, Maui Mango flavor, 2-pack.',        2.99, 1.50, 75, 20, true, false),
('BWR-HEM-BLBRY2',  'Hemparillo Hemp Wraps Blueberry 2pk','Hemparillo','Accessories', 'Blunt Wraps', 'Hemp blueberry flavored wraps, 2-pack.',            2.49, 1.25, 70, 20, true, false),
('BWR-RYB-HMP2',    'Royal Blunts Hemp Wraps 2pk',       'Royal Blunts','Accessories','Blunt Wraps', 'Hemp blunt wraps, sweet natural flavor, 2-pack.',   2.49, 1.25, 60, 15, true, false),
('BWR-TWH-NATRL4',  'Twisted Hemp Wraps Natural 4pk',    'Twisted Hemp','Accessories','Blunt Wraps', 'Natural unflavored hemp wraps, 4-pack.',            2.99, 1.50, 55, 15, true, false),
('BWR-GME-GRPE2',   'Game Leaf Cigarillos Grape 2pk',    'Game',       'Accessories', 'Blunt Wraps', 'Natural leaf grape cigarillo wraps, 2-pack.',       2.29, 1.15, 80, 20, true, true)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- PIPES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('PIP-PUL-SP4',     'Pulsar 4" Spoon Pipe Hand Glass',   'Pulsar',     'Accessories', 'Glass Pipes',  'Borosilicate glass spoon pipe, 4 inch.',            9.99,  5.50, 30, 8, true, false),
('PIP-GRV-SP5',     'Grav Labs 5" Spoon Pipe',           'Grav Labs',  'Accessories', 'Glass Pipes',  'Scientific glass spoon pipe, fumed color-change.',  24.99, 14.00, 20, 5, true, false),
('PIP-CHM-SP5',     'Chameleon Glass 5" Color Spoon',    'Chameleon',  'Accessories', 'Glass Pipes',  'Color-changing glass spoon pipe, hand-blown.',       19.99, 11.00, 18, 5, true, false),
('PIP-RYT-1HTR',    'Ryot Metal Taster One-Hitter',      'Ryot',       'Accessories', 'One-Hitters',  'Aluminum metal taster bat one-hitter pipe.',          7.99,  4.00, 40, 10, true, false),
('PIP-KUP-DUGOUT',  'KKUP2U Dugout One-Hitter Set',      'KKUP2U',     'Accessories', 'One-Hitters',  'Wood dugout box with metal bat one-hitter.',         14.99,  8.00, 25, 8, true, false),
('PIP-STD-CHLL3',   'Chillum Glass Pipe 3"',             'Generic',    'Accessories', 'Glass Pipes',  'Borosilicate glass chillum pipe, 3 inch.',           7.99,  4.00, 35, 10, true, false),
('PIP-STD-SHRLK',   'Sherlock Glass Pipe 6"',            'Generic',    'Accessories', 'Glass Pipes',  'Sherlock-style borosilicate glass pipe, 6 inch.',   14.99,  8.00, 20, 5, true, false),
('PIP-WOD-BNTST',   'Bent Stem Wooden Pipe',             'Generic',    'Accessories', 'Wood Pipes',   'Classic bent stem briar wood tobacco pipe.',        12.99,  7.00, 15, 5, true, false),
('PIP-MOM-CNCOB',   'Missouri Meerschaum Corn Cob Pipe', 'Missouri Meerschaum','Accessories','Corn Cob Pipes','Genuine corn cob pipe, American made.',  6.99,  3.50, 20, 5, true, false),
('PIP-SLC-SPOON',   'Silicone Spoon Pipe with Glass Bowl','Generic',   'Accessories', 'Silicone Pipes','Unbreakable silicone pipe, removable glass bowl.',  12.99,  7.00, 25, 8, true, false),
('PIP-GRV-STMRL',   'Grav 9mm Steamroller',              'Grav Labs',  'Accessories', 'Glass Pipes',  'Scientific glass steamroller, powerful airflow.',   29.99, 17.00, 12, 3, true, false),
('PIP-MNI-CLMTL',   'Mini Color Metal Pipe 2.5"',        'Generic',    'Accessories', 'Metal Pipes',  'Compact metal bowl pipe, colorful, 2.5 inch.',       5.99,  3.00, 40, 10, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- WATER PIPES / BONGS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('BNG-DMG-BKR8',    'Diamond Glass 8" Beaker Bong',       'Diamond Glass','Accessories','Bongs',     'Thick borosilicate 8" beaker bong, 14mm joint.',   29.99, 17.00, 15, 3, true, false),
('BNG-GRV-ST12',    'Grav Labs 12" Straight Tube Bong',   'Grav Labs',    'Accessories','Bongs',     'Scientific glass 12" straight tube, ice catcher.',49.99, 29.00, 10, 3, true, false),
('BNG-PUL-BKR10',   'Pulsar 10" Beaker Bong',             'Pulsar',       'Accessories','Bongs',     'Borosilicate glass 10" beaker with ice notches.',  34.99, 20.00, 12, 3, true, false),
('BNG-SLC-11IN',    'Silicone Bong 11" Unbreakable',      'Generic',      'Accessories','Bongs',     'Unbreakable food-grade silicone bong, 11 inch.',   24.99, 13.00, 15, 5, true, false),
('BNG-MNI-DAB6',    'Mini Dab Rig 6" Glass',              'Generic',      'Accessories','Dab Rigs',  'Compact borosilicate dab rig, 6 inch, 14mm banger.',29.99, 17.00, 10, 3, true, false),
('BNG-PRC-HC12',    'Honeycomb Percolator Bong 12"',      'Generic',      'Accessories','Bongs',     'Dual honeycomb perc bong, 12 inch, heavy glass.',  44.99, 26.00, 8,  2, true, false),
('BNG-PRC-TR14',    'Tree Perc Bong 14"',                 'Generic',      'Accessories','Bongs',     'Multi-arm tree percolator bong, 14 inch.',         39.99, 23.00, 8,  2, true, false),
('BNG-EHLE-ST18',   'EHLE Glass 18" Straight Tube',       'EHLE',         'Accessories','Bongs',     'German borosilicate 18" straight tube, ice pinch.', 79.99, 47.00, 5,  2, true, false),
('BNG-REC-8',       'Recycler Dab Rig 8"',                'Generic',      'Accessories','Dab Rigs',  'Recycler glass dab rig, 8 inch, enhanced filtration.',34.99, 20.00, 8, 2, true, false),
('BNG-OLB-GLASS',   'Oil Burner Glass Pipe',              'Generic',      'Accessories','Pipes',     'Borosilicate glass oil burner pipe, 6 inch.',        5.99,  3.00, 30, 8, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- GRINDERS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('GRD-SPC-TI4P2',   'Space Case Titanium 4-Piece 2"',     'Space Case',     'Accessories', 'Grinders', 'Aerospace-grade titanium grinder, 4-piece.',        69.99, 42.00, 8,  2, true, false),
('GRD-SCZ-4P2',     'Santa Cruz Shredder 4-Piece 2.15"',  'Santa Cruz Shredder','Accessories','Grinders','Unique tooth design, 4-piece anodized aluminum.',  59.99, 36.00, 10, 3, true, false),
('GRD-CAL-PRO4P',   'Cali Crusher Pro 4-Piece 2.5"',      'Cali Crusher',   'Accessories', 'Grinders', 'Quick-lock system, 4-piece aluminum grinder.',      34.99, 20.00, 12, 3, true, false),
('GRD-PHX-ELT4P',   'Phoenician Elite 4-Piece 2.2"',      'Phoenician',     'Accessories', 'Grinders', 'Medical-grade aluminum, screen system, 4-piece.',   59.99, 36.00, 8,  2, true, false),
('GRD-MND-4P2',     'Mendo Mulcher 4-Piece 2"',           'Mendo Mulcher',  'Accessories', 'Grinders', 'Hand-crafted USA aluminum grinder, 4-piece.',        49.99, 30.00, 8,  2, true, false),
('GRD-SHS-VIB4P',   'SharpStone Vibrating Grinder 4-Piece','SharpStone',    'Accessories', 'Grinders', 'Built-in vibrator for kief collection, 4-piece.',   29.99, 17.00, 10, 3, true, false),
('GRD-GLG-4P22',    'Golden Gate 2.2" 4-Piece Aluminum',  'Golden Gate',    'Accessories', 'Grinders', 'Quality anodized aluminum grinder, 4-piece.',        19.99, 11.00, 15, 5, true, false),
('GRD-GRN-PLSTC',   'GreenGo Plastic Grinder 3-Piece',    'GreenGo',        'Accessories', 'Grinders', 'Durable plastic grinder, 3-piece, affordable.',     7.99,  4.00, 25, 8, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- LIGHTERS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('LTR-BIC-SNGL',    'Bic Classic Lighter Single',          'Bic',    'Accessories', 'Lighters',      'Standard Bic butane lighter, assorted colors.',       1.99, 0.85, 200, 50, true, false),
('LTR-BIC-5PK',     'Bic Classic Lighter 5-Pack',          'Bic',    'Accessories', 'Lighters',      'Assorted colors 5-pack Bic classic lighters.',        8.99, 4.00, 80,  25, true, false),
('LTR-BIC-MINI5',   'Bic Mini Lighter 5-Pack',             'Bic',    'Accessories', 'Lighters',      'Compact mini Bic lighters, 5-pack assorted.',         6.99, 3.25, 70,  20, true, false),
('LTR-CLP-REFLL',   'Clipper Refillable Lighter Classic',  'Clipper','Accessories', 'Lighters',      'Refillable flint lighter with removable flint system.',2.99, 1.50, 100, 25, true, false),
('LTR-CLP-HEMP',    'Clipper Hemp Lighter',                'Clipper','Accessories', 'Lighters',      'Hemp design Clipper refillable lighter.',              3.49, 1.75, 60,  15, true, false),
('LTR-ZIP-CHROME',  'Zippo Chrome Regular Lighter',        'Zippo',  'Accessories', 'Lighters',      'Classic polished chrome Zippo windproof lighter.',    14.99, 8.50, 25, 5,  true, false),
('LTR-ZIP-MATTE',   'Zippo Matte Black Lighter',           'Zippo',  'Accessories', 'Lighters',      'Matte black Zippo windproof lighter.',                14.99, 8.50, 20, 5,  true, false),
('LTR-ZIP-FLD12',   'Zippo Lighter Fluid 12oz',            'Zippo',  'Accessories', 'Lighter Fuel',  'Zippo premium lighter fluid, 12-ounce can.',           6.99, 3.75, 40, 10, true, false),
('LTR-ZIP-FLNT6',   'Zippo Flints 6-Pack',                 'Zippo',  'Accessories', 'Lighter Parts', 'Genuine Zippo replacement flints, 6-pack.',            3.99, 2.00, 50, 15, true, false),
('LTR-XIK-ULT2',   'Xikar Ultra Single Torch Lighter',    'Xikar',  'Accessories', 'Torch Lighters','Cigar torch lighter, single flame, fuel window.',    29.99, 17.00, 12, 3, true, false),
('LTR-BLZ-BGSHT',  'Blazer Big Shot Torch Lighter',       'Blazer', 'Accessories', 'Torch Lighters','Powerful butane torch, adjustable flame.',            24.99, 14.00, 10, 3, true, false),
('LTR-VTG-CYC3T',  'Vertigo Cyclone Triple Torch Lighter','Vertigo', 'Accessories', 'Torch Lighters','Triple-jet torch lighter for cigars.',                19.99, 11.00, 12, 3, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLING ACCESSORIES (TRAYS, MACHINES, TUBES)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('RLA-RAW-TRYSML',  'RAW Rolling Tray Small 11x7"',        'RAW',    'Accessories', 'Rolling Trays',  'Small RAW natural rolling tray, 11x7 inches.',      7.99,  4.00, 30, 8, true, false),
('RLA-RAW-TRYMED',  'RAW Rolling Tray Medium 13x10"',      'RAW',    'Accessories', 'Rolling Trays',  'Medium RAW natural rolling tray, 13x10 inches.',    9.99,  5.25, 25, 8, true, false),
('RLA-RAW-TRYLRG',  'RAW Rolling Tray Large 14x12"',       'RAW',    'Accessories', 'Rolling Trays',  'Large RAW natural rolling tray, 14x12 inches.',    14.99,  8.00, 20, 5, true, false),
('RLA-OCB-RLM125',  'OCB Rolling Machine 1.25"',           'OCB',    'Accessories', 'Rolling Machines','Cigarette rolling machine, 70mm, easy fill.',       3.99,  2.00, 40, 10, true, false),
('RLA-RAW-RLM79',   'RAW 79mm Hemp Roller Machine',        'RAW',    'Accessories', 'Rolling Machines','Hemp 79mm rolling machine for 1.25 papers.',        5.99,  3.00, 35, 10, true, false),
('RLA-RAW-RLM110',  'RAW 110mm Lean Roller Machine',       'RAW',    'Accessories', 'Rolling Machines','Lean 110mm rolling machine for king size papers.',   6.99,  3.50, 30, 8,  true, false),
('RLA-STD-TUBE200', 'Cigarette Tubes Regular 200ct',       'Generic','Accessories', 'Cigarette Tubes','Empty cigarette tubes for injector, 200-count.',     2.99,  1.50, 40, 10, true, false),
('RLA-STD-MTUBE200','Cigarette Tubes Menthol 200ct',       'Generic','Accessories', 'Cigarette Tubes','Menthol empty cigarette tubes, 200-count.',           2.99,  1.50, 35, 10, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE & ACCESSORIES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('STG-SKK-SPSML',   'Skunk Bag Smell-Proof Bag Small',    'Skunk',   'Accessories', 'Storage',    'Carbon-lined smell-proof bag, small.',              9.99,  5.25, 25, 5, true, false),
('STG-SKK-SPLRG',   'Skunk Bag Smell-Proof Bag Large',    'Skunk',   'Accessories', 'Storage',    'Carbon-lined smell-proof bag, large.',             14.99,  8.00, 20, 5, true, false),
('STG-CVL-006L',    'CVault Storage Container 0.06L',     'CVault',  'Accessories', 'Storage',    'Airtight stainless steel humidity-controlled container.', 14.99, 8.00, 20, 5, true, false),
('STG-CVL-1L',      'CVault Storage Container 1L',        'CVault',  'Accessories', 'Storage',    'Large airtight stainless container, 1-liter.',     29.99, 17.00, 12, 3, true, false),
('STG-BVD-HUM624',  'Boveda 62% Humidity Pack 4pk',       'Boveda',  'Accessories', 'Humidity',   '2-way humidity control packs 62%, 4-count.',        7.99,  4.00, 30, 8, true, false),
('STG-GLZ-JAR4',    'Glass Stash Jar 4oz Wide Mouth',     'Generic', 'Accessories', 'Storage',    'UV-resistant borosilicate glass jar, 4oz.',         5.99,  3.00, 35, 8, true, false),
('STG-GLZ-JAR8',    'Glass Stash Jar 8oz Wide Mouth',     'Generic', 'Accessories', 'Storage',    'UV-resistant borosilicate glass jar, 8oz.',         7.99,  4.00, 28, 8, true, false),
('ACC-STD-ASH',     'Ceramic Ashtray Round Large',        'Generic', 'Accessories', 'Ashtrays',   'Large ceramic ashtray, heavy base, 5 inch.',        7.99,  4.00, 30, 8, true, false),
('ACC-STD-ASHCGR',  'Cigar Ashtray 4-Slot Glass',         'Generic', 'Accessories', 'Ashtrays',   '4-slot glass cigar ashtray, heavy duty.',          14.99,  8.00, 15, 5, true, false),
('ACC-STD-CGCASE',  'Metal Cigarette Case 20-Pack',       'Generic', 'Accessories', 'Cases',      'Slim metal cigarette case holds 20 cigarettes.',    8.99,  4.75, 20, 5, true, false),
('ACC-STD-PPCLN',   'Pipe Cleaners Bristle 100pk',        'Generic', 'Accessories', 'Pipe Tools', 'Cotton bristle pipe cleaners, 100-pack.',           3.99,  2.00, 30, 8, true, false),
('ACC-STD-BUTANE',  'Lotus Butane Fuel Can 10oz',         'Lotus',   'Accessories', 'Lighter Fuel','Ultra-refined triple-filtered butane, 10oz.',       6.99,  3.50, 40, 10, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- BEVERAGES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('BEV-MON-ORIG16',  'Monster Energy Original 16oz',       'Monster',    'Beverages', 'Energy Drinks', 'Original Monster Energy, 16oz can.',              2.99, 1.50, 80, 20, true, false),
('BEV-MON-ZRULT',   'Monster Energy Zero Ultra 16oz',     'Monster',    'Beverages', 'Energy Drinks', 'Zero sugar Monster Energy, white can.',            2.99, 1.50, 70, 20, true, false),
('BEV-MON-ULB16',   'Monster Ultra Blue 16oz',            'Monster',    'Beverages', 'Energy Drinks', 'Zero sugar blue berry Monster Energy.',            2.99, 1.50, 60, 15, true, false),
('BEV-RDB-ORIG84',  'Red Bull Original 8.4oz',            'Red Bull',   'Beverages', 'Energy Drinks', 'Original Red Bull energy drink, 8.4oz.',          2.49, 1.25, 90, 25, true, false),
('BEV-RDB-SFREE84', 'Red Bull Sugar Free 8.4oz',          'Red Bull',   'Beverages', 'Energy Drinks', 'Sugar-free Red Bull energy drink, 8.4oz.',        2.49, 1.25, 80, 20, true, false),
('BEV-FHE-ORIG',    '5-Hour Energy Original 1.93oz',      '5-Hour Energy','Beverages','Shots',        'Original strength berry flavor energy shot.',     3.49, 1.75, 80, 20, true, false),
('BEV-FHE-XTRA',    '5-Hour Energy Extra Strength 1.93oz','5-Hour Energy','Beverages','Shots',        'Extra strength pomegranate energy shot.',          3.99, 2.00, 70, 20, true, false),
('BEV-AZN-GRNTEA',  'Arizona Green Tea 23oz',             'Arizona',    'Beverages', 'Teas',          'Classic Arizona Green Tea with Ginseng, 23oz.',    1.99, 0.99, 100, 25, true, false),
('BEV-RGN-MELON',   'Reign Total Body Fuel Melon Mania',  'Reign',      'Beverages', 'Energy Drinks', 'Melon mango performance energy drink, 16oz.',     2.99, 1.50, 55, 15, true, false),
('BEV-BNG-SOURH',   'Bang Energy Sour Heads 16oz',        'Bang',       'Beverages', 'Energy Drinks', 'Sour candy flavored energy drink, no sugar.',     2.99, 1.50, 50, 15, true, false),
('BEV-CEL-WLDBY',   'Celsius Energy Wild Berry 12oz',     'Celsius',    'Beverages', 'Energy Drinks', 'Sparkling wild berry fitness energy drink.',       2.49, 1.25, 55, 15, true, false),
('BEV-PRM-HYD169',  'Prime Hydration Drink 16.9oz',       'Prime',      'Beverages', 'Sports Drinks', 'Electrolyte hydration drink, 10% coconut water.',  2.49, 1.25, 60, 15, true, false)
ON CONFLICT (sku) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SNACKS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO products (sku, name, brand, category, subcategory, description, price, cost_price, stock, min_stock, is_active, age_restricted) VALUES
('SNK-JLK-BEF325',  'Jack Link''s Beef Jerky Original 3.25oz',   'Jack Link''s','Snacks','Jerky',  'Original beef jerky, slow smoked, 3.25oz bag.',    5.99, 3.25, 30, 8, true, false),
('SNK-JLK-TRY325',  'Jack Link''s Teriyaki Jerky 3.25oz',        'Jack Link''s','Snacks','Jerky',  'Sweet teriyaki beef jerky, slow smoked, 3.25oz.',  5.99, 3.25, 25, 8, true, false),
('SNK-SLJ-ORIG1',   'Slim Jim Original 1oz',                     'Slim Jim',   'Snacks','Jerky',  'Classic Slim Jim smoked meat snack, 1oz.',          1.49, 0.75, 80, 20, true, false),
('SNK-CHT-HTFRY2',  'Chester''s Hot Fries 2oz',                  'Chester''s', 'Snacks','Chips',  'Crunchy corn/potato hot fries, 2oz bag.',           1.99, 0.99, 60, 15, true, false),
('SNK-FNY-ONRNG2',  'Funyuns Onion Rings 2oz',                   'Funyuns',    'Snacks','Chips',  'Crunchy onion-flavored corn rings, 2oz.',           1.99, 0.99, 60, 15, true, false),
('SNK-DVD-SUNFL',   'David Sunflower Seeds Original 5.25oz',      'David',      'Snacks','Seeds',  'Original salted sunflower seeds, 5.25oz.',          2.99, 1.50, 40, 10, true, false),
('SNK-PLN-MXNUT',   'Planters Mixed Nuts 1.75oz',                 'Planters',   'Snacks','Nuts',   'Salted mixed nuts with peanuts and cashews, 1.75oz.',2.49, 1.25, 40, 10, true, false),
('SNK-SKT-ORIG',    'Skittles Original 2.17oz',                   'Skittles',   'Snacks','Candy',  'Original rainbow Skittles, 2.17oz bag.',            1.79, 0.89, 50, 15, true, false)
ON CONFLICT (sku) DO NOTHING;

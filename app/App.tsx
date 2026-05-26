import { useCallback, useEffect, memo, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

// ─── Web-only CSS (injected once at module load) ──────────────────────────────
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const _id = 'andys-global-styles';
  if (!document.getElementById(_id)) {
    const s = document.createElement('style');
    s.id = _id;
    s.textContent = `
      * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
      html, body { height: 100%; margin: 0; overflow: hidden; background: #060914; }
      #root { height: 100%; display: flex; flex-direction: column; }
      input:focus { outline: none !important; }

      .ag-btn-grad {
        background: linear-gradient(135deg, #1f6feb 0%, #4f46e5 55%, #7c3aed 100%) !important;
        box-shadow: 0 4px 22px rgba(31,111,235,0.38) !important;
        cursor: pointer !important;
        transition: filter 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease !important;
      }
      .ag-btn-grad:hover {
        filter: brightness(1.12) !important;
        box-shadow: 0 7px 32px rgba(31,111,235,0.55) !important;
        transform: translateY(-1px) !important;
      }

      .ag-btn-secondary {
        transition: background 0.14s ease, transform 0.12s ease !important;
        cursor: pointer !important;
      }
      .ag-btn-secondary:hover { background: #1e3251 !important; transform: translateY(-1px) !important; }

      .ag-glass {
        backdrop-filter: blur(24px) !important;
        -webkit-backdrop-filter: blur(24px) !important;
      }

      .ag-input:focus {
        border-color: rgba(31,111,235,0.75) !important;
        box-shadow: 0 0 0 3px rgba(31,111,235,0.14) !important;
      }

      .ag-card-hover {
        transition: transform 0.17s ease, box-shadow 0.17s ease !important;
      }
      .ag-card-hover:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
      }

      .ag-cat-btn {
        transition: background 0.14s ease, transform 0.12s ease !important;
        cursor: pointer !important;
      }
      .ag-cat-btn:hover { transform: translateY(-1px) !important; }

      .ag-add-btn {
        transition: filter 0.12s ease !important;
        cursor: pointer !important;
      }
      .ag-add-btn:hover { filter: brightness(1.15) !important; }

      .ag-qty-btn {
        cursor: pointer !important;
        transition: background 0.12s ease, transform 0.1s ease !important;
        border-radius: 10px !important;
      }
      .ag-qty-btn:hover {
        background: rgba(31,111,235,0.28) !important;
        transform: scale(1.12) !important;
      }

      .ag-cart-pill {
        cursor: pointer !important;
        transition: transform 0.15s ease, box-shadow 0.15s ease !important;
      }
      .ag-cart-pill:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 10px 32px rgba(31,111,235,0.45) !important;
      }

      .ag-sticky {
        position: sticky !important;
        top: 0 !important;
        z-index: 100 !important;
        background: rgba(6,9,20,0.97) !important;
        backdrop-filter: blur(18px) !important;
        -webkit-backdrop-filter: blur(18px) !important;
        border-bottom: 1px solid rgba(255,255,255,0.04) !important;
      }

      .ag-brand-glow {
        text-shadow: 0 0 40px rgba(255,255,255,0.12), 0 2px 12px rgba(0,0,0,0.6) !important;
      }
      .ag-brand-sub-glow {
        text-shadow: 0 0 24px rgba(31,111,235,0.7) !important;
      }

      /* Responsive product grid */
      .ag-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
        gap: 14px !important;
        align-items: start !important;
      }

      /* Card image hover zoom — target the actual <img> inside the hero wrap */
      .card-hero-wrap { overflow: hidden !important; }
      .card-hero-wrap img {
        transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        width: 100% !important; height: 100% !important; object-fit: cover !important;
      }
      .ag-card-hover:hover .card-hero-wrap img { transform: scale(1.1) !important; }

      /* Flame brand logo mark */
      @keyframes flamePulse {
        0%, 100% { box-shadow: 0 0 28px rgba(255,107,53,0.55), 0 0 56px rgba(124,58,237,0.32), inset 0 1px 0 rgba(255,255,255,0.18); }
        50% { box-shadow: 0 0 44px rgba(255,107,53,0.8), 0 0 88px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.22); }
      }
      .ag-logo-flame {
        background: linear-gradient(135deg, #ff6b35 0%, #dc2626 42%, #7c3aed 100%) !important;
        border-color: rgba(255,107,53,0.35) !important;
        animation: flamePulse 2.8s ease-in-out infinite !important;
      }

      /* Cart drawer overlay */
      .ag-drawer-overlay {
        position: fixed !important;
        inset: 0 !important;
        z-index: 500 !important;
        background: rgba(3,7,18,0.82) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
      }

      /* Cart drawer panel */
      .ag-drawer-panel {
        position: fixed !important;
        top: 0 !important; right: 0 !important; bottom: 0 !important;
        width: min(440px, 100vw) !important;
        z-index: 501 !important;
        background: linear-gradient(175deg, #080e1c 0%, #0a1428 65%, #060914 100%) !important;
        border-left: 1px solid rgba(31,111,235,0.16) !important;
        box-shadow: -24px 0 80px rgba(0,0,0,0.95), -1px 0 0 rgba(255,107,53,0.08) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }

      /* Scrollable items inside drawer */
      .ag-drawer-items {
        flex: 1 !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
      .ag-drawer-items::-webkit-scrollbar { width: 3px !important; }
      .ag-drawer-items::-webkit-scrollbar-track { background: transparent !important; }
      .ag-drawer-items::-webkit-scrollbar-thumb { background: rgba(31,111,235,0.25) !important; border-radius: 2px !important; }

      /* Wishlist pill */
      .ag-wl-pill { cursor: pointer !important; transition: transform 0.14s ease, box-shadow 0.14s ease !important; }
      .ag-wl-pill:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(251,191,36,0.35) !important; }

      /* Heart button on card */
      .ag-heart-btn { cursor: pointer !important; transition: transform 0.12s ease !important; }
      .ag-heart-btn:hover { transform: scale(1.22) !important; }

      /* Wishlist drawer */
      .ag-wl-overlay {
        position: fixed !important; inset: 0 !important; z-index: 500 !important;
        background: rgba(3,7,18,0.82) !important;
        backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
      }
      .ag-wl-panel {
        position: fixed !important; top: 0 !important; left: 0 !important; bottom: 0 !important;
        width: min(400px, 100vw) !important; z-index: 501 !important;
        background: linear-gradient(175deg, #0a0e1c 0%, #0c1428 65%, #060914 100%) !important;
        border-right: 1px solid rgba(251,191,36,0.14) !important;
        box-shadow: 20px 0 80px rgba(0,0,0,0.95) !important;
        display: flex !important; flex-direction: column !important; overflow: hidden !important;
      }
      .ag-wl-items { flex: 1 !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }
      .ag-wl-items::-webkit-scrollbar { width: 3px !important; }
      .ag-wl-items::-webkit-scrollbar-thumb { background: rgba(251,191,36,0.25) !important; border-radius: 2px !important; }

      /* Quick-add cart button (appears on card hover) */
      .card-quick-add-wrap {
        position: absolute !important; inset: 0 !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        opacity: 0 !important; transition: opacity 0.18s ease !important;
        pointer-events: none !important;
        background: rgba(6,9,20,0.18) !important;
      }
      .ag-card-hover:hover .card-quick-add-wrap {
        opacity: 1 !important; pointer-events: auto !important;
      }
      .card-quick-add-btn {
        background: rgba(255,255,255,0.93) !important; border-radius: 50% !important;
        width: 54px !important; height: 54px !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        cursor: pointer !important; box-shadow: 0 4px 24px rgba(0,0,0,0.38) !important;
        transform: scale(0.72) !important;
        transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.14s, box-shadow 0.14s !important;
      }
      .ag-card-hover:hover .card-quick-add-btn { transform: scale(1) !important; }
      .card-quick-add-btn:hover {
        background: #1f6feb !important;
        box-shadow: 0 8px 28px rgba(31,111,235,0.55) !important;
      }
      .card-quick-add-btn:hover .cqa-icon { filter: brightness(0) invert(1) !important; }

      /* Review cards scroll */
      .ag-reviews-scroll {
        display: flex !important; flex-direction: row !important;
        overflow-x: auto !important; gap: 14px !important; padding-bottom: 8px !important;
        scrollbar-width: none !important;
      }
      .ag-reviews-scroll::-webkit-scrollbar { display: none !important; }
      .ag-review-card {
        flex-shrink: 0 !important; width: 280px !important;
        background: rgba(12,21,38,0.8) !important;
        border: 1px solid rgba(255,255,255,0.07) !important;
        border-radius: 18px !important; padding: 18px !important;
        transition: transform 0.16s ease, box-shadow 0.16s ease !important;
      }
      .ag-review-card:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 12px 36px rgba(0,0,0,0.4) !important;
      }

      /* Store map iframe */
      .ag-map-frame {
        width: 100% !important; height: 220px !important;
        border: none !important; border-radius: 16px !important;
        display: block !important;
      }
    `;
    document.head.appendChild(s);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const storage = {
  getItem: (key: string) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key: string, value: string) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); return Promise.resolve(); },
  removeItem: (key: string) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); return Promise.resolve(); }
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const TOKEN_KEY = '@andys_auth_token';
const wc = (cls: string) => Platform.OS === 'web' ? ({ className: cls } as any) : {};

// ─── Category icon colours ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  'Cigarettes':       { color: '#fca5a5', bg: 'rgba(220,38,38,0.16)' },
  'Cigars':           { color: '#fbbf24', bg: 'rgba(180,83,9,0.18)' },
  'Little Cigars':    { color: '#f59e0b', bg: 'rgba(146,64,14,0.18)' },
  'Vapes':            { color: '#60a5fa', bg: 'rgba(37,99,235,0.18)' },
  'E-Cigarettes':     { color: '#818cf8', bg: 'rgba(79,70,229,0.18)' },
  'Hookah':           { color: '#34d399', bg: 'rgba(5,150,105,0.18)' },
  'Shisha':           { color: '#34d399', bg: 'rgba(5,150,105,0.18)' },
  'Nicotine Pouches': { color: '#a78bfa', bg: 'rgba(124,58,237,0.18)' },
  'CBD':              { color: '#4ade80', bg: 'rgba(22,163,74,0.18)' },
  'Accessories':      { color: '#94a3b8', bg: 'rgba(71,85,105,0.22)' },
  'Beverages':        { color: '#38bdf8', bg: 'rgba(8,145,178,0.18)' },
  'Snacks':           { color: '#fbbf24', bg: 'rgba(217,119,6,0.18)' },
  'Lighters':         { color: '#fb923c', bg: 'rgba(194,65,12,0.18)' },
  'Tobacco':          { color: '#d97706', bg: 'rgba(120,53,15,0.18)' },
};
function getCatStyle(category: string): { color: string; bg: string } {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  const key = Object.keys(CATEGORY_COLORS).find((k) =>
    category.toLowerCase().includes(k.toLowerCase())
  );
  return key ? CATEGORY_COLORS[key] : { color: '#94a3b8', bg: 'rgba(71,85,105,0.22)' };
}

// ─── Curated Unsplash CDN photo pools per category ───────────────────────────
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=280&fit=crop&auto=format&q=82`;

const CATEGORY_PHOTOS: Record<string, string[]> = {
  'Cigarettes': [
    U('1574027542338-98e75acfd385'), U('1545241047-6083a3f17103'),
    U('1512845177-0a3ccca1e7e5'),   U('1585166059390-a01f9a3c2bcd'),
  ],
  'Cigars': [
    U('1527799820374-dcf8d9d4a388'), U('1607113564-e525f93c8b43'),
    U('1564671165-8e0fe9b08e01'),    U('1541696432-82c6da8ce7bf'),
  ],
  'Little Cigars': [
    U('1527799820374-dcf8d9d4a388'), U('1607113564-e525f93c8b43'),
  ],
  'Vaping': [
    U('1559076953-bccfeba37b91'), U('1574144816-4f87f4f51fe0'),
    U('1520209268-7bd62b5dc5e1'), U('1587502537147-e521b5f7ab36'),
  ],
  'E-Cigarettes': [
    U('1559076953-bccfeba37b91'), U('1574144816-4f87f4f51fe0'),
  ],
  'Hookah': [
    U('1516456396-4f5d5ed24c43'), U('1508597649478-a8bfe6c55ed0'),
    U('1599474924187-334a4ae4e55f'),
  ],
  'Shisha': [
    U('1516456396-4f5d5ed24c43'), U('1508597649478-a8bfe6c55ed0'),
  ],
  'Nicotine Pouches': [
    U('1622032493875-64b8a3b5b27e'), U('1584473457409-ae5c91d211ff'),
    U('1612969310830-f8d4fa4b2a84'),
  ],
  'CBD': [
    U('1619952867878-3e7cc3c4b7e2'), U('1596394516093-501ba68a0ba6'),
    U('1621349339063-5e55fe1b4d4a'), U('1607868894064-2b6606e05d05'),
  ],
  'Delta': [
    U('1619952867878-3e7cc3c4b7e2'), U('1596394516093-501ba68a0ba6'),
    U('1621349339063-5e55fe1b4d4a'),
  ],
  'Kratom': [
    U('1596394516093-501ba68a0ba6'), U('1558618666-fcd25c85cd64'),
    U('1542754424-6c42d1a1f79f'),
  ],
  'Accessories': [
    U('1493723843671-1d655e66ac1c'), U('1558618666-fcd25c85cd64'),
    U('1565793972605-44df8d9e3d14'), U('1574027542338-98e75acfd385'),
  ],
  'Lighters': [
    U('1493723843671-1d655e66ac1c'), U('1582719508-b1aea8ce9d94'),
    U('1558618666-fcd25c85cd64'),
  ],
  'Tobacco': [
    U('1574027542338-98e75acfd385'), U('1545241047-6083a3f17103'),
    U('1512845177-0a3ccca1e7e5'),
  ],
  'Pipe Tobacco': [
    U('1574027542338-98e75acfd385'), U('1584473457409-ae5c91d211ff'),
    U('1545241047-6083a3f17103'),
  ],
  'Dip & Chew': [
    U('1622032493875-64b8a3b5b27e'), U('1584473457409-ae5c91d211ff'),
  ],
  'Beverages': [
    U('1543965860-c0b00f8d2b58'), U('1545620110-3191a4f63f4e'),
    U('1551024601-bec78aea704b'), U('1582106245-20f1a6c6b6f5'),
  ],
  'Snacks': [
    U('1566478989-d6e3b27f6a26'), U('1578985545062-69928b1d9587'),
    U('1512058454905-6b841e7ad132'), U('1558618666-fcd25c85cd64'),
  ],
};

function getCategoryImage(category: string, productId: string, productName: string): string {
  let pool = CATEGORY_PHOTOS[category];
  if (!pool) {
    const key = Object.keys(CATEGORY_PHOTOS).find((k) =>
      category.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(category.toLowerCase())
    );
    pool = key ? CATEGORY_PHOTOS[key] : [];
  }
  if (!pool || pool.length === 0) return '';
  const seed = (productId + productName).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return pool[seed % pool.length];
}

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Product {
  id: string; sku: string; name: string; brand?: string;
  category: string; subcategory?: string; price: number;
  description: string; stock?: number; minStock?: number;
  ageRestricted?: boolean; isActive?: boolean;
}
interface AdminStats { total: string; low_stock: string; categories: string; }
interface AuthUser {
  id: string; email: string; firstName: string; lastName: string;
  token: string; ageVerified: boolean; isAdmin: boolean;
}
interface PaymentMethod { id: string; brand: string; last4: string; expMonth: number; expYear: number; isDefault: boolean; }
type Screen = 'loading' | 'login' | 'register' | 'verify-age' | 'shop' | 'payment-methods' | 'admin';

// ─── Floating Blob (login background) ────────────────────────────────────────
interface BlobProps { startDelay?: number; cycleMs?: number; size: number; top?: any; bottom?: any; left?: any; right?: any; color: string; }

function FloatingBlob({ startDelay = 0, cycleMs = 9000, size, top, bottom, left, right, color }: BlobProps) {
  const y = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const half = cycleMs / 2;
    const xHalf = Math.round(cycleMs * 0.65);
    const timer = setTimeout(() => {
      const ay = Animated.loop(Animated.sequence([
        Animated.timing(y, { toValue: -38, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      const ax = Animated.loop(Animated.sequence([
        Animated.timing(x, { toValue: 28, duration: xHalf, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(x, { toValue: -28, duration: xHalf, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      ay.start(); ax.start();
    }, startDelay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        top, bottom, left, right,
        transform: [{ translateX: x }, { translateY: y }],
        ...(Platform.OS === 'web'
          ? { background: `radial-gradient(circle, ${color} 0%, transparent 68%)` } as any
          : { backgroundColor: 'transparent' }
        ),
      }}
    />
  );
}

// ─── Animated Press Wrapper ───────────────────────────────────────────────────
function APressable({ onPress, style, children, disabled, webClass }: {
  onPress?: () => void; style?: any; children: React.ReactNode; disabled?: boolean; webClass?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, tension: 280, friction: 10 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => spring(0.95)}
        onPressOut={() => spring(1)}
        style={[style, disabled && styles.disabledBtn]}
        disabled={disabled}
        {...(webClass ? wc(webClass) : {})}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Product Card (hero-image vertical layout) ───────────────────────────────
const ProductCard = memo(function ProductCard({ product, index, cartQty, onAdd, onRemove, isWishlisted, onToggleWishlist }: {
  product: Product; index: number; cartQty: number;
  onAdd: (p: Product) => void; onRemove: (id: string) => void;
  isWishlisted: boolean; onToggleWishlist: (p: Product) => void;
}) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(28)).current;
  const addScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    const delay = Math.min(index * 40, 400);
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAdd() {
    Animated.sequence([
      Animated.spring(addScale, { toValue: 0.82, useNativeDriver: true, tension: 350, friction: 7 }),
      Animated.spring(addScale, { toValue: 1.10, useNativeDriver: true, tension: 200, friction: 6 }),
      Animated.spring(addScale, { toValue: 1, useNativeDriver: true, tension: 250, friction: 8 }),
    ]).start();
    onAdd(product);
  }

  function handleWishlist() {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.55, useNativeDriver: true, tension: 420, friction: 5 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 260, friction: 8 }),
    ]).start();
    onToggleWishlist(product);
  }

  const { color: iconColor, bg: iconBg } = getCatStyle(product.category);
  const iconLetter = product.category.charAt(0).toUpperCase();
  const imgUrl = getCategoryImage(product.category, product.id, product.name);
  const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock !== null && product.stock > 0 && product.stock <= (product.minStock || 5);

  return (
    <Animated.View style={{ opacity: op, transform: [{ translateY: ty }] }} {...wc('ag-card-hover')}>
      <View style={styles.card}>

        {/* ── Hero image ───────────────────────────────────────────────── */}
        <View style={styles.cardHeroWrap} {...wc('card-hero-wrap')}>
          {imgUrl && !imgErr ? (
            <Image source={{ uri: imgUrl }} style={styles.cardHeroImg} resizeMode="cover"
              onError={() => setImgErr(true)} />
          ) : (
            <View style={[styles.cardHeroImg, { backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 64, fontWeight: '900', color: iconColor, opacity: 0.35 }}>{iconLetter}</Text>
            </View>
          )}
          <View style={styles.heroOverlay} pointerEvents="none" />

          {/* Price badge – bottom right */}
          <View style={styles.heroPriceBadge}>
            <Text style={styles.heroPriceText}>${product.price?.toFixed(2)}</Text>
          </View>

          {/* Age badge – bottom left */}
          {product.ageRestricted && (
            <View style={styles.heroAgeBadge}><Text style={styles.heroAgeBadgeText}>21+</Text></View>
          )}

          {/* Stock badge – top left */}
          {(isOutOfStock || isLowStock) && (
            <View style={[styles.heroStockBadge, isOutOfStock ? styles.heroStockOut : styles.heroStockLow]} pointerEvents="none">
              <Text style={styles.heroStockText}>{isOutOfStock ? '✕ OUT OF STOCK' : '⚡ LOW STOCK'}</Text>
            </View>
          )}
          {product.stock !== undefined && !isOutOfStock && !isLowStock && (
            <View style={[styles.heroStockBadge, styles.heroStockOk]} pointerEvents="none">
              <Text style={styles.heroStockText}>✓ IN STOCK</Text>
            </View>
          )}

          {/* Quick-add cart button — plain div so CSS hover opacity works */}
          {Platform.OS === 'web' && !isOutOfStock && (() => {
            const DivEl = 'div' as any;
            return (
              <DivEl className="card-quick-add-wrap" onClick={handleAdd}>
                <DivEl className="card-quick-add-btn">
                  <Text style={[styles.cardQuickAddIcon, { lineHeight: 22 }]} {...{ className: 'cqa-icon' } as any}>🛒</Text>
                </DivEl>
              </DivEl>
            );
          })()}

          {/* Heart wishlist button – top right */}
          <Animated.View style={[styles.heroHeart, { transform: [{ scale: heartScale }] }]}>
            <Pressable onPress={handleWishlist} {...wc('ag-heart-btn')}>
              <Text style={styles.heroHeartIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* ── Card content ─────────────────────────────────────────────── */}
        <View style={styles.cardContent}>
          {product.brand ? <Text style={styles.productBrand}>{product.brand}</Text> : null}
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          {product.description ? (
            <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
          ) : null}

          {/* Action: Add button OR stepper OR out-of-stock */}
          <View style={styles.cardFooter}>
            {isOutOfStock ? (
              <View style={[styles.addButton, { opacity: 0.35, flex: 1 }]}>
                <Text style={styles.addButtonText}>Out of Stock</Text>
              </View>
            ) : cartQty === 0 ? (
              <Animated.View style={[{ transform: [{ scale: addScale }] }, { flex: 1 }]}>
                <Pressable style={styles.addButton} onPress={handleAdd} {...wc('ag-btn-grad')}>
                  <Text style={styles.addButtonText}>Add to Cart  +</Text>
                </Pressable>
              </Animated.View>
            ) : (
              <View style={[styles.qtyRow, { flex: 1 }]}>
                <Pressable style={styles.qtyBtn} onPress={() => onRemove(product.id)} {...wc('ag-qty-btn')}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={[styles.qtyNum, { flex: 1 }]}>{cartQty} in cart</Text>
                <Animated.View style={{ transform: [{ scale: addScale }] }}>
                  <Pressable style={[styles.qtyBtn, styles.qtyBtnPlus]} onPress={handleAdd} {...wc('ag-qty-btn')}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </View>
        </View>

      </View>
    </Animated.View>
  );
});

// ─── Google Reviews Section ───────────────────────────────────────────────────
const REVIEWS = [
  { name: 'James T.', ago: '2 weeks ago', text: 'Best smoke shop in Northwest Indiana! Huge selection, unbeatable prices, and the staff is always super helpful. Been coming here for years!', avatar: 'J' },
  { name: 'Maria L.', ago: '1 month ago', text: 'Love this place. They always have everything I need at great prices. Andy is incredibly knowledgeable and friendly. My go-to spot in Merrillville!', avatar: 'M' },
  { name: 'Kevin R.', ago: '3 months ago', text: 'Amazing variety of products. Prices are way better than other shops in the area. Staff is very professional and helpful. Highly recommend to everyone!', avatar: 'K' },
  { name: 'Sandra P.', ago: '4 months ago', text: 'Fantastic smoke shop with a ton of options. Very clean store, knowledgeable staff, and competitive pricing. Will definitely keep coming back!', avatar: 'S' },
];

function ReviewsSection() {
  return (
    <View style={styles.reviewsWrap}>
      {/* Header */}
      <View style={styles.reviewsHeader}>
        <View style={styles.reviewsRatingBox}>
          <Text style={styles.reviewsRatingNum}>4.5</Text>
          <View>
            <Text style={styles.reviewsStars}>★★★★½</Text>
            <Text style={styles.reviewsCount}>133 Google Reviews</Text>
          </View>
          <View style={styles.googleBadge}><Text style={styles.googleBadgeTxt}>G</Text></View>
        </View>
        <Pressable
          style={styles.reviewUsBtn}
          onPress={() => { if (typeof window !== 'undefined') window.open('https://g.page/r/andys-smoke-shop/review', '_blank'); }}
        >
          <Text style={styles.reviewUsBtnTxt}>⭐ Leave a Review</Text>
        </Pressable>
      </View>

      {/* Review cards (horizontal scroll) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewsScroll} {...wc('ag-reviews-scroll')}>
        {REVIEWS.map((r, i) => (
          <View key={i} style={styles.reviewCard} {...wc('ag-review-card')}>
            <View style={styles.reviewCardTop}>
              <View style={[styles.reviewAvatar, { backgroundColor: ['#1f6feb','#7c3aed','#059669','#dc2626'][i % 4] }]}>
                <Text style={styles.reviewAvatarTxt}>{r.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <Text style={styles.reviewAgo}>{r.ago}</Text>
              </View>
              <Text style={styles.reviewGoogleIcon}>G</Text>
            </View>
            <Text style={styles.reviewStars}>★★★★★</Text>
            <Text style={styles.reviewText}>{r.text}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Store Info Footer ────────────────────────────────────────────────────────
function StoreInfoFooter() {
  const mapsUrl = 'https://maps.google.com/?q=5780+Broadway+Merrillville+IN+46410';
  const MapEl = 'iframe' as any;

  const HOURS = [
    { day: 'Monday',    time: '8:00 AM – 8:00 PM' },
    { day: 'Tuesday',   time: '8:00 AM – 8:00 PM' },
    { day: 'Wednesday', time: '8:00 AM – 8:00 PM' },
    { day: 'Thursday',  time: '8:00 AM – 8:00 PM' },
    { day: 'Friday',    time: '8:00 AM – 8:00 PM' },
    { day: 'Saturday',  time: '8:00 AM – 8:00 PM' },
    { day: 'Sunday',    time: '9:00 AM – 7:00 PM' },
  ];
  const today = new Date().getDay(); // 0=Sun,1=Mon,...
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <View style={styles.storeFooter}>
      <View style={styles.storeFooterGrid}>

        {/* ── Store info + Map ─────────────────────────────── */}
        <View style={styles.storeInfoCol}>
          <View style={styles.storeLogoRow}>
            <View style={styles.storeLogoMark} {...wc('ag-logo-flame')}>
              <Text style={styles.storeLogoLetter}>A</Text>
            </View>
            <View>
              <Text style={styles.storeLogoName}>Andy's Smoke Shop</Text>
              <Text style={styles.storeLogoSub}>EST. 1998  ·  MERRILLVILLE, IN</Text>
            </View>
          </View>

          <View style={styles.storeDetail}>
            <Text style={styles.storeDetailIcon}>📍</Text>
            <Text style={styles.storeDetailTxt}>5780 Broadway{'\n'}Merrillville, IN 46410</Text>
          </View>
          <View style={styles.storeDetail}>
            <Text style={styles.storeDetailIcon}>📞</Text>
            <Text style={styles.storeDetailTxt}>(219) 939-7279</Text>
          </View>
          <View style={styles.storeDetail}>
            <Text style={styles.storeDetailIcon}>✉️</Text>
            <Text style={styles.storeDetailTxt}>smokeshopandys@gmail.com</Text>
          </View>

          {/* Map */}
          <View style={styles.mapWrap}>
            {Platform.OS === 'web' ? (
              <MapEl
                src="https://maps.google.com/maps?q=5780+Broadway+Merrillville+IN+46410&output=embed"
                className="ag-map-frame"
                loading="lazy"
                title="Andy's Smoke Shop"
              />
            ) : null}
          </View>

          <Pressable style={styles.mapsBtn} onPress={() => Linking.openURL(mapsUrl).catch(() => {})}>
            <Text style={styles.mapsBtnTxt}>📍  Get Directions  →</Text>
          </Pressable>
        </View>

        {/* ── Hours ────────────────────────────────────────── */}
        <View style={styles.hoursCol}>
          <Text style={styles.hoursTitle}>Store Hours</Text>
          {HOURS.map((h, i) => (
            <View key={h.day} style={[styles.hoursRow, i === todayIdx && styles.hoursRowToday]}>
              <Text style={[styles.hoursDay, i === todayIdx && styles.hoursDayToday]}>{h.day}</Text>
              <Text style={[styles.hoursTime, i === todayIdx && styles.hoursTimeToday]}>{h.time}</Text>
            </View>
          ))}
          <View style={styles.hoursOpenNow}>
            <View style={styles.hoursOpenDot} />
            <Text style={styles.hoursOpenTxt}>Open Now</Text>
          </View>
        </View>

      </View>

      {/* Copyright */}
      <View style={styles.copyright}>
        <Text style={styles.copyrightTxt}>
          © {new Date().getFullYear()}  Andy's Smoke Shop  ·  All Rights Reserved  ·  Merrillville, IN
        </Text>
        <Text style={styles.copyrightSub}>Must be 21+ to purchase tobacco, nicotine & CBD products · Indiana Law</Text>
      </View>
    </View>
  );
}

// ─── Wishlist Drawer ──────────────────────────────────────────────────────────
function WishlistDrawer({ open, onClose, wishlistItems, onToggleWishlist, onAddToCart }: {
  open: boolean; onClose: () => void; wishlistItems: Product[];
  onToggleWishlist: (p: Product) => void; onAddToCart: (p: Product) => void;
}) {
  const slideX = useRef(new Animated.Value(-440)).current;

  useEffect(() => {
    Animated.spring(slideX, {
      toValue: open ? 0 : -440,
      tension: open ? 72 : 280, friction: open ? 12 : 18, useNativeDriver: true,
    }).start();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {open && (
        <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 500 }]} onPress={onClose} {...wc('ag-wl-overlay')} />
      )}
      <Animated.View style={[styles.wlPanel, { transform: [{ translateX: slideX }] }]} {...wc('ag-wl-panel')}>

        {/* Header */}
        <View style={styles.wlHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.wlTitle}>❤️  Wishlist</Text>
            <Text style={styles.wlSubtitle}>
              {wishlistItems.length === 0 ? 'No saved items' : `${wishlistItems.length} saved item${wishlistItems.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          <Pressable style={styles.wlCloseBtn} onPress={onClose}>
            <Text style={styles.wlCloseTxt}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.drawerDivider} />

        {/* Empty state */}
        {wishlistItems.length === 0 ? (
          <View style={styles.wlEmpty}>
            <Text style={styles.wlEmptyIcon}>🤍</Text>
            <Text style={styles.wlEmptyTitle}>Nothing saved yet</Text>
            <Text style={styles.wlEmptyHint}>Tap the ❤️ on any product to save it for later</Text>
            <Pressable style={styles.wlBrowseBtn} onPress={onClose} {...wc('ag-btn-grad')}>
              <Text style={styles.wlBrowseTxt}>Browse Products →</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView style={styles.wlItems} showsVerticalScrollIndicator={false} {...wc('ag-wl-items')}>
              {wishlistItems.map((item) => {
                const imgUrl = getCategoryImage(item.category, item.id, item.name);
                const { color: iconColor, bg: iconBg } = getCatStyle(item.category);
                return (
                  <View key={item.id} style={styles.wlItem}>
                    <View style={styles.wlThumbWrap}>
                      {imgUrl ? (
                        <Image source={{ uri: imgUrl }} style={styles.wlThumb} resizeMode="cover" />
                      ) : (
                        <View style={[styles.wlThumb, { backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ fontSize: 20, color: iconColor, fontWeight: '900', opacity: 0.5 }}>{item.category.charAt(0)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.wlItemBody}>
                      {item.brand ? <Text style={styles.wlItemBrand}>{item.brand}</Text> : null}
                      <Text style={styles.wlItemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.wlItemPrice}>${item.price.toFixed(2)}</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        <Pressable style={styles.wlAddBtn} onPress={() => { onAddToCart(item); }} {...wc('ag-btn-grad')}>
                          <Text style={styles.wlAddBtnTxt}>+ Add to Cart</Text>
                        </Pressable>
                        <Pressable style={styles.wlRemoveBtn} onPress={() => onToggleWishlist(item)}>
                          <Text style={styles.wlRemoveTxt}>Remove</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.wlFooter}>
              <View style={styles.drawerDivider} />
              <View style={{ padding: 16 }}>
                <Pressable
                  style={styles.wlAddAllBtn}
                  onPress={() => { wishlistItems.forEach((item) => onAddToCart(item)); onClose(); }}
                  {...wc('ag-btn-grad')}
                >
                  <Text style={styles.wlAddAllTxt}>Add All to Cart ({wishlistItems.length} items) →</Text>
                </Pressable>
                <Text style={styles.wlFooterNote}>Items stay saved until you remove them</Text>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, cartItems, total, onAdd, onRemove, onRemoveAll, onCheckout,
  checkoutLoading, savedMethods, selectedMethodId, checkoutMessage, paymentUrl }: {
  open: boolean; onClose: () => void;
  cartItems: (Product & { quantity: number })[]; total: number;
  onAdd: (p: Product) => void; onRemove: (id: string) => void; onRemoveAll: (id: string) => void;
  onCheckout: () => void; checkoutLoading: boolean;
  savedMethods: PaymentMethod[]; selectedMethodId: string | null;
  checkoutMessage: string; paymentUrl: string;
}) {
  const slideX = useRef(new Animated.Value(460)).current;

  useEffect(() => {
    Animated.spring(slideX, {
      toValue: open ? 0 : 460,
      tension: open ? 72 : 280,
      friction: open ? 12 : 18,
      useNativeDriver: true,
    }).start();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const tax = total * 0.085;
  const grandTotal = total + tax;
  const card = savedMethods.find((m) => m.id === selectedMethodId);

  return (
    <>
      {/* Backdrop — covers viewport, click to close */}
      {open && (
        <Pressable
          style={[StyleSheet.absoluteFillObject, { zIndex: 500 }]}
          onPress={onClose}
          {...wc('ag-drawer-overlay')}
        />
      )}

      {/* Panel — always mounted, slides via transform */}
      <Animated.View style={[styles.drawerPanel, { transform: [{ translateX: slideX }] }]} {...wc('ag-drawer-panel')}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={styles.drawerHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.drawerTitle}>🛒  My Cart</Text>
            <Text style={styles.drawerSubtitle}>
              {cartItems.length === 0
                ? 'Nothing added yet'
                : `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}  ·  $${total.toFixed(2)}`}
            </Text>
          </View>
          <Pressable style={styles.drawerCloseBtn} onPress={onClose}>
            <Text style={styles.drawerCloseTxt}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.drawerDivider} />

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {cartItems.length === 0 ? (
          <View style={styles.drawerEmpty}>
            <Text style={styles.drawerEmptyIcon}>🛒</Text>
            <Text style={styles.drawerEmptyTitle}>Your cart is empty</Text>
            <Text style={styles.drawerEmptyHint}>Browse our products and add items to get started</Text>
            <Pressable style={styles.drawerBrowseBtn} onPress={onClose} {...wc('ag-btn-grad')}>
              <Text style={styles.drawerBrowseTxt}>Shop Now  →</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* ── Items ──────────────────────────────────────────────────── */}
            <ScrollView style={styles.drawerItems} showsVerticalScrollIndicator={false} {...wc('ag-drawer-items')}>
              {cartItems.map((item) => {
                const imgUrl = getCategoryImage(item.category, item.id, item.name);
                const { color: iconColor, bg: iconBg } = getCatStyle(item.category);
                return (
                  <View key={item.id} style={styles.drawerItem}>
                    {/* Thumbnail */}
                    <View style={styles.drawerThumbWrap}>
                      {imgUrl ? (
                        <Image source={{ uri: imgUrl }} style={styles.drawerThumb} resizeMode="cover" />
                      ) : (
                        <View style={[styles.drawerThumb, { backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ fontSize: 20, color: iconColor, fontWeight: '900', opacity: 0.5 }}>{item.category.charAt(0)}</Text>
                        </View>
                      )}
                    </View>

                    {/* Info + controls */}
                    <View style={styles.drawerItemBody}>
                      {item.brand ? <Text style={styles.drawerItemBrand}>{item.brand}</Text> : null}
                      <Text style={styles.drawerItemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.drawerItemUnitPrice}>${item.price.toFixed(2)} each</Text>
                      <View style={styles.drawerItemFooter}>
                        {/* Qty stepper */}
                        <View style={styles.drawerStepper}>
                          <Pressable style={styles.drawerStepBtn} onPress={() => onRemove(item.id)} {...wc('ag-qty-btn')}>
                            <Text style={styles.drawerStepTxt}>−</Text>
                          </Pressable>
                          <Text style={styles.drawerStepNum}>{item.quantity}</Text>
                          <Pressable style={[styles.drawerStepBtn, styles.drawerStepBtnPlus]} onPress={() => onAdd(item)} {...wc('ag-qty-btn')}>
                            <Text style={styles.drawerStepTxt}>+</Text>
                          </Pressable>
                        </View>
                        {/* Line total + remove */}
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.drawerItemLinetotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                          <Pressable onPress={() => onRemoveAll(item.id)}>
                            <Text style={styles.drawerRemoveTxt}>Remove</Text>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* ── Summary + Checkout ─────────────────────────────────────── */}
            <View style={styles.drawerFooter}>
              <View style={styles.drawerDivider} />
              <View style={styles.drawerSummaryBlock}>
                <View style={styles.drawerSummaryRow}>
                  <Text style={styles.drawerSummaryLabel}>Subtotal</Text>
                  <Text style={styles.drawerSummaryVal}>${total.toFixed(2)}</Text>
                </View>
                <View style={styles.drawerSummaryRow}>
                  <Text style={styles.drawerSummaryLabel}>Est. Tax (IN 8.5%)</Text>
                  <Text style={styles.drawerSummaryVal}>${tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.drawerSummaryRow, styles.drawerGrandRow]}>
                  <Text style={styles.drawerGrandLabel}>Total</Text>
                  <Text style={styles.drawerGrandAmt}>${grandTotal.toFixed(2)}</Text>
                </View>

                {card && (
                  <View style={styles.drawerCardRow}>
                    <Text style={styles.drawerCardTxt}>💳  {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} ••••{card.last4}</Text>
                  </View>
                )}

                <Pressable
                  style={[styles.drawerCheckoutBtn, checkoutLoading && styles.disabledBtn]}
                  onPress={onCheckout}
                  disabled={checkoutLoading}
                  {...wc('ag-btn-grad')}
                >
                  {checkoutLoading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.drawerCheckoutTxt}>Checkout  →</Text>}
                </Pressable>

                <Pressable style={styles.drawerContinueBtn} onPress={onClose}>
                  <Text style={styles.drawerContinueTxt}>← Continue Shopping</Text>
                </Pressable>

                {checkoutMessage ? <Text style={styles.drawerMsg}>{checkoutMessage}</Text> : null}
                {paymentUrl ? (
                  <Pressable style={{ alignItems: 'center', paddingVertical: 6 }} onPress={() => Linking.openURL(paymentUrl)}>
                    <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600' }}>Open Payment Link →</Text>
                  </Pressable>
                ) : null}

                <Text style={styles.drawerDisclaimer}>🔒 Secured by Stripe  ·  Must be 21+</Text>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, Product>>({});
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginEmailFocused, setLoginEmailFocused] = useState(false);
  const [loginPassFocused, setLoginPassFocused] = useState(false);

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regFocused, setRegFocused] = useState('');

  // Payment
  const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  // Shop
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  // Products loading
  const [productsLoading, setProductsLoading] = useState(false);

  // Admin
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState('All');
  const [adminLoading, setAdminLoading] = useState(false);
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', brand: '', category: '', subcategory: '', description: '', price: '', stock: '', minStock: '5', ageRestricted: true });

  // Verify
  const [checkVerifyLoading, setCheckVerifyLoading] = useState(false);

  // ─── Screen entrance animations ──────────────────────────────────────────
  const screenOp = useRef(new Animated.Value(0)).current;
  const screenY = useRef(new Animated.Value(28)).current;

  // Login stagger
  const lgnHdrOp = useRef(new Animated.Value(0)).current;
  const lgnHdrY = useRef(new Animated.Value(-24)).current;
  const lgnCardOp = useRef(new Animated.Value(0)).current;
  const lgnCardY = useRef(new Animated.Value(36)).current;
  const lgnFtrOp = useRef(new Animated.Value(0)).current;

  // Cart bubble bounce
  const cartBounce = useRef(new Animated.Value(1)).current;
  const cartCountRef = useRef(0);

  useEffect(() => {
    const enter = () => {
      screenOp.setValue(0); screenY.setValue(28);
      Animated.parallel([
        Animated.timing(screenOp, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(screenY, { toValue: 0, tension: 62, friction: 9, useNativeDriver: true }),
      ]).start();
    };

    if (screen === 'login') {
      lgnHdrOp.setValue(0); lgnHdrY.setValue(-24);
      lgnCardOp.setValue(0); lgnCardY.setValue(36);
      lgnFtrOp.setValue(0);
      Animated.stagger(110, [
        Animated.parallel([
          Animated.timing(lgnHdrOp, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(lgnHdrY, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(lgnCardOp, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(lgnCardY, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        ]),
        Animated.timing(lgnFtrOp, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      enter();
    }
  }, [screen]);

  // ─── Session restore ──────────────────────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        if (!token) { setScreen('login'); return; }
        const res = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setAuthUser({ ...data.user, token });
          setScreen(data.user.ageVerified ? 'shop' : 'verify-age');
        } else {
          await storage.removeItem(TOKEN_KEY);
          setScreen('login');
        }
      } catch { setScreen('login'); }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    if (screen === 'shop' && authUser) { loadPaymentMethods(); loadCategories(); loadProducts(); }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist wishlist in localStorage
  useEffect(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('@andys_wishlist');
      if (saved) { try { setWishlist(JSON.parse(saved)); } catch {} }
    }
  }, []);
  useEffect(() => {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem('@andys_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const cartTotalQty = Object.values(cart).reduce((s, v) => s + v, 0);
  useEffect(() => {
    if (cartTotalQty > cartCountRef.current) {
      Animated.sequence([
        Animated.spring(cartBounce, { toValue: 1.18, useNativeDriver: true, tension: 400, friction: 6 }),
        Animated.spring(cartBounce, { toValue: 1, useNativeDriver: true, tension: 260, friction: 9 }),
      ]).start();
    }
    cartCountRef.current = cartTotalQty;
  }, [cartTotalQty]); // eslint-disable-line react-hooks/exhaustive-deps

  // Category: load immediately on tap
  useEffect(() => {
    if (screen === 'shop') loadProducts();
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search: debounce 300ms so we don't fire on every keystroke
  useEffect(() => {
    if (screen !== 'shop') return;
    const t = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(t);
  }, [searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Data loaders ─────────────────────────────────────────────────────────
  async function loadCategories() {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (res.ok) { const d = await res.json(); setCategories(d.categories); }
    } catch {}
  }

  async function loadProducts() {
    setProductsLoading(true);
    const p = new URLSearchParams();
    if (selectedCategory !== 'All') p.set('category', selectedCategory);
    if (searchText.trim()) p.set('search', searchText.trim());
    try {
      const res = await fetch(`${API_URL}/api/products?${p}`);
      if (res.ok) { const d = await res.json(); if (Array.isArray(d.products)) setProducts(d.products); }
    } catch {} finally { setProductsLoading(false); }
  }

  async function loadAdminProducts() {
    if (!authUser) return;
    setAdminLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, { headers: { Authorization: `Bearer ${authUser.token}` } });
      if (res.ok) { const d = await res.json(); setAdminProducts(d.products); setAdminStats(d.stats); }
    } catch {} finally { setAdminLoading(false); }
  }

  async function loadPaymentMethods() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/payments/methods`, { headers: { Authorization: `Bearer ${authUser.token}` } });
      if (res.ok) {
        const d = await res.json();
        setSavedMethods(d.methods);
        const def = (d.methods as PaymentMethod[]).find((m) => m.isDefault);
        if (def) setSelectedMethodId(def.id);
      }
    } catch {}
  }

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((w) => {
      const n = { ...w };
      if (n[product.id]) delete n[product.id];
      else n[product.id] = product;
      return n;
    });
  }, []);

  // ─── Memos ────────────────────────────────────────────────────────────────
  const visibleProducts = useMemo(() => products, [products]);
  const wishlistItems = useMemo(() => Object.values(wishlist), [wishlist]);
  const wishlistCount = wishlistItems.length;
  const cartItems = useMemo(
    () => Object.entries(cart).map(([id, qty]) => {
      const p = products.find((x) => x.id === id);
      return p ? { ...p, quantity: qty } : null;
    }).filter(Boolean) as (Product & { quantity: number })[],
    [cart, products]
  );
  const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const filteredAdminProducts = useMemo(() => adminProducts.filter((p) => {
    const mc = adminCategory === 'All' || p.category === adminCategory;
    const ms = !adminSearch || p.name.toLowerCase().includes(adminSearch.toLowerCase()) || p.sku.toLowerCase().includes(adminSearch.toLowerCase()) || (p.brand || '').toLowerCase().includes(adminSearch.toLowerCase());
    return mc && ms;
  }), [adminProducts, adminCategory, adminSearch]);

  const adminLowStock = useMemo(() => adminProducts.filter((p) => p.isActive && (p.stock ?? 0) < (p.minStock ?? 5)), [adminProducts]);

  // ─── Auth handlers ────────────────────────────────────────────────────────
  async function handleLogin() {
    if (!loginEmail || !loginPassword) { Alert.alert('Required', 'Please enter your email and password.'); return; }
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        await storage.setItem(TOKEN_KEY, data.token);
        setAuthUser({ ...data.user, token: data.token });
        setLoginEmail(''); setLoginPassword('');
        setScreen(data.user.ageVerified ? 'shop' : 'verify-age');
      } else { Alert.alert('Login failed', data.error || 'Invalid credentials.'); }
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
    finally { setLoginLoading(false); }
  }

  async function handleRegister() {
    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regDob) { Alert.alert('Required', 'Please fill in all fields.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(regDob)) { Alert.alert('Invalid date', 'Date of birth must be YYYY-MM-DD.'); return; }
    if (regPassword.length < 8) { Alert.alert('Weak password', 'Password must be at least 8 characters.'); return; }
    setRegLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: regFirstName, lastName: regLastName, email: regEmail, password: regPassword, dateOfBirth: regDob })
      });
      const data = await res.json();
      if (res.ok) {
        await storage.setItem(TOKEN_KEY, data.token);
        setAuthUser({ ...data.user, token: data.token });
        setRegFirstName(''); setRegLastName(''); setRegEmail(''); setRegPassword(''); setRegDob('');
        setScreen('verify-age');
      } else { Alert.alert('Registration failed', data.error || 'Could not create account.'); }
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
    finally { setRegLoading(false); }
  }

  async function handleStartVerification() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/age-verification/session`, { method: 'POST', headers: { Authorization: `Bearer ${authUser.token}` } });
      const data = await res.json();
      if (data.alreadyVerified) { setAuthUser((u) => u ? { ...u, ageVerified: true } : u); setScreen('shop'); return; }
      if (res.ok && data.url) Linking.openURL(data.url).catch(() => Alert.alert('Error', 'Could not open verification link.'));
      else Alert.alert('Error', data.error || 'Could not start verification.');
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
  }

  async function handleCheckVerificationStatus() {
    if (!authUser) return;
    setCheckVerifyLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/age-verification/check`, { headers: { Authorization: `Bearer ${authUser.token}` } });
      const data = await res.json();
      if (res.ok && data.verified) {
        setAuthUser((u) => u ? { ...u, ageVerified: true } : u);
        setScreen('shop');
      } else {
        Alert.alert('Not verified yet', 'Complete the Stripe Identity verification first, then tap Check Status.');
      }
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
    finally { setCheckVerifyLoading(false); }
  }

  async function handleAddCard() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/payments/setup`, { method: 'POST', headers: { Authorization: `Bearer ${authUser.token}` } });
      const data = await res.json();
      if (res.ok && data.url) Linking.openURL(data.url).catch(() => Alert.alert('Error', 'Could not open card setup page.'));
      else Alert.alert('Error', data.error || 'Could not start card setup.');
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
  }

  async function handleDeleteMethod(methodId: string) {
    if (!authUser) return;
    try {
      await fetch(`${API_URL}/api/payments/methods/${methodId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${authUser.token}` } });
      setSavedMethods((m) => m.filter((x) => x.id !== methodId));
      if (selectedMethodId === methodId) setSelectedMethodId(null);
    } catch { Alert.alert('Error', 'Could not remove card.'); }
  }

  async function handleSetDefault(methodId: string) {
    if (!authUser) return;
    try {
      await fetch(`${API_URL}/api/payments/methods/${methodId}/default`, { method: 'PUT', headers: { Authorization: `Bearer ${authUser.token}` } });
      setSavedMethods((m) => m.map((x) => ({ ...x, isDefault: x.id === methodId })));
      setSelectedMethodId(methodId);
    } catch { Alert.alert('Error', 'Could not update default card.'); }
  }

  async function handleLogout() {
    await storage.removeItem(TOKEN_KEY);
    setAuthUser(null); setCart({}); setCheckoutMessage(''); setPaymentUrl('');
    setScreen('login');
  }

  const addToCart = useCallback((product: Product) => {
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
    if (authUser) {
      fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      }).catch(() => {});
    }
  }, [authUser]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((c) => { const n = { ...c }; delete n[productId]; return n; });
    if (authUser) {
      fetch(`${API_URL}/api/cart/items/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${authUser.token}` } }).catch(() => {});
    }
  }, [authUser]);

  const removeFromCartQty = useCallback((productId: string) => {
    setCart((c) => {
      const current = c[productId] || 0;
      if (current <= 1) { const n = { ...c }; delete n[productId]; return n; }
      return { ...c, [productId]: current - 1 };
    });
  }, []);

  async function checkout() {
    if (cartItems.length === 0) { Alert.alert('Cart is empty', 'Please add items before checkout.'); return; }
    setCheckoutLoading(true); setCheckoutMessage('');
    try {
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(authUser ? { Authorization: `Bearer ${authUser.token}` } : {}) },
        body: JSON.stringify({
          phone: '0000000000',
          items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
          ...(selectedMethodId ? { paymentMethodId: selectedMethodId } : {})
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckoutMessage(`Order ${data.orderId} created. Total $${data.total?.toFixed(2)}.`);
        setCart({});
        if (data.paymentUrl) { setPaymentUrl(data.paymentUrl); Linking.openURL(data.paymentUrl).catch(() => {}); }
      } else { setCheckoutMessage(data.error || 'Checkout failed. Please try again.'); }
    } catch { setCheckoutMessage('Unable to connect to payment service.'); }
    finally { setCheckoutLoading(false); }
  }

  // ─── Admin handlers ───────────────────────────────────────────────────────
  async function adminAdjustStock(sku: string, adjustment: number) {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${sku}/stock`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` },
        body: JSON.stringify({ adjustment })
      });
      const data = await res.json();
      if (res.ok) setAdminProducts((prev) => prev.map((p) => p.sku === sku ? { ...p, stock: data.stock } : p));
    } catch {}
  }

  async function adminSaveEdit(sku: string) {
    if (!authUser) return;
    const payload: Record<string, unknown> = {};
    if (editPrice) payload.price = parseFloat(editPrice);
    if (editStock) payload.stock = parseInt(editStock, 10);
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${sku}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAdminProducts((prev) => prev.map((p) => p.sku === sku ? {
          ...p, ...(editPrice ? { price: parseFloat(editPrice) } : {}), ...(editStock ? { stock: parseInt(editStock, 10) } : {})
        } : p));
        setEditingSku(null); setEditPrice(''); setEditStock('');
      }
    } catch {}
  }

  async function adminDeactivate(sku: string) {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${sku}`, { method: 'DELETE', headers: { Authorization: `Bearer ${authUser.token}` } });
      if (res.ok) setAdminProducts((prev) => prev.map((p) => p.sku === sku ? { ...p, isActive: false } : p));
    } catch {}
  }

  async function adminAddProduct() {
    if (!authUser || !newProduct.sku || !newProduct.name || !newProduct.category || !newProduct.price) {
      Alert.alert('Required', 'SKU, Name, Category, and Price are required.'); return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` },
        body: JSON.stringify({
          sku: newProduct.sku, name: newProduct.name, brand: newProduct.brand || undefined,
          category: newProduct.category, subcategory: newProduct.subcategory || undefined,
          description: newProduct.description || undefined, price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock || '0', 10), minStock: parseInt(newProduct.minStock || '5', 10),
          ageRestricted: newProduct.ageRestricted, isActive: true
        })
      });
      if (res.ok) {
        Alert.alert('Success', `Product ${newProduct.sku} added.`);
        setShowAddForm(false);
        setNewProduct({ sku: '', name: '', brand: '', category: '', subcategory: '', description: '', price: '', stock: '', minStock: '5', ageRestricted: true });
        loadAdminProducts();
      } else { const d = await res.json(); Alert.alert('Error', d.error || 'Could not add product.'); }
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCREENS
  // ─────────────────────────────────────────────────────────────────────────

  // ── Loading ───────────────────────────────────────────────────────────────
  if (screen === 'loading') {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 22, marginBottom: -8, lineHeight: 28 }}>🔥</Text>
          <View style={styles.loadingLogoMark} {...wc('ag-logo-flame')}>
            <Text style={styles.loadingLogoLetter}>A</Text>
          </View>
        </View>
        <Text style={styles.loadingBrand}>ANDY'S</Text>
        <Text style={styles.loadingBrandSub}>SMOKE SHOP</Text>
        <Text style={{ color: '#334155', fontSize: 10, letterSpacing: 3, marginTop: 4 }}>EST. 1998  ·  MERRILLVILLE, IN</Text>
        <ActivityIndicator size="small" color="#1f6feb" style={{ marginTop: 36 }} />
      </SafeAreaView>
    );
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Animated background blobs */}
        <FloatingBlob size={700} cycleMs={9000} startDelay={0}
          top={-280} left={-220} color="rgba(31,111,235,0.16)" />
        <FloatingBlob size={550} cycleMs={11000} startDelay={800}
          top="35%" right={-200} color="rgba(99,102,241,0.12)" />
        <FloatingBlob size={420} cycleMs={13000} startDelay={400}
          bottom={-120} left="18%" color="rgba(6,182,212,0.09)" />

        <ScrollView
          contentContainerStyle={styles.loginScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo + brand */}
          <Animated.View style={[styles.loginHeader, { opacity: lgnHdrOp, transform: [{ translateY: lgnHdrY }] }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, marginBottom: -6, lineHeight: 24 }}>🔥</Text>
              <View style={[styles.logoMark, { marginBottom: 0 }]} {...wc('ag-logo-flame')}>
                <Text style={styles.logoMarkLetter}>A</Text>
              </View>
            </View>
            <Text style={styles.loginBrandName}>ANDY'S</Text>
            <Text style={styles.loginBrandSub}>SMOKE SHOP</Text>
            <View style={styles.loginBrandLine} />
            <Text style={styles.loginBrandTagline}>PREMIUM TOBACCO & ACCESSORIES</Text>
          </Animated.View>

          {/* Glass form card */}
          <Animated.View
            style={[styles.glassCard, { opacity: lgnCardOp, transform: [{ translateY: lgnCardY }] }]}
            {...wc('ag-glass')}
          >
            <Text style={styles.loginCardTitle}>Welcome Back</Text>
            <Text style={styles.loginCardSubtitle}>Sign in to your account</Text>

            {/* Email */}
            <View style={[styles.inputWrapper, loginEmailFocused && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.formInput}
                placeholder="Email address"
                placeholderTextColor="rgba(148,163,184,0.55)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={loginEmail}
                onChangeText={setLoginEmail}
                onFocus={() => setLoginEmailFocused(true)}
                onBlur={() => setLoginEmailFocused(false)}
                {...wc('ag-input')}
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrapper, loginPassFocused && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.formInput}
                placeholder="Password"
                placeholderTextColor="rgba(148,163,184,0.55)"
                secureTextEntry
                value={loginPassword}
                onChangeText={setLoginPassword}
                onFocus={() => setLoginPassFocused(true)}
                onBlur={() => setLoginPassFocused(false)}
                {...wc('ag-input')}
              />
            </View>

            {/* Sign In */}
            <APressable
              onPress={handleLogin}
              disabled={loginLoading}
              style={styles.loginBtn}
              webClass="ag-btn-grad"
            >
              {loginLoading
                ? <ActivityIndicator color="#fff" />
                : <View style={styles.loginBtnInner}>
                    <Text style={styles.loginBtnText}>SIGN IN</Text>
                    <Text style={styles.loginBtnArrow}>→</Text>
                  </View>}
            </APressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerTxt}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <APressable onPress={() => setScreen('register')} style={styles.loginSecBtn} webClass="ag-btn-secondary">
              <Text style={styles.loginSecBtnTxt}>Create New Account</Text>
            </APressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={{ opacity: lgnFtrOp }}>
            <Text style={styles.loginFooter}>5780 Broadway, Merrillville, IN  ·  Must be 21+</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Register ──────────────────────────────────────────────────────────────
  if (screen === 'register') {
    return (
      <SafeAreaView style={styles.container}>
        <FloatingBlob size={600} cycleMs={10000} startDelay={0} top={-250} right={-180} color="rgba(31,111,235,0.14)" />
        <FloatingBlob size={450} cycleMs={12000} startDelay={600} bottom={-100} left={-150} color="rgba(99,102,241,0.10)" />

        <ScrollView
          contentContainerStyle={styles.loginScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: screenOp, transform: [{ translateY: screenY }] }}>
            <View style={styles.loginHeader}>
              <View style={styles.logoMark}>
                <Text style={styles.logoMarkLetter}>A</Text>
              </View>
              <Text style={styles.loginBrandName}>CREATE ACCOUNT</Text>
              <View style={styles.loginBrandLine} />
              <Text style={styles.loginBrandTagline}>YOU MUST BE 21 OR OLDER</Text>
            </View>

            <View style={styles.glassCard} {...wc('ag-glass')}>
              {(['firstName', 'lastName', 'email', 'password', 'dob'] as const).map((field, i) => {
                const configs = {
                  firstName: { label: 'First Name', value: regFirstName, set: setRegFirstName, secure: false, kb: 'default' as const },
                  lastName: { label: 'Last Name', value: regLastName, set: setRegLastName, secure: false, kb: 'default' as const },
                  email: { label: 'Email address', value: regEmail, set: setRegEmail, secure: false, kb: 'email-address' as const },
                  password: { label: 'Password (8+ characters)', value: regPassword, set: setRegPassword, secure: true, kb: 'default' as const },
                  dob: { label: 'Date of Birth (YYYY-MM-DD)', value: regDob, set: setRegDob, secure: false, kb: 'default' as const },
                };
                const cfg = configs[field];
                const focused = regFocused === field;
                return (
                  <View key={field} style={[styles.inputWrapper, focused && styles.inputWrapperFocused, i > 0 && { marginTop: 10 }]}>
                    <TextInput
                      style={styles.formInput}
                      placeholder={cfg.label}
                      placeholderTextColor="rgba(148,163,184,0.55)"
                      secureTextEntry={cfg.secure}
                      keyboardType={cfg.kb}
                      autoCapitalize={field === 'email' ? 'none' : 'words'}
                      value={cfg.value}
                      onChangeText={cfg.set}
                      onFocus={() => setRegFocused(field)}
                      onBlur={() => setRegFocused('')}
                      {...wc('ag-input')}
                    />
                  </View>
                );
              })}

              <APressable onPress={handleRegister} disabled={regLoading} style={[styles.loginBtn, { marginTop: 20 }]} webClass="ag-btn-grad">
                {regLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>CREATE ACCOUNT →</Text>}
              </APressable>

              <APressable onPress={() => setScreen('login')} style={[styles.loginSecBtn, { marginTop: 10 }]} webClass="ag-btn-secondary">
                <Text style={styles.loginSecBtnTxt}>Already have an account? Sign In</Text>
              </APressable>
            </View>

            <Text style={styles.loginFooter}>5780 Broadway, Merrillville, IN  ·  Must be 21+</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Verify Age ────────────────────────────────────────────────────────────
  if (screen === 'verify-age') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.loginScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: screenOp, transform: [{ translateY: screenY }] }}>
            <View style={styles.loginHeader}>
              <View style={[styles.logoMark, { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.3)' }]}>
                <Text style={[styles.logoMarkLetter, { color: '#f59e0b' }]}>21+</Text>
              </View>
              <Text style={styles.loginBrandName}>VERIFY YOUR AGE</Text>
              <View style={[styles.loginBrandLine, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.loginBrandTagline}>INDIANA LAW REQUIRES ID VERIFICATION</Text>
            </View>

            <View style={styles.glassCard} {...wc('ag-glass')}>
              <Text style={styles.loginCardTitle}>Identity Verification</Text>
              <Text style={styles.loginCardSubtitle}>You must be 21+ to purchase tobacco, nicotine, or CBD products</Text>

              <View style={styles.stepsCard}>
                {['Tap "Start Verification" below', 'Upload your government-issued photo ID', 'Take a matching selfie to confirm identity', 'Return here and tap "Check Status"'].map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepBubble}><Text style={styles.stepNum}>{i + 1}</Text></View>
                    <Text style={styles.stepTxt}>{step}</Text>
                  </View>
                ))}
              </View>

              <APressable onPress={handleStartVerification} style={[styles.loginBtn, { marginTop: 20 }]} webClass="ag-btn-grad">
                <Text style={styles.loginBtnText}>START VERIFICATION →</Text>
              </APressable>

              <APressable onPress={handleCheckVerificationStatus} disabled={checkVerifyLoading} style={[styles.loginSecBtn, { marginTop: 10 }]} webClass="ag-btn-secondary">
                {checkVerifyLoading
                  ? <ActivityIndicator color="#94a3b8" size="small" />
                  : <Text style={styles.loginSecBtnTxt}>I've Completed — Check Status</Text>}
              </APressable>

              <APressable onPress={handleLogout} style={styles.textOnlyBtn}>
                <Text style={styles.textOnlyBtnTxt}>Sign Out</Text>
              </APressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Payment Methods ───────────────────────────────────────────────────────
  if (screen === 'payment-methods') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.authContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: screenOp, transform: [{ translateY: screenY }] }}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Payment Methods</Text>
              <APressable onPress={() => setScreen('shop')} style={styles.navBtn} webClass="ag-btn-secondary">
                <Text style={styles.navBtnTxt}>← Back</Text>
              </APressable>
            </View>
            <Text style={styles.description}>Save cards for faster checkout. Secured by Stripe.</Text>

            {savedMethods.length === 0
              ? <View style={styles.glassCard} {...wc('ag-glass')}><Text style={styles.emptyText}>No saved cards yet.</Text></View>
              : savedMethods.map((m) => (
                <View key={m.id} style={styles.methodCard} {...wc('ag-card-hover')}>
                  <View>
                    <Text style={styles.productName}>{m.brand.charAt(0).toUpperCase() + m.brand.slice(1)} •••• {m.last4}</Text>
                    <Text style={styles.productDescription}>Expires {m.expMonth}/{m.expYear}{m.isDefault ? '  ★ Default' : ''}</Text>
                  </View>
                  <View style={styles.methodActions}>
                    {!m.isDefault && (
                      <APressable style={styles.secondaryButton} onPress={() => handleSetDefault(m.id)} webClass="ag-btn-secondary">
                        <Text style={styles.buttonText}>Set Default</Text>
                      </APressable>
                    )}
                    <APressable style={styles.removeButton} onPress={() => handleDeleteMethod(m.id)}>
                      <Text style={styles.buttonText}>Remove</Text>
                    </APressable>
                  </View>
                </View>
              ))
            }

            <APressable onPress={handleAddCard} style={styles.primaryButton} webClass="ag-btn-grad">
              <Text style={styles.buttonText}>+ Add New Card</Text>
            </APressable>
            <APressable onPress={loadPaymentMethods} style={styles.secondaryButton} webClass="ag-btn-secondary">
              <Text style={styles.buttonText}>Refresh</Text>
            </APressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  if (screen === 'admin') {
    const adminCats = ['All', ...Array.from(new Set(adminProducts.map((p) => p.category))).sort()];
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: screenOp, transform: [{ translateY: screenY }] }}>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <Text style={[styles.title, { fontSize: 24 }]}>Inventory Manager</Text>
                <APressable style={styles.navBtn} onPress={() => setScreen('shop')} webClass="ag-btn-secondary">
                  <Text style={styles.navBtnTxt}>← Shop</Text>
                </APressable>
              </View>

              {adminStats && (
                <View style={styles.statsRow}>
                  {[
                    { n: adminStats.total, l: 'Products', warn: false },
                    { n: adminStats.low_stock, l: 'Low Stock', warn: parseInt(adminStats.low_stock) > 0 },
                    { n: adminStats.categories, l: 'Categories', warn: false },
                  ].map(({ n, l, warn }) => (
                    <View key={l} style={[styles.statBox, warn && styles.statBoxWarn]}>
                      <Text style={[styles.statNumber, warn && styles.statNumberWarn]}>{n}</Text>
                      <Text style={styles.statLabel}>{l}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {adminLowStock.length > 0 && (
              <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>⚠ Low Stock Alert ({adminLowStock.length} items)</Text>
                {adminLowStock.slice(0, 5).map((p) => (
                  <Text key={p.sku} style={styles.alertItem}>• {p.name} — {p.stock} left (min {p.minStock})</Text>
                ))}
                {adminLowStock.length > 5 && <Text style={styles.alertItem}>...and {adminLowStock.length - 5} more</Text>}
              </View>
            )}

            <TextInput style={[styles.input, { marginTop: 8 }]} placeholder="Search by name, SKU, or brand..." placeholderTextColor="#888" value={adminSearch} onChangeText={setAdminSearch} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
              {adminCats.map((cat) => (
                <Pressable key={cat} style={[styles.categoryButton, adminCategory === cat && styles.categoryButtonActive]} onPress={() => setAdminCategory(cat)} {...wc('ag-cat-btn')}>
                  <Text style={[styles.categoryText, adminCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <APressable style={[styles.secondaryButton, { flex: 1, marginTop: 0 }]} onPress={loadAdminProducts} webClass="ag-btn-secondary">
                <Text style={styles.buttonText}>{adminLoading ? 'Loading...' : 'Refresh'}</Text>
              </APressable>
              <APressable style={[styles.addButton, { flex: 1 }]} onPress={() => setShowAddForm(!showAddForm)} webClass="ag-btn-grad">
                <Text style={styles.buttonText}>{showAddForm ? 'Cancel' : '+ Add Product'}</Text>
              </APressable>
            </View>

            {showAddForm && (
              <View style={styles.addForm}>
                <Text style={styles.sectionTitle}>New Product</Text>
                {[
                  { ph: 'SKU (e.g. CIG-MRL-NEWRED)', val: newProduct.sku, key: 'sku' as const },
                  { ph: 'Name', val: newProduct.name, key: 'name' as const },
                  { ph: 'Brand', val: newProduct.brand, key: 'brand' as const },
                  { ph: 'Category', val: newProduct.category, key: 'category' as const },
                  { ph: 'Subcategory (optional)', val: newProduct.subcategory, key: 'subcategory' as const },
                  { ph: 'Description', val: newProduct.description, key: 'description' as const },
                  { ph: 'Price (e.g. 12.99)', val: newProduct.price, key: 'price' as const },
                  { ph: 'Stock quantity', val: newProduct.stock, key: 'stock' as const },
                  { ph: 'Min stock (default 5)', val: newProduct.minStock, key: 'minStock' as const },
                ].map(({ ph, val, key }) => (
                  <TextInput key={key} style={styles.input} placeholder={ph} placeholderTextColor="#888" value={val} onChangeText={(v) => setNewProduct((p) => ({ ...p, [key]: v }))} />
                ))}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                  <Pressable style={[styles.toggleBtn, newProduct.ageRestricted && styles.toggleBtnOn]} onPress={() => setNewProduct((p) => ({ ...p, ageRestricted: !p.ageRestricted }))}>
                    <Text style={styles.buttonText}>21+ Required: {newProduct.ageRestricted ? 'YES' : 'NO'}</Text>
                  </Pressable>
                </View>
                <APressable style={[styles.primaryButton, { marginTop: 12 }]} onPress={adminAddProduct} webClass="ag-btn-grad">
                  <Text style={styles.buttonText}>Save Product</Text>
                </APressable>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>{filteredAdminProducts.length} products</Text>

            {filteredAdminProducts.map((product) => {
              const isLow = (product.stock ?? 0) < (product.minStock ?? 5);
              const isEditing = editingSku === product.sku;
              return (
                <View key={product.sku} style={[styles.adminCard, !product.isActive && styles.adminCardInactive]} {...wc('ag-card-hover')}>
                  <View style={styles.adminCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.adminSku}>{product.sku}</Text>
                      <Text style={styles.productName}>{product.name}</Text>
                      {product.brand && <Text style={styles.adminBrand}>{product.brand}</Text>}
                      <Text style={styles.productCategory}>{product.category}{product.subcategory ? ` › ${product.subcategory}` : ''}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
                      <View style={[styles.stockBadge, isLow ? styles.stockBadgeLow : styles.stockBadgeOk]}>
                        <Text style={styles.stockBadgeText}>Stock: {product.stock ?? 0}</Text>
                      </View>
                      {!product.isActive && <Text style={styles.inactiveBadge}>INACTIVE</Text>}
                    </View>
                  </View>

                  <View style={styles.stockControls}>
                    {[-10, -1, 10, 50].map((adj) => (
                      <Pressable key={adj} style={[styles.stockBtn, adj > 0 && styles.stockBtnGreen]} onPress={() => adminAdjustStock(product.sku, adj)}>
                        <Text style={styles.stockBtnText}>{adj > 0 ? `+${adj}` : adj}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={styles.adminActions}>
                    <Pressable style={styles.editBtn} onPress={() => {
                      if (isEditing) { setEditingSku(null); setEditPrice(''); setEditStock(''); }
                      else { setEditingSku(product.sku); setEditPrice(String(product.price)); setEditStock(String(product.stock ?? 0)); }
                    }}>
                      <Text style={styles.buttonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                    </Pressable>
                    {product.isActive && (
                      <Pressable style={styles.deactivateBtn} onPress={() => adminDeactivate(product.sku)}>
                        <Text style={styles.buttonText}>Deactivate</Text>
                      </Pressable>
                    )}
                  </View>

                  {isEditing && (
                    <View style={styles.editForm}>
                      <TextInput style={styles.inlineInput} placeholder="New price" placeholderTextColor="#888" keyboardType="decimal-pad" value={editPrice} onChangeText={setEditPrice} />
                      <TextInput style={styles.inlineInput} placeholder="New stock" placeholderTextColor="#888" keyboardType="number-pad" value={editStock} onChangeText={setEditStock} />
                      <Pressable style={styles.saveBtn} onPress={() => adminSaveEdit(product.sku)}>
                        <Text style={styles.buttonText}>Save</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Shop ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* ── STICKY HEADER (never scrolls) ─────────────────────────────────── */}
      <Animated.View style={[styles.stickyHeader, { opacity: screenOp }]} {...wc('ag-sticky')}>
        {/* Brand row */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Mini flame logo mark */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 10, lineHeight: 12 }}>🔥</Text>
              <View style={styles.headerLogoMark} {...wc('ag-logo-flame')}>
                <Text style={styles.headerLogoLetter}>A</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} {...wc('ag-brand-glow')}>Andy's Smoke Shop</Text>
              <Text style={styles.titleSub} {...wc('ag-brand-sub-glow')}>MERRILLVILLE, IN  ·  EST. 1998</Text>
              {authUser && <Text style={styles.welcomeText}>Welcome, {authUser.firstName} 👋</Text>}
            </View>
          </View>

          {/* Wishlist + Cart pills + nav */}
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {/* Wishlist pill */}
              <Pressable style={styles.wishlistPill} onPress={() => setWishlistOpen(true)} {...wc('ag-wl-pill')}>
                <Text style={styles.wishlistPillIcon}>{wishlistCount > 0 ? '❤️' : '🤍'}</Text>
                <View>
                  <Text style={styles.wishlistPillLabel}>Wishlist</Text>
                  <Text style={styles.wishlistPillCount}>{wishlistCount} item{wishlistCount !== 1 ? 's' : ''}</Text>
                </View>
                {wishlistCount > 0 && (
                  <View style={styles.wishlistDot}>
                    <Text style={styles.wishlistDotText}>{wishlistCount > 99 ? '99+' : wishlistCount}</Text>
                  </View>
                )}
              </Pressable>
              {/* Cart pill */}
              <Animated.View style={{ transform: [{ scale: cartBounce }] }}>
                <Pressable style={styles.cartPill} onPress={() => setCartOpen(true)} {...wc('ag-cart-pill')}>
                  <Text style={styles.cartPillIcon}>🛒</Text>
                  <View>
                    <Text style={styles.cartPillCount}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</Text>
                    <Text style={styles.cartPillTotal}>${total.toFixed(2)}</Text>
                  </View>
                  {cartItems.length > 0 && (
                    <View style={styles.cartDot}>
                      <Text style={styles.cartDotText}>{cartItems.length > 99 ? '99+' : cartItems.length}</Text>
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            </View>{/* end pills row */}
            <View style={styles.headerActions}>
              {authUser?.isAdmin && (
                <APressable style={[styles.navBtn, styles.adminNavBtn]} onPress={() => { setScreen('admin'); loadAdminProducts(); }}>
                  <Text style={[styles.navBtnTxt, { color: '#f59e0b' }]}>Admin</Text>
                </APressable>
              )}
              <APressable style={styles.navBtn} onPress={() => setScreen('payment-methods')} webClass="ag-btn-secondary">
                <Text style={styles.navBtnTxt}>Cards</Text>
              </APressable>
              <APressable style={styles.navBtn} onPress={handleLogout} webClass="ag-btn-secondary">
                <Text style={styles.navBtnTxt}>Sign Out</Text>
              </APressable>
            </View>
          </View>
        </View>

        {/* Search */}
        <TextInput
          style={[styles.input, styles.searchInput]}
          placeholder="Search products, brands, or SKUs..."
          placeholderTextColor="#555"
          value={searchText}
          onChangeText={setSearchText}
          {...wc('ag-input')}
        />

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
          {categories.map((cat) => (
            <Pressable key={cat} style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]} onPress={() => setSelectedCategory(cat)} {...wc('ag-cat-btn')}>
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* ── SCROLLABLE PRODUCTS ────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
      >
        <Animated.View style={{ transform: [{ translateY: screenY }] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
            <Text style={styles.productCount}>{productsLoading ? 'Loading…' : `${visibleProducts.length} products`}</Text>
            {productsLoading && <ActivityIndicator size="small" color="#1f6feb" />}
          </View>
          {(() => {
            const GridEl = Platform.OS === 'web' ? ('div' as any) : View;
            const gridStyle = Platform.OS === 'web'
              ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, opacity: productsLoading ? 0.5 : 1 } as any
              : { opacity: productsLoading ? 0.5 : 1 };
            return (
              <GridEl style={gridStyle}>
                {visibleProducts.length === 0 && !productsLoading
                  ? <View style={styles.emptyState}><Text style={styles.emptyText}>No products found.</Text></View>
                  : visibleProducts.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={idx}
                      cartQty={cart[product.id] || 0}
                      onAdd={addToCart}
                      onRemove={removeFromCartQty}
                      isWishlisted={!!wishlist[product.id]}
                      onToggleWishlist={toggleWishlist}
                    />
                  ))
                }
              </GridEl>
            );
          })()}
          {/* ── Reviews + Store Footer ─────────────────── */}
          <ReviewsSection />
          <StoreInfoFooter />
        </Animated.View>
      </ScrollView>

      {/* ── STICKY CART BAR (always visible at bottom) ─────────────────────── */}
      <View style={styles.cartBar}>
        {/* Cart items list (scrollable if many) */}
        {cartItems.length > 0 && (
          <ScrollView
            style={styles.cartItemsList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartBarItem}>
                <Text style={styles.cartBarItemName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.cartBarItemRight}>
                  <Text style={styles.cartBarQty}>{item.quantity}×</Text>
                  <Text style={styles.cartBarItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                  <Pressable onPress={() => removeFromCart(item.id)} style={styles.cartBarRemove}>
                    <Text style={styles.cartBarRemoveTxt}>✕</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Divider between items and checkout row */}
        {cartItems.length > 0 && <View style={styles.cartBarDivider} />}

        {/* Total + Checkout row */}
        <View style={styles.cartBarFooter}>
          <View>
            <Text style={styles.cartBarLabel}>
              {cartItems.length === 0 ? 'Cart is empty' : `${cartItems.length} item${cartItems.length !== 1 ? 's' : ''}`}
            </Text>
            <Text style={styles.cartBarTotal}>${total.toFixed(2)}</Text>
            {selectedMethodId && savedMethods.find((m) => m.id === selectedMethodId) && (
              <Text style={styles.cartBarCard}>
                💳 {savedMethods.find((m) => m.id === selectedMethodId)!.brand} ••••{savedMethods.find((m) => m.id === selectedMethodId)!.last4}
              </Text>
            )}
          </View>
          <APressable
            style={[styles.checkoutBtn, cartItems.length === 0 && styles.disabledBtn]}
            onPress={checkout}
            disabled={checkoutLoading || cartItems.length === 0}
            webClass="ag-btn-grad"
          >
            {checkoutLoading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.checkoutBtnText}>Checkout →</Text>}
          </APressable>
        </View>

        {checkoutMessage ? <Text style={styles.messageText}>{checkoutMessage}</Text> : null}
        {paymentUrl ? (
          <APressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={() => Linking.openURL(paymentUrl)} webClass="ag-btn-secondary">
            <Text style={styles.buttonText}>Open Payment Link</Text>
          </APressable>
        ) : null}

        <Text style={styles.disclaimer}>Must be 21+ · Indiana tobacco & nicotine sales age-restricted</Text>
      </View>

      {/* ── WISHLIST DRAWER ───────────────────────────────────────────────── */}
      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onToggleWishlist={toggleWishlist}
        onAddToCart={addToCart}
      />

      {/* ── CART DRAWER ───────────────────────────────────────────────────── */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        total={total}
        onAdd={addToCart}
        onRemove={removeFromCartQty}
        onRemoveAll={removeFromCart}
        onCheckout={checkout}
        checkoutLoading={checkoutLoading}
        savedMethods={savedMethods}
        selectedMethodId={selectedMethodId}
        checkoutMessage={checkoutMessage}
        paymentUrl={paymentUrl}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1, backgroundColor: '#060914',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
    ...(Platform.OS === 'web' ? { height: '100vh', overflow: 'hidden' } as any : {}),
  },
  centered: { justifyContent: 'center', alignItems: 'center' },
  authContent: { padding: 24, paddingTop: 60 },
  scrollContent: { padding: 16, paddingBottom: 16 },

  // Sticky shop header (sits above ScrollView on native; CSS makes it sticky on web)
  stickyHeader: {
    backgroundColor: '#060914',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },

  // Loading
  loadingLogoMark: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(31,111,235,0.12)', borderWidth: 1.5, borderColor: 'rgba(31,111,235,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  loadingLogoLetter: { color: '#1f6feb', fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  loadingBrand: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 6 },
  loadingBrandSub: { color: '#475569', fontSize: 12, fontWeight: '600', letterSpacing: 5, marginTop: 4 },

  // Login screen structure
  loginScrollContent: { padding: 24, paddingTop: 60, paddingBottom: 48, alignItems: 'center', minHeight: '100%' as any },
  loginHeader: { alignItems: 'center', marginBottom: 36, width: '100%' as any },
  logoMark: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(31,111,235,0.12)', borderWidth: 1.5, borderColor: 'rgba(31,111,235,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  logoMarkLetter: { color: '#1f6feb', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  loginBrandName: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: 8, marginBottom: 4 },
  loginBrandSub: { color: '#94a3b8', fontSize: 13, fontWeight: '600', letterSpacing: 5, marginBottom: 14 },
  loginBrandLine: { width: 40, height: 2, backgroundColor: '#1f6feb', borderRadius: 2, marginBottom: 10 },
  loginBrandTagline: { color: '#475569', fontSize: 10, fontWeight: '600', letterSpacing: 3 },

  // Glass card
  glassCard: {
    width: '100%' as any, maxWidth: 460,
    borderRadius: 24, padding: 28,
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
    } as any : {
      shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 40,
    }),
  },
  loginCardTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  loginCardSubtitle: { color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 20 },

  // Form inputs
  inputWrapper: { borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 0 },
  inputWrapperFocused: { borderColor: '#1f6feb', ...(Platform.OS === 'web' ? { boxShadow: '0 0 0 3px rgba(31,111,235,0.14)' } as any : {}) },
  formInput: { backgroundColor: 'rgba(6,9,20,0.6)', color: '#f1f5f9', paddingVertical: 15, paddingHorizontal: 16, fontSize: 15 },

  // Login buttons
  loginBtn: { backgroundColor: '#1f6feb', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 20 },
  loginBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1.5 },
  loginBtnArrow: { color: 'rgba(255,255,255,0.75)', fontSize: 18, fontWeight: '300' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  dividerTxt: { color: '#334155', fontSize: 12, marginHorizontal: 14, fontWeight: '600', letterSpacing: 1 },
  loginSecBtn: { backgroundColor: 'rgba(30,41,59,0.7)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  loginSecBtnTxt: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  textOnlyBtn: { alignItems: 'center', marginTop: 18, paddingVertical: 8 },
  textOnlyBtnTxt: { color: '#334155', fontSize: 13 },
  loginFooter: { color: '#334155', fontSize: 12, marginTop: 28, textAlign: 'center', letterSpacing: 0.5 },

  // Verify steps
  stepsCard: { backgroundColor: 'rgba(6,9,20,0.5)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  stepBubble: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(31,111,235,0.18)', borderWidth: 1, borderColor: 'rgba(31,111,235,0.4)', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1 },
  stepNum: { color: '#1f6feb', fontSize: 12, fontWeight: '800' },
  stepTxt: { color: '#cbd5e1', fontSize: 14, lineHeight: 22, flex: 1 },

  // Common nav button (replaces logoutButton for consistency)
  navBtn: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#17233c', marginTop: 4, marginLeft: 6 },
  navBtnTxt: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  adminNavBtn: { borderColor: '#f59e0b', borderWidth: 1 },
  disabledBtn: { opacity: 0.5 },

  // Shop header
  header: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { color: '#fff', fontSize: 38, fontWeight: '900', letterSpacing: -0.5, lineHeight: 42 },
  titleSub: { color: '#1f6feb', fontSize: 10, fontWeight: '800', letterSpacing: 4, marginTop: 2, marginBottom: 6 },
  shopAddress: { color: '#334155', fontSize: 12, marginTop: 4 },
  welcomeText: { color: '#3b5a8c', fontSize: 12, marginTop: 4, fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  // Cart pill
  cartPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(31,111,235,0.12)', borderRadius: 16,
    paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(31,111,235,0.28)',
    position: 'relative' as any,
  },
  cartPillIcon: { fontSize: 20 },
  cartPillCount: { color: '#60a5fa', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  cartPillTotal: { color: '#fff', fontSize: 16, fontWeight: '900' },
  cartDot: {
    position: 'absolute' as any, top: -6, right: -6,
    backgroundColor: '#ef4444', borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2, borderColor: '#060914',
  },
  cartDotText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  // Legacy aliases
  logoutButton: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#17233c', marginTop: 4, marginLeft: 6 },
  logoutText: { color: '#94a3b8', fontSize: 12 },
  description: { color: '#cbd5e1', fontSize: 16, lineHeight: 24 },

  // Search + categories
  searchInput: { marginBottom: 14, marginTop: 8 },
  categoryBar: { marginBottom: 14 },
  categoryButton: {
    paddingVertical: 9, paddingHorizontal: 16, borderRadius: 22,
    backgroundColor: 'rgba(30,41,59,0.7)', marginRight: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(31,111,235,0.2)', borderColor: 'rgba(31,111,235,0.5)',
    ...(Platform.OS === 'web' ? { boxShadow: '0 0 12px rgba(31,111,235,0.3)' } as any : {}),
  },
  categoryText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#60a5fa', fontWeight: '800' },
  productCount: { color: '#334155', fontSize: 11, marginBottom: 10, letterSpacing: 0.5 },

  // Product card — vertical hero-image layout
  card: {
    backgroundColor: '#0c1526', borderRadius: 20, overflow: 'hidden' as any,
    marginBottom: 0,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(0,0,0,0.45)' } as any : {}),
  },
  // Hero image
  cardHeroWrap: { position: 'relative' as any, width: '100%' as any, height: 150, overflow: 'hidden' as any },
  cardHeroImg: { width: '100%' as any, height: 150 },
  heroOverlay: {
    position: 'absolute' as any, bottom: 0, left: 0, right: 0, height: 80,
    ...(Platform.OS === 'web' ? { background: 'linear-gradient(to top, rgba(12,21,38,0.85) 0%, transparent 100%)' } as any : { backgroundColor: 'transparent' }),
  },
  heroPriceBadge: {
    position: 'absolute' as any, bottom: 10, right: 12,
    backgroundColor: 'rgba(6,9,20,0.82)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  heroPriceText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  heroAgeBadge: {
    position: 'absolute' as any, top: 10, left: 10,
    backgroundColor: '#7c3aed', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  heroAgeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  // Card content area
  cardContent: { padding: 14 },
  cardIcon: {
    width: 76, height: 76, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, position: 'relative' as any,
  },
  cardIconLetter: { fontSize: 26, fontWeight: '900' },
  ageChip: {
    position: 'absolute' as any, bottom: 4, right: 4,
    backgroundColor: '#7c3aed', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2,
    borderWidth: 1.5, borderColor: '#060914',
  },
  ageChipText: { color: '#fff', fontSize: 7, fontWeight: '900', letterSpacing: 0.5 },
  cardBody: { flex: 1, minWidth: 0 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  productBrand: { color: '#3b82f6', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' as any, letterSpacing: 1.5, marginBottom: 3 },
  productName: { color: '#f1f5f9', fontSize: 15, fontWeight: '800', marginBottom: 4, lineHeight: 20 },
  productCategory: { color: '#475569', fontSize: 12 },
  productDescription: { color: '#64748b', fontSize: 12, lineHeight: 17 },
  skuTag: { color: '#1e2d45', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginLeft: 8 },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  cartQty: { color: '#1f6feb', fontSize: 14, fontWeight: '700' },

  // Add button — full width
  addButton: {
    backgroundColor: '#1f6feb', paddingVertical: 11, paddingHorizontal: 16,
    borderRadius: 14, alignItems: 'center', flex: 1,
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 18px rgba(31,111,235,0.45)' } as any : {}),
  },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },

  // Qty stepper — full width when active
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(31,111,235,0.1)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(31,111,235,0.28)',
    overflow: 'hidden' as any,
  },
  qtyBtn: { width: 44, height: 42, alignItems: 'center', justifyContent: 'center' },
  qtyBtnPlus: { backgroundColor: 'rgba(31,111,235,0.22)' },
  qtyBtnText: { color: '#60a5fa', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  qtyNum: { color: '#fff', fontSize: 14, fontWeight: '800', textAlign: 'center' as any },

  // Common buttons
  secondaryButton: { backgroundColor: '#1e293b', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  primaryButton: { backgroundColor: '#1f6feb', paddingVertical: 13, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', marginTop: 14 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  removeButton: { backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  input: { backgroundColor: '#0f172a', color: '#fff', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#1e293b', fontSize: 14 },

  // Sticky cart bar (bottom of screen)
  cartBar: {
    backgroundColor: '#0a1020',
    borderTopWidth: 1,
    borderTopColor: 'rgba(31,111,235,0.18)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    ...(Platform.OS === 'web' ? { boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' } as any : {}),
  },
  cartItemsList: { maxHeight: 120 },
  cartBarItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  cartBarItemName: { color: '#94a3b8', fontSize: 13, flex: 1, marginRight: 8 },
  cartBarItemRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBarQty: { color: '#475569', fontSize: 12 },
  cartBarItemPrice: { color: '#e2e8f0', fontSize: 13, fontWeight: '700' },
  cartBarRemove: { paddingHorizontal: 6, paddingVertical: 2 },
  cartBarRemoveTxt: { color: '#334155', fontSize: 13, fontWeight: '700' },
  cartBarDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 10 },
  cartBarFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartBarLabel: { color: '#475569', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' as any, marginBottom: 2 },
  cartBarTotal: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  cartBarCard: { color: '#3b82f6', fontSize: 11, marginTop: 3 },
  checkoutBtn: { backgroundColor: '#1f6feb', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 16 },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

  // Legacy cart styles (kept for other screens)
  cartSection: { marginTop: 20, padding: 16, borderRadius: 18, backgroundColor: '#0c1526', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  emptyText: { color: '#475569', marginBottom: 10, fontSize: 14 },
  emptyState: { padding: 20, alignItems: 'center' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  checkoutBar: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageText: { color: '#64748b', marginTop: 8, fontSize: 12, textAlign: 'center' as any },
  savedCardText: { color: '#7c93c4', fontSize: 12, marginTop: 8 },
  footer: { marginTop: 24 },
  disclaimer: { color: '#1e293b', fontSize: 11, lineHeight: 16, marginTop: 10, textAlign: 'center' as any },

  // Payment method card
  methodCard: { backgroundColor: '#0f172a', borderRadius: 14, padding: 14, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  methodActions: { flexDirection: 'row', gap: 8 },

  // Admin
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  statBox: { flex: 1, backgroundColor: '#0c1526', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  statBoxWarn: { borderColor: '#f59e0b' },
  statNumber: { color: '#fff', fontSize: 24, fontWeight: '900' },
  statNumberWarn: { color: '#f59e0b' },
  statLabel: { color: '#64748b', fontSize: 11, marginTop: 2 },
  alertBox: { backgroundColor: '#1a0f00', borderRadius: 14, padding: 14, marginBottom: 12, borderColor: '#f59e0b', borderWidth: 1 },
  alertTitle: { color: '#f59e0b', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  alertItem: { color: '#fbbf24', fontSize: 12, lineHeight: 20 },
  adminCard: { backgroundColor: '#0c1526', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  adminCardInactive: { opacity: 0.5 },
  adminCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  adminSku: { color: '#334155', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 2 },
  adminBrand: { color: '#7c93c4', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  stockBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  stockBadgeOk: { backgroundColor: '#14532d' },
  stockBadgeLow: { backgroundColor: '#7f1d1d' },
  stockBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  inactiveBadge: { color: '#64748b', fontSize: 10, marginTop: 4 },
  stockControls: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  stockBtn: { paddingVertical: 5, paddingHorizontal: 10, backgroundColor: '#1e293b', borderRadius: 8 },
  stockBtnGreen: { backgroundColor: '#14532d' },
  stockBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  adminActions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#1e3a5f', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8 },
  deactivateBtn: { backgroundColor: '#450a0a', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8 },
  editForm: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },
  inlineInput: { flex: 1, backgroundColor: '#1e293b', color: '#fff', borderRadius: 8, padding: 8, fontSize: 13, borderWidth: 1, borderColor: '#334155' },
  saveBtn: { backgroundColor: '#1f6feb', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addForm: { backgroundColor: '#0c1526', borderRadius: 16, padding: 14, marginBottom: 16, borderColor: '#1f6feb', borderWidth: 1 },
  toggleBtn: { backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  toggleBtnOn: { backgroundColor: '#7f1d1d' },

  // Quick-add cart button on product card hero
  cardQuickAddWrap: { position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  cardQuickAddBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.93)',
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 24px rgba(0,0,0,0.38)' } as any : {}),
  },
  cardQuickAddIcon: { fontSize: 20 },

  // ── Google Reviews ──────────────────────────────────────────────────────────
  reviewsWrap: { marginTop: 36, marginBottom: 8 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  reviewsRatingBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reviewsRatingNum: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  reviewsStars: { color: '#fbbf24', fontSize: 18, letterSpacing: 2 },
  reviewsCount: { color: '#475569', fontSize: 11, marginTop: 2 },
  googleBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 8px rgba(0,0,0,0.3)' } as any : {}),
  },
  googleBadgeTxt: { color: '#4285F4', fontSize: 16, fontWeight: '900' },
  reviewUsBtn: {
    backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: 12,
    paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)',
  },
  reviewUsBtnTxt: { color: '#fbbf24', fontSize: 12, fontWeight: '700' },
  reviewsScroll: { overflow: 'hidden' as any },
  reviewCard: {
    width: 280, backgroundColor: 'rgba(12,21,38,0.8)',
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    marginRight: 14,
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 20px rgba(0,0,0,0.3)' } as any : {}),
  },
  reviewCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  reviewName: { color: '#f1f5f9', fontSize: 14, fontWeight: '700' },
  reviewAgo: { color: '#475569', fontSize: 11, marginTop: 1 },
  reviewGoogleIcon: { color: '#4285F4', fontSize: 14, fontWeight: '900' },
  reviewStars: { color: '#fbbf24', fontSize: 14, letterSpacing: 1, marginBottom: 8 },
  reviewText: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },

  // ── Store Info Footer ───────────────────────────────────────────────────────
  storeFooter: {
    marginTop: 36,
    backgroundColor: '#060912',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 28,
  },
  storeFooterGrid: {
    flexDirection: 'row', gap: 24, flexWrap: 'wrap' as any,
    paddingHorizontal: 0, marginBottom: 24,
  },
  storeInfoCol: { flex: 1, minWidth: 240 },
  storeLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  storeLogoMark: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(31,111,235,0.12)', borderWidth: 1.5, borderColor: 'rgba(31,111,235,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  storeLogoLetter: { color: '#fff', fontSize: 18, fontWeight: '900' },
  storeLogoName: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  storeLogoSub: { color: '#1f6feb', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: 2 },
  storeDetail: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  storeDetailIcon: { fontSize: 14, marginTop: 1 },
  storeDetailTxt: { color: '#94a3b8', fontSize: 13, lineHeight: 20, flex: 1 },
  mapWrap: { height: 200, borderRadius: 16, overflow: 'hidden' as any, marginTop: 14, marginBottom: 12, backgroundColor: '#0c1526' },
  mapsBtn: {
    backgroundColor: 'rgba(31,111,235,0.1)', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(31,111,235,0.25)',
    alignItems: 'center',
  },
  mapsBtnTxt: { color: '#60a5fa', fontSize: 13, fontWeight: '700' },
  hoursCol: { flex: 1, minWidth: 200 },
  hoursTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 14, letterSpacing: -0.3 },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  hoursRowToday: { backgroundColor: 'rgba(31,111,235,0.08)', borderRadius: 8, paddingHorizontal: 8, borderBottomColor: 'transparent' },
  hoursDay: { color: '#64748b', fontSize: 13 },
  hoursDayToday: { color: '#60a5fa', fontWeight: '700' },
  hoursTime: { color: '#94a3b8', fontSize: 13 },
  hoursTimeToday: { color: '#fff', fontWeight: '700' },
  hoursOpenNow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  hoursOpenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  hoursOpenTxt: { color: '#22c55e', fontSize: 12, fontWeight: '700' },
  copyright: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16, alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(3,6,12,0.8)',
  },
  copyrightTxt: { color: '#334155', fontSize: 11, letterSpacing: 0.5, textAlign: 'center' as any },
  copyrightSub: { color: '#1e293b', fontSize: 10, textAlign: 'center' as any },

  // Wishlist pill
  wishlistPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: 14,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.22)',
    position: 'relative' as any,
  },
  wishlistPillIcon: { fontSize: 16 },
  wishlistPillLabel: { color: '#fbbf24', fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' as any },
  wishlistPillCount: { color: '#fff', fontSize: 13, fontWeight: '900' },
  wishlistDot: {
    position: 'absolute' as any, top: -6, right: -6,
    backgroundColor: '#fbbf24', borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3, borderWidth: 2, borderColor: '#060914',
  },
  wishlistDotText: { color: '#000', fontSize: 9, fontWeight: '900' },

  // Hero image overlays (card)
  heroHeart: {
    position: 'absolute' as any, top: 10, right: 12,
    backgroundColor: 'rgba(6,9,20,0.72)', borderRadius: 20,
    width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
  },
  heroHeartIcon: { fontSize: 15 },
  heroStockBadge: {
    position: 'absolute' as any, top: 10, left: 10,
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  heroStockOk: { backgroundColor: 'rgba(5,150,105,0.88)' },
  heroStockLow: { backgroundColor: 'rgba(217,119,6,0.9)' },
  heroStockOut: { backgroundColor: 'rgba(185,28,28,0.9)' },
  heroStockText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  // ── Wishlist Drawer ─────────────────────────────────────────────────────────
  wlPanel: {
    position: 'absolute' as any,
    top: 0, left: 0, bottom: 0, width: 400,
    backgroundColor: '#08101e', zIndex: 501,
    ...(Platform.OS === 'web' ? { boxShadow: '20px 0 80px rgba(0,0,0,0.95)' } as any : {}),
  },
  wlHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 22, paddingBottom: 16 },
  wlTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  wlSubtitle: { color: '#475569', fontSize: 12, marginTop: 3, fontWeight: '500' },
  wlCloseBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  wlCloseTxt: { color: '#64748b', fontSize: 15, fontWeight: '700' },
  wlEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  wlEmptyIcon: { fontSize: 52, marginBottom: 18 },
  wlEmptyTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  wlEmptyHint: { color: '#475569', fontSize: 14, textAlign: 'center' as any, lineHeight: 21, marginBottom: 28 },
  wlBrowseBtn: { backgroundColor: '#1f6feb', paddingVertical: 13, paddingHorizontal: 28, borderRadius: 14 },
  wlBrowseTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  wlItems: { flex: 1 },
  wlItem: { flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  wlThumbWrap: { width: 76, height: 76, borderRadius: 12, overflow: 'hidden' as any, flexShrink: 0 },
  wlThumb: { width: 76, height: 76 },
  wlItemBody: { flex: 1, minWidth: 0 },
  wlItemBrand: { color: '#3b82f6', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' as any, letterSpacing: 1.5, marginBottom: 2 },
  wlItemName: { color: '#f1f5f9', fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 2 },
  wlItemPrice: { color: '#fbbf24', fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  wlAddBtn: { backgroundColor: '#1f6feb', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 10 },
  wlAddBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  wlRemoveBtn: { justifyContent: 'center', paddingHorizontal: 8 },
  wlRemoveTxt: { color: '#334155', fontSize: 12, textDecorationLine: 'underline' as any },
  wlFooter: { backgroundColor: 'rgba(6,9,20,0.9)' },
  wlAddAllBtn: { backgroundColor: '#1f6feb', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  wlAddAllTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  wlFooterNote: { color: '#334155', fontSize: 11, textAlign: 'center' as any, marginTop: 10 },

  // Header flame logo mark (mini)
  headerLogoMark: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(31,111,235,0.12)', borderWidth: 1.5, borderColor: 'rgba(31,111,235,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerLogoLetter: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

  // ── Cart Drawer ─────────────────────────────────────────────────────────────
  drawerPanel: {
    position: 'absolute' as any,
    top: 0, right: 0, bottom: 0, width: 440,
    backgroundColor: '#080e1c', zIndex: 501,
    ...(Platform.OS === 'web' ? { boxShadow: '-20px 0 80px rgba(0,0,0,0.95)' } as any : {}),
  },
  drawerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 16,
  },
  drawerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
  drawerSubtitle: { color: '#475569', fontSize: 12, marginTop: 3, fontWeight: '500' },
  drawerCloseBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  drawerCloseTxt: { color: '#64748b', fontSize: 15, fontWeight: '700' },
  drawerDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },

  // Empty state
  drawerEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  drawerEmptyIcon: { fontSize: 52, marginBottom: 18 },
  drawerEmptyTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 10 },
  drawerEmptyHint: { color: '#475569', fontSize: 14, textAlign: 'center' as any, lineHeight: 21, marginBottom: 28 },
  drawerBrowseBtn: { backgroundColor: '#1f6feb', paddingVertical: 13, paddingHorizontal: 28, borderRadius: 14 },
  drawerBrowseTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Items list
  drawerItems: { flex: 1 },
  drawerItem: {
    flexDirection: 'row', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  drawerThumbWrap: { width: 76, height: 76, borderRadius: 12, overflow: 'hidden' as any, flexShrink: 0 },
  drawerThumb: { width: 76, height: 76 },
  drawerItemBody: { flex: 1, minWidth: 0 },
  drawerItemBrand: { color: '#3b82f6', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' as any, letterSpacing: 1.5, marginBottom: 2 },
  drawerItemName: { color: '#f1f5f9', fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 2 },
  drawerItemUnitPrice: { color: '#475569', fontSize: 11, marginBottom: 8 },
  drawerItemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drawerStepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(31,111,235,0.08)', borderRadius: 9,
    borderWidth: 1, borderColor: 'rgba(31,111,235,0.22)', overflow: 'hidden' as any,
  },
  drawerStepBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  drawerStepBtnPlus: { backgroundColor: 'rgba(31,111,235,0.18)' },
  drawerStepTxt: { color: '#60a5fa', fontSize: 17, fontWeight: '700' },
  drawerStepNum: { color: '#fff', fontSize: 13, fontWeight: '800', paddingHorizontal: 9 },
  drawerItemLinetotal: { color: '#fff', fontSize: 14, fontWeight: '900' },
  drawerRemoveTxt: { color: '#334155', fontSize: 11, marginTop: 5, textDecorationLine: 'underline' as any },

  // Summary footer
  drawerFooter: { backgroundColor: 'rgba(6,9,20,0.9)' },
  drawerSummaryBlock: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  drawerSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  drawerGrandRow: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
    paddingTop: 12, marginTop: 5, marginBottom: 14,
  },
  drawerSummaryLabel: { color: '#64748b', fontSize: 13 },
  drawerSummaryVal: { color: '#cbd5e1', fontSize: 13, fontWeight: '600' },
  drawerGrandLabel: { color: '#fff', fontSize: 16, fontWeight: '900' },
  drawerGrandAmt: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  drawerCardRow: {
    backgroundColor: 'rgba(31,111,235,0.07)', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(31,111,235,0.18)',
  },
  drawerCardTxt: { color: '#60a5fa', fontSize: 12, fontWeight: '600' },
  drawerCheckoutBtn: {
    backgroundColor: '#1f6feb', borderRadius: 15,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 24px rgba(31,111,235,0.5)' } as any : {}),
  },
  drawerCheckoutTxt: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  drawerContinueBtn: { alignItems: 'center', paddingVertical: 11 },
  drawerContinueTxt: { color: '#475569', fontSize: 13, fontWeight: '600' },
  drawerMsg: { color: '#64748b', fontSize: 12, textAlign: 'center' as any, marginTop: 6 },
  drawerDisclaimer: { color: '#1e3251', fontSize: 11, textAlign: 'center' as any, marginTop: 10 },
});

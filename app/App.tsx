import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
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
      body { margin: 0; overflow-x: hidden; background: #060914; }
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

// ─── Product Card (with add-bounce) ──────────────────────────────────────────
function ProductCard({ product, index, cartQty, onAdd }: {
  product: Product; index: number; cartQty: number; onAdd: (p: Product) => void;
}) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(22)).current;
  const addScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = Math.min(index * 45, 350);
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 380, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 380, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  function handleAdd() {
    Animated.sequence([
      Animated.spring(addScale, { toValue: 0.78, useNativeDriver: true, tension: 350, friction: 7 }),
      Animated.spring(addScale, { toValue: 1.12, useNativeDriver: true, tension: 200, friction: 6 }),
      Animated.spring(addScale, { toValue: 1, useNativeDriver: true, tension: 250, friction: 8 }),
    ]).start();
    onAdd(product);
  }

  return (
    <Animated.View style={{ opacity: op, transform: [{ translateY: ty }] }} {...wc('ag-card-hover')}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            {product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>
              {product.category}{product.subcategory ? ` › ${product.subcategory}` : ''}
            </Text>
          </View>
          <Text style={styles.skuTag}>{product.sku}</Text>
        </View>
        <Text style={styles.productDescription}>{product.description}</Text>
        <View style={styles.productFooter}>
          <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {cartQty > 0 && <Text style={styles.cartQty}>×{cartQty}</Text>}
            <Animated.View style={{ transform: [{ scale: addScale }] }}>
              <Pressable style={styles.addButton} onPress={handleAdd} {...wc('ag-add-btn')}>
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

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

  useEffect(() => {
    if (screen === 'shop') loadProducts();
  }, [selectedCategory, searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Data loaders ─────────────────────────────────────────────────────────
  async function loadCategories() {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (res.ok) { const d = await res.json(); setCategories(d.categories); }
    } catch {}
  }

  async function loadProducts() {
    const p = new URLSearchParams();
    if (selectedCategory !== 'All') p.set('category', selectedCategory);
    if (searchText.trim()) p.set('search', searchText.trim());
    try {
      const res = await fetch(`${API_URL}/api/products?${p}`);
      if (res.ok) { const d = await res.json(); if (Array.isArray(d.products)) setProducts(d.products); }
    } catch {}
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

  // ─── Memos ────────────────────────────────────────────────────────────────
  const visibleProducts = useMemo(() => products, [products]);
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

  function addToCart(product: Product) {
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
    if (authUser) {
      fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      }).catch(() => {});
    }
  }

  function removeFromCart(productId: string) {
    setCart((c) => { const n = { ...c }; delete n[productId]; return n; });
    if (authUser) {
      fetch(`${API_URL}/api/cart/items/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${authUser.token}` } }).catch(() => {});
    }
  }

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
        <View style={styles.loadingLogoMark}>
          <Text style={styles.loadingLogoLetter}>A</Text>
        </View>
        <Text style={styles.loadingBrand}>ANDY'S</Text>
        <Text style={styles.loadingBrandSub}>SMOKE SHOP</Text>
        <ActivityIndicator size="small" color="#1f6feb" style={{ marginTop: 32 }} />
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
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkLetter}>A</Text>
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

        <Animated.ScrollView
          style={{ opacity: screenOp }}
          contentContainerStyle={styles.loginScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateY: screenY }] }}>
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
        </Animated.ScrollView>
      </SafeAreaView>
    );
  }

  // ── Verify Age ────────────────────────────────────────────────────────────
  if (screen === 'verify-age') {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          style={{ opacity: screenOp }}
          contentContainerStyle={styles.loginScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ transform: [{ translateY: screenY }] }}>
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
        </Animated.ScrollView>
      </SafeAreaView>
    );
  }

  // ── Payment Methods ───────────────────────────────────────────────────────
  if (screen === 'payment-methods') {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          style={{ opacity: screenOp }}
          contentContainerStyle={styles.authContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ transform: [{ translateY: screenY }] }}>
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
        </Animated.ScrollView>
      </SafeAreaView>
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  if (screen === 'admin') {
    const adminCats = ['All', ...Array.from(new Set(adminProducts.map((p) => p.category))).sort()];
    return (
      <SafeAreaView style={styles.container}>
        <Animated.ScrollView
          style={{ opacity: screenOp }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ transform: [{ translateY: screenY }] }}>
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
        </Animated.ScrollView>
      </SafeAreaView>
    );
  }

  // ── Shop ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={{ opacity: screenOp }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ transform: [{ translateY: screenY }] }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Andy's Smoke Shop</Text>
                {authUser && <Text style={styles.welcomeText}>Welcome, {authUser.firstName}</Text>}
              </View>
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
            <Text style={styles.shopAddress}>5780 Broadway, Merrillville, IN  |  Age 21+</Text>
          </View>

          {/* Search */}
          <TextInput
            style={[styles.input, styles.searchInput]}
            placeholder="Search products, brands, or SKUs..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            {...wc('ag-input')}
          />

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
            {categories.map((cat) => (
              <Pressable key={cat} style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]} onPress={() => setSelectedCategory(cat)} {...wc('ag-cat-btn')}>
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.productCount}>{visibleProducts.length} products</Text>

          {/* Product grid with staggered entrance */}
          <View key={`${selectedCategory}|${searchText}`}>
            {visibleProducts.length === 0
              ? <View style={styles.emptyState}><Text style={styles.emptyText}>No products found. Try a different search.</Text></View>
              : visibleProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                  cartQty={cart[product.id] || 0}
                  onAdd={addToCart}
                />
              ))
            }
          </View>

          {/* Cart */}
          <View style={styles.cartSection}>
            <Text style={styles.sectionTitle}>Cart ({cartItems.length} items)</Text>
            {cartItems.length === 0
              ? <Text style={styles.emptyText}>Your cart is empty.</Text>
              : cartItems.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDescription}>{item.quantity} × ${item.price?.toFixed(2)}</Text>
                  </View>
                  <APressable style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.buttonText}>Remove</Text>
                  </APressable>
                </View>
              ))
            }
            {selectedMethodId && savedMethods.find((m) => m.id === selectedMethodId) && (
              <Text style={styles.savedCardText}>
                Paying with {savedMethods.find((m) => m.id === selectedMethodId)!.brand} ••••{' '}
                {savedMethods.find((m) => m.id === selectedMethodId)!.last4}
              </Text>
            )}
            <View style={styles.checkoutBar}>
              <Text style={styles.price}>Total: ${total.toFixed(2)}</Text>
              <APressable style={styles.primaryButton} onPress={checkout} disabled={checkoutLoading} webClass="ag-btn-grad">
                {checkoutLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Checkout</Text>}
              </APressable>
            </View>
            {checkoutMessage ? <Text style={styles.messageText}>{checkoutMessage}</Text> : null}
            {paymentUrl ? (
              <APressable style={styles.secondaryButton} onPress={() => Linking.openURL(paymentUrl)} webClass="ag-btn-secondary">
                <Text style={styles.buttonText}>Open Payment Link</Text>
              </APressable>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Text style={styles.disclaimer}>Indiana sales are age restricted. Must be 21+ to purchase regulated products.</Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: '#060914', paddingTop: Platform.OS === 'android' ? 24 : 0 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  authContent: { padding: 24, paddingTop: 60 },
  scrollContent: { padding: 20, paddingBottom: 40 },

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
  header: { marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 2 },
  shopAddress: { color: '#64748b', fontSize: 12, marginBottom: 4 },
  welcomeText: { color: '#7c93c4', fontSize: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' },
  // Legacy aliases
  logoutButton: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#17233c', marginTop: 4, marginLeft: 6 },
  logoutText: { color: '#94a3b8', fontSize: 12 },
  description: { color: '#cbd5e1', fontSize: 16, lineHeight: 24 },

  // Search + categories
  searchInput: { marginBottom: 12, marginTop: 4 },
  categoryBar: { marginBottom: 12 },
  categoryButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#17233c', marginRight: 8 },
  categoryButtonActive: { backgroundColor: '#1f6feb' },
  categoryText: { color: '#cbd5e1', fontSize: 13 },
  categoryTextActive: { color: '#fff', fontWeight: '700' },
  productCount: { color: '#64748b', fontSize: 12, marginBottom: 10 },

  // Product card
  card: { backgroundColor: '#0c1526', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  productBrand: { color: '#7c93c4', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  productCategory: { color: '#475569', fontSize: 12 },
  productDescription: { color: '#94a3b8', fontSize: 13, marginBottom: 10, lineHeight: 18 },
  skuTag: { color: '#1e2d45', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginLeft: 8 },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
  cartQty: { color: '#1f6feb', fontSize: 14, fontWeight: '700' },
  addButton: { backgroundColor: '#1f3a6e', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(31,111,235,0.3)' },

  // Common buttons
  secondaryButton: { backgroundColor: '#1e293b', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  primaryButton: { backgroundColor: '#1f6feb', paddingVertical: 13, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', marginTop: 14 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  removeButton: { backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  input: { backgroundColor: '#0f172a', color: '#fff', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#1e293b', fontSize: 14 },

  // Cart
  cartSection: { marginTop: 20, padding: 16, borderRadius: 18, backgroundColor: '#0c1526', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  emptyText: { color: '#475569', marginBottom: 10, fontSize: 14 },
  emptyState: { padding: 20, alignItems: 'center' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  checkoutBar: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageText: { color: '#94a3b8', marginTop: 12, fontSize: 13 },
  savedCardText: { color: '#7c93c4', fontSize: 12, marginTop: 8 },
  footer: { marginTop: 24 },
  disclaimer: { color: '#334155', fontSize: 12, lineHeight: 18 },

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
});

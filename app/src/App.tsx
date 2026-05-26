import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList
} from 'react-native';

const storage = {
  getItem: (key: string) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key: string, value: string) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); return Promise.resolve(); },
  removeItem: (key: string) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); return Promise.resolve(); }
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const TOKEN_KEY = '@andys_auth_token';

interface Product {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  price: number;
  description: string;
  imageUrl?: string;
  stock?: number;
  minStock?: number;
  ageRestricted?: boolean;
  isActive?: boolean;
}

interface AdminStats {
  total: string;
  low_stock: string;
  categories: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  ageVerified: boolean;
  isAdmin: boolean;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

type Screen = 'loading' | 'login' | 'register' | 'verify-age' | 'shop' | 'payment-methods' | 'admin';

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  // Admin state
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState('All');
  const [adminLoading, setAdminLoading] = useState(false);
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', brand: '', category: '', subcategory: '', description: '', price: '', stock: '', minStock: '5', imageUrl: '', ageRestricted: true });

  // Session restore
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
      } catch {
        setScreen('login');
      }
    }
    restoreSession();
  }, []);

  // Load shop data when entering shop
  useEffect(() => {
    if (screen === 'shop' && authUser) {
      loadPaymentMethods();
      loadCategories();
      loadProducts();
    }
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload products when search or category changes
  useEffect(() => {
    if (screen === 'shop') loadProducts();
  }, [selectedCategory, searchText]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCategories() {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch {}
  }

  async function loadProducts() {
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (searchText.trim()) params.set('search', searchText.trim());
    try {
      const res = await fetch(`${API_URL}/api/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) setProducts(data.products);
      }
    } catch {}
  }

  async function loadAdminProducts() {
    if (!authUser) return;
    setAdminLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${authUser.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminProducts(data.products);
        setAdminStats(data.stats);
      }
    } catch {} finally {
      setAdminLoading(false);
    }
  }

  const visibleProducts = useMemo(() => products, [products]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const p = products.find((x) => x.id === id);
          return p ? { ...p, quantity: qty } : null;
        })
        .filter(Boolean) as (Product & { quantity: number })[],
    [cart, products]
  );

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredAdminProducts = useMemo(() => {
    return adminProducts.filter((p) => {
      const matchCat = adminCategory === 'All' || p.category === adminCategory;
      const matchSearch = !adminSearch || p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(adminSearch.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(adminSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [adminProducts, adminCategory, adminSearch]);

  const adminLowStock = useMemo(
    () => adminProducts.filter((p) => p.isActive && (p.stock ?? 0) < (p.minStock ?? 5)),
    [adminProducts]
  );

  async function handleLogin() {
    if (!loginEmail || !loginPassword) { Alert.alert('Required', 'Please enter your email and password.'); return; }
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok) {
        await storage.setItem(TOKEN_KEY, data.token);
        setAuthUser({ ...data.user, token: data.token });
        setLoginEmail(''); setLoginPassword('');
        setScreen(data.user.ageVerified ? 'shop' : 'verify-age');
      } else {
        Alert.alert('Login failed', data.error || 'Invalid credentials.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server.');
    } finally { setLoginLoading(false); }
  }

  async function handleRegister() {
    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regDob) { Alert.alert('Required', 'Please fill in all fields.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(regDob)) { Alert.alert('Invalid date', 'Date of birth must be YYYY-MM-DD.'); return; }
    if (regPassword.length < 8) { Alert.alert('Weak password', 'Password must be at least 8 characters.'); return; }
    setRegLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: regFirstName, lastName: regLastName, email: regEmail, password: regPassword, dateOfBirth: regDob })
      });
      const data = await res.json();
      if (res.ok) {
        await storage.setItem(TOKEN_KEY, data.token);
        setAuthUser({ ...data.user, token: data.token });
        setRegFirstName(''); setRegLastName(''); setRegEmail(''); setRegPassword(''); setRegDob('');
        setScreen('verify-age');
      } else {
        Alert.alert('Registration failed', data.error || 'Could not create account.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server.');
    } finally { setRegLoading(false); }
  }

  async function handleStartVerification() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/age-verification/session`, { method: 'POST', headers: { Authorization: `Bearer ${authUser.token}` } });
      const data = await res.json();
      if (data.alreadyVerified) { setAuthUser((u) => u ? { ...u, ageVerified: true } : u); setScreen('shop'); return; }
      if (res.ok && data.url) { Linking.openURL(data.url).catch(() => Alert.alert('Error', 'Could not open verification link.')); }
      else { Alert.alert('Error', data.error || 'Could not start verification.'); }
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
  }

  async function handleCheckVerificationStatus() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${authUser.token}` } });
      const data = await res.json();
      if (res.ok && data.user.ageVerified) { setAuthUser((u) => u ? { ...u, ageVerified: true } : u); setScreen('shop'); }
      else { Alert.alert('Not verified yet', 'Your ID has not been verified yet.'); }
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
  }

  async function loadPaymentMethods() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/payments/methods`, { headers: { Authorization: `Bearer ${authUser.token}` } });
      if (res.ok) {
        const data = await res.json();
        setSavedMethods(data.methods);
        const def = (data.methods as PaymentMethod[]).find((m) => m.isDefault);
        if (def) setSelectedMethodId(def.id);
      }
    } catch {}
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
      } else {
        setCheckoutMessage(data.error || 'Checkout failed. Please try again.');
      }
    } catch { setCheckoutMessage('Unable to connect to payment service.'); }
    finally { setCheckoutLoading(false); }
  }

  // Admin: adjust stock
  async function adminAdjustStock(sku: string, adjustment: number) {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${sku}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` },
        body: JSON.stringify({ adjustment })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminProducts((prev) => prev.map((p) => p.sku === sku ? { ...p, stock: data.stock } : p));
      }
    } catch {}
  }

  // Admin: save edit
  async function adminSaveEdit(sku: string) {
    if (!authUser) return;
    const payload: Record<string, unknown> = {};
    if (editPrice) payload.price = parseFloat(editPrice);
    if (editStock) payload.stock = parseInt(editStock, 10);
    if (editImageUrl) payload.imageUrl = editImageUrl;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAdminProducts((prev) => prev.map((p) => p.sku === sku ? {
          ...p,
          ...(editPrice ? { price: parseFloat(editPrice) } : {}),
          ...(editStock ? { stock: parseInt(editStock, 10) } : {}),
          ...(editImageUrl ? { imageUrl: editImageUrl } : {})
        } : p));
        setEditingSku(null); setEditPrice(''); setEditStock(''); setEditImageUrl('');
      }
    } catch {}
  }

  // Admin: deactivate
  async function adminDeactivate(sku: string) {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/products/${sku}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authUser.token}` }
      });
      if (res.ok) setAdminProducts((prev) => prev.map((p) => p.sku === sku ? { ...p, isActive: false } : p));
    } catch {}
  }

  // Admin: add product
  async function adminAddProduct() {
    if (!authUser || !newProduct.sku || !newProduct.name || !newProduct.category || !newProduct.price) {
      Alert.alert('Required', 'SKU, Name, Category, and Price are required.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authUser.token}` },
        body: JSON.stringify({
          sku: newProduct.sku,
          name: newProduct.name,
          brand: newProduct.brand || undefined,
          category: newProduct.category,
          subcategory: newProduct.subcategory || undefined,
          description: newProduct.description || undefined,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock || '0', 10),
          minStock: parseInt(newProduct.minStock || '5', 10),
          imageUrl: newProduct.imageUrl || undefined,
          ageRestricted: newProduct.ageRestricted,
          isActive: true
        })
      });
      if (res.ok) {
        Alert.alert('Success', `Product ${newProduct.sku} added.`);
        setShowAddForm(false);
        setNewProduct({ sku: '', name: '', brand: '', category: '', subcategory: '', description: '', price: '', stock: '', minStock: '5', imageUrl: '', ageRestricted: true });
        loadAdminProducts();
      } else {
        const data = await res.json();
        Alert.alert('Error', data.error || 'Could not add product.');
      }
    } catch { Alert.alert('Error', 'Could not connect to server.'); }
  }

  // ── Screens ───────────────────────────────────────────────────────────────

  if (screen === 'loading') {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1f6feb" />
      </SafeAreaView>
    );
  }

  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.title}>Andy's Smoke Shop</Text>
          <Text style={styles.shopAddress}>5780 Broadway, Merrillville, IN</Text>
          <Text style={styles.description}>Sign in to continue. You must be 21+ to shop.</Text>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" value={loginEmail} onChangeText={setLoginEmail} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry value={loginPassword} onChangeText={setLoginPassword} />
          <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={loginLoading}>
            {loginLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setScreen('register')}>
            <Text style={styles.buttonText}>Create Account</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'register') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.description}>You must be 21 or older. Your date of birth will be verified.</Text>
          <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#888" value={regFirstName} onChangeText={setRegFirstName} />
          <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#888" value={regLastName} onChangeText={setRegLastName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" value={regEmail} onChangeText={setRegEmail} />
          <TextInput style={styles.input} placeholder="Password (8+ characters)" placeholderTextColor="#888" secureTextEntry value={regPassword} onChangeText={setRegPassword} />
          <TextInput style={styles.input} placeholder="Date of Birth (YYYY-MM-DD)" placeholderTextColor="#888" value={regDob} onChangeText={setRegDob} />
          <Pressable style={styles.primaryButton} onPress={handleRegister} disabled={regLoading}>
            {regLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setScreen('login')}>
            <Text style={styles.buttonText}>Already have an account? Sign In</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'verify-age') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.title}>Verify Your Age</Text>
          <Text style={styles.description}>Indiana law requires age verification before purchasing tobacco, nicotine, or CBD products.</Text>
          <View style={styles.verifySteps}>
            <Text style={styles.stepText}>1. Tap "Start Verification" below</Text>
            <Text style={styles.stepText}>2. Upload your government-issued photo ID</Text>
            <Text style={styles.stepText}>3. Take a selfie to match your ID</Text>
            <Text style={styles.stepText}>4. Return here and tap "Check Status"</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={handleStartVerification}>
            <Text style={styles.buttonText}>Start Verification</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleCheckVerificationStatus}>
            <Text style={styles.buttonText}>I've Completed — Check Status</Text>
          </Pressable>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'payment-methods') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authContent}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Payment Methods</Text>
            <Pressable style={styles.logoutButton} onPress={() => setScreen('shop')}>
              <Text style={styles.logoutText}>Back</Text>
            </Pressable>
          </View>
          <Text style={styles.description}>Save cards for faster checkout. Secured by Stripe.</Text>
          {savedMethods.length === 0 ? (
            <View style={styles.verifySteps}><Text style={styles.stepText}>No saved cards yet.</Text></View>
          ) : (
            savedMethods.map((method) => (
              <View key={method.id} style={styles.methodCard}>
                <View>
                  <Text style={styles.productName}>{method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}</Text>
                  <Text style={styles.productDescription}>Expires {method.expMonth}/{method.expYear}{method.isDefault ? '  ★ Default' : ''}</Text>
                </View>
                <View style={styles.methodActions}>
                  {!method.isDefault && (
                    <Pressable style={styles.secondaryButton} onPress={() => handleSetDefault(method.id)}>
                      <Text style={styles.buttonText}>Set Default</Text>
                    </Pressable>
                  )}
                  <Pressable style={styles.removeButton} onPress={() => handleDeleteMethod(method.id)}>
                    <Text style={styles.buttonText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
          <Pressable style={styles.primaryButton} onPress={handleAddCard}>
            <Text style={styles.buttonText}>+ Add New Card</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={loadPaymentMethods}>
            <Text style={styles.buttonText}>Refresh</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Admin Inventory Screen ────────────────────────────────────────────────
  if (screen === 'admin') {
    const adminCategories = ['All', ...Array.from(new Set(adminProducts.map((p) => p.category))).sort()];
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { fontSize: 24 }]}>Inventory Manager</Text>
              <Pressable style={styles.logoutButton} onPress={() => setScreen('shop')}>
                <Text style={styles.logoutText}>← Shop</Text>
              </Pressable>
            </View>

            {/* Stats */}
            {adminStats && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{adminStats.total}</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={[styles.statBox, parseInt(adminStats.low_stock) > 0 && styles.statBoxWarn]}>
                  <Text style={[styles.statNumber, parseInt(adminStats.low_stock) > 0 && styles.statNumberWarn]}>{adminStats.low_stock}</Text>
                  <Text style={styles.statLabel}>Low Stock</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{adminStats.categories}</Text>
                  <Text style={styles.statLabel}>Categories</Text>
                </View>
              </View>
            )}
          </View>

          {/* Low stock alert */}
          {adminLowStock.length > 0 && (
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>⚠ Low Stock Alert ({adminLowStock.length} items)</Text>
              {adminLowStock.slice(0, 5).map((p) => (
                <Text key={p.sku} style={styles.alertItem}>• {p.name} — {p.stock} left (min {p.minStock})</Text>
              ))}
              {adminLowStock.length > 5 && <Text style={styles.alertItem}>...and {adminLowStock.length - 5} more</Text>}
            </View>
          )}

          {/* Search + Filter */}
          <TextInput
            style={[styles.input, { marginTop: 8 }]}
            placeholder="Search by name, SKU, or brand..."
            placeholderTextColor="#888"
            value={adminSearch}
            onChangeText={setAdminSearch}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
            {adminCategories.map((cat) => (
              <Pressable key={cat} style={[styles.categoryButton, adminCategory === cat && styles.categoryButtonActive]} onPress={() => setAdminCategory(cat)}>
                <Text style={[styles.categoryText, adminCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Refresh + Add */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <Pressable style={[styles.secondaryButton, { flex: 1, marginTop: 0 }]} onPress={loadAdminProducts}>
              <Text style={styles.buttonText}>{adminLoading ? 'Loading...' : 'Refresh'}</Text>
            </Pressable>
            <Pressable style={[styles.addButton, { flex: 1 }]} onPress={() => setShowAddForm(!showAddForm)}>
              <Text style={styles.buttonText}>{showAddForm ? 'Cancel' : '+ Add Product'}</Text>
            </Pressable>
          </View>

          {/* Add product form */}
          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={styles.sectionTitle}>New Product</Text>
              <TextInput style={styles.input} placeholder="SKU (e.g. CIG-MRL-NEWRED)" placeholderTextColor="#888" value={newProduct.sku} onChangeText={(v) => setNewProduct((p) => ({ ...p, sku: v }))} />
              <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#888" value={newProduct.name} onChangeText={(v) => setNewProduct((p) => ({ ...p, name: v }))} />
              <TextInput style={styles.input} placeholder="Brand" placeholderTextColor="#888" value={newProduct.brand} onChangeText={(v) => setNewProduct((p) => ({ ...p, brand: v }))} />
              <TextInput style={styles.input} placeholder="Category (e.g. Cigarettes)" placeholderTextColor="#888" value={newProduct.category} onChangeText={(v) => setNewProduct((p) => ({ ...p, category: v }))} />
              <TextInput style={styles.input} placeholder="Subcategory (optional)" placeholderTextColor="#888" value={newProduct.subcategory} onChangeText={(v) => setNewProduct((p) => ({ ...p, subcategory: v }))} />
              <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#888" value={newProduct.description} onChangeText={(v) => setNewProduct((p) => ({ ...p, description: v }))} />
              <TextInput style={styles.input} placeholder="Price (e.g. 12.99)" placeholderTextColor="#888" keyboardType="decimal-pad" value={newProduct.price} onChangeText={(v) => setNewProduct((p) => ({ ...p, price: v }))} />
              <TextInput style={styles.input} placeholder="Stock quantity" placeholderTextColor="#888" keyboardType="number-pad" value={newProduct.stock} onChangeText={(v) => setNewProduct((p) => ({ ...p, stock: v }))} />
              <TextInput style={styles.input} placeholder="Min stock (default 5)" placeholderTextColor="#888" keyboardType="number-pad" value={newProduct.minStock} onChangeText={(v) => setNewProduct((p) => ({ ...p, minStock: v }))} />
              <TextInput style={styles.input} placeholder="Image URL (HTTPS, optional)" placeholderTextColor="#888" value={newProduct.imageUrl} onChangeText={(v) => setNewProduct((p) => ({ ...p, imageUrl: v }))} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                <Pressable
                  style={[styles.toggleBtn, newProduct.ageRestricted && styles.toggleBtnOn]}
                  onPress={() => setNewProduct((p) => ({ ...p, ageRestricted: !p.ageRestricted }))}
                >
                  <Text style={styles.buttonText}>21+ Required: {newProduct.ageRestricted ? 'YES' : 'NO'}</Text>
                </Pressable>
              </View>
              <Pressable style={[styles.primaryButton, { marginTop: 12 }]} onPress={adminAddProduct}>
                <Text style={styles.buttonText}>Save Product</Text>
              </Pressable>
            </View>
          )}

          {/* Product list */}
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
            {filteredAdminProducts.length} products
          </Text>
          {filteredAdminProducts.map((product) => {
            const isLow = (product.stock ?? 0) < (product.minStock ?? 5);
            const isEditing = editingSku === product.sku;
            return (
              <View key={product.sku} style={[styles.adminCard, !product.isActive && styles.adminCardInactive]}>
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

                {/* Stock controls */}
                <View style={styles.stockControls}>
                  <Pressable style={styles.stockBtn} onPress={() => adminAdjustStock(product.sku, -1)}>
                    <Text style={styles.stockBtnText}>-1</Text>
                  </Pressable>
                  <Pressable style={styles.stockBtn} onPress={() => adminAdjustStock(product.sku, -10)}>
                    <Text style={styles.stockBtnText}>-10</Text>
                  </Pressable>
                  <Pressable style={[styles.stockBtn, styles.stockBtnGreen]} onPress={() => adminAdjustStock(product.sku, 10)}>
                    <Text style={styles.stockBtnText}>+10</Text>
                  </Pressable>
                  <Pressable style={[styles.stockBtn, styles.stockBtnGreen]} onPress={() => adminAdjustStock(product.sku, 50)}>
                    <Text style={styles.stockBtnText}>+50</Text>
                  </Pressable>
                </View>

                {/* Edit / Deactivate row */}
                <View style={styles.adminActions}>
                  <Pressable
                    style={styles.editBtn}
                    onPress={() => {
                      if (isEditing) { setEditingSku(null); setEditPrice(''); setEditStock(''); }
                      else { setEditingSku(product.sku); setEditPrice(String(product.price)); setEditStock(String(product.stock ?? 0)); }
                    }}
                  >
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
                    <TextInput style={styles.inlineInput} placeholder="Image URL (HTTPS)" placeholderTextColor="#888" value={editImageUrl} onChangeText={setEditImageUrl} />
                    <Pressable style={styles.saveBtn} onPress={() => adminSaveEdit(product.sku)}>
                      <Text style={styles.buttonText}>Save</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Shop ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Andy's Smoke Shop</Text>
              {authUser && <Text style={styles.welcomeText}>Welcome, {authUser.firstName}</Text>}
            </View>
            <View style={styles.headerActions}>
              {authUser?.isAdmin && (
                <Pressable style={[styles.logoutButton, styles.adminButton]} onPress={() => { setScreen('admin'); loadAdminProducts(); }}>
                  <Text style={[styles.logoutText, { color: '#f59e0b' }]}>Admin</Text>
                </Pressable>
              )}
              <Pressable style={styles.logoutButton} onPress={() => setScreen('payment-methods')}>
                <Text style={styles.logoutText}>Cards</Text>
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.shopAddress}>5780 Broadway, Merrillville, IN  |  Age 21+</Text>
        </View>

        {/* Search bar */}
        <TextInput
          style={[styles.input, styles.searchInput]}
          placeholder="Search products, brands, or SKUs..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
          {categories.map((cat) => (
            <Pressable key={cat} style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Product count */}
        <Text style={styles.productCount}>{visibleProducts.length} products</Text>

        {/* Products Grid */}
        {visibleProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found. Try a different search.</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {visibleProducts.map((product, idx) => (
              <View key={product.id} style={[styles.gridItem, idx % 2 === 1 && styles.gridItemOffset]}>
                <View style={styles.productGridCard}>
                  {/* Image Section */}
                  <View style={styles.productImageWrapper}>
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productGridImage}
                      />
                    ) : (
                      <View style={styles.imageplaceholder}>
                        <Text style={styles.placeholderText}>📦</Text>
                      </View>
                    )}
                    
                    {/* Stock Badge */}
                    <View style={[styles.stockBadgeSmall, (product.stock ?? 0) > 0 ? styles.stockBadgeGreen : styles.stockBadgeRed]}>
                      <Text style={styles.stockBadgeSmallText}>
                        {(product.stock ?? 0) > 0 ? '✓ In Stock' : 'Out'}
                      </Text>
                    </View>
                  </View>

                  {/* Product Info */}
                  <View style={styles.productGridInfo}>
                    {product.brand && (
                      <Text style={styles.productBrandSmall}>{product.brand}</Text>
                    )}
                    <Text style={styles.productNameSmall} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productDescSmall} numberOfLines={1}>
                      {product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}
                    </Text>
                    
                    {/* Price & Button */}
                    <View style={styles.productGridFooter}>
                      <Text style={styles.priceSmall}>${product.price?.toFixed(2)}</Text>
                      <Pressable 
                        style={[styles.addButtonSmall, (cart[product.id] || 0) > 0 && styles.addButtonSmallActive]}
                        onPress={() => addToCart(product)}
                      >
                        <Text style={styles.addButtonSmallText}>
                          {(cart[product.id] || 0) > 0 ? `✓ ${cart[product.id]}` : '+'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Cart */}
        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>Cart ({cartItems.length} items)</Text>
          {cartItems.length === 0 ? (
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          ) : (
            cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDescription}>{item.quantity} × ${item.price?.toFixed(2)}</Text>
                </View>
                <Pressable style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
                  <Text style={styles.buttonText}>Remove</Text>
                </Pressable>
              </View>
            ))
          )}
          {selectedMethodId && savedMethods.find((m) => m.id === selectedMethodId) && (
            <Text style={styles.savedCardText}>
              Paying with {savedMethods.find((m) => m.id === selectedMethodId)!.brand} ••••{' '}
              {savedMethods.find((m) => m.id === selectedMethodId)!.last4}
            </Text>
          )}
          <View style={styles.checkoutBar}>
            <Text style={styles.price}>Total: ${total.toFixed(2)}</Text>
            <Pressable style={styles.primaryButton} onPress={checkout} disabled={checkoutLoading}>
              {checkoutLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Checkout</Text>}
            </Pressable>
          </View>
          {checkoutMessage ? <Text style={styles.messageText}>{checkoutMessage}</Text> : null}
          {paymentUrl ? (
            <Pressable style={styles.secondaryButton} onPress={() => Linking.openURL(paymentUrl)}>
              <Text style={styles.buttonText}>Open Payment Link</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>Indiana sales are age restricted. Must be 21+ to purchase regulated products.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1f', paddingTop: Platform.OS === 'android' ? 24 : 0 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  authContent: { padding: 24, paddingTop: 60 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 4, letterSpacing: -0.5 },
  shopAddress: { color: '#7c8ba8', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  welcomeText: { color: '#64b5f6', fontSize: 13, fontWeight: '600' },
  description: { color: '#b0b8c8', fontSize: 16, lineHeight: 24 },
  logoutButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#1a2543', marginTop: 4, marginLeft: 8 },
  logoutText: { color: '#7c8ba8', fontSize: 12, fontWeight: '600' },
  adminButton: { borderColor: '#f59e0b', borderWidth: 1.5 },
  headerActions: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 },
  searchInput: { marginBottom: 14, marginTop: 8, borderWidth: 1.5, borderColor: '#1e3a5f', backgroundColor: '#0f1929' },
  categoryBar: { marginBottom: 16, paddingVertical: 4 },
  categoryButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 24, backgroundColor: '#1a2543', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  categoryButtonActive: { backgroundColor: '#1f6feb', borderColor: '#64b5f6' },
  categoryText: { color: '#7c8ba8', fontSize: 13, fontWeight: '600' },
  categoryTextActive: { color: '#fff', fontWeight: '700' },
  productCount: { color: '#64748b', fontSize: 13, fontWeight: '600', marginBottom: 14 },
  
  /* Grid Layout */
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  gridItem: { width: '48%', marginBottom: 14 },
  gridItemOffset: { marginLeft: '2%' },
  
  productGridCard: { 
    backgroundColor: '#0f172a', 
    borderRadius: 16, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  
  productImageWrapper: { 
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#1a2543'
  },
  
  productGridImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  
  imageplaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a2543',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  placeholderText: {
    fontSize: 48,
    opacity: 0.5
  },
  
  stockBadgeSmall: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  
  stockBadgeGreen: {
    backgroundColor: '#10b981'
  },
  
  stockBadgeRed: {
    backgroundColor: '#ef4444'
  },
  
  stockBadgeSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  
  productGridInfo: {
    padding: 12
  },
  
  productBrandSmall: { 
    color: '#64b5f6', 
    fontSize: 10, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
    marginBottom: 4
  },
  
  productNameSmall: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '700', 
    marginBottom: 4,
    lineHeight: 18
  },
  
  productDescSmall: { 
    color: '#7c8ba8', 
    fontSize: 11,
    marginBottom: 8
  },
  
  productGridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  priceSmall: {
    color: '#f0f9ff',
    fontSize: 16,
    fontWeight: '800'
  },
  
  addButtonSmall: {
    backgroundColor: '#1f6feb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: 44
  },
  
  addButtonSmallActive: {
    backgroundColor: '#10b981'
  },
  
  addButtonSmallText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center'
  },

  card: { backgroundColor: '#0f172a', borderRadius: 16, padding: 16, marginBottom: 12 },
  productImageContainer: { width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 12, backgroundColor: '#1e293b' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  productBrand: { color: '#7c93c4', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  productCategory: { color: '#475569', fontSize: 12 },
  productDescription: { color: '#94a3b8', fontSize: 13, marginBottom: 10, lineHeight: 18 },
  skuTag: { color: '#334155', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginLeft: 8 },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
  cartQty: { color: '#1f6feb', fontSize: 14, fontWeight: '700' },
  addButton: { backgroundColor: '#1f6feb', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 },
  secondaryButton: { backgroundColor: '#1e293b', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  primaryButton: { backgroundColor: '#1f6feb', paddingVertical: 13, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', marginTop: 14 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  input: { backgroundColor: '#0f172a', color: '#fff', borderRadius: 14, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#1e293b', fontSize: 14 },
  cartSection: { marginTop: 20, padding: 16, borderRadius: 16, backgroundColor: '#0f172a' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  emptyText: { color: '#475569', marginBottom: 10, fontSize: 14 },
  emptyState: { padding: 20, alignItems: 'center' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  removeButton: { backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  checkoutBar: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageText: { color: '#94a3b8', marginTop: 12, fontSize: 13 },
  footer: { marginTop: 24 },
  disclaimer: { color: '#334155', fontSize: 12, lineHeight: 18 },
  verifySteps: { backgroundColor: '#0f172a', borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 4 },
  stepText: { color: '#cbd5e1', fontSize: 14, lineHeight: 26 },
  methodCard: { backgroundColor: '#0f172a', borderRadius: 14, padding: 14, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  methodActions: { flexDirection: 'row', gap: 8 },
  savedCardText: { color: '#7c93c4', fontSize: 12, marginTop: 8 },

  // Admin styles
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  statBox: { flex: 1, backgroundColor: '#0f172a', borderRadius: 12, padding: 12, alignItems: 'center' },
  statBoxWarn: { borderColor: '#f59e0b', borderWidth: 1 },
  statNumber: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statNumberWarn: { color: '#f59e0b' },
  statLabel: { color: '#64748b', fontSize: 11, marginTop: 2 },
  alertBox: { backgroundColor: '#1a0f00', borderRadius: 12, padding: 14, marginBottom: 12, borderColor: '#f59e0b', borderWidth: 1 },
  alertTitle: { color: '#f59e0b', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  alertItem: { color: '#fbbf24', fontSize: 12, lineHeight: 20 },
  adminCard: { backgroundColor: '#0f172a', borderRadius: 14, padding: 14, marginBottom: 10 },
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
  addForm: { backgroundColor: '#0f172a', borderRadius: 14, padding: 14, marginBottom: 16, borderColor: '#1f6feb', borderWidth: 1 },
  toggleBtn: { backgroundColor: '#1e293b', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  toggleBtnOn: { backgroundColor: '#7f1d1d' },
});

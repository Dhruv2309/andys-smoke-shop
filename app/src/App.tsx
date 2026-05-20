import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

const storage = {
  getItem: (key: string) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key: string, value: string) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); return Promise.resolve(); },
  removeItem: (key: string) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); return Promise.resolve(); }
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const TOKEN_KEY = '@andys_auth_token';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  ageVerified: boolean;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

type Screen = 'loading' | 'login' | 'register' | 'verify-age' | 'shop' | 'payment-methods';

const defaultProducts: Product[] = [
  { id: 'tobacco-001', name: 'Premium Cigarettes Pack', category: 'Tobacco', price: 12.99, description: 'Classic filtered cigarettes for adult customers.' },
  { id: 'nicotine-001', name: 'Nicotine Disposable Vape', category: 'Nicotine', price: 19.99, description: 'Ready-to-use nicotine disposable device.' },
  { id: 'cbd-001', name: 'CBD Gummies Pack', category: 'CBD / Delta', price: 24.99, description: 'Relaxing CBD gummies compliant with local regulations.' },
  { id: 'snacks-001', name: 'Snack Pack - Chips & Candy', category: 'Snacks', price: 9.49, description: 'Assorted chips, candy, and convenience snacks.' },
  { id: 'drink-001', name: 'Energy Drink Variety', category: 'Beverages', price: 3.49, description: 'Refreshments for on-the-go convenience.' },
  { id: 'accessory-001', name: 'Butane Lighter', category: 'Accessories', price: 6.99, description: 'Portable butane refill lighter.' }
];

const categories = ['All', 'Tobacco', 'Nicotine', 'CBD / Delta', 'Snacks', 'Beverages', 'Accessories'];

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

  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  // Restore session from storage on launch
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        if (!token) { setScreen('login'); return; }
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  // Load payment methods when shop opens
  useEffect(() => {
    if (screen === 'shop' && authUser) loadPaymentMethods();
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load products when shop screen opens
  useEffect(() => {
    if (screen !== 'shop' || !authUser) return;
    fetch(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${authUser.token}` }
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.products)) setProducts(data.products); })
      .catch(() => {});
  }, [screen, authUser]);

  const visibleProducts = useMemo(
    () => products.filter((p) => selectedCategory === 'All' || p.category === selectedCategory),
    [products, selectedCategory]
  );

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

  async function handleLogin() {
    if (!loginEmail || !loginPassword) {
      Alert.alert('Required', 'Please enter your email and password.');
      return;
    }
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
        setLoginEmail('');
        setLoginPassword('');
        setScreen(data.user.ageVerified ? 'shop' : 'verify-age');
      } else {
        Alert.alert('Login failed', data.error || 'Invalid credentials.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister() {
    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regDob) {
      Alert.alert('Required', 'Please fill in all fields.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(regDob)) {
      Alert.alert('Invalid date', 'Date of birth must be YYYY-MM-DD.');
      return;
    }
    if (regPassword.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          password: regPassword,
          dateOfBirth: regDob
        })
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
    } finally {
      setRegLoading(false);
    }
  }

  async function handleStartVerification() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/age-verification/session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authUser.token}` }
      });
      const data = await res.json();
      if (data.alreadyVerified) {
        setAuthUser((u) => u ? { ...u, ageVerified: true } : u);
        setScreen('shop');
        return;
      }
      if (res.ok && data.url) {
        Linking.openURL(data.url).catch(() =>
          Alert.alert('Error', 'Could not open verification link.')
        );
      } else {
        Alert.alert('Error', data.error || 'Could not start verification.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server.');
    }
  }

  async function handleCheckVerificationStatus() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authUser.token}` }
      });
      const data = await res.json();
      if (res.ok && data.user.ageVerified) {
        setAuthUser((u) => u ? { ...u, ageVerified: true } : u);
        setScreen('shop');
      } else {
        Alert.alert('Not verified yet', 'Your ID has not been verified yet. Please complete the verification and try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server.');
    }
  }

  async function loadPaymentMethods() {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/payments/methods`, {
        headers: { Authorization: `Bearer ${authUser.token}` }
      });
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
      const res = await fetch(`${API_URL}/api/payments/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authUser.token}` }
      });
      const data = await res.json();
      if (res.ok && data.url) {
        Linking.openURL(data.url).catch(() => Alert.alert('Error', 'Could not open card setup page.'));
      } else {
        Alert.alert('Error', data.error || 'Could not start card setup.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server.');
    }
  }

  async function handleDeleteMethod(methodId: string) {
    if (!authUser) return;
    try {
      await fetch(`${API_URL}/api/payments/methods/${methodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authUser.token}` }
      });
      setSavedMethods((m) => m.filter((x) => x.id !== methodId));
      if (selectedMethodId === methodId) setSelectedMethodId(null);
    } catch {
      Alert.alert('Error', 'Could not remove card.');
    }
  }

  async function handleSetDefault(methodId: string) {
    if (!authUser) return;
    try {
      await fetch(`${API_URL}/api/payments/methods/${methodId}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authUser.token}` }
      });
      setSavedMethods((m) => m.map((x) => ({ ...x, isDefault: x.id === methodId })));
      setSelectedMethodId(methodId);
    } catch {
      Alert.alert('Error', 'Could not update default card.');
    }
  }

  async function handleLogout() {
    await storage.removeItem(TOKEN_KEY);
    setAuthUser(null);
    setCart({});
    setCheckoutMessage('');
    setPaymentUrl('');
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
      fetch(`${API_URL}/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authUser.token}` }
      }).catch(() => {});
    }
  }

  async function checkout() {
    if (cartItems.length === 0) {
      Alert.alert('Cart is empty', 'Please add items before checkout.');
      return;
    }
    setCheckoutLoading(true);
    setCheckoutMessage('');
    try {
      const res = await fetch(`${API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authUser ? { Authorization: `Bearer ${authUser.token}` } : {})
        },
        body: JSON.stringify({
          phone: '0000000000',
          items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity })),
          ...(selectedMethodId ? { paymentMethodId: selectedMethodId } : {})
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckoutMessage(`Order ${data.orderId} created. Total $${data.total}.`);
        setCart({});
        if (data.paymentUrl) {
          setPaymentUrl(data.paymentUrl);
          Linking.openURL(data.paymentUrl).catch(() => {});
        }
      } else {
        setCheckoutMessage('Checkout failed. Please try again.');
      }
    } catch {
      setCheckoutMessage('Unable to connect to payment service.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  // ── Screens ───────────────────────────────────────────────────────────────

  if (screen === 'verify-age') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.title}>Verify Your Age</Text>
          <Text style={styles.description}>
            Indiana law requires age verification before purchasing tobacco, nicotine, or CBD products.
            You'll be asked to upload a government-issued ID (driver's license, passport, or state ID).
          </Text>

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
          <Text style={styles.description}>Save cards for faster checkout. Your card details are secured by Stripe.</Text>

          {savedMethods.length === 0 ? (
            <View style={styles.verifySteps}>
              <Text style={styles.stepText}>No saved cards yet.</Text>
            </View>
          ) : (
            savedMethods.map((method) => (
              <View key={method.id} style={styles.methodCard}>
                <View>
                  <Text style={styles.productName}>
                    {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                  </Text>
                  <Text style={styles.productDescription}>
                    Expires {method.expMonth}/{method.expYear}
                    {method.isDefault ? '  ★ Default' : ''}
                  </Text>
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

  // ── Shop ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Andy's Smoke Shop</Text>
              {authUser && <Text style={styles.welcomeText}>Welcome, {authUser.firstName}</Text>}
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.logoutButton} onPress={() => setScreen('payment-methods')}>
                <Text style={styles.logoutText}>Cards</Text>
              </Pressable>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.description}>Shop tobacco, vape, CBD, snacks, drinks, and accessories.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
          {categories.map((cat) => (
            <Pressable key={cat} style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibleProducts.map((product) => (
          <View key={product.id} style={styles.card}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <View style={styles.productFooter}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <Pressable style={styles.addButton} onPress={() => addToCart(product)}>
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={styles.cartSection}>
          <Text style={styles.sectionTitle}>Cart</Text>
          {cartItems.length === 0 ? (
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          ) : (
            cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDescription}>{item.quantity} × ${item.price.toFixed(2)}</Text>
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
  container: { flex: 1, backgroundColor: '#060914', paddingTop: Platform.OS === 'android' ? 24 : 0 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  authContent: { padding: 24, paddingTop: 60 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  welcomeText: { color: '#7c93c4', fontSize: 14, marginTop: -4 },
  description: { color: '#cbd5e1', fontSize: 16, lineHeight: 24 },
  logoutButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#17233c', marginTop: 4 },
  logoutText: { color: '#94a3b8', fontSize: 13 },
  categoryBar: { marginBottom: 20 },
  categoryButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#17233c', marginRight: 10 },
  categoryButtonActive: { backgroundColor: '#1f6feb' },
  categoryText: { color: '#cbd5e1', fontSize: 14 },
  categoryTextActive: { color: '#ffffff', fontWeight: '700' },
  card: { backgroundColor: '#0f172a', borderRadius: 20, padding: 18, marginBottom: 16 },
  productName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  productCategory: { color: '#7c93c4', fontSize: 13, marginBottom: 8 },
  productDescription: { color: '#cbd5e1', fontSize: 14, marginBottom: 12 },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
  addButton: { backgroundColor: '#1f6feb', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14 },
  secondaryButton: { backgroundColor: '#334155', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 12 },
  primaryButton: { backgroundColor: '#0f172a', borderColor: '#1f6feb', borderWidth: 1, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 18, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '700' },
  input: { backgroundColor: '#0f172a', color: '#fff', borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#1f2937' },
  cartSection: { marginTop: 20, padding: 18, borderRadius: 20, backgroundColor: '#0f172a' },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  emptyText: { color: '#94a3b8', marginBottom: 12 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  removeButton: { backgroundColor: '#334155', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14 },
  checkoutBar: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageText: { color: '#fff', marginTop: 14, fontSize: 15 },
  footer: { marginTop: 24 },
  disclaimer: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
  verifySteps: { backgroundColor: '#0f172a', borderRadius: 16, padding: 18, marginTop: 20, marginBottom: 4 },
  stepText: { color: '#cbd5e1', fontSize: 15, lineHeight: 26 },
  methodCard: { backgroundColor: '#0f172a', borderRadius: 16, padding: 16, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  methodActions: { flexDirection: 'row', gap: 8 },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  savedCardText: { color: '#7c93c4', fontSize: 13, marginTop: 8, marginBottom: 2 }
});

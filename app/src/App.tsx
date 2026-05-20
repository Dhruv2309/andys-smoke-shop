import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotiView } from 'moti';
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

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

const defaultProducts: Product[] = [
  {
    id: 'tobacco-001',
    name: 'Premium Cigarettes Pack',
    category: 'Tobacco',
    price: 12.99,
    description: 'Classic filtered cigarettes for adult customers.'
  },
  {
    id: 'nicotine-001',
    name: 'Nicotine Disposable Vape',
    category: 'Nicotine',
    price: 19.99,
    description: 'Ready-to-use nicotine disposable device.'
  },
  {
    id: 'cbd-001',
    name: 'CBD Gummies Pack',
    category: 'CBD / Delta',
    price: 24.99,
    description: 'Relaxing CBD gummies compliant with local regulations.'
  },
  {
    id: 'snacks-001',
    name: 'Snack Pack - Chips & Candy',
    category: 'Snacks',
    price: 9.49,
    description: 'Assorted chips, candy, and convenience snacks.'
  },
  {
    id: 'drink-001',
    name: 'Energy Drink Variety',
    category: 'Beverages',
    price: 3.49,
    description: 'Refreshments for on-the-go convenience.'
  },
  {
    id: 'accessory-001',
    name: 'Butane Lighter',
    category: 'Accessories',
    price: 6.99,
    description: 'Portable butane refill lighter.'
  }
];

const categories = ['All', 'Tobacco', 'Nicotine', 'CBD / Delta', 'Snacks', 'Beverages', 'Accessories'];

export default function App() {
  const [ageInput, setAgeInput] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch('http://localhost:3000/api/products');
        const data = await response.json();
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        console.log('Backend fetch failed', error);
      }
    }

    loadProducts();
  }, []);

  const visibleProducts = useMemo(
    () => products.filter((product) => selectedCategory === 'All' || product.category === selectedCategory),
    [products, selectedCategory]
  );

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, quantity]) => {
      const product = products.find((item) => item.id === id);
      return product ? { ...product, quantity } : null;
    }).filter(Boolean) as (Product & { quantity: number })[];
  }, [cart, products]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  };

  const handleVerifyAge = () => {
    const age = Number(ageInput);
    if (!age || age < 21) {
      Alert.alert('Age verification', 'You must be 21 years or older to use this store.');
      return;
    }
    setAgeVerified(true);
  };

  const checkout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is empty', 'Please add items to your cart before checkout.');
      return;
    }
    setLoading(true);
    setCheckoutMessage('');

    try {
      const order = {
        name: 'Guest Shopper',
        email: 'guest@andys-smokeshop.com',
        phone: '0000000000',
        age: 21,
        items: cartItems.map((item) => ({ id: item.id, quantity: item.quantity }))
      };

      const response = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      const data = await response.json();
      if (response.ok) {
        setCheckoutMessage(`Order ${data.orderId} created. Total $${data.total}.`);
        setCart({});
        if (data.paymentUrl) {
          setPaymentUrl(data.paymentUrl);
          Linking.openURL(data.paymentUrl).catch(() => {});
        }
      } else {
        setCheckoutMessage('Checkout failed. Please try again.');
      }
    } catch (error) {
      setCheckoutMessage('Unable to connect to payment service.');
    } finally {
      setLoading(false);
    }
  };

  if (!ageVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Andy's Smoke Shop</Text>
        <Text style={styles.description}>Enter your age to continue. Indiana law requires customers to be 21+.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={ageInput}
          onChangeText={setAgeInput}
        />
        <Pressable style={styles.primaryButton} onPress={handleVerifyAge}>
          <Text style={styles.buttonText}>Verify Age</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing' }} style={styles.header}>
          <Text style={styles.title}>Andy's Smoke Shop</Text>
          <Text style={styles.description}>Shop tobacco, vape, CBD, snacks, drinks, and accessories with fast checkout.</Text>
        </MotiView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
          {categories.map((category) => (
            <Pressable key={category} style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]} onPress={() => setSelectedCategory(category)}>
              <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibleProducts.map((product) => (
          <MotiView key={product.id} from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', delay: 50 }} style={styles.card}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <View style={styles.productFooter}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <Pressable style={styles.addButton} onPress={() => addToCart(product)}>
                <Text style={styles.buttonText}>Add</Text>
              </Pressable>
            </View>
          </MotiView>
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
          <View style={styles.checkoutBar}>
            <Text style={styles.price}>Total: ${total.toFixed(2)}</Text>
            <Pressable style={styles.primaryButton} onPress={checkout} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Checkout</Text>}
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
          <Text style={styles.disclaimer}>Indiana sales are age restricted. Please verify other local requirements before selling regulated products.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060914',
    paddingTop: Platform.OS === 'android' ? 24 : 0
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 20
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8
  },
  description: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24
  },
  categoryBar: {
    marginBottom: 20
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#17233c',
    marginRight: 10
  },
  categoryButtonActive: {
    backgroundColor: '#1f6feb'
  },
  categoryText: {
    color: '#cbd5e1',
    fontSize: 14
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },
  productName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6
  },
  productCategory: {
    color: '#7c93c4',
    fontSize: 13,
    marginBottom: 8
  },
  productDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 12
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  price: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700'
  },
  addButton: {
    backgroundColor: '#1f6feb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14
  },
  secondaryButton: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 12
  },
  primaryButton: {
    backgroundColor: '#0f172a',
    borderColor: '#1f6feb',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  cartSection: {
    marginTop: 20,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#0f172a'
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12
  },
  emptyText: {
    color: '#94a3b8',
    marginBottom: 12
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  removeButton: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  checkoutBar: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  messageText: {
    color: '#fff',
    marginTop: 14,
    fontSize: 15
  },
  footer: {
    marginTop: 24
  },
  disclaimer: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 20
  }
});

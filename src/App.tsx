import React, { useState, useEffect, useMemo } from 'react';
import {
  CategoryId,
  MenuItem,
  CartItem,
  SelectedItemOption,
  Order,
  OrderType,
  OrderStatus,
  StoreSettings,
  FlavorOption
} from './types';
import { MENU_ITEMS, INITIAL_STORE_SETTINGS, COMMON_FLAVORS } from './data/menu';
import { NEIGHBORHOODS, VALID_COUPONS, Coupon, NeighborhoodFee } from './data/neighborhoods';
import { BARRANCO_LOGO_URL, DEFAULT_BANNER_URL } from './assets/logo';

// Firebase Service
import {
  subscribeToStoreSettings,
  saveStoreSettingsToFirebase,
  subscribeToMenuItems,
  saveMenuItemToFirebase,
  deleteMenuItemFromFirebase,
  bulkSaveMenuItemsToFirebase,
  subscribeToOrders,
  saveOrderToFirebase,
  updateOrderStatusInFirebase,
  clearOrdersInFirebase,
  subscribeToNeighborhoods,
  saveNeighborhoodsToFirebase,
  subscribeToCoupons,
  saveCouponsToFirebase,
  subscribeToFlavors,
  saveFlavorsToFirebase,
  seedInitialFirestoreData,
  fetchAllCloudDataOnce,
  onLocalBroadcastSync
} from './services/firebaseService';

// Components
import { Header } from './components/Header';
import { StoreBanner } from './components/StoreBanner';
import { getStoreScheduleStatus } from './utils/storeSchedule';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { FlavorCatalogModal } from './components/FlavorCatalogModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { ThermalReceiptPrintArea } from './components/ThermalReceiptPrintArea';

import {
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Flame,
  Check,
  AlertTriangle,
  Clock,
  Settings
} from 'lucide-react';
import { formatCurrency } from './utils/formatters';

const sanitizeLogoUrl = (url?: string): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return BARRANCO_LOGO_URL;
  }
  if (
    url === '/src/assets/logo.png' ||
    url === '/logo.png' ||
    url.includes('caseiros_logo') ||
    url.includes('caseiros_da_larissa_logo') ||
    url.includes('barranco_lanches_logo_') ||
    url.includes('barranco_logo_sq_') ||
    url.includes('barranco_logo_transparent_') ||
    url.includes('sabor_brasa') ||
    url.includes('placeholder')
  ) {
    return BARRANCO_LOGO_URL;
  }
  return url;
};

const sanitizeBannerUrl = (url?: string): string => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_BANNER_URL;
  }
  if (url.includes('placeholder') || url.includes('sabor_brasa')) {
    return DEFAULT_BANNER_URL;
  }
  return url;
};

const sanitizeStoreSettings = (data: Partial<StoreSettings>): StoreSettings => {
  return {
    ...INITIAL_STORE_SETTINGS,
    ...data,
    name: !data.name || data.name === 'Sabor & Brasa Lanches' || data.name === 'Barranco Lanches' ? 'CASEIROS DA LARISSA' : data.name,
    logoUrl: sanitizeLogoUrl(data.logoUrl),
    bannerUrl: sanitizeBannerUrl(data.bannerUrl),
    bannerSubtitle:
      data.bannerSubtitle && !data.bannerSubtitle.includes('Hambúrgueres artesanais suculentos')
        ? data.bannerSubtitle
        : INITIAL_STORE_SETTINGS.bannerSubtitle,
    operatingMode: data.operatingMode || 'auto',
    scheduleOpenTime: data.scheduleOpenTime || '10:00',
    scheduleCloseTime: data.scheduleCloseTime || '14:00',
    openingHours: data.openingHours || 'Segunda a Domingo: 10h às 14h'
  };
};

export default function App() {
  // Current time tracking for real-time automatic opening & closing (30s interval)
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // 1. Store Settings (with localStorage + Firebase synchronization)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('sabor_brasa_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return sanitizeStoreSettings(parsed);
      } catch (e) {
        return INITIAL_STORE_SETTINGS;
      }
    }
    return INITIAL_STORE_SETTINGS;
  });

  // Sync browser favicon with current logoUrl
  useEffect(() => {
    const activeLogo = storeSettings.logoUrl || BARRANCO_LOGO_URL;
    const iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (iconLink && activeLogo) {
      iconLink.href = activeLogo;
    }
  }, [storeSettings.logoUrl]);

  // Calculate live store schedule status based on current time and operating mode
  const scheduleStatus = useMemo(() => {
    return getStoreScheduleStatus(storeSettings, currentDate);
  }, [storeSettings, currentDate]);

  const isStoreOpen = scheduleStatus.isOpen;

  // 2. Menu Items (with localStorage + Firebase synchronization)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('sabor_brasa_menu_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return MENU_ITEMS;
      }
    }
    return MENU_ITEMS;
  });

  // 3. Neighborhoods (with localStorage + Firebase synchronization)
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodFee[]>(() => {
    const saved = localStorage.getItem('sabor_brasa_neighborhoods');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOldData = parsed.some(
            (n: any) =>
              n.name &&
              (n.name.includes('Bela Vista') ||
                n.name.includes('Pinheiros') ||
                n.name.includes('Cerqueira César'))
          );
          if (!hasOldData) return parsed;
        }
      } catch (e) {
        return NEIGHBORHOODS;
      }
    }
    return NEIGHBORHOODS;
  });

  // 4. Coupons (with localStorage + Firebase synchronization)
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('sabor_brasa_coupons');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return VALID_COUPONS;
      }
    }
    return VALID_COUPONS;
  });

  // 5. Flavors & Sauces (with localStorage + Firebase synchronization)
  const [flavors, setFlavors] = useState<FlavorOption[]>(() => {
    const saved = localStorage.getItem('sabor_brasa_flavors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        return COMMON_FLAVORS;
      }
    }
    return COMMON_FLAVORS;
  });

  // 6. Cart State (with localStorage persistence)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sabor_brasa_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // 7. Orders State (with localStorage + Firebase synchronization)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sabor_brasa_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Cloud Connection Status
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // UI Navigation & Filters
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('hamburguer');
  const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'popular' | 'promos' | 'veggie'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cart & Checkout configuration
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(
    neighborhoods[0]?.name || 'Centro'
  );
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Modals visibility
  const [selectedProductForModal, setSelectedProductForModal] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFlavorCatalogOpen, setIsFlavorCatalogOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [orderForReceiptModal, setOrderForReceiptModal] = useState<Order | null>(null);
  const [activePrintOrder, setActivePrintOrder] = useState<Order | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ----------------- FIREBASE REAL-TIME SYNC (DESKTOP & MOBILE) -----------------
  useEffect(() => {
    // 1. Initial Firestore cloud check and seed if collection empty
    seedInitialFirestoreData(storeSettings, menuItems, neighborhoods, coupons, flavors, orders);

    const applyCloudSnapshot = (cloudData: {
      settings?: StoreSettings;
      menu?: MenuItem[];
      orders?: Order[];
      neighborhoods?: NeighborhoodFee[];
      coupons?: Coupon[];
      flavors?: FlavorOption[];
    }) => {
      if (cloudData.settings) {
        setStoreSettings(sanitizeStoreSettings(cloudData.settings));
      }
      if (cloudData.menu && cloudData.menu.length > 0) {
        setMenuItems(cloudData.menu);
      }
      if (cloudData.orders) {
        setOrders(cloudData.orders);
      }
      if (cloudData.neighborhoods && cloudData.neighborhoods.length > 0) {
        setNeighborhoods(cloudData.neighborhoods);
      }
      if (cloudData.coupons && cloudData.coupons.length > 0) {
        setCoupons(cloudData.coupons);
      }
      if (cloudData.flavors && cloudData.flavors.length > 0) {
        setFlavors(cloudData.flavors);
      }
      setIsFirebaseConnected(true);
    };

    // 2. Real-time Store Settings subscription
    const unsubSettings = subscribeToStoreSettings(
      (newSettings) => {
        const sanitized = sanitizeStoreSettings(newSettings);
        setStoreSettings(sanitized);
        setIsFirebaseConnected(true);
      },
      () => setIsFirebaseConnected(false)
    );

    // 3. Real-time Menu Items subscription
    const unsubMenu = subscribeToMenuItems(
      (newMenu) => {
        if (newMenu && newMenu.length > 0) {
          setMenuItems(newMenu);
        }
        setIsFirebaseConnected(true);
      },
      () => setIsFirebaseConnected(false)
    );

    // 4. Real-time Orders subscription (Live KDS update)
    const unsubOrders = subscribeToOrders(
      (newOrders) => {
        setOrders(newOrders);
        setIsFirebaseConnected(true);
      },
      () => setIsFirebaseConnected(false)
    );

    // 5. Real-time Neighborhoods subscription
    const unsubNeighborhoods = subscribeToNeighborhoods(
      (newNh) => {
        if (newNh && newNh.length > 0) {
          setNeighborhoods(newNh);
        }
        setIsFirebaseConnected(true);
      },
      () => setIsFirebaseConnected(false)
    );

    // 6. Real-time Coupons subscription
    const unsubCoupons = subscribeToCoupons(
      (newCp) => {
        if (newCp && newCp.length > 0) {
          setCoupons(newCp);
        }
        setIsFirebaseConnected(true);
      },
      () => setIsFirebaseConnected(false)
    );

    // 7. Real-time Flavors & Sauces subscription
    const unsubFlavors = subscribeToFlavors(
      (newFlavors) => {
        if (newFlavors && newFlavors.length > 0) {
          setFlavors(newFlavors);
        }
        setIsFirebaseConnected(true);
      },
      () => setIsFirebaseConnected(false)
    );

    // 8. Instant local BroadcastChannel sync across tabs
    const unsubBroadcast = onLocalBroadcastSync(({ type, data }) => {
      if (type === 'settings' && data) setStoreSettings(sanitizeStoreSettings(data));
      if (type === 'menu' && Array.isArray(data)) setMenuItems(data);
      if (type === 'orders' && Array.isArray(data)) setOrders(data);
      if (type === 'neighborhoods' && Array.isArray(data)) setNeighborhoods(data);
      if (type === 'coupons' && Array.isArray(data)) setCoupons(data);
      if (type === 'flavors' && Array.isArray(data)) setFlavors(data);
    });

    // 9. Automatic wake-up & periodic sync for mobile/desktop browsers
    const handleWakeUpOrOnline = () => {
      if (document.visibilityState === 'visible') {
        fetchAllCloudDataOnce()
          .then(applyCloudSnapshot)
          .catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleWakeUpOrOnline);
    window.addEventListener('online', handleWakeUpOrOnline);
    window.addEventListener('focus', handleWakeUpOrOnline);

    const syncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchAllCloudDataOnce()
          .then(applyCloudSnapshot)
          .catch(() => {});
      }
    }, 20000);

    return () => {
      unsubSettings();
      unsubMenu();
      unsubOrders();
      unsubNeighborhoods();
      unsubCoupons();
      unsubFlavors();
      unsubBroadcast();
      document.removeEventListener('visibilitychange', handleWakeUpOrOnline);
      window.removeEventListener('online', handleWakeUpOrOnline);
      window.removeEventListener('focus', handleWakeUpOrOnline);
      clearInterval(syncInterval);
    };
  }, []);

  // Persist to local backup cache
  useEffect(() => {
    localStorage.setItem('sabor_brasa_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('sabor_brasa_menu_v2', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('sabor_brasa_neighborhoods', JSON.stringify(neighborhoods));
  }, [neighborhoods]);

  useEffect(() => {
    localStorage.setItem('sabor_brasa_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('sabor_brasa_flavors', JSON.stringify(flavors));
  }, [flavors]);

  useEffect(() => {
    localStorage.setItem('sabor_brasa_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('sabor_brasa_orders', JSON.stringify(orders));
  }, [orders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Cart Calculations
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cartItems]);

  const deliveryFee = useMemo(() => {
    if (orderType === 'retirada') return 0;
    if (subtotal >= storeSettings.freeDeliveryAbove) return 0;
    const found = neighborhoods.find((n) => n.name === selectedNeighborhood);
    return found ? found.fee : storeSettings.defaultDeliveryFee;
  }, [orderType, subtotal, selectedNeighborhood, storeSettings, neighborhoods]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrder) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    return appliedCoupon.value;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal + deliveryFee - discount);
  }, [subtotal, deliveryFee, discount]);

  // Add Item to Cart with customizations
  const handleAddToCart = (item: MenuItem, quantity: number, options: SelectedItemOption) => {
    let basePrice = item.price;
    if (item.sizes && options.selectedSize) {
      const sObj = item.sizes.find((s) => s.name === options.selectedSize);
      if (sObj) basePrice = item.price * sObj.priceMultiplier;
    }

    const extrasSum = options.selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
    const unitPrice = basePrice + extrasSum;
    const totalPrice = unitPrice * quantity;

    const optionsKey = JSON.stringify({
      doneness: options.doneness,
      flavors: options.selectedFlavors.sort(),
      extras: options.selectedExtras.map((e) => e.id).sort(),
      exclusions: options.selectedExclusions.sort(),
      size: options.selectedSize,
      notes: options.notes
    });

    const cartItemId = `${item.id}-${optionsKey}`;

    const existingIndex = cartItems.findIndex((ci) => ci.cartItemId === cartItemId);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].totalPrice = updated[existingIndex].unitPrice * newQty;
      setCartItems(updated);
    } else {
      const newCartItem: CartItem = {
        cartItemId,
        item,
        quantity,
        options,
        unitPrice,
        totalPrice
      };
      setCartItems([...cartItems, newCartItem]);
    }

    showToast(`"${item.name}" adicionado ao pedido!`);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    const updated = cartItems.map((item) => {
      if (item.cartItemId === cartItemId) {
        return {
          ...item,
          quantity: newQty,
          totalPrice: item.unitPrice * newQty
        };
      }
      return item;
    });
    setCartItems(updated);
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems(cartItems.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Handlers (Local + Firebase)
  const handleOrderCompleted = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setActivePrintOrder(newOrder);
    setCartItems([]);
    setAppliedCoupon(null);

    // Increment timesUsed on the used coupon if present
    if (newOrder.couponCode) {
      setCoupons((prev) => {
        const updated = prev.map((c) => {
          if (c.code.toUpperCase() === newOrder.couponCode?.toUpperCase()) {
            return { ...c, timesUsed: (c.timesUsed || 0) + 1 };
          }
          return c;
        });
        saveCouponsToFirebase(updated).catch(() => {});
        return updated;
      });
    }

    try {
      await saveOrderToFirebase(newOrder);
    } catch (err) {
      console.warn('Firebase order save note:', err);
    }
  };

  const handleOpenReceiptModal = (order: Order) => {
    setOrderForReceiptModal(order);
    setActivePrintOrder(order);
    setIsReceiptModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    try {
      await updateOrderStatusInFirebase(orderId, status);
    } catch (err) {
      console.warn('Firebase update order status error:', err);
    }
  };

  const handleClearOrders = async () => {
    setOrders([]);
    showToast('Histórico de pedidos resetado.');
    try {
      await clearOrdersInFirebase();
    } catch (err) {
      console.warn('Firebase clear orders error:', err);
    }
  };

  // Store Settings Handler
  const handleUpdateStoreSettings = async (newSettings: StoreSettings) => {
    const sanitized = sanitizeStoreSettings(newSettings);
    setStoreSettings(sanitized);
    try {
      await saveStoreSettingsToFirebase(sanitized);
    } catch (err) {
      console.warn('Firebase save settings error:', err);
    }
  };

  // Menu Management Handlers (Local + Firebase)
  const handleAddItem = async (newItem: MenuItem) => {
    const updatedList = [newItem, ...menuItems];
    setMenuItems(updatedList);
    showToast(`"${newItem.name}" adicionado com sucesso!`);
    try {
      await saveMenuItemToFirebase(newItem, updatedList);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firebase add item error:', err);
    }
  };

  const handleUpdateItem = async (updatedItem: MenuItem) => {
    const updatedList = menuItems.map((it) => (it.id === updatedItem.id ? updatedItem : it));
    setMenuItems(updatedList);
    showToast(`"${updatedItem.name}" atualizado!`);
    try {
      await saveMenuItemToFirebase(updatedItem, updatedList);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firebase update item error:', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const updatedList = menuItems.filter((it) => it.id !== itemId);
    setMenuItems(updatedList);
    showToast('Item removido do cardápio.');
    try {
      await deleteMenuItemFromFirebase(itemId, updatedList);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firebase delete item error:', err);
    }
  };

  const handleToggleItemAvailable = async (itemId: string) => {
    const item = menuItems.find((it) => it.id === itemId);
    if (!item) return;
    const updated = { ...item, available: !item.available };
    const updatedList = menuItems.map((it) => (it.id === itemId ? updated : it));
    setMenuItems(updatedList);
    try {
      await saveMenuItemToFirebase(updated, updatedList);
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Firebase toggle item error:', err);
    }
  };

  const handleResetMenu = async () => {
    setMenuItems(MENU_ITEMS);
    showToast('Cardápio restaurado para o padrão original!');
    try {
      await bulkSaveMenuItemsToFirebase(MENU_ITEMS);
    } catch (err) {
      console.warn('Firebase reset menu error:', err);
    }
  };

  const handleApplyMassPriceAdjustment = async (percentage: number, categoryId?: CategoryId) => {
    const updatedList = menuItems.map((it) => {
      if (categoryId && categoryId !== 'todos' && it.category !== categoryId) {
        return it;
      }
      const newPrice = Math.max(0.5, Math.round(it.price * (1 + percentage / 100) * 10) / 10);
      return { ...it, price: newPrice };
    });

    setMenuItems(updatedList);
    showToast(`Preços ajustados em ${percentage > 0 ? '+' : ''}${percentage}%!`);
    try {
      await bulkSaveMenuItemsToFirebase(updatedList);
    } catch (err) {
      console.warn('Firebase mass price adjustment error:', err);
    }
  };

  // Neighborhoods Handler
  const handleUpdateNeighborhoods = async (newNeighborhoods: NeighborhoodFee[]) => {
    setNeighborhoods(newNeighborhoods);
    try {
      await saveNeighborhoodsToFirebase(newNeighborhoods);
    } catch (err) {
      console.warn('Firebase save neighborhoods error:', err);
    }
  };

  // Coupons Handler
  const handleUpdateCoupons = async (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    try {
      await saveCouponsToFirebase(newCoupons);
    } catch (err) {
      console.warn('Firebase save coupons error:', err);
    }
  };

  // Flavors & Sauces Handler
  const handleUpdateFlavors = async (newFlavors: FlavorOption[]) => {
    setFlavors(newFlavors);
    try {
      await saveFlavorsToFirebase(newFlavors);
    } catch (err) {
      console.warn('Firebase save flavors error:', err);
    }
  };

  // Manual Full Sync to Cloud
  const handleSyncAllToFirebase = async () => {
    const results = await Promise.allSettled([
      saveStoreSettingsToFirebase(storeSettings),
      bulkSaveMenuItemsToFirebase(menuItems),
      saveNeighborhoodsToFirebase(neighborhoods),
      saveCouponsToFirebase(coupons),
      saveFlavorsToFirebase(flavors)
    ]);
    const anySuccess = results.some((r) => r.status === 'fulfilled');
    if (anySuccess) {
      setIsFirebaseConnected(true);
      showToast('☁️ Todos os dados sincronizados com o Firebase em tempo real!');
    } else {
      showToast('Erro ao sincronizar com o Firebase.');
    }
  };

  // Filtered Menu Items (with Hamburguer shown first in the menu)
  const filteredItems = useMemo(() => {
    const list = menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'todos' && item.category !== selectedCategory) {
        return false;
      }

      // Quick filter
      if (activeQuickFilter === 'popular' && !item.isPopular) return false;
      if (activeQuickFilter === 'promos' && (!item.originalPrice || item.originalPrice <= item.price)) {
        return false;
      }
      if (activeQuickFilter === 'veggie' && !item.isVegetarian) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(term);
        const matchesDesc = item.description.toLowerCase().includes(term);
        const matchesBadge = item.badge?.toLowerCase().includes(term);
        return matchesName || matchesDesc || matchesBadge;
      }

      return true;
    });

    // When viewing "Todos os Itens", ensure Hambúrguer category appears first
    if (selectedCategory === 'todos' && !searchTerm.trim()) {
      const CATEGORY_PRIORITY: Record<string, number> = {
        hamburguer: 1,
        hamburguer_caseiro: 2,
        frango: 3,
        calabresa: 4,
        lombo: 5,
        file: 6,
        hot_dog: 7,
        diversos: 8,
        porcoes: 9,
        bebidas: 10,
        sobremesas: 11,
        combos: 12
      };

      return [...list].sort((a, b) => {
        const priorityA = CATEGORY_PRIORITY[a.category] ?? 50;
        const priorityB = CATEGORY_PRIORITY[b.category] ?? 50;
        return priorityA - priorityB;
      });
    }

    return list;
  }, [menuItems, selectedCategory, activeQuickFilter, searchTerm]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryId, number> = {
      hamburguer: 0,
      hamburguer_caseiro: 0,
      frango: 0,
      calabresa: 0,
      lombo: 0,
      file: 0,
      hot_dog: 0,
      diversos: 0,
      porcoes: 0,
      bebidas: 0,
      sobremesas: 0,
      combos: 0,
      todos: menuItems.length
    };
    menuItems.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category]++;
      }
    });
    return counts;
  }, [menuItems]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status !== 'concluido' && o.status !== 'cancelado').length;
  }, [orders]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-zinc-950 font-black px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-slide-down border-2 border-amber-400 text-xs sm:text-sm">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        storeSettings={storeSettings}
        scheduleStatus={scheduleStatus}
        cartCount={cartCount}
        cartTotal={subtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFlavorCatalog={() => setIsFlavorCatalogOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeOrdersCount={activeOrdersCount}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isFirebaseConnected={isFirebaseConnected}
      />

      {/* Store Closed Warning Banner if !isStoreOpen */}
      {!isStoreOpen && (
        <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-red-950 border-b border-red-800/80 px-4 py-3">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-red-200">
                  {storeSettings.closedMessage || 'No momento estamos fechados para novos pedidos.'}
                </p>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5 justify-center sm:justify-start">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>
                    Atendimento das {storeSettings.scheduleOpenTime || '18:00'} às {storeSettings.scheduleCloseTime || '23:59'} • <strong className="text-amber-300">{scheduleStatus.nextOpenTimeMessage}</strong>
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition border border-zinc-700 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Painel / Configurar Horários</span>
            </button>
          </div>
        </div>
      )}

      {/* Store Banner / Promo */}
      <StoreBanner
        storeSettings={storeSettings}
        isStoreOpen={isStoreOpen}
        onOpenCouponInfo={() => setIsCartOpen(true)}
        onOpenFlavorCatalog={() => setIsFlavorCatalogOpen(true)}
        coupons={coupons}
      />

      {/* Category Tabs & Quick Filter */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        activeFilter={activeQuickFilter}
        onSelectFilter={setActiveQuickFilter}
        counts={categoryCounts}
      />

      {/* Main Product Showcase Section */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Results title & count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-lg sm:text-2xl text-white tracking-tight">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : selectedCategory === 'hamburguer'
                ? 'Hambúrgueres Tradicionais'
                : selectedCategory === 'hamburguer_caseiro'
                ? 'Hambúrgueres Caseiros & Artesanais'
                : selectedCategory === 'frango'
                ? 'Lanches de Frango & Filé de Frango'
                : selectedCategory === 'calabresa'
                ? 'Lanches de Calabresa Especial'
                : selectedCategory === 'lombo'
                ? 'Lanches de Lombo & Bacon'
                : selectedCategory === 'file'
                ? 'Lanches de Filé Mignon'
                : selectedCategory === 'hot_dog'
                ? 'Hot Dogs Prensados & Especiais'
                : selectedCategory === 'diversos'
                ? 'Lanches Especiais & Tradicionais'
                : selectedCategory === 'porcoes'
                ? 'Porções & Petiscos Turbinados'
                : selectedCategory === 'bebidas'
                ? 'Bebidas & Sucos Gelados'
                : selectedCategory === 'sobremesas'
                ? 'Sobremesas Especiais'
                : selectedCategory === 'combos'
                ? 'Combos & Ofertas Especiais'
                : 'Cardápio Completo na Brasa'}
            </h2>
            <span className="text-xs bg-zinc-800 text-zinc-400 font-mono px-2.5 py-0.5 rounded-full">
              {filteredItems.length} opções
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFlavorCatalogOpen(true)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold hidden sm:flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ver 8 Sabores de Molhos</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Gerenciar Restaurante</span>
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-12 text-center space-y-3 my-6">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-zinc-200">Nenhum item encontrado</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Tente buscar por outro termo ou limpar os filtros de categoria para visualizar todos os lanches e porções disponíveis.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('todos');
                setActiveQuickFilter('all');
              }}
              className="mt-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Ver Todo o Cardápio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const countInCart = cartItems
                .filter((ci) => ci.item.id === item.id)
                .reduce((acc, ci) => acc + ci.quantity, 0);

              return (
                <ProductCard
                  key={item.id}
                  item={item}
                  onSelect={(selected) => setSelectedProductForModal(selected)}
                  countInCart={countInCart}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar for Mobile when cart has items */}
      {cartCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            id="mobile-floating-cart"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black p-3.5 rounded-2xl shadow-2xl shadow-orange-950/80 flex items-center justify-between border border-amber-400/40 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <span className="block font-bold">
                  {cartCount} {cartCount === 1 ? 'item' : 'itens'} no carrinho
                </span>
                <span className="text-[10px] text-amber-100">Toque para ver o pedido</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black bg-black/25 px-2.5 py-1 rounded-lg">
                {formatCurrency(subtotal)}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 text-zinc-400 text-xs py-8 mt-12">
        <div className="container mx-auto px-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-white text-sm mb-2">{storeSettings.name}</h4>
              <p className="text-zinc-400 leading-relaxed max-w-sm">{storeSettings.tagline}</p>
              <div className="mt-3 text-zinc-300">
                <strong>Endereço:</strong> {storeSettings.address}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-2">Horário & Atendimento</h4>
              <p>{storeSettings.openingHours}</p>
              <p className="mt-1">
                WhatsApp de Pedidos: <strong>{storeSettings.phone}</strong>
              </p>
              <p className="text-emerald-400 mt-2 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>🔥 Firebase Firestore em tempo real ativo</span>
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-2">Formas de Pagamento Aceitas</h4>
              <p>• PIX Online Automático com QR Code</p>
              <p>• Cartão de Crédito Online em até 3x</p>
              <p>• Cartão Débito / Crédito / VR na Entrega</p>
              <p>• Dinheiro em Espécie (com troco)</p>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px]">
            <span>
              © {new Date().getFullYear()} {storeSettings.name}. Todos os direitos reservados.
            </span>
            <div className="flex gap-4">
              <button onClick={() => setIsFlavorCatalogOpen(true)} className="hover:text-zinc-300 cursor-pointer">
                Catálogo de Sabores
              </button>
              <button onClick={() => setIsTrackerOpen(true)} className="hover:text-zinc-300 cursor-pointer">
                Acompanhar Pedido
              </button>
              <button onClick={() => setIsAdminOpen(true)} className="hover:text-amber-300 cursor-pointer font-bold text-amber-400 flex items-center gap-1">
                <span>🔒 Painel do Dono (Acesso Restrito)</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= ALL MODALS ================= */}

      {/* 1. Customization & Add to Cart Modal */}
      <ProductModal
        item={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={handleAddToCart}
        globalFlavors={flavors}
      />

      {/* 2. Cart Slide Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        orderType={orderType}
        setOrderType={setOrderType}
        selectedNeighborhood={selectedNeighborhood}
        setSelectedNeighborhood={setSelectedNeighborhood}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        storeSettings={storeSettings}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discount={discount}
        total={total}
        neighborhoods={neighborhoods}
        coupons={coupons}
      />

      {/* 3. Online Checkout & WhatsApp Finalizer Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        orderType={orderType}
        selectedNeighborhood={selectedNeighborhood}
        appliedCoupon={appliedCoupon}
        storeSettings={storeSettings}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        discount={discount}
        total={total}
        onOrderCompleted={handleOrderCompleted}
        onOpenReceiptModal={handleOpenReceiptModal}
        neighborhoods={neighborhoods}
      />

      {/* 4. Flavor & Sauce Catalog Modal */}
      <FlavorCatalogModal
        isOpen={isFlavorCatalogOpen}
        onClose={() => setIsFlavorCatalogOpen(false)}
        flavors={flavors}
        onOpenAdminSauces={() => setIsAdminOpen(true)}
      />

      {/* 5. Order Tracker Timeline Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orders={orders}
        storeSettings={storeSettings}
        onOpenReceiptModal={handleOpenReceiptModal}
      />

      {/* 6. Comprehensive Restaurant Management Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        storeSettings={storeSettings}
        onUpdateStoreSettings={handleUpdateStoreSettings}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onClearOrders={handleClearOrders}
        onOpenReceiptModal={handleOpenReceiptModal}
        menuItems={menuItems}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onToggleItemAvailable={handleToggleItemAvailable}
        onResetMenu={handleResetMenu}
        onApplyMassPriceAdjustment={handleApplyMassPriceAdjustment}
        neighborhoods={neighborhoods}
        onUpdateNeighborhoods={handleUpdateNeighborhoods}
        coupons={coupons}
        onUpdateCoupons={handleUpdateCoupons}
        flavors={flavors}
        onUpdateFlavors={handleUpdateFlavors}
        isFirebaseConnected={isFirebaseConnected}
        onSyncAllToFirebase={handleSyncAllToFirebase}
      />

      {/* 7. Thermal Receipt 80mm Preview & Manual Print Modal */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={orderForReceiptModal}
        storeSettings={storeSettings}
        onUpdateSettings={handleUpdateStoreSettings}
      />

      {/* Persistent Thermal Receipt Print Area for browser window.print() */}
      <div className="hidden print:block">
        <ThermalReceiptPrintArea
          order={activePrintOrder || (orders.length > 0 ? orders[0] : null)}
          storeSettings={storeSettings}
        />
      </div>
    </div>
  );
}

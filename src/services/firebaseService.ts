import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoreSettings, MenuItem, Order, OrderStatus, FlavorOption } from '../types';
import { NeighborhoodFee, Coupon, NEIGHBORHOODS } from '../data/neighborhoods';

// Strip undefined properties recursively so Firestore never rejects payloads
function cleanFirestoreData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Non-blocking wrapper so Firestore daily write quota exhaustion never hangs UI operations
async function safeFirestoreWrite(writePromise: Promise<unknown>): Promise<boolean> {
  try {
    await Promise.race([
      writePromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('FIRESTORE_WRITE_TIMEOUT')), 2500)
      )
    ]);
    return true;
  } catch (err) {
    console.warn('Firestore write deferred (local/broadcast sync active):', err);
    return false;
  }
}

// Cross-tab BroadcastChannel for instant local multi-tab sync in addition to Firestore cloud sync
const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('caseiros_larissa_realtime_sync')
    : null;

export function onLocalBroadcastSync(
  callback: (payload: { type: string; data: any }) => void
): () => void {
  if (!syncChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event?.data?.type) {
      callback(event.data);
    }
  };
  syncChannel.addEventListener('message', handler);
  return () => syncChannel.removeEventListener('message', handler);
}

function broadcastChange(type: string, data: any) {
  try {
    syncChannel?.postMessage({ type, data });
  } catch {
    // ignore broadcast errors
  }
}

// =================== STORE SETTINGS ===================

export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'settings', 'general');
  return onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as StoreSettings);
      }
    },
    (error) => {
      console.warn('Firebase storeSettings subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveStoreSettingsToFirebase(settings: StoreSettings) {
  const cleaned = cleanFirestoreData({
    ...settings,
    updatedAt: new Date().toISOString()
  });
  broadcastChange('settings', cleaned);
  const docRef = doc(db, 'settings', 'general');
  await safeFirestoreWrite(setDoc(docRef, cleaned, { merge: true }));
  return true;
}

// =================== MENU ITEMS ===================
// Stored in doc(db, 'menu', 'list') for atomic real-time sync across all devices without collection list permission errors

export function subscribeToMenuItems(
  onUpdate: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'menu', 'list');
  return onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          onUpdate(data.items as MenuItem[]);
        }
      }
    },
    (error) => {
      console.warn('Firebase menu items subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function bulkSaveMenuItemsToFirebase(items: MenuItem[]) {
  const cleanedItems = cleanFirestoreData(items);
  broadcastChange('menu', cleanedItems);
  const docRef = doc(db, 'menu', 'list');
  await safeFirestoreWrite(
    setDoc(docRef, {
      items: cleanedItems,
      updatedAt: new Date().toISOString()
    })
  );
  return true;
}

export async function saveMenuItemToFirebase(item: MenuItem, fullList?: MenuItem[]) {
  const cleanedItem = cleanFirestoreData(item);
  if (fullList && Array.isArray(fullList)) {
    return bulkSaveMenuItemsToFirebase(fullList);
  }
  const listRef = doc(db, 'menu', 'list');
  const snap = await getDoc(listRef);
  let items: MenuItem[] = [];
  if (snap.exists() && Array.isArray(snap.data()?.items)) {
    items = snap.data().items as MenuItem[];
  }
  const idx = items.findIndex((i) => i.id === cleanedItem.id);
  if (idx >= 0) {
    items[idx] = cleanedItem;
  } else {
    items = [cleanedItem, ...items];
  }
  return bulkSaveMenuItemsToFirebase(items);
}

export async function deleteMenuItemFromFirebase(itemId: string, fullList?: MenuItem[]) {
  if (fullList && Array.isArray(fullList)) {
    return bulkSaveMenuItemsToFirebase(fullList);
  }
  const listRef = doc(db, 'menu', 'list');
  const snap = await getDoc(listRef);
  if (snap.exists() && Array.isArray(snap.data()?.items)) {
    const filtered = (snap.data().items as MenuItem[]).filter((i) => i.id !== itemId);
    await bulkSaveMenuItemsToFirebase(filtered);
  }
  try {
    await deleteDoc(doc(db, 'menu', itemId));
  } catch {
    // ignore individual doc cleanup error
  }
  return true;
}

// =================== ORDERS ===================
// Stored in doc(db, 'orders', 'list') for instant real-time KDS sync across Desktop & Mobile

export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'orders', 'list');
  return onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          const sorted = [...(data.items as Order[])].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          onUpdate(sorted);
        }
      }
    },
    (error) => {
      console.warn('Firebase orders subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveOrderToFirebase(order: Order) {
  const cleanedOrder = cleanFirestoreData(order);
  const listRef = doc(db, 'orders', 'list');
  const snap = await getDoc(listRef);
  let orders: Order[] = [];
  if (snap.exists() && Array.isArray(snap.data()?.items)) {
    orders = snap.data().items as Order[];
  }
  const filtered = orders.filter((o) => o.id !== cleanedOrder.id);
  const updatedOrders = [cleanedOrder, ...filtered].slice(0, 250);

  broadcastChange('orders', updatedOrders);
  await safeFirestoreWrite(
    setDoc(listRef, {
      items: updatedOrders,
      updatedAt: new Date().toISOString()
    })
  );
  return true;
}

export async function updateOrderStatusInFirebase(orderId: string, status: OrderStatus) {
  const listRef = doc(db, 'orders', 'list');
  const snap = await getDoc(listRef);
  if (snap.exists() && Array.isArray(snap.data()?.items)) {
    const items = (snap.data().items as Order[]).map((o) =>
      o.id === orderId ? { ...o, status } : o
    );
    broadcastChange('orders', items);
    await safeFirestoreWrite(
      setDoc(listRef, {
        items: cleanFirestoreData(items),
        updatedAt: new Date().toISOString()
      })
    );
  }
  return true;
}

export async function clearOrdersInFirebase() {
  broadcastChange('orders', []);
  const listRef = doc(db, 'orders', 'list');
  await safeFirestoreWrite(
    setDoc(listRef, {
      items: [],
      updatedAt: new Date().toISOString()
    })
  );
  return true;
}

// =================== NEIGHBORHOODS & DELIVERY ===================

export function subscribeToNeighborhoods(
  onUpdate: (neighborhoods: NeighborhoodFee[]) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'neighborhoods', 'list');
  return onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          const hasOldData = data.items.some(
            (n: any) =>
              n.name &&
              (n.name === 'Bela Vista' ||
                n.name.includes('Pinheiros') ||
                n.name.includes('Cerqueira César'))
          );
          if (hasOldData) {
            saveNeighborhoodsToFirebase(NEIGHBORHOODS).catch(() => {});
            onUpdate(NEIGHBORHOODS);
            return;
          }
          onUpdate(data.items);
        }
      }
    },
    (error) => {
      console.warn('Firebase neighborhoods subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveNeighborhoodsToFirebase(neighborhoods: NeighborhoodFee[]) {
  const cleaned = cleanFirestoreData(neighborhoods);
  broadcastChange('neighborhoods', cleaned);
  const docRef = doc(db, 'neighborhoods', 'list');
  await safeFirestoreWrite(
    setDoc(docRef, {
      items: cleaned,
      updatedAt: new Date().toISOString()
    })
  );
  return true;
}

// =================== COUPONS ===================

export function subscribeToCoupons(
  onUpdate: (coupons: Coupon[]) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'coupons', 'list');
  return onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          onUpdate(data.items);
        }
      }
    },
    (error) => {
      console.warn('Firebase coupons subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveCouponsToFirebase(coupons: Coupon[]) {
  const cleaned = cleanFirestoreData(coupons);
  broadcastChange('coupons', cleaned);
  const docRef = doc(db, 'coupons', 'list');
  await safeFirestoreWrite(
    setDoc(docRef, {
      items: cleaned,
      updatedAt: new Date().toISOString()
    })
  );
  return true;
}

// =================== FLAVORS & SAUCES ===================

export function subscribeToFlavors(
  onUpdate: (flavors: FlavorOption[]) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'flavors', 'list');
  return onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          onUpdate(data.items);
        }
      }
    },
    (error) => {
      console.warn('Firebase flavors subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveFlavorsToFirebase(flavors: FlavorOption[]) {
  const cleaned = cleanFirestoreData(flavors);
  broadcastChange('flavors', cleaned);
  const docRef = doc(db, 'flavors', 'list');
  await safeFirestoreWrite(
    setDoc(docRef, {
      items: cleaned,
      updatedAt: new Date().toISOString()
    })
  );
  return true;
}

// =================== ACTIVE PULL / WAKE-UP REFRESH ===================

export async function fetchAllCloudDataOnce(): Promise<{
  settings?: StoreSettings;
  menu?: MenuItem[];
  orders?: Order[];
  neighborhoods?: NeighborhoodFee[];
  coupons?: Coupon[];
  flavors?: FlavorOption[];
}> {
  const result: {
    settings?: StoreSettings;
    menu?: MenuItem[];
    orders?: Order[];
    neighborhoods?: NeighborhoodFee[];
    coupons?: Coupon[];
    flavors?: FlavorOption[];
  } = {};

  const [settingsSnap, menuSnap, ordersSnap, nhSnap, cpSnap, flSnap] = await Promise.allSettled([
    getDoc(doc(db, 'settings', 'general')),
    getDoc(doc(db, 'menu', 'list')),
    getDoc(doc(db, 'orders', 'list')),
    getDoc(doc(db, 'neighborhoods', 'list')),
    getDoc(doc(db, 'coupons', 'list')),
    getDoc(doc(db, 'flavors', 'list'))
  ]);

  if (settingsSnap.status === 'fulfilled' && settingsSnap.value.exists()) {
    result.settings = settingsSnap.value.data() as StoreSettings;
  }
  if (menuSnap.status === 'fulfilled' && menuSnap.value.exists()) {
    const items = menuSnap.value.data()?.items;
    if (Array.isArray(items) && items.length > 0) result.menu = items as MenuItem[];
  }
  if (ordersSnap.status === 'fulfilled' && ordersSnap.value.exists()) {
    const items = ordersSnap.value.data()?.items;
    if (Array.isArray(items)) result.orders = items as Order[];
  }
  if (nhSnap.status === 'fulfilled' && nhSnap.value.exists()) {
    const items = nhSnap.value.data()?.items;
    if (Array.isArray(items) && items.length > 0) result.neighborhoods = items as NeighborhoodFee[];
  }
  if (cpSnap.status === 'fulfilled' && cpSnap.value.exists()) {
    const items = cpSnap.value.data()?.items;
    if (Array.isArray(items) && items.length > 0) result.coupons = items as Coupon[];
  }
  if (flSnap.status === 'fulfilled' && flSnap.value.exists()) {
    const items = flSnap.value.data()?.items;
    if (Array.isArray(items) && items.length > 0) result.flavors = items as FlavorOption[];
  }

  return result;
}

// =================== SEED / INITIAL CLOUD SYNC ===================

export async function seedInitialFirestoreData(
  defaultSettings: StoreSettings,
  defaultMenu: MenuItem[],
  defaultNeighborhoods: NeighborhoodFee[],
  defaultCoupons: Coupon[],
  defaultFlavors?: FlavorOption[],
  defaultOrders?: Order[]
) {
  try {
    // 1. Settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'settings', 'general'), cleanFirestoreData(defaultSettings));
    }

    // 2. Menu (stored in menu/list)
    const menuDoc = await getDoc(doc(db, 'menu', 'list'));
    if (!menuDoc.exists() || !Array.isArray(menuDoc.data()?.items) || menuDoc.data()?.items.length === 0) {
      await bulkSaveMenuItemsToFirebase(defaultMenu);
    }

    // 3. Orders (stored in orders/list)
    const ordersDoc = await getDoc(doc(db, 'orders', 'list'));
    if (!ordersDoc.exists()) {
      await setDoc(doc(db, 'orders', 'list'), {
        items: cleanFirestoreData(defaultOrders || []),
        updatedAt: new Date().toISOString()
      });
    }

    // 4. Neighborhoods
    const nhDoc = await getDoc(doc(db, 'neighborhoods', 'list'));
    if (!nhDoc.exists()) {
      await saveNeighborhoodsToFirebase(defaultNeighborhoods);
    } else {
      const nhData = nhDoc.data();
      if (nhData && Array.isArray(nhData.items)) {
        const hasOldData = nhData.items.some(
          (n: any) =>
            n.name &&
            (n.name === 'Bela Vista' ||
              n.name.includes('Pinheiros') ||
              n.name.includes('Cerqueira César'))
        );
        if (hasOldData) {
          await saveNeighborhoodsToFirebase(defaultNeighborhoods);
        }
      }
    }

    // 5. Coupons
    const cpDoc = await getDoc(doc(db, 'coupons', 'list'));
    if (!cpDoc.exists()) {
      await saveCouponsToFirebase(defaultCoupons);
    }

    // 6. Flavors / House Sauces
    if (defaultFlavors && defaultFlavors.length > 0) {
      const flDoc = await getDoc(doc(db, 'flavors', 'list'));
      if (!flDoc.exists()) {
        await saveFlavorsToFirebase(defaultFlavors);
      }
    }
  } catch (err) {
    console.warn('Initial Firestore seed note:', err);
  }
}

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoreSettings, MenuItem, Order, OrderStatus } from '../types';
import { NeighborhoodFee, Coupon } from '../data/neighborhoods';

// =================== STORE SETTINGS ===================

export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'settings', 'general');
  return onSnapshot(
    docRef,
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
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving store settings to Firebase:', err);
    throw err;
  }
}

// =================== MENU ITEMS ===================

export function subscribeToMenuItems(
  onUpdate: (items: MenuItem[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'menu');
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: MenuItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as MenuItem);
        });
        onUpdate(items);
      }
    },
    (error) => {
      console.warn('Firebase menu items subscription error:', error);
      if (onError) onError(error);
    }
  );
}

export async function saveMenuItemToFirebase(item: MenuItem) {
  try {
    const docRef = doc(db, 'menu', item.id);
    await setDoc(docRef, item);
    return true;
  } catch (err) {
    console.error('Error saving menu item to Firebase:', err);
    throw err;
  }
}

export async function deleteMenuItemFromFirebase(itemId: string) {
  try {
    const docRef = doc(db, 'menu', itemId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting menu item from Firebase:', err);
    throw err;
  }
}

export async function bulkSaveMenuItemsToFirebase(items: MenuItem[]) {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, 'menu', item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
    return true;
  } catch (err) {
    console.error('Error bulk saving menu items to Firebase:', err);
    throw err;
  }
}

// =================== ORDERS ===================

export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, 'orders');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(docSnap.data() as Order);
      });
      onUpdate(orders);
    },
    (error) => {
      // Fallback query if ordering index is preparing
      console.warn('Firebase orders subscription with orderBy failed, falling back to direct collection:', error);
      return onSnapshot(
        colRef,
        (snapshot) => {
          const orders: Order[] = [];
          snapshot.forEach((docSnap) => {
            orders.push(docSnap.data() as Order);
          });
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          onUpdate(orders);
        },
        onError
      );
    }
  );
}

export async function saveOrderToFirebase(order: Order) {
  try {
    const docRef = doc(db, 'orders', order.id);
    await setDoc(docRef, order);
    return true;
  } catch (err) {
    console.error('Error saving order to Firebase:', err);
    throw err;
  }
}

export async function updateOrderStatusInFirebase(orderId: string, status: OrderStatus) {
  try {
    const docRef = doc(db, 'orders', orderId);
    await setDoc(docRef, { status }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error updating order status in Firebase:', err);
    throw err;
  }
}

export async function clearOrdersInFirebase() {
  try {
    const colRef = collection(db, 'orders');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    return true;
  } catch (err) {
    console.error('Error clearing orders in Firebase:', err);
    throw err;
  }
}

// =================== NEIGHBORHOODS & DELIVERY ===================

export function subscribeToNeighborhoods(
  onUpdate: (neighborhoods: NeighborhoodFee[]) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'neighborhoods', 'list');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
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
  try {
    const docRef = doc(db, 'neighborhoods', 'list');
    await setDoc(docRef, { items: neighborhoods });
    return true;
  } catch (err) {
    console.error('Error saving neighborhoods to Firebase:', err);
    throw err;
  }
}

// =================== COUPONS ===================

export function subscribeToCoupons(
  onUpdate: (coupons: Coupon[]) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, 'coupons', 'list');
  return onSnapshot(
    docRef,
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
  try {
    const docRef = doc(db, 'coupons', 'list');
    await setDoc(docRef, { items: coupons });
    return true;
  } catch (err) {
    console.error('Error saving coupons to Firebase:', err);
    throw err;
  }
}

// =================== SEED / INITIAL CLOUD SYNC ===================

export async function seedInitialFirestoreData(
  defaultSettings: StoreSettings,
  defaultMenu: MenuItem[],
  defaultNeighborhoods: NeighborhoodFee[],
  defaultCoupons: Coupon[]
) {
  try {
    // 1. Settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'settings', 'general'), defaultSettings);
    }

    // 2. Menu
    const menuSnapshot = await getDocs(collection(db, 'menu'));
    if (menuSnapshot.empty) {
      await bulkSaveMenuItemsToFirebase(defaultMenu);
    }

    // 3. Neighborhoods
    const nhDoc = await getDoc(doc(db, 'neighborhoods', 'list'));
    if (!nhDoc.exists()) {
      await setDoc(doc(db, 'neighborhoods', 'list'), { items: defaultNeighborhoods });
    }

    // 4. Coupons
    const cpDoc = await getDoc(doc(db, 'coupons', 'list'));
    if (!cpDoc.exists()) {
      await setDoc(doc(db, 'coupons', 'list'), { items: defaultCoupons });
    }
  } catch (err) {
    console.warn('Initial Firestore seed note:', err);
  }
}

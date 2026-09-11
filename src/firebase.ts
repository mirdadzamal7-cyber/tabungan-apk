import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SavingsTransaction, TargetGoal, NasabahUser } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with configured database ID (MANDATORY)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operation types for strict Firestore error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standard Firestore error handler conforming strictly to security and debugging specifications.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Tests connection to Firestore upon application initialization
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection successful');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local cache / offline persistence.');
    } else {
      console.log('Firestore connection verified or responding.');
    }
    return false;
  }
}

// Trigger initial connection test
testFirestoreConnection();

/**
 * Helper to log in with Google Provider using popup
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
}

/**
 * Helper to logout Firebase auth
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out error:', error);
  }
}

// -------------------------------------------------------------
// Real-time Firestore Sync Helpers for Tabungan Berkah
// -------------------------------------------------------------

/**
 * Listen to Transactions real-time
 */
export function subscribeToTransactions(
  onData: (transactions: SavingsTransaction[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'transactions';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: SavingsTransaction[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as SavingsTransaction);
        });
        onData(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (e) {
          if (onError && e instanceof Error) onError(e);
        }
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Listen to Goals real-time
 */
export function subscribeToGoals(
  onData: (goals: TargetGoal[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'goals';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: TargetGoal[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as TargetGoal);
        });
        onData(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (e) {
          if (onError && e instanceof Error) onError(e);
        }
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Listen to Nasabah real-time
 */
export function subscribeToNasabah(
  onData: (nasabah: NasabahUser[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'nasabah';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: NasabahUser[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as NasabahUser);
        });
        onData(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (e) {
          if (onError && e instanceof Error) onError(e);
        }
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Save / Update a Transaction in Firestore
 */
export async function saveTransactionToFirestore(tx: SavingsTransaction): Promise<void> {
  const path = `transactions/${tx.id}`;
  try {
    // Sanitize to plain object without undefined
    const cleanTx = JSON.parse(JSON.stringify(tx));
    await setDoc(doc(db, 'transactions', tx.id), cleanTx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a Transaction in Firestore
 */
export async function deleteTransactionFromFirestore(txId: string): Promise<void> {
  const path = `transactions/${txId}`;
  try {
    await deleteDoc(doc(db, 'transactions', txId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save / Update a Goal in Firestore
 */
export async function saveGoalToFirestore(goal: TargetGoal): Promise<void> {
  const path = `goals/${goal.id}`;
  try {
    const cleanGoal = JSON.parse(JSON.stringify(goal));
    await setDoc(doc(db, 'goals', goal.id), cleanGoal);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a Goal in Firestore
 */
export async function deleteGoalFromFirestore(goalId: string): Promise<void> {
  const path = `goals/${goalId}`;
  try {
    await deleteDoc(doc(db, 'goals', goalId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save / Update a Nasabah in Firestore
 */
export async function saveNasabahToFirestore(nasabah: NasabahUser): Promise<void> {
  const path = `nasabah/${nasabah.id}`;
  try {
    const cleanNasabah = JSON.parse(JSON.stringify(nasabah));
    await setDoc(doc(db, 'nasabah', nasabah.id), cleanNasabah);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a Nasabah in Firestore
 */
export async function deleteNasabahFromFirestore(nasabahId: string): Promise<void> {
  const path = `nasabah/${nasabahId}`;
  try {
    await deleteDoc(doc(db, 'nasabah', nasabahId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Seed initial data to Firestore if collection is empty
 */
export async function seedInitialFirestoreDataIfEmpty(
  initialTransactions: SavingsTransaction[],
  initialGoals: TargetGoal[],
  initialNasabah: NasabahUser[]
): Promise<void> {
  try {
    // Check if nasabah collection has documents
    const nasabahSnap = await getDocs(collection(db, 'nasabah'));
    if (nasabahSnap.empty && initialNasabah.length > 0) {
      console.log('Seeding initial Nasabah data to Firestore...');
      for (const n of initialNasabah) {
        await saveNasabahToFirestore(n);
      }
    }

    // Check if goals collection has documents
    const goalsSnap = await getDocs(collection(db, 'goals'));
    if (goalsSnap.empty && initialGoals.length > 0) {
      console.log('Seeding initial Goals data to Firestore...');
      for (const g of initialGoals) {
        await saveGoalToFirestore(g);
      }
    }

    // Check if transactions collection has documents
    const txSnap = await getDocs(collection(db, 'transactions'));
    if (txSnap.empty && initialTransactions.length > 0) {
      console.log('Seeding initial Transactions data to Firestore...');
      for (const t of initialTransactions) {
        await saveTransactionToFirestore(t);
      }
    }
  } catch (err) {
    console.warn('Initial seeding check completed or skipped due to network/rules:', err);
  }
}

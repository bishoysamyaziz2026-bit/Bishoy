import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot, setDoc, getDoc, serverTimestamp, collection, query, Query, onSnapshot as onSnapCollection, DocumentData } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { roles as ROLES_LIST, checkSovereignStatus } from '@/lib/roles';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: User | null;
  profile: any | null;
  role: string;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState extends UserAuthState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, firebaseApp, firestore, auth }) => {
  const [authState, setAuthState] = useState<UserAuthState>({
    user: null, profile: null, role: ROLES_LIST.USER, isUserLoading: true, userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) return;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const sovereign = checkSovereignStatus(firebaseUser.email);
        const initialRole = sovereign.isOwner ? ROLES_LIST.ADMIN : ROLES_LIST.USER;
        const userRef = doc(firestore, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const newProfile = {
            id: firebaseUser.uid, email: firebaseUser.email,
            fullName: firebaseUser.displayName || 'مواطن سيادي',
            balance: sovereign.isOwner ? 999999 : 50,
            role: initialRole, createdAt: serverTimestamp(), isBanned: false
          };
          await setDoc(userRef, newProfile);
        } else if (sovereign.isOwner) {
          await setDoc(userRef, { balance: 999999, role: ROLES_LIST.ADMIN }, { merge: true });
        }
        const unsubscribeProfile = onSnapshot(userRef, (snap) => {
          const data = snap.data();
          let detectedRole = data?.role || initialRole;
          if (sovereign.isOwner) detectedRole = ROLES_LIST.ADMIN;
          setAuthState({ user: firebaseUser, profile: data || null, role: detectedRole, isUserLoading: false, userError: null });
        });
        return () => unsubscribeProfile();
      } else {
        setAuthState({ user: null, profile: null, role: ROLES_LIST.USER, isUserLoading: false, userError: null });
      }
    });
    return () => unsubscribeAuth();
  }, [auth, firestore]);

  const contextValue = useMemo(() => ({
    ...authState,
    areServicesAvailable: !!(firebaseApp && firestore && auth),
    firebaseApp, firestore, auth,
    signOut: () => firebaseSignOut(auth),
    signInWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    }
  }), [firebaseApp, firestore, auth, authState]);

  return <FirebaseContext.Provider value={contextValue}>{children}</FirebaseContext.Provider>;
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) throw new Error('useFirebase must be used within a FirebaseProvider.');
  return context;
};

export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useUser = () => {
  const { user, profile, role, isUserLoading, userError, signOut, signInWithGoogle } = useFirebase();
  return { user, profile, role, isUserLoading, userError, signOut, signInWithGoogle };
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}

// Collection hook
export function useCollection(queryRef: Query<DocumentData> | null) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!queryRef) { setIsLoading(false); return; }
    setIsLoading(true);
    const unsub = onSnapCollection(queryRef, (snapshot) => {
      setData(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    }, () => setIsLoading(false));
    return () => unsub();
  }, [queryRef]);

  return { data, isLoading };
}

// Doc hook
export function useDoc(docRef: any) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!docRef) { setIsLoading(false); return; }
    setIsLoading(true);
    const unsub = onSnapshot(docRef, (snap: any) => {
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setIsLoading(false);
    }, () => setIsLoading(false));
    return () => unsub();
  }, [docRef]);

  return { data, isLoading };
}

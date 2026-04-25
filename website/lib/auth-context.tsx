"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface UserProfile {
  role: "admin" | "student";
  name: string;
  rfidUid: string | null;
}

export interface SimpleUser {
  uid: string;
  email: string | null;
}

interface AuthContextValue {
  user: SimpleUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ADMIN_USER: SimpleUser = { uid: "__admin__", email: "admin" };
const ADMIN_PROFILE: UserProfile = { role: "admin", name: "Admin", rfidUid: null };
const SESSION_KEY = "rfid_admin_session";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminActive, setAdminActive] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<SimpleUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Re-runs when adminActive toggles so Firebase listener is set up / torn down correctly
  useEffect(() => {
    if (adminActive) {
      setProfile(ADMIN_PROFILE);
      setLoading(false);
      return; // no Firebase listener needed while admin is active
    }

    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        const snap = await getDoc(doc(db, "users", fu.uid));
        const p: UserProfile = snap.exists()
          ? (snap.data() as UserProfile)
          : { role: "student", name: fu.email ?? "", rfidUid: null };
        setFirebaseUser({ uid: fu.uid, email: fu.email });
        setProfile(p);
      } else {
        setFirebaseUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [adminActive]);

  // Restore admin session after a page refresh
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      setAdminActive(true);
    }
  }, []);

  const user: SimpleUser | null = adminActive ? ADMIN_USER : firebaseUser;

  const login = async (username: string, password: string) => {
    if (username === "admin" && password === "admin123") {
      sessionStorage.setItem(SESSION_KEY, "1");
      setAdminActive(true);
      return;
    }
    const cred = await signInWithEmailAndPassword(auth, username, password);
    setFirebaseUser({ uid: cred.user.uid, email: cred.user.email });
  };

  const logout = async () => {
    if (adminActive) {
      sessionStorage.removeItem(SESSION_KEY);
      setAdminActive(false);
      setProfile(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

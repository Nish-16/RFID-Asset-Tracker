"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

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
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface StudentSession {
  rfidUid: string;
  name: string;
}

const ADMIN_USER: SimpleUser = { uid: "__admin__", email: "admin" };
const ADMIN_PROFILE: UserProfile = { role: "admin", name: "Admin", rfidUid: null };
const ADMIN_SESSION_KEY = "rfid_admin_session";
const STUDENT_SESSION_KEY = "rfid_student_session";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [adminActive, setAdminActive] = useState(false);
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session after page refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(ADMIN_SESSION_KEY)) {
      setAdminActive(true);
    } else {
      const stored = sessionStorage.getItem(STUDENT_SESSION_KEY);
      if (stored) {
        try {
          setStudentSession(JSON.parse(stored));
        } catch {
          sessionStorage.removeItem(STUDENT_SESSION_KEY);
        }
      }
    }
    setLoading(false);
  }, []);

  const user: SimpleUser | null = adminActive
    ? ADMIN_USER
    : studentSession
    ? { uid: studentSession.rfidUid, email: null }
    : null;

  const profile: UserProfile | null = adminActive
    ? ADMIN_PROFILE
    : studentSession
    ? { role: "student", name: studentSession.name, rfidUid: studentSession.rfidUid }
    : null;

  const login = async (identifier: string, password?: string) => {
    if (identifier === "admin" && password === "admin123") {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
      setAdminActive(true);
      return;
    }
    // Student login: look up by roll number in Firestore
    const snap = await getDocs(
      query(collection(db, "students"), where("roll", "==", identifier))
    );
    if (snap.empty) throw new Error("No student found with that roll number.");
    const d = snap.docs[0];
    const session: StudentSession = {
      rfidUid: d.id,
      name: (d.data().name as string) ?? "",
    };
    sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
    setStudentSession(session);
  };

  const logout = async () => {
    if (adminActive) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      setAdminActive(false);
    } else {
      sessionStorage.removeItem(STUDENT_SESSION_KEY);
      setStudentSession(null);
    }
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

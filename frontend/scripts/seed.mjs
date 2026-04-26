import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dir, "../.env.local");
  try {
    const content = readFileSync(envPath, "utf8");
    return Object.fromEntries(
      content
        .split("\n")
        .filter((l) => l.includes("=") && !l.startsWith("#"))
        .map((l) => {
          const [k, ...v] = l.split("=");
          return [k.trim(), v.join("=").trim()];
        })
    );
  } catch {
    console.error("[ERR]  Could not read .env.local");
    process.exit(1);
  }
}

const env = loadEnv();

const app = initializeApp({
  apiKey:            env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db   = getFirestore(app);

const STUDENT_EMAIL    = "student@lab.local";
const STUDENT_PASSWORD = "student123";
const STUDENT_RFID     = "DEMO001";
const STUDENT_NAME     = "Demo Student";

const COMPONENTS = [
  { code: "ARD",  name: "Arduino UNO",          totalCount: 3 },
  { code: "BB",   name: "Breadboard",           totalCount: 5 },
  { code: "SM",   name: "Servo Motor",          totalCount: 2 },
  { code: "LCD",  name: "16×2 LCD Display",     totalCount: 2 },
  { code: "OSC",  name: "Oscilloscope Probe",   totalCount: 1 },
  { code: "SEN",  name: "IR Sensor",            totalCount: 4 },
  { code: "RES",  name: "Resistor Kit (100pc)", totalCount: 6 },
  { code: "ESP32",name: "ESP32",                totalCount: 3 },
  { code: "RPI",  name: "Raspberry Pi 4",       totalCount: 2 },
];

async function seedFirestore() {
  const now = Date.now();
  const hr  = 60 * 60 * 1000;

  // Students
  await setDoc(doc(db, "students", STUDENT_RFID), {
    uid: STUDENT_RFID, name: STUDENT_NAME, roll: "2021CS001", branch: "CSE",
  });
  console.log("[OK]  students doc written");

  // Components
  for (const c of COMPONENTS) {
    await setDoc(doc(db, "components", c.code), c);
  }
  console.log(`[OK]  ${COMPONENTS.length} components written`);

  // Transactions (skip if already seeded)
  const existing = await getDocs(
    query(collection(db, "transactions"), where("uid", "==", STUDENT_RFID))
  );
  if (existing.size > 0) {
    console.log("[INFO]  Transactions already seeded -- skipping");
  } else {
    const txs = [
      { uid: STUDENT_RFID,  studentName: STUDENT_NAME,    componentCode: "ARD",  componentName: "Arduino UNO",          issueTime: new Date(now - 2*hr).toISOString(), returnTime: null,                               status: "issued"   },
      { uid: STUDENT_RFID,  studentName: STUDENT_NAME,    componentCode: "SM",   componentName: "Servo Motor",          issueTime: new Date(now - 3*hr).toISOString(), returnTime: null,                               status: "issued"   },
      { uid: STUDENT_RFID,  studentName: STUDENT_NAME,    componentCode: "BB",   componentName: "Breadboard",           issueTime: new Date(now - 5*hr).toISOString(), returnTime: new Date(now - 1*hr).toISOString(), status: "returned" },
      { uid: "A1B2C3D4",    studentName: "Rahul Sharma",  componentCode: "SEN",  componentName: "IR Sensor",            issueTime: new Date(now - 4*hr).toISOString(), returnTime: null,                               status: "issued"   },
      { uid: "E5F6G7H8",    studentName: "Priya Patel",   componentCode: "LCD",  componentName: "16x2 LCD Display",     issueTime: new Date(now - 6*hr).toISOString(), returnTime: new Date(now - 2*hr).toISOString(), status: "returned" },
      { uid: "K9L0M1N2",    studentName: "Amit Rathore",  componentCode: "OSC",  componentName: "Oscilloscope Probe",   issueTime: new Date(now - 7*hr).toISOString(), returnTime: new Date(now - 3*hr).toISOString(), status: "returned" },
    ];
    for (const tx of txs) await addDoc(collection(db, "transactions"), tx);
    console.log(`[OK]  ${txs.length} transactions written`);
  }
}

async function createStudentAuth() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, STUDENT_EMAIL, STUDENT_PASSWORD);
    const uid  = cred.user.uid;
    await setDoc(doc(db, "users", uid), {
      role: "student", name: STUDENT_NAME, rfidUid: STUDENT_RFID,
    });
    console.log("[OK]  Student auth user created:", uid);
    console.log("[OK]  users doc written");
    return true;
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      console.log("[INFO]  Student auth user already exists");
      return true;
    }
    if (e.code === "auth/configuration-not-found" || e.code === "auth/operation-not-allowed") {
      console.log("[WARN]  Email/Password auth not enabled yet -- skipping auth user");
      console.log("        Firebase Console -> Authentication -> Sign-in method -> Email/Password -> Enable");
      console.log("        Re-run this script after enabling it");
      return false;
    }
    throw e;
  }
}

async function seed() {
  console.log("\n[SEED]  Seeding:", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "\n");

  await seedFirestore();
  const authOk = await createStudentAuth();

  console.log(`
------------------------------------
  Credentials
------------------------------------
  Admin  (hardcoded)
    Username : admin
    Password : admin123

  Demo Student  (Firebase Auth)
    Email    : student@lab.local
    Password : student123
    ${authOk ? "Status   : [OK] Ready" : "Status   : [WARN] Enable Email/Password auth, then re-run"}
------------------------------------
`);

  process.exit(0);
}

seed().catch((e) => {
  console.error("\n[ERR]  Seed failed:", e.message);
  process.exit(1);
});

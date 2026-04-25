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
    console.error("❌  Could not read .env.local");
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
  { code: "ARD001", name: "Arduino UNO",          available: true  },
  { code: "ARD002", name: "Arduino UNO",          available: false },
  { code: "BB001",  name: "Breadboard",           available: true  },
  { code: "SM001",  name: "Servo Motor",          available: false },
  { code: "LCD001", name: "16×2 LCD Display",     available: true  },
  { code: "OSC001", name: "Oscilloscope Probe",   available: true  },
  { code: "SEN001", name: "IR Sensor",            available: false },
  { code: "RES001", name: "Resistor Kit (100pc)", available: true  },
];

async function seedFirestore() {
  const now = Date.now();
  const hr  = 60 * 60 * 1000;

  // Students
  await setDoc(doc(db, "students", STUDENT_RFID), {
    uid: STUDENT_RFID, name: STUDENT_NAME, roll: "2021CS001", branch: "CSE",
  });
  console.log("✓  students doc written");

  // Components
  for (const c of COMPONENTS) {
    await setDoc(doc(db, "components", c.code), c);
  }
  console.log(`✓  ${COMPONENTS.length} components written`);

  // Transactions (skip if already seeded)
  const existing = await getDocs(
    query(collection(db, "transactions"), where("uid", "==", STUDENT_RFID))
  );
  if (existing.size > 0) {
    console.log("ℹ  Transactions already seeded — skipping");
  } else {
    const txs = [
      { uid: STUDENT_RFID,  studentName: STUDENT_NAME,    componentCode: "ARD002", componentName: "Arduino UNO",       issueTime: new Date(now - 2*hr).toISOString(), returnTime: null,                               status: "issued"   },
      { uid: STUDENT_RFID,  studentName: STUDENT_NAME,    componentCode: "SM001",  componentName: "Servo Motor",       issueTime: new Date(now - 3*hr).toISOString(), returnTime: null,                               status: "issued"   },
      { uid: STUDENT_RFID,  studentName: STUDENT_NAME,    componentCode: "BB001",  componentName: "Breadboard",        issueTime: new Date(now - 5*hr).toISOString(), returnTime: new Date(now - 1*hr).toISOString(), status: "returned" },
      { uid: "A1B2C3D4",    studentName: "Rahul Sharma",  componentCode: "SEN001", componentName: "IR Sensor",         issueTime: new Date(now - 4*hr).toISOString(), returnTime: null,                               status: "issued"   },
      { uid: "E5F6G7H8",    studentName: "Priya Patel",   componentCode: "LCD001", componentName: "16×2 LCD Display",  issueTime: new Date(now - 6*hr).toISOString(), returnTime: new Date(now - 2*hr).toISOString(), status: "returned" },
      { uid: "K9L0M1N2",    studentName: "Amit Rathore",  componentCode: "OSC001", componentName: "Oscilloscope Probe",issueTime: new Date(now - 7*hr).toISOString(), returnTime: new Date(now - 3*hr).toISOString(), status: "returned" },
    ];
    for (const tx of txs) await addDoc(collection(db, "transactions"), tx);
    console.log(`✓  ${txs.length} transactions written`);
  }
}

async function createStudentAuth() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, STUDENT_EMAIL, STUDENT_PASSWORD);
    const uid  = cred.user.uid;
    await setDoc(doc(db, "users", uid), {
      role: "student", name: STUDENT_NAME, rfidUid: STUDENT_RFID,
    });
    console.log("✓  Student auth user created:", uid);
    console.log("✓  users doc written");
    return true;
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      console.log("ℹ  Student auth user already exists");
      return true;
    }
    if (e.code === "auth/configuration-not-found" || e.code === "auth/operation-not-allowed") {
      console.log("⚠   Email/Password auth not enabled yet — skipping auth user");
      console.log("    → Firebase Console → Authentication → Sign-in method → Email/Password → Enable");
      console.log("    → Re-run this script after enabling it");
      return false;
    }
    throw e;
  }
}

async function seed() {
  console.log("\n🌱  Seeding:", env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "\n");

  await seedFirestore();
  const authOk = await createStudentAuth();

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Admin  (hardcoded — works now)
    Username : admin
    Password : admin123

  Demo Student  (Firebase Auth)
    Email    : student@lab.local
    Password : student123
    ${authOk ? "Status   : ✓ Ready" : "Status   : ⚠  Enable Email/Password auth, then re-run"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  process.exit(0);
}

seed().catch((e) => {
  console.error("\n❌  Seed failed:", e.message);
  process.exit(1);
});

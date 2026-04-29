import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ===== LOAD ENV =====
const __dir = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dir, "../.env.local");
  const content = readFileSync(envPath, "utf8");

  return Object.fromEntries(
    content
      .split("\n")
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => {
        const [k, ...v] = l.split("=");
        return [k.trim(), v.join("=").trim()];
      }),
  );
}

const env = loadEnv();

// ===== FIREBASE INIT =====
const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getFirestore(app);

// ===== DATA =====

const STUDENTS = [
  {
    id: "4A115",
    name: "Nishesh",
    roll: "2021CS001",
    branch: "CSE",
  },
  {
    id: "A1B2C3",
    name: "Rahul",
    roll: "2021CS002",
    branch: "ECE",
  },
];

const COMPONENTS = [
  { code: "101", name: "Screen", totalCount: 5 },
  { code: "102", name: "ESP32", totalCount: 3 },
  { code: "103", name: "Sensor", totalCount: 10 },
];

// ===== HELPERS =====

async function safeSet(collection, id, data) {
  const ref = doc(db, collection, id);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    console.log(`[SKIP] ${collection}/${id} already exists`);
    return;
  }

  await setDoc(ref, data);
  console.log(`[OK] ${collection}/${id} created`);
}

// ===== SEED =====

async function seedStudents() {
  console.log("\nSeeding Students...");

  for (const s of STUDENTS) {
    await safeSet("students", s.id, {
      name: s.name,
      roll: s.roll,
      branch: s.branch,
    });
  }
}

async function seedComponents() {
  console.log("\nSeeding Components...");

  for (const c of COMPONENTS) {
    await safeSet("components", c.code, {
      name: c.name,
      code: c.code,
      totalCount: c.totalCount,
    });
  }
}

// ===== MAIN =====

async function seed() {
  console.log("\n[START] Seeding Firestore\n");

  await seedStudents();
  await seedComponents();

  console.log("\n[DONE] Database seeded successfully\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[ERROR]", err);
  process.exit(1);
});

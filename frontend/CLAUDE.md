@AGENTS.md



# Project Specification: Smart RFID-Based Asset Issuance and Tracking System

## Overview

This project is an IoT-based system that manages the issuing and returning of lab components using RFID and a cloud backend (Firebase).

The system consists of:

* ESP32 + RC522 RFID reader + keypad (hardware layer)
* Firebase Firestore (database)
* Next.js web dashboard (frontend)

The goal is to track:

* Which student issued which component
* When it was issued and returned
* Current inventory status (available vs issued)

---

## Core Concept

Students are identified using RFID cards.

Each student has a unique RFID UID.
This UID is used to fetch student details from Firestore.

There is NO password-based authentication for students.

---

## Authentication Strategy

* Firebase Auth is used ONLY for admin/dashboard login
* Students are identified ONLY via RFID UID
* DO NOT store passwords in Firestore

---

## Firestore Data Model

### 1. students (collection)

Document ID = RFID UID

Fields:

* name (string)
* roll (string)
* branch (string)
* authUid (optional, for admin linkage)

Example:
{
"name": "Nish",
"roll": "123",
"branch": "CSE"
}

---

### 2. components (collection)

Document ID = component code

Fields:

* name (string)
* code (string)
* available (boolean) [optional, not source of truth]

Example:
{
"name": "ESP32",
"code": "101",
"available": false
}

---

### 3. transactions (collection)

Each document represents one issue-return cycle.

Fields:

* rfidUid (string)
* studentName (string)
* componentCode (string)
* componentName (string)
* issueTime (timestamp)
* returnTime (timestamp | null)
* status ("issued" | "returned")

Example:
{
"rfidUid": "D0A5D35F",
"studentName": "Nish",
"componentCode": "101",
"componentName": "ESP32",
"issueTime": "...",
"returnTime": null,
"status": "issued"
}

---

## Core Logic

### Issue Flow:

1. RFID card scanned
2. Component code entered via keypad
3. System:

   * Fetch student via RFID UID
   * Check if component is already issued
   * If available → create transaction with status = "issued"

---

### Return Flow:

1. RFID card scanned
2. Component code entered
3. System:

   * Find active transaction (status = "issued" and returnTime = null)
   * Update:

     * returnTime
     * status = "returned"

---

## Important Rule

DO NOT rely on `components.available` as the source of truth.

The true state of inventory MUST be derived from transactions:

* If a component has an active transaction → it is issued
* Otherwise → it is available

---

## Frontend Requirements (Next.js)

### Pages:

1. `/` (Landing Page)

* Simple explanation of the project
* Login button → redirects to dashboard

2. `/dashboard`

* Shows transaction history (table)
* Real-time updates using Firestore

3. `/inventory`

* Shows all components
* Displays:

  * Available / Issued status
  * If issued → show student name

---

## Inventory Logic (Frontend)

* Fetch all components
* Fetch all transactions where status = "issued"
* Create mapping:
  componentCode → studentName
* Merge data:

  * If componentCode exists in mapping → issued
  * Else → available

---

## UI/UX Guidelines

* Maintain a **light theme only**
* Clean, minimal, human-designed UI
* Avoid over-designed or AI-like layouts
* Use Tailwind CSS
* Use simple cards and tables
* Keep spacing natural (not overly symmetric)
* Avoid excessive gradients or animations

---

## Code Guidelines

* Use functional React components
* Use hooks (useEffect, useState)
* Keep logic modular
* Do NOT over-engineer
* This is a prototype project

---

## Constraints

* No complex backend required
* No server-side rendering required
* Keep everything client-side with Firebase
* Focus on clarity and simplicity

---

## Goal for Claude

When generating code:

* Follow the above architecture strictly
* Do not invent new data structures
* Do not add unnecessary complexity
* Keep implementation clean and practical
* Maintain light theme across all pages

# DU Seva (CUET Mock Test Platform)

Welcome to **DU Seva**, India's sweetest, most powerful mock test platform designed specifically to calm student nerves and boost their percentile for the Common University Entrance Test (CUET).

This project is a full-featured, responsive Next.js application integrated with Firebase for database, authentication, storage, and Razorpay for payment processing.

---

## 🚀 Key Features

* **Beautiful & Aesthetic UI**: Modern dark theme with smooth Framer Motion animations, custom ambient backgrounds, and glassmorphic designs.
* **CUET Practice Mocks**: Rich simulation environment mimicking actual test patterns, supporting complex mathematical equations (rendered using KaTeX) and media support.
* **Detailed Analytics**: Comprehensive performance reports, scorecard breakdowns, and insights for students to identify weak spots.
* **Robust Admin Dashboard**: Complete administrative panel for mock creation, managing CSV imports of questions via PapaParse, and processing student records.
* **Secure Payments**: Smooth checkouts integrated with Razorpay.
* **Firebase Integration**: Authenticated student login, real-time Firestore database storage, and secure Cloud Storage.

---

## 🛠️ Tech Stack

* **Framework**: Next.js (App Router, Tailwind CSS, TypeScript)
* **Animations**: Framer Motion
* **Database & Auth**: Firebase / Firebase Admin SDK
* **Rich Text Editing**: TipTap (Starter Kit with Subscript, Superscript, Underline, and Image extensions)
* **Equations & Rendering**: KaTeX & React Markdown
* **Payments**: Razorpay
* **Parsing**: PapaParse

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
# Client-side Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Client-side Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Server-side Firebase Admin (Service Account JSON)
FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}

# Server-side Razorpay Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Code Quality & Linting
To check and fix code issues, run:
```bash
npm run lint
```


# VMS — Visitor Management System

A complete, production-quality **Visitor Management System** prototype built for **ABC Manufacturing Industries Pvt. Ltd.**

Implemented as a React + Vite + Tailwind CSS single-page application with browser-local storage (no backend required).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
cd Frontend
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

Output goes to `dist/`. Preview the build with:

```bash
npm run preview
```

---

## 🔑 Demo Credentials

| Role | Username | Password | Dashboard |
|------|----------|----------|-----------|
| Security Guard | `guard` | `Guard@123` | Security Gate Dashboard |
| Plant Head | `planthead` | `Plant@123` | Approval Dashboard |
| HR / Administrator | `admin` | `Admin@123` | Admin Dashboard |

> ⚠️ These are demo-mode credentials only. This is a browser-local prototype — not production-secure authentication.

---

## 📋 Features

### Security Guard
- Register new visitors with photograph, all contact details, and visit information
- Generate unique visitor tokens (format: `VIS-YYYY-NNNNN`)
- View visitor list with search by name, token, or mobile
- Record check-in and check-out by token lookup
- View and print approved gate passes

### Plant Head
- View pending approval requests in a split-panel interface
- Approve, reject, or hold visitor requests with mandatory reasons
- View all processed requests with decision history
- Access digital gate passes for approved visitors

### HR / Administrator
- Full visitor records with search, date-range, status, department, and company filters
- Paginated records table with CSV export
- Today / This Week / This Month summary reports with per-period export
- Searchable, paginated audit log
- Company settings editor (company name, plant, address, gate name)
- Reset demo data with confirmation

### Digital Gate Pass
- Printable gate pass with company branding
- Real QR code (using `qrcode.react`)
- Visitor photo, all visit details, approval info
- Print-optimized layout (File → Print → Save as PDF)

---

## 🏗️ Architecture

```
Frontend/
├── src/
│   ├── config/
│   │   └── company.js          # Centralized company config & demo users
│   ├── context/
│   │   └── AppContext.jsx       # Global state (auth, visitors, notifications)
│   ├── services/
│   │   └── storage.js          # localStorage abstraction (all CRUD ops)
│   ├── components/
│   │   ├── ui.jsx              # Reusable UI components
│   │   ├── Layout.jsx          # Sidebar + top nav layout
│   │   └── GatePass.jsx        # Printable gate pass with QR
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── guard/              # Security Guard pages
│   │   ├── planthead/          # Plant Head pages
│   │   └── admin/              # HR/Admin pages
│   ├── App.jsx                 # Router + protected routes
│   └── index.css               # Global styles + Tailwind
├── netlify.toml                # Netlify SPA routing
└── vercel.json                 # Vercel SPA routing
```

### Storage Interface (`src/services/storage.js`)
All data operations go through this layer — designed to be replaced with REST API calls without touching UI components:

- `getVisitors()` / `createVisitor()` / `updateVisitor()`
- `approveVisitor()` / `rejectVisitor()` / `holdVisitor()`
- `checkInVisitor()` / `checkOutVisitor()`
- `getAuditLogs()` / `createAuditLog()`
- `getCompanySettings()` / `saveCompanySettings()`
- `exportVisitorRecords()` — CSV export with proper escaping
- `resetDemoData()` — clears and re-seeds sample data

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react-router-dom` | Client-side routing |
| `lucide-react` | Icons |
| `recharts` | Dashboard charts |
| `qrcode.react` | QR code generation |
| `date-fns` | Date formatting |
| `tailwindcss` | Styling |

---

## 🌐 Deployment

### Netlify
1. Build: `npm run build`
2. Publish directory: `dist`
3. The included `netlify.toml` handles SPA routing automatically.

Or use the Netlify CLI:
```bash
netlify deploy --dir=dist --prod
```

### Vercel
1. Connect the `Frontend` folder to a Vercel project
2. Build command: `npm run build`
3. Output directory: `dist`
4. The included `vercel.json` handles SPA routing automatically.

Or use the Vercel CLI:
```bash
vercel --prod
```

---

## ⚠️ Known Limitations (Prototype)

- **Browser-local storage only**: Data is stored in the browser's localStorage. It does not sync across devices, browsers, or users.
- **Not production-secure**: Authentication is frontend-only demo. Do not use real visitor data.
- **Audit logs are local**: Can be modified via browser DevTools. Not tamper-proof.
- **No real notifications**: In-app notification center only; no email/SMS.
- **No QR scanner**: Token-based lookup only; camera scanning is a future extension.

---

## 🔮 Future Production Roadmap

- REST API backend (Node.js / FastAPI)
- PostgreSQL database
- JWT-based authentication
- Server-side role enforcement
- Real-time updates (WebSockets)
- Camera-based QR scanning
- Email/SMS notifications
- Centralized audit logs
- Multi-gate support

---

## 📊 Sample Demo Data

Pre-loaded fictional records demonstrating all workflow states:

| Token | Visitor | Status | Demo Purpose |
|-------|---------|--------|--------------|
| VIS-2026-00001 | Rajiv Gupta | Approved | Ready to check in |
| VIS-2026-00002 | Anita Verma | Pending | Awaiting Plant Head approval |
| VIS-2026-00003 | Mohit Joshi | Rejected | Shows rejection workflow |
| VIS-2026-00004 | Deepak Singh | On Hold | Shows hold workflow |
| VIS-2026-00005 | Sunita Patel | Checked Out | Completed visit (yesterday) |

# 🌿 BLife

An offline-first progressive web application for biodiversity field surveys, ecological monitoring, and specimen data collection in zero-connectivity environments.

[![AWS CloudFront](https://img.shields.io/badge/AWS-CloudFront%20CDN-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://d3lallddukllru.cloudfront.net)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌐 Live Deployments

**BLife** is an intuitive field data collection platform designed for conservationists, botanists, zoologists, and citizen scientists. Conducting biodiversity surveys in remote or protected areas often means operating with zero network coverage. BLife solves this by offering an offline-first architecture powered by client-side browser storage (IndexedDB).

### Key Highlights
- **Offline-First Resilience**: All field records, attached photos, and metadata are persisted locally using **Dexie.js** (IndexedDB wrapper). Never lose findings in zero-connectivity areas.
- **Darwin Core (DwC) Standards Support**: Built-in support for Darwin Core-aligned biodiversity data export and sharing.
- **Interactive Geospatial Mapping**: Integrated Leaflet and Mapbox maps with pinpoint coordinate picking, high-accuracy device geolocation, and accuracy radius tracking.
- **Multi-Media Documentation**: Capture live field photos or upload from device gallery with tag-based classification and preview cards.
- **Project & Ward/Survey Management**: Organize observations by projects, wards, and dedicated surveys.
- **Mobile-Responsive App Experience**: Includes splash screens, bottom navigation drawer, account management, profile badges, and responsive layouts tailored for mobile field devices.

---

## ⚡ Highlights

* **Offline-First Storage**: Saves all field notes, metadata, and photos directly in browser storage via Dexie.js (IndexedDB).
* **GPS & Leaflet Maps**: High-precision device geolocation tracking and Leaflet map pin placement (with optional Mapbox HD layers).
* **Photo Documentation**: Direct device camera capture and multi-photo uploads with identification tagging.
* **Darwin Core (DwC) Ready**: Clean JSON and CSV data exports formatted for global research repositories like GBIF.
* **Project Organization**: Structure observations by research projects, field surveys, and geographic wards.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build & Tooling** | [Vite 8](https://vitejs.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), Base UI, Lucide React icons |
| **Local Database** | [Dexie.js](https://dexie.org/) (IndexedDB) |
| **Mapping & Geospatial** | [Leaflet](https://leafletjs.com/), Mapbox Outdoors / OpenStreetMap tiles |

---

## 🚀 Local Setup & Installation

Follow the steps below to set up and run BLife on your local development machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* Modern browser with IndexedDB and Geolocation API support

### Setup

```bash
# 1. Clone repository
git clone https://github.com/veenaav/Vasudha_App.git
cd Vasudha_App

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Customize VITE_API_URL or Mapbox token in .env if needed

BLife comes with an optional Mapbox integration for high-definition topographic and outdoor tiles.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. (Optional) Open `.env` and configure your Mapbox public token:
   ```env
   # Mapbox Public Access Token (Get one at https://account.mapbox.com/)
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```
   > **Note**: If `VITE_MAPBOX_TOKEN` is omitted, the app will gracefully fall back to free standard OpenStreetMap tiles.

### 4. Start the Development Server

```bash
npm run dev
```
#testing

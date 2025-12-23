# 🏥 Medicheck — Blockchain-Based Medicine Tracking System 💊🔗

![Medicheck](https://img.shields.io/badge/Medicheck-Blockchain%20Medicine%20Tracker-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node.js-18.x-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB)
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636)
![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D)

**Medicheck** is a blockchain-powered medicine tracking and verification platform designed to ensure **end-to-end pharmaceutical supply chain transparency**, prevent counterfeit drugs, and enable **real-time medicine authentication**.

---

## 📌 Table of Contents

* 🌟 Features
* 🏗️ System Architecture
* 🚀 Quick Start
* ⚙️ Installation
* 🔧 Configuration
* 📦 Smart Contracts
* 🔐 Authentication
* 💊 Medicine Lifecycle
* 📊 API Overview
* 🖥️ Frontend Overview
* 🧪 Testing
* 🚢 Deployment
* 🤝 Contributing
* 📄 License

---

## 🌟 Features

### 🎯 Core Features

* ✅ **Immutable Medicine Records** (Blockchain-backed)
* ✅ **Real-time Verification** via QR / Batch Number
* ✅ **Complete Supply Chain Tracking**
* ✅ **Multi-role Access Control**
* ✅ **Counterfeit Prevention**
* ✅ **Expiry Monitoring & Alerts**

### 🔗 Blockchain Features

* Ethereum Smart Contracts (Solidity)
* Sepolia Testnet Integration
* MetaMask Wallet Authentication
* Gas-optimized transactions
* Full on-chain audit trail

### 🔒 Security

* JWT-based authentication
* Role-based authorization
* Input validation & sanitization
* Encrypted sensitive data
* Activity & audit logs

---

## 🏗️ System Architecture

```
Frontend (React)
   ↓ REST API
Backend (Node.js + Express)
   ↓ Web3 / JSON-RPC
Ethereum Blockchain (Sepolia)
```

### Tech Stack

| Layer           | Technology         |
| --------------- | ------------------ |
| Frontend        | React 18           |
| Backend         | Node.js, Express   |
| Database        | MongoDB            |
| Blockchain      | Ethereum (Sepolia) |
| Smart Contracts | Solidity           |
| Auth            | JWT + MetaMask     |

---

## 🚀 Quick Start

### Prerequisites

* Node.js **18+**
* MongoDB **6+**
* MetaMask Extension
* Git
* Sepolia Test ETH

### Setup (5 Minutes)

```bash
git clone https://github.com/YOUR_USERNAME/medicheck.git
cd medicheck
```

#### Backend

```bash
cd medicheck-backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

**URLs**

* Backend: `http://localhost:5000`
* Frontend: `http://localhost:3000`

---

## ⚙️ Configuration

### Backend `.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medicheck

JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d

ETHEREUM_NETWORK=sepolia
BLOCKCHAIN_NETWORK=https://sepolia.infura.io/v3/YOUR_INFURA_ID
DEPLOYER_PRIVATE_KEY=YOUR_PRIVATE_KEY
CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
```

⚠️ **Never commit `.env` files to GitHub**

---

## 📦 Smart Contracts

**Main Contract:** `MedicineTracker.sol`

### Key Functions

* `registerMedicine`
* `verifyMedicine`
* `transferMedicine`
* `getMedicine`
* `verifyMedicineExistence`

### Deploy to Sepolia

```bash
npm run deploy-sepolia
npm run verify
```

---

## 🔐 Authentication

### User Roles

| Role         | Access                   |
| ------------ | ------------------------ |
| Admin        | Full access              |
| Manufacturer | Create & manage batches  |
| Pharmacy     | Inventory & verification |
| Viewer       | Read-only verification   |

### Auth Flow

```
Login → JWT Issued → API Access → Role Validation
```

🔐 **Default credentials should be changed immediately in production**

---

## 💊 Medicine Lifecycle

```
Manufacturer
   ↓ (Blockchain Register)
Distributor / Pharmacy
   ↓ (Ownership Transfer)
Patient Verification
```

Each step is **recorded immutably on-chain**.

---

## 📊 API Overview

**Base URL**

```
/api
```

### Example Endpoints

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| POST   | /auth/login              | Login               |
| POST   | /batches                 | Create batch        |
| GET    | /batches/verify/:batchNo | Public verification |
| POST   | /pharmacy/accept-batch   | Accept batch        |

All protected routes require **JWT Authorization**.

---

## 🖥️ Frontend Overview

### Core Pages

* Admin Dashboard
* Manufacturer Dashboard
* Pharmacy Dashboard
* Public Verification Page

### Key Components

* `MetaMaskConnector`
* `BlockchainVisualization`
* `ProtectedRoute`
* `VerifyPage`

---

## 🧪 Testing

```bash
# Backend
npm test

# Smart Contracts
npx hardhat test

# Frontend
npm test
```

---

## 🚢 Deployment

### Backend

* Heroku / Railway / VPS
* MongoDB Atlas recommended

### Frontend

* Netlify
* Vercel

### Docker

```bash
docker-compose up -d
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit with clear messages
4. Open a Pull Request

✔ ESLint
✔ Solhint
✔ Conventional Commits

---

## 📄 License

**MIT License**

© 2025 Medicheck
Free to use, modify, and distribute.

---

## ⭐ Roadmap

* 📱 Mobile App
* 🔗 Cross-chain support
* 🏛 Regulatory compliance

---

## 🌍 Connect

* 📧 Email: `muhammadahmer1qw2@gmail.com`
* 🐦 Twitter: -
* 💼 LinkedIn: Medicheck

---

### ⭐ If you find Medicheck useful, give it a star on GitHub!

**Built to protect lives through technology. 💊🔗**



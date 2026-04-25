# 🔒 LinkLock Security Vault

LinkLock is a high-security, self-destructing data vault designed for sovereign data privacy. It allows users to generate encrypted, one-time-use links for secrets and files that "burn" automatically upon viewing, usage limit, or time expiration.

## 🏗️ System Architecture & Workflow

The system is built on a **Zero-Knowledge** architecture, ensuring that the central server never possesses the raw decryption keys required to read your data.

### 1. Instances (Active Links)
In LinkLock, an **Instance** refers to a unique, transient record in the `active_links` MongoDB collection.
- **Spawn**: When a user initializes a "Secure Link," a new document instance is created containing high-entropy ciphertext and security constraints (View Limits/TTL).
- **Transient Nature**: Unlike traditional databases, these instances are designed to be temporary. They exist in a state of "potential deletion" from the moment of creation.
- **Reference**: Each instance is accessed via a unique `key`, but the actual physical data remains locked until the client provides the `#hash` key stored in their browser.

### 2. Procedures (The Burn Mechanism)
The system utilizes **Automated Procedures** to enforce strict data destruction protocols.
- **Autonomous Scrubbing**: The backend executes a recurring procedure every 2 seconds (Simulated Atlas Trigger) that monitors the state of all active instances.
- **Protocol Enforcement**: 
    - If `currentViews` matches the `viewLimit`, the procedure triggers an immediate "Burn."
    - If the `expiresAt` timestamp is reached, the procedure triggers a "Burn" regardless of view count.
- **Physical Shredding**: When a procedure initiates a "Burn," it executes a file-system procedure to physically delete any attached binaries from server storage, ensuring the data is unrecoverable.

### 3. Functions (Logic & Security)
The application relies on several specialized functions to maintain its security posture:
- **Client-Side Encryption**: A cryptographic function utilizing `AES-256` runs entirely in the user's browser. It transforms the payload into ciphertext before transmission.
- **Data Normalization**: In the **Command Center**, a normalization function translates raw system logs and trigger metadata into a professional audit trail, handling legacy data and ensuring "UNKNOWN" states are resolved into meaningful actions.
- **Log Management Functions**: Administrative functions allow for the cleanup of "Legacy Logs" to maintain high performance in the Command Center without affecting active security links.

## 🛡️ Core Security Features
- **URL Hash Keys**: Decryption keys are stored in the URL hash (`#`). Per web standards, everything after the `#` is **not sent to the server**.
- **Self-Destructing Files**: Support for encrypted file attachments that are physically wiped from disk upon link expiration.
- **Advanced Audit Logs**: Real-time monitoring of all burn events with filtering and search capabilities.
- **High-Tech UI**: Cyber-Security aesthetic with Monospaced data displays and glassmorphism.

## 🚀 Setup & Launch

### Environment
- **React + Vite** (Frontend)
- **Node.js + Express** (Backend)
- **MongoDB** (Database)

### Installation
1.  **Clone** the repository.
2.  **Dependencies**:
    ```bash
    # Frontend setup
    cd LinkLock && npm install
    # Backend setup
    cd ../LinkLock-server && npm install
    ```
3.  **Environment Configuration**: Create a `.env` in `LinkLock-server`:
    ```env
    MONGODB_URI=your_mongodb_connection_link
    PORT=5000
    ```
4.  **Launch**:
    ```bash
    # Start Backend (Terminal 1)
    cd LinkLock-server && node index.js
    # Start Frontend (Terminal 2)
    cd LinkLock && npm run dev
    ```

---
*Architected for Privacy. Developed by Antigravity.*

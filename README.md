# Personal Finance REST API

A RESTful API built for a Personal Finance application to manage wallets and transactions. This project is created as part of the Web Advanced Development Midterm Exam (UTS).

**Identitas Mahasiswa:**
*   **Nama:** Muhammad Mufti
*   **NIM:** 24110400020

## Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **ORM:** Prisma ORM
*   **Database:** PostgreSQL (Supabase)

## Database Schema

The database consists of two main tables: `Wallet` and `Transaction` with a one-to-many relationship.

### 1. Wallet
*   `id` (Int, PK, Auto Increment)
*   `name` (String)
*   `currency` (String, default: "IDR")
*   `createdAt` (DateTime)

### 2. Transaction
*   `id` (Int, PK, Auto Increment)
*   `amount` (Float)
*   `type` (String: `"income"` | `"expense"`)
*   `category` (String)
*   `note` (String, Nullable)
*   `date` (DateTime)
*   `createdAt` (DateTime)
*   `walletId` (Int, FK to Wallet)

## API Endpoints

### Wallets
*   `GET /wallets` - Menampilkan semua wallet (diurutkan berdasarkan `createdAt` descending).
*   `POST /wallets` - Membuat wallet baru (Validasi: `name` wajib diisi).
*   `DELETE /wallets/:id` - Menghapus wallet beserta seluruh transaksi di dalamnya (Cascade Delete).

### Transactions
*   `GET /wallets/:id/transactions` - Menampilkan seluruh transaksi dari wallet tertentu (diurutkan berdasarkan `date` descending).
*   `POST /wallets/:id/transactions` - Membuat transaksi baru pada wallet tertentu (Validasi: `amount`, `type`, `category`, `date` wajib diisi; `amount` > 0; `type` harus `"income"` atau `"expense"`).
*   `DELETE /transactions/:id` - Menghapus transaksi berdasarkan ID (Mengembalikan data transaksi terhapus beserta nama wallet).

### Reports & Summary
*   `GET /wallets/:id/balance` - Menghitung total pemasukan, pengeluaran, dan saldo akhir pada wallet tertentu.
*   `GET /wallets/:id/summary` - Menampilkan ringkasan transaksi dikelompokkan per kategori, lengkap dengan jumlah transaksi, total nominal, rata-rata nominal, serta jumlah tipe pemasukan/pengeluaran.

## Cara Instalasi dan Menjalankan Proyek

1.  **Clone repositori ini** ke komputer lokal Anda.
2.  **Instal dependensi**:
    ```bash
    npm install
    ```
3.  **Konfigurasi Environment Variable**:
    Salin file `.env.example` menjadi `.env` lalu sesuaikan URL database PostgreSQL Anda (misal Supabase):
    ```env
    DATABASE_URL="postgresql://username:password@host:port/database"
    ```
4.  **Jalankan Database Migration**:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  **Jalankan Seed Data** (Opsional, untuk mengisi data awal):
    ```bash
    node seed.js
    ```
6.  **Jalankan Server**:
    ```bash
    node index.js
    ```
    Server akan berjalan di http://localhost:3000.

## Contoh Penggunaan API (cURL)

### Membuat Wallet Baru
```bash
curl -X POST http://localhost:3000/wallets \
  -H "Content-Type: application/json" \
  -d '{"name": "Dompet Utama", "currency": "IDR"}'
```

### Membuat Transaksi Baru
```bash
curl -X POST http://localhost:3000/wallets/1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "type": "expense",
    "category": "Makanan",
    "note": "Makan Siang",
    "date": "2026-06-12"
  }'
```

### Melihat Ringkasan Kategori
```bash
curl http://localhost:3000/wallets/1/summary
```

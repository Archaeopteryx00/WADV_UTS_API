// Nama: Muhammad Mufti | NIM: 24110400020
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Soal 1a — GET /wallets - Return all wallets, sorted by createdAt descending
app.get("/wallets", async (req, res) => {
  const wallets = await prisma.wallet.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(wallets);
});

// Soal 1b — POST /wallets - Create wallet
app.post("/wallets", async (req, res) => {
  const { name, currency } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "name wajib diisi" });
  }
  
  const wallet = await prisma.wallet.create({
    data: { name, currency: currency || "IDR" }
  });
  
  res.status(201).json(wallet);
});

// Soal 1c — DELETE /wallets/:id - Delete wallet and its transactions
app.delete("/wallets/:id", async (req, res) => {
  const walletId = parseInt(req.params.id);
  
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId }
  });
  
  if (!wallet) {
    return res.status(404).json({ error: "Wallet tidak ditemukan" });
  }
  
  // Delete all transactions first, then delete wallet
  await prisma.transaction.deleteMany({
    where: { walletId }
  });
  
  await prisma.wallet.delete({
    where: { id: walletId }
  });
  
  res.status(204).send();
});

// Soal 2a — GET /wallets/:id/transactions - Get all transactions for a wallet
app.get("/wallets/:id/transactions", async (req, res) => {
  const walletId = parseInt(req.params.id);
  
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId }
  });
  
  if (!wallet) {
    return res.status(404).json({ error: "Wallet tidak ditemukan" });
  }
  
  const transactions = await prisma.transaction.findMany({
    where: { walletId },
    orderBy: { date: "desc" }
  });
  
  res.json(transactions);
});

// Soal 2b — POST /wallets/:id/transactions - Create transaction
app.post("/wallets/:id/transactions", async (req, res) => {
  const walletId = parseInt(req.params.id);
  const { amount, type, category, note, date } = req.body;
  
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId }
  });
  
  if (!wallet) {
    return res.status(404).json({ error: "Wallet tidak ditemukan" });
  }
  
  if (!amount || !type || !category || !date) {
    return res.status(400).json({ error: "amount, type, category, dan date wajib diisi" });
  }
  
  if (type !== "income" && type !== "expense") {
    return res.status(400).json({ error: "type harus \"income\" atau \"expense\"" });
  }
  
  if (amount <= 0) {
    return res.status(400).json({ error: "amount harus lebih dari 0" });
  }
  
  const transaction = await prisma.transaction.create({
    data: {
      amount: parseFloat(amount),
      type,
      category,
      note,
      date: new Date(date),
      walletId
    }
  });
  
  res.status(201).json(transaction);
});

// Soal 2c (Bonus) — DELETE /transactions/:id - Delete transaction
app.delete("/transactions/:id", async (req, res) => {
  const transactionId = parseInt(req.params.id);
  
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { wallet: true }
  });
  
  if (!transaction) {
    return res.status(404).json({ error: "Transaksi tidak ditemukan" });
  }
  
  await prisma.transaction.delete({
    where: { id: transactionId }
  });
  
  // Bonus response
  res.status(200).json({
    deleted: {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      note: transaction.note,
      date: transaction.date,
      createdAt: transaction.createdAt,
      walletId: transaction.walletId,
      wallet: {
        name: transaction.wallet.name
      }
    }
  });
});

// Soal 3a — GET /wallets/:id/balance - Calculate balance
app.get("/wallets/:id/balance", async (req, res) => {
  const walletId = parseInt(req.params.id);
  
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId }
  });
  
  if (!wallet) {
    return res.status(404).json({ error: "Wallet tidak ditemukan" });
  }
  
  const transactions = await prisma.transaction.findMany({
    where: { walletId }
  });
  
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;
  
  res.json({
    walletId,
    walletName: wallet.name,
    totalIncome,
    totalExpense,
    balance
  });
});

// Soal 3b — GET /wallets/:id/summary - Group by category
app.get("/wallets/:id/summary", async (req, res) => {
  const walletId = parseInt(req.params.id);
  
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId }
  });
  
  if (!wallet) {
    return res.status(404).json({ error: "Wallet tidak ditemukan" });
  }
  
  const transactions = await prisma.transaction.findMany({
    where: { walletId }
  });
  
  // Group by category
  const categoryMap = {};
  
  for (const t of transactions) {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = {
        category: t.category,
        count: 0,
        totalAmount: 0,
        avgAmount: 0,
        types: {
          income: 0,
          expense: 0
        }
      };
    }
    
    const cat = categoryMap[t.category];
    cat.count++;
    cat.totalAmount += t.amount;
    
    if (t.type === "income") {
      cat.types.income++;
    } else if (t.type === "expense") {
      cat.types.expense++;
    }
  }
  
  // Calculate average and round to 2 decimals
  for (const cat of Object.values(categoryMap)) {
    cat.avgAmount = cat.count > 0 ? Math.round((cat.totalAmount / cat.count) * 100) / 100 : 0;
  }
  
  const summary = Object.values(categoryMap);
  
  res.json({
    walletId,
    walletName: wallet.name,
    summary
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

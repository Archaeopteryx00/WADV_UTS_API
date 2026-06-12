// Nama: Muhammad Mufti | NIM: 24110400020
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();

  // Create wallets
  const wallet1 = await prisma.wallet.create({
    data: {
      name: "Dompet Utama",
      currency: "IDR"
    }
  });

  const wallet2 = await prisma.wallet.create({
    data: {
      name: "Rekening Bank",
      currency: "IDR"
    }
  });

  const wallet3 = await prisma.wallet.create({
    data: {
      name: "Cash",
      currency: "IDR"
    }
  });

  console.log(`Created ${3} wallets`);

  // Create transactions for wallet 1
  await prisma.transaction.createMany({
    data: [
      {
        amount: 5000000,
        type: "income",
        category: "Gaji",
        note: "Gaji bulan Juni",
        date: new Date("2026-06-01"),
        walletId: wallet1.id
      },
      {
        amount: 150000,
        type: "expense",
        category: "Makanan",
        note: "Makan siang",
        date: new Date("2026-06-02"),
        walletId: wallet1.id
      },
      {
        amount: 50000,
        type: "expense",
        category: "Transportasi",
        note: "Bensin",
        date: new Date("2026-06-03"),
        walletId: wallet1.id
      },
      {
        amount: 200000,
        type: "expense",
        category: "Belanja",
        note: "Kebutuhan rumah",
        date: new Date("2026-06-05"),
        walletId: wallet1.id
      }
    ]
  });

  // Create transactions for wallet 2
  await prisma.transaction.createMany({
    data: [
      {
        amount: 10000000,
        type: "income",
        category: "Investasi",
        note: "Dividen saham",
        date: new Date("2026-06-01"),
        walletId: wallet2.id
      },
      {
        amount: 2500000,
        type: "expense",
        category: "Tagihan",
        note: "Listrik & Internet",
        date: new Date("2026-06-05"),
        walletId: wallet2.id
      },
      {
        amount: 1000000,
        type: "expense",
        category: "Pendidikan",
        note: "Kursus online",
        date: new Date("2026-06-07"),
        walletId: wallet2.id
      }
    ]
  });

  // Create transactions for wallet 3
  await prisma.transaction.createMany({
    data: [
      {
        amount: 500000,
        type: "income",
        category: "Freelance",
        note: "Project website",
        date: new Date("2026-06-08"),
        walletId: wallet3.id
      },
      {
        amount: 75000,
        type: "expense",
        category: "Makanan",
        note: "Coffeeshop",
        date: new Date("2026-06-09"),
        walletId: wallet3.id
      }
    ]
  });

  console.log(`Created transactions`);

  // Show summary
  const wallets = await prisma.wallet.findMany({
    include: { transactions: true }
  });

  console.log("\nSeeded Data Summary:");
  for (const wallet of wallets) {
    const income = wallet.transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = wallet.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    console.log(`\n${wallet.name}:`);
    console.log(`   Transactions: ${wallet.transactions.length}`);
    console.log(`   Income: Rp ${income.toLocaleString()}`);
    console.log(`   Expense: Rp ${expense.toLocaleString()}`);
    console.log(`   Balance: Rp ${(income - expense).toLocaleString()}`);
  }

  console.log("\nSeeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

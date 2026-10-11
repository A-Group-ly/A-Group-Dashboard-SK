import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.subscription.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.user.deleteMany();

  // Create user Ahmed with 4 cards (Libyan local networks + International)
  const user = await prisma.user.create({
    data: {
      name: "Ahmed Al-Warfalli (أحمد الورفلي)",
      email: "ahmed@example.ly",
      paymentMethods: {
        create: [
          {
            stripeMethodId: "card_tadawul_01",
            brand: "Tadawul (تداول)",
            last4: "9102",
            expMonth: 12,
            expYear: 2027,
            isDefault: true,
          },
          {
            stripeMethodId: "card_moamalat_02",
            brand: "Moamalat (معاملات)",
            last4: "4421",
            expMonth: 8,
            expYear: 2026,
            isDefault: false,
          },
          {
            stripeMethodId: "card_sadad_03",
            brand: "Sadad (سداد)",
            last4: "1088",
            expMonth: 4,
            expYear: 2028,
            isDefault: false,
          },
          {
            stripeMethodId: "card_aman_visa_04",
            brand: "Visa (مصرف الأمان)",
            last4: "7733",
            expMonth: 10,
            expYear: 2026,
            isDefault: false,
          },
        ],
      },
    },
    include: { paymentMethods: true },
  });

  const expiringDate = new Date();
  expiringDate.setDate(expiringDate.getDate() + 2);

  // Set the default card to Tadawul
  await prisma.subscription.create({
    data: {
      userId: user.id,
      planName: "Enterprise Cloud (ليبيا)",
      price: 350.00, // 350 LYD
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: expiringDate,
      paymentMethodId: user.paymentMethods[0].id, // Currently billed to Tadawul
      notifiedForRenewal: false,
    },
  });

  console.log("Database seeded with Libyan cards successfully!");
}

main().finally(() => prisma.$disconnect());
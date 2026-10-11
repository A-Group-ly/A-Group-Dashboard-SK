import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

// Async component that fetches data
async function SubscriptionsData() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: {
        include: { paymentMethods: true },
      },
      paymentMethod: true,
    },
    orderBy: { currentPeriodEnd: "asc" },
  });

  return <DashboardClient initialSubscriptions={subscriptions} />;
}

// Main page wrapped in Suspense for Next.js 16
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
          Loading dashboard...
        </div>
      }
    >
      <SubscriptionsData />
    </Suspense>
  );
}
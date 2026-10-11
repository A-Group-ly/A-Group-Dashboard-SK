"use client";

import { useState, useTransition } from "react";
import { CreditCard, AlertTriangle, Users, Wallet, Bell, ChevronDown, Check } from "lucide-react";
import { switchActiveCard } from "./actions";

const EXCHANGE_RATES: Record<string, { rate: number; symbol: string; decimals: number }> = {
  LYD: { rate: 1, symbol: "LYD (د.ل)", decimals: 2 },
  USD: { rate: 0.21, symbol: "$ USD", decimals: 2 },
  EUR: { rate: 0.19, symbol: "€ EUR", decimals: 2 },
};

// Helper badge color for Libyan vs International cards
function getCardBadgeStyle(brand: string) {
  if (brand.includes("تداول") || brand.toLowerCase().includes("tadawul")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (brand.includes("معاملات") || brand.toLowerCase().includes("moamalat")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (brand.includes("سداد") || brand.toLowerCase().includes("sadad")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-purple-50 text-purple-700 border-purple-200";
}

export default function DashboardClient({ initialSubscriptions }: { initialSubscriptions: any[] }) {
  const [selectedCurrency, setSelectedCurrency] = useState<"LYD" | "USD" | "EUR">("LYD");
  const [isPending, startTransition] = useTransition();
  const [activeCardId, setActiveCardId] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialSubscriptions.forEach((sub) => {
      map[sub.id] = sub.paymentMethodId;
    });
    return map;
  });

  const formatPrice = (amountInLYD: number) => {
    const config = EXCHANGE_RATES[selectedCurrency];
    const converted = amountInLYD * config.rate;
    return `${converted.toFixed(config.decimals)} ${config.symbol}`;
  };

  const handleCardChange = (subscriptionId: string, newCardId: string) => {
    setActiveCardId((prev) => ({ ...prev, [subscriptionId]: newCardId }));
    startTransition(async () => {
      await switchActiveCard(subscriptionId, newCardId);
    });
  };

  const totalMRR_LYD = initialSubscriptions.reduce((sum, s) => sum + s.price, 0);
  const activeSubs = initialSubscriptions.filter((s) => s.status === "ACTIVE").length;
  const pendingNotifications = initialSubscriptions.filter((s) => !s.notifiedForRenewal).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">Subscription & Billing Dashboard</h1>
            <p className="text-sm text-slate-500">Switch between Libyan & International payment cards</p>
          </div>

          {/* CURRENCY SELECTOR */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 pl-2">Currency:</span>
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as any)}
                className="appearance-none bg-white text-slate-800 text-sm font-semibold py-1.5 pl-3 pr-8 rounded-md border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="LYD">🇱🇾 LYD (د.ل)</option>
                <option value="USD">🇺🇸 USD ($)</option>
                <option value="EUR">🇪🇺 EUR (€)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Revenue (MRR)</p>
              <p className="text-2xl font-bold">{formatPrice(totalMRR_LYD)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Active Subscriptions</p>
              <p className="text-2xl font-bold">{activeSubs}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Pending Alerts</p>
              <p className="text-2xl font-bold">{pendingNotifications}</p>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Subscriber Management</h2>
            <span className="text-xs text-slate-400">Total: {initialSubscriptions.length} users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Renewal Date</th>
                  <th className="px-6 py-3">Active Billed Card (Switchable)</th>
                  <th className="px-6 py-3">All Customer Cards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialSubscriptions.map((sub) => {
                  const currentCardId = activeCardId[sub.id] || sub.paymentMethodId;
                  const currentCard = sub.user.paymentMethods.find((p: any) => p.id === currentCardId);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{sub.user.name}</p>
                        <p className="text-xs text-slate-400">{sub.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{sub.planName}</span>
                        <span className="block text-xs font-semibold text-emerald-600">
                          {formatPrice(sub.price)}/mo
                        </span>
                      </td>
                      <td className="px-6 py-4">
                       <p className="font-medium text-slate-700" suppressHydrationWarning>
                             {new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB")}
                        </p>
                        {sub.notifiedForRenewal ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <Check className="w-3 h-3" /> Notified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            <AlertTriangle className="w-3 h-3" /> Alert Due
                          </span>
                        )}
                      </td>

                      {/* INTERACTIVE CARD SWITCHER COLUMN */}
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            value={currentCardId || ""}
                            disabled={isPending}
                            onChange={(e) => handleCardChange(sub.id, e.target.value)}
                            className="text-xs font-semibold py-2 pl-3 pr-8 rounded-lg border border-slate-300 bg-white hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            {sub.user.paymentMethods.map((pm: any) => (
                              <option key={pm.id} value={pm.id}>
                                {pm.brand} •••• {pm.last4}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                        </div>
                      </td>

                      {/* ALL SAVED CARDS BADGES */}
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {sub.user.paymentMethods.map((pm: any) => {
                            const isSelected = pm.id === currentCardId;
                            return (
                              <span
                                key={pm.id}
                                className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 ${
                                  isSelected
                                    ? "ring-2 ring-indigo-500 font-bold " + getCardBadgeStyle(pm.brand)
                                    : "opacity-60 " + getCardBadgeStyle(pm.brand)
                                }`}
                              >
                                <CreditCard className="w-3 h-3" />
                                {pm.brand} ••{pm.last4}
                                {isSelected && " (Active)"}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
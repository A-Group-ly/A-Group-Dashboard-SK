// app/api/charge/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();

    // 1. Fetch subscription and active card details
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true, paymentMethod: true },
    });

    if (!subscription || !subscription.paymentMethod) {
      return NextResponse.json({ error: "Subscription or payment method not found" }, { status: 404 });
    }

    // 2. Stripe rule for LYD: 
    // LYD has 3 decimal places (1 LYD = 1000 millimes). 
    // A price of 250 LYD must be sent to Stripe as 250000.
    const amountInSmallestUnit = Math.round(subscription.price * 1000);

    // 3. Charge the customer's card in Libyan Dinar
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: 'lyd', // Libyan Dinar
      customer: subscription.user.stripeCustomerId || undefined,
      payment_method: subscription.paymentMethod.stripeMethodId,
      confirm: true,
      off_session: true, // Indicates recurring automatic charge
    });

    return NextResponse.json({ success: true, paymentIntent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
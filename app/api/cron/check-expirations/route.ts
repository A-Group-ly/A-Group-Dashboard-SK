import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function GET() {
  const now = new Date();
  const alertWindow = new Date();
  alertWindow.setDate(now.getDate() + 3); // Subscriptions expiring in the next 3 days

  try {
    const expiringSubs = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        notifiedForRenewal: false,
        currentPeriodEnd: {
          gte: now,
          lte: alertWindow,
        },
      },
      include: {
        user: true,
        paymentMethod: true,
      },
    });

    for (const sub of expiringSubs) {
      // Send email if Resend key is configured
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_dummy') {
        await resend.emails.send({
          from: 'billing@yourdomain.com',
          to: sub.user.email,
          subject: 'Your subscription is renewing soon',
          html: `<p>Hi ${sub.user.name}, your ${sub.planName} renews on ${sub.currentPeriodEnd.toDateString()}.</p>`,
        });
      }

      // Mark that notification has been sent
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { notifiedForRenewal: true },
      });
    }

    return NextResponse.json({
      success: true,
      notifiedSubscriptionsCount: expiringSubs.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
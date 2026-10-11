"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function switchActiveCard(subscriptionId: string, newPaymentMethodId: string) {
  try {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { paymentMethodId: newPaymentMethodId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
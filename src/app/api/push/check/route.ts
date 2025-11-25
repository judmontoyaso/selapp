import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const subscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    return NextResponse.json({ exists: !!subscription });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}

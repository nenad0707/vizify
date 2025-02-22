import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, title, color } = await req.json();
    if (!name || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingCard = await prisma.businessCard.findFirst({
      where: { userId: session.user.id, name },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "A card with this name already exists." },
        { status: 409 },
      );
    }

    const card = await prisma.businessCard.create({
      data: {
        userId: session.user.id,
        name,
        title,
        color: color || "#ffffff",
        qrCode: `${process.env.NEXTAUTH_URL}/card/${name}`,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 },
    );
  }
}

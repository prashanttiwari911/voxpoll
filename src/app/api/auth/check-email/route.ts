import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ exists: false });

    const user = await db.user.findUnique({ where: { email } });
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check email" }, { status: 500 });
  }
}

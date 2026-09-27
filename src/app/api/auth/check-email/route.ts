import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    return NextResponse.json({ exists: email ? !!(await db.user.findUnique({ where: { email } })) : false });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check email" }, { status: 500 });
  }
}

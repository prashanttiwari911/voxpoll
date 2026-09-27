import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, name, age, address, gender, occupation, image } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    
    if (await db.user.findUnique({ where: { email } })) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        email,
        name: name || "New User",
        age: age ? parseInt(age.toString()) : null,
        address: address || null,
        gender: gender || null,
        occupation: occupation || null,
        image: image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name || email}`,
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import nodemailer from "nodemailer";
import { z } from "zod";

const shareSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(20),
  message: z.string().max(500).optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    const parsed = shareSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid sharing details." },
        { status: 400 }
      );
    }

    const { emails, message } = parsed.data;

    const poll = await db.poll.findUnique({
      where: { id },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Only allow creator or admin to share
    if (poll.creatorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You cannot share this poll" }, { status: 403 });
    }

    // Grab configured SMTP settings
    const host = process.env.SMTP_HOST || "smtp.ethereal.email";
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM || "noreply@voti.com";

    // If no credentials, just pretend we sent them (for dev environment)
    if (!user || !pass) {
      console.log(`[VoTI] Would send invite emails for Poll ${id} to: ${emails.join(", ")}`);
      return NextResponse.json({ success: true, dummy: true });
    }

    const transport = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
    });

    const senderName = session.user.name || "A VoTI user";
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const pollLink = `${appUrl}/polls/${poll.id}`;

    const mailPromises = emails.map((email) => {
      return transport.sendMail({
        to: email,
        from,
        subject: `${senderName} invited you to vote: "${poll.question}"`,
        text: `You have been invited to vote!\n\nQuestion: ${poll.question}\n${message ? `\nMessage: ${message}\n` : ""}\nLink: ${pollLink}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4f46e5; margin: 0;">VoTI</h1>
              <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Voice of The Internet</p>
            </div>
            
            <p style="color: #374151; font-size: 16px;">Hi there,</p>
            <p style="color: #374151; font-size: 16px;">
              <strong>${senderName}</strong> has invited you to participate in a poll!
            </p>
            
            ${message ? `
              <div style="background-color: #f3f4f6; padding: 12px 16px; border-left: 4px solid #4f46e5; border-radius: 4px; margin: 16px 0; font-style: italic; color: #4b5563;">
                "${message}"
              </div>
            ` : ""}

            <div style="margin: 32px 0; padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
              <h2 style="margin-top: 0; color: #111827; font-size: 20px;">${poll.question}</h2>
              <a href="${pollLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; margin-top: 16px;">
                Vote Now
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
              If you have trouble clicking the button, copy and paste this link into your browser:<br/>
              <a href="${pollLink}" style="color: #4f46e5;">${pollLink}</a>
            </p>
          </div>
        `,
      });
    });

    await Promise.all(mailPromises);

    return NextResponse.json({ success: true, count: emails.length });
  } catch (error) {
    console.error("Error sending share emails:", error);
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 });
  }
}

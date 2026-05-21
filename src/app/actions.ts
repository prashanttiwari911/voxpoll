"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Utility to get current authenticated user
async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be logged in to perform this action.");
  }
  
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  
  if (!user) {
    throw new Error("User account not found.");
  }
  
  return user;
}

// Action 1: Update User Profile Details
export async function updateProfile(prevState: any, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    
    const name = formData.get("name") as string;
    const ageRaw = formData.get("age") as string;
    const address = formData.get("address") as string;
    
    const age = ageRaw ? parseInt(ageRaw, 10) : null;
    
    if (age !== null && (isNaN(age) || age < 1 || age > 120)) {
      return { success: false, error: "Please enter a valid age between 1 and 120." };
    }
    
    await db.user.update({
      where: { id: user.id },
      data: {
        name: name || user.name,
        age: age,
        address: address || null,
      },
    });
    
    revalidatePath("/profile");
    revalidatePath("/");
    
    return { success: true, message: "Profile updated successfully! 🎉" };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

// Action 2: Create a New Poll
export async function createPoll(prevState: any, data: { question: string; description: string; category: string; options: string[] }) {
  try {
    const user = await getAuthenticatedUser();
    
    const { question, description, category, options } = data;
    
    if (!question || question.trim().length < 5) {
      return { success: false, error: "Question must be at least 5 characters long." };
    }
    
    const filteredOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0);
    if (filteredOptions.length < 2) {
      return { success: false, error: "You must provide at least 2 voting choices." };
    }
    
    const validCategories = ["EDUCATION", "SPORTS", "POLITICS", "BOOKS"];
    if (!validCategories.includes(category)) {
      return { success: false, error: "Invalid category selected." };
    }
    
    // Create Poll and options inside database
    const newPoll = await db.poll.create({
      data: {
        question: question.trim(),
        description: description?.trim() || null,
        category: category,
        creatorId: user.id,
        options: {
          create: filteredOptions.map(optionText => ({
            text: optionText,
          })),
        },
      },
    });
    
    revalidatePath("/");
    return { success: true, pollId: newPoll.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not create poll." };
  }
}

// Action 3: Submit a Vote
export async function submitVote(pollId: string, optionId: string) {
  try {
    const user = await getAuthenticatedUser();
    
    // 1. Verify poll exists
    const poll = await db.poll.findUnique({
      where: { id: pollId },
      include: {
        votes: {
          where: { userId: user.id }
        }
      }
    });
    
    if (!poll) {
      return { success: false, error: "Poll not found." };
    }
    
    // 2. Double-voting check
    if (poll.votes.length > 0) {
      return { success: false, error: "You have already voted in this poll!" };
    }
    
    // 3. User details check (must fill details to vote!)
    if (!user.age || !user.address) {
      return { 
        success: false, 
        error: "Please complete your profile (add age & address) before voting so we can analyze demographics!",
        redirectProfile: true 
      };
    }
    
    // 4. Create Vote record
    await db.vote.create({
      data: {
        userId: user.id,
        pollId: pollId,
        optionId: optionId,
      },
    });
    
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/");
    revalidatePath("/dashboard");
    
    return { success: true, message: "Vote cast successfully! Thank you for voting. 🗳️" };
  } catch (error: any) {
    return { success: false, error: error.message || "Could not cast vote." };
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import ProfileForm from "./ProfileForm";
import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 py-8 bg-white border border-indigo-50 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-black text-slate-800">Whoops! 🕵️</h2>
        <p className="text-slate-500 mt-2">You need to log in to complete or view your profile details!</p>
        <Link
          href="/"
          className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors"
        >
          Go Back Home to Login
        </Link>
      </div>
    );
  }

  // Fetch the latest details directly from database
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  const userData = {
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || null,
    address: user?.address || "",
  };

  const isProfileIncomplete = !userData.age || !userData.address;

  return (
    <div className="max-w-2xl mx-auto my-12 px-4 sm:px-6">
      <Link href="/" className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Polls</span>
      </Link>
      
      <div className="bg-white border border-indigo-50 rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Your VoxPoll Profile</h1>
            <p className="text-sm text-slate-500">
              Provide your details to enable regional and age demographics analysis on polls.
            </p>
          </div>
        </div>

        {isProfileIncomplete && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl mb-6 text-sm">
            <span className="font-bold">⚠️ Profile Incomplete:</span> Please enter your <strong>age</strong> and <strong>city/region</strong>. This allows us to group votes anonymously and show cool demographic charts on poll results!
          </div>
        )}

        <ProfileForm initialData={userData} />
      </div>
    </div>
  );
}

import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import NewPollForm from "./NewPollForm";
export default async function NewPollPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 py-8 bg-white border border-indigo-50 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-black text-slate-800">Please Sign In 🔐</h2>
        <p className="text-slate-500 mt-2">You need to log in before you can create custom online polls!</p>
        <Link href="/" className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors">
          Go Back Home to Sign In
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto my-12 px-4 sm:px-6">
      <Link href="/" className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /><span>Back to Polls</span>
      </Link>
      <div className="bg-white border border-indigo-50 rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
          <div className="bg-violet-100 p-3 rounded-2xl text-violet-600"><PlusCircle className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Create a New Poll</h1>
            <p className="text-sm text-slate-500">Gather opinions from around the world! Ask a question and define choices.</p>
          </div>
        </div>
        <NewPollForm />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans text-white">
      <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2">TransitOps</h1>
        <p className="text-zinc-500 text-xs mb-8">Sign in to your enterprise account</p>
        
        <div className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
            <input 
              type="email" 
              defaultValue="alex.mercer@transitops.com"
              className="w-full px-4 py-2 text-sm border border-zinc-800 bg-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
            <input 
              type="password" 
              defaultValue="••••••••"
              className="w-full px-4 py-2 text-sm border border-zinc-800 bg-zinc-950 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              disabled
            />
          </div>
          
          <Link href="/dashboard">
            <button className="w-full py-2.5 mt-2 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg text-sm text-zinc-950 transition-colors">
              Continue as Financial Analyst (Demo)
            </button>
          </Link>
        </div>

        <p className="text-zinc-600 text-xs mt-6">
          No account? <span className="text-zinc-400 hover:underline cursor-pointer">Sign up here</span>
        </p>
      </div>
    </div>
  );
}

"use client";

import AuthBackground from "../components/auth/AuthBackground";
import SignupCard from "../components/auth/SignupCard";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md px-6">
        <SignupCard />
      </div>
    </main>
  );
}
"use client";

import SignupForm from "./SignupForm";

export default function SignupCard() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">
          Create Account
        </h1>

        <p className="mt-3 text-sm text-white/70">
          Welcome to EventQR Live
        </p>
      </div>

      <SignupForm />

      <div className="mt-8 text-center">
        <p className="text-sm text-white/70">
          Already have an account?
        </p>

        <a
          href="/login"
          className="mt-2 inline-block font-semibold text-pink-400 transition-colors hover:text-pink-300"
        >
          Login
        </a>
      </div>
    </div>
  );
}
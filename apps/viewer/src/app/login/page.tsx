"use client";

import AuthBackground from "../components/auth/AuthBackground";
import LoginCard from "../components/auth/LoginCard";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">

      <AuthBackground />

      <div className="relative w-full max-w-md">

        <div className="mb-8 text-center">

          <h1 className="text-5xl font-black tracking-tight text-white">
            EventQR
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Premium Event Experience
          </p>

        </div>

        <LoginCard>

          <h2 className="mb-2 text-3xl font-bold text-white">
            Welcome Back 👋
          </h2>

          <p className="mb-8 text-sm text-slate-400">
            Login to continue your dashboard.
          </p>

          <LoginForm />

        </LoginCard>

      </div>

    </main>
  );
}
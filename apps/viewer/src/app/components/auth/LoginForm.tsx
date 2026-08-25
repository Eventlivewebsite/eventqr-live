"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/app/lib/auth-client";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Checkbox from "../ui/Checkbox";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      console.log(result);

      router.push("/");
    } catch (err) {
      console.error(err);

      alert("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className="space-y-5"
    >
      <Input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox />

          Remember Me
        </label>

        <button
          type="button"
          className="text-sm text-pink-500 hover:text-pink-400 transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
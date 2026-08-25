"use client";

import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Checkbox from "../ui/Checkbox";



export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
      });

      console.log(result);

      alert("Account created successfully!");

      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Signup Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSignup}
      className="space-y-5"
    >
      <Input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
<label className="flex items-center gap-2 text-sm">
  <Checkbox
    checked={showPassword}
    onChange={() => setShowPassword(!showPassword)}
  />

  Show Password
</label>

      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
}
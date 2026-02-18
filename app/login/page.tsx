"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!data.user?.email_confirmed_at) {
      alert("Please verify your email before logging in.");
      await supabase.auth.signOut();
      return;
    }

    // Important: refresh session
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      alert("Session not created.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded-xl w-96">
        <h1 className="text-2xl mb-6 text-center">Login</h1>

        <input
          className="w-full mb-4 p-2 rounded bg-gray-800"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 p-2 rounded bg-gray-800"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-yellow-500 text-black py-2 rounded"
        >
          Login
        </button>

        <p>
          Don't have an account? <a href="/signup">Signup</a>
        </p>

      </div>
    </div>
  );
}

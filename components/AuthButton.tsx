"use client";

import { supabase } from "@/lib/supabase";

export default function AuthButton() {
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <button
      onClick={loginWithGoogle}
      className="px-6 py-3 bg-white text-black rounded-xl font-semibold"
    >
      Continue with Google
    </button>
  );
}
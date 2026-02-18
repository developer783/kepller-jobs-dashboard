"use client";

export default function GoldBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      <div className="absolute -top-1/2 left-1/2 w-[1200px] h-[1200px] 
        bg-gradient-to-br from-yellow-600/30 via-amber-500/10 to-transparent 
        rounded-full blur-[120px] animate-spin-slow" />

      <div className="absolute top-1/3 left-1/4 w-[800px] h-[800px] 
        bg-gradient-to-tr from-amber-400/20 to-transparent 
        rounded-full blur-[100px] animate-pulse" />
    </div>
  );
}
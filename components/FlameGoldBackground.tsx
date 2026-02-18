"use client";

export default function FlameGoldBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base black */}
      <div className="absolute inset-0 bg-black" />

      {/* Flame blob 1 */}
      <div className="absolute -top-1/2 left-1/4 w-[900px] h-[900px]
        bg-gradient-to-tr from-amber-500/40 via-yellow-400/20 to-transparent
        rounded-full blur-[140px] animate-flame-slow" />

      {/* Flame blob 2 */}
      <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px]
        bg-gradient-to-bl from-yellow-600/30 via-amber-400/20 to-transparent
        rounded-full blur-[120px] animate-flame-fast" />

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b 
        from-yellow-500/5 via-transparent to-black/90" />
    </div>
  );
}
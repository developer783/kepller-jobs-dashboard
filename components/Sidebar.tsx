"use client";

import { motion } from "framer-motion";
import { FaBriefcase, FaCogs } from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-black/70 backdrop-blur-xl border-r border-yellow-500/20 flex flex-col items-center py-8 z-50">
      <motion.div
        whileHover={{ scale: 1.15 }}
        className="text-yellow-400 text-xl mb-10 font-bold"
      >
        K22
      </motion.div>

      <nav className="flex flex-col gap-8 text-yellow-300/70">

        <a href="/history" className="sidebar-icon">
         📜
        </a>

        <a href="/analytics" className="sidebar-icon">
         📊
        </a>

      </nav>
    </aside>
  );
}

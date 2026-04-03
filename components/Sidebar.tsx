"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FaChartBar, FaHistory, FaTasks } from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();

  const items = [
    { href: "/history", label: "History", icon: FaHistory },
    { href: "/analytics", label: "Analytics", icon: FaChartBar },
    { href: "/saved-tasks", label: "Saved Tasks", icon: FaTasks },
  ];

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col items-center border-r border-yellow-500/20 bg-black/70 py-8 backdrop-blur-xl">
      <motion.div
        whileHover={{ scale: 1.15 }}
        className="mb-10 text-xl font-bold text-yellow-400"
      >
        K22
      </motion.div>

      <nav className="flex flex-col gap-8 text-yellow-300/70">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-icon ${isActive ? "scale-110 text-yellow-300" : ""}`}
              title={label}
              aria-label={label}
            >
              <Icon />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

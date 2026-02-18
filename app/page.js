"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import GoldBackground from "@/components/GoldBackground";
import { FaCrown } from "react-icons/fa";

import AuthButton from "@/components/AuthButton";



export default function Dashboard() {

  const supabase = createClient();
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };

    getUser();
  }, []);


  

      const scrapers = [
     { id: "adp", name: "ADP Jobs", desc: "Advanced ADP job discovery with AI enrichment" },
     { id: "ashby", name: "Ashby Jobs", desc: "Ashby-powered job boards with CSV export" },
     { id: "careersitejoblistingfeed", name: "Career Site Feed", desc: "Career site scraping with AI filters" },
     { id: "careersitepremium", name: "Premium Career API", desc: "High-quality ATS & career-site jobs" },
     { id: "greenhouse", name: "Greenhouse Jobs", desc: "Greenhouse-powered job scraping" },
     { id: "icims", name: "iCIMS Jobs", desc: "Structured iCIMS job extraction" },
     { id: "lever", name: "Lever Jobs", desc: "Lever-based job searches" },
     { id: "linkedin", name: "LinkedIn Jobs", desc: "LinkedIn jobs with advanced filters" },
     { id: "mercor", name: "Mercor Jobs", desc: "Mercor jobs by relevance & recency" },
     { id: "paradox", name: "Paradox Jobs", desc: "Paradox.ai job scraping" },
     { id: "workday", name: "Workday Jobs", desc: "Workday-powered job boards" },
     ];

     const router = useRouter();

     const logout = async () => {
     await supabase.auth.signOut();
     router.push("/login");
     };


     return (
     <div className="relative min-h-screen bg-black text-white pl-28 pr-12 py-16">
      <GoldBackground />
      <Sidebar />
      <AuthButton />


     <div style={{
         position: "absolute",
         top: "30px",
         right: "40px",
         textAlign: "right",
        }}>
       {userEmail && (
       <div style={{
         fontSize: "0.9rem",
         color: "#facc15",
         fontFamily: "Times New Roman, serif",
         }}>
         Logged in as <strong>{userEmail}</strong>
       </div>
      )}
    </div>


      {/* Header */}
      <motion.div
         initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
        <h1 className="text-6xl font-serif font-semibold tracking-wide 
          bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 
          bg-clip-text text-transparent">
           Kepler22 Jobs
          </h1>

         <p className="mt-4 text-lg text-yellow-300/70 font-serif tracking-wide">
          Premium Job Intelligence Dashboard
           </p>

           <div className="mt-6 flex justify-center">
             <div className="h-[1px] w-48 bg-gradient-to-r 
             from-transparent via-yellow-400/60 to-transparent" />
           </div>

      </motion.div>

      <button onClick={logout} style={{
         position: "fixed",
        bottom: "30px",
        right: "30px",
       padding: "10px 20px",
       background: "gold",
       color: "black",
       borderRadius: "20px"
       }}>
       Logout
     </button>


      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {scrapers.map((s, i) => (
          <motion.a
            key={s.id}
            href={`/scrapers/${s.id}/index.html`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{
              rotateX: 6,
              rotateY: -6,
              scale: 1.05,
            }}
            className="relative group perspective"
          >
            <div className="relative rounded-2xl p-7 bg-white/5 backdrop-blur-xl border border-yellow-400/20
              shadow-lg hover:shadow-[0_0_40px_rgba(255,215,0,0.35)] transition-all duration-300">

              {/* Gold icon badge */}
              <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full 
                bg-gradient-to-br from-yellow-400 to-amber-600 
                flex items-center justify-center shadow-lg">
                <FaCrown className="text-black text-sm" />
              </div>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-6 w-3 h-3 rounded-full 
                 bg-yellow-400 shadow-[0_0_20px_6px_rgba(255,215,0,0.6)]" />
              </div>


              <h2 className="text-xl font-semibold text-yellow-400">
                {s.name}
              </h2>

              <p className="mt-2 text-sm text-gray-300">
                {s.desc}
              </p>

              <span className="inline-block mt-5 text-xs tracking-widest text-yellow-300">
                OPEN →
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
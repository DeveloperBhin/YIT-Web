"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-yellow-400 via-red-500 to-pink-600 text-white">
      {/* Floating UNO cards */}
      <motion.div
        initial={{ y: -100, rotate: -20, opacity: 0 }}
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0], opacity: 1 }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute top-24 left-20 w-24 h-36 bg-white rounded-xl border-4 border-red-500 shadow-lg rotate-12"
      >
        <div className="flex h-full items-center justify-center text-4xl font-bold text-red-500">YIT</div>
      </motion.div>

      <motion.div
        initial={{ y: 100, rotate: 30, opacity: 0 }}
        animate={{ y: [0, 15, 0], rotate: [0, -8, 8, 0], opacity: 1 }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute bottom-24 right-20 w-24 h-36 bg-white rounded-xl border-4 border-blue-500 shadow-lg rotate-12"
      >
        <div className="flex h-full items-center justify-center text-4xl font-bold text-blue-500">UNO</div>
      </motion.div>

      {/* Title and tagline */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-6xl sm:text-7xl font-extrabold mb-4 tracking-wider drop-shadow-lg"
      >
       YIT UNO GAME
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="text-lg sm:text-xl mb-10 text-center max-w-md opacity-90"
      >
        Challenge your friends or join online matches in the colorful world of UNO.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-xs"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/login")}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-all shadow-md"
        >
          Login
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/register")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md"
        >
          Register
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-10 text-sm opacity-80"
      >
        Built by <span className="font-semibold">developerBhin</span>
      </motion.p>
    </div>
  );
}

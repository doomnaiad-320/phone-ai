"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "../app/i18n";
import UserTour from "@/components/UserTour";
import { useTour } from "@/hooks/useTour";

/**
 * Main content component for the home page
 * Renders the landing page with animations and interactive elements
 * 
 * @returns {JSX.Element} The rendered home page content
 */
export default function HomeContent() {
  const { t, fontClass, serifFontClass } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const { isTourVisible, currentTourSteps, completeTour, skipTour } = useTour();

  useEffect(() => {
    setMounted(true);
    const yellowImg = new Image();
    const redImg = new Image();
    
    yellowImg.src = "/background_yellow.png";
    redImg.src = "/background_red.png";
    
    Promise.all([
      new Promise(resolve => yellowImg.onload = resolve),
      new Promise(resolve => redImg.onload = resolve),
    ]).then(() => {
      setImagesLoaded(true);
    });
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full relative bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* 亮色主题装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-indigo-100 rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-sky-100 rounded-full opacity-25 animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-cyan-100 rounded-full opacity-20 animate-pulse delay-700"></div>
      </div>
      {/* 亮色主题装饰图标 */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-10 left-10 opacity-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15 8H21L16 12L18 18L12 14L6 18L8 12L3 8H9L12 2Z" fill="#3b82f6" />
          </svg>
        </div>
        <div className="absolute top-20 right-20 opacity-10">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0L12 6H18L13 10L15 16L10 12L5 16L7 10L2 6H8L10 0Z" fill="#6366f1" />
          </svg>
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-10">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" fill="#0ea5e9" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-1/4 opacity-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#06b6d4" />
          </svg>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-2xl px-4 relative z-20"
      >
        <h1 className="text-5xl font-cinzel mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-lg">
        Narratium
        </h1>
        <p
          className={`text-xl mb-12 tracking-wide ${serifFontClass} text-slate-600 leading-relaxed`}
        >
          {t("homePage.slogan")}
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
          <Link href="/character-cards">
            <motion.div
              className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm px-8 py-3 rounded-lg cursor-pointer ${fontClass} tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 font-medium`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {t("homePage.immediatelyStart")}
            </motion.div>
          </Link>
        </div>
      </motion.div>
      <UserTour
        steps={currentTourSteps}
        isVisible={isTourVisible}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </div>
  );
} 

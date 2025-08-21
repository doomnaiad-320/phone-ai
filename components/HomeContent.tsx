"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "../app/i18n";
import UserTour from "@/components/UserTour";
import { useTour } from "@/hooks/useTour";

// 模拟对话数据
const mockConversations = [
  {
    id: 1,
    name: "Ruth Acosta",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    lastMessage: "Hey, how are you doing today? I hope everything is going well for you!",
    time: "9:41",
    unread: true
  },
  {
    id: 2,
    name: "Lorena & Gus",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    lastMessage: "We are still good for tonight right? Let me know if anything changes.",
    time: "8:32",
    unread: false
  },
  {
    id: 3,
    name: "Will Fleming",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    lastMessage: "Thanks for the help earlier! Really appreciate it.",
    time: "Yesterday",
    unread: false
  },
  {
    id: 4,
    name: "Gus Kelly",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    lastMessage: "You should join us at dinner at work today",
    time: "Yesterday",
    unread: false
  },
  {
    id: 5,
    name: "Rachelle & Will",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    lastMessage: "Sounds good! See you there.",
    time: "Tuesday",
    unread: false
  },
  {
    id: 6,
    name: "Tina Hayes",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    lastMessage: "I'll be there in 5 minutes",
    time: "Tuesday",
    unread: false
  },
  {
    id: 7,
    name: "Artie Conway",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    lastMessage: "Perfect! Thanks for letting me know.",
    time: "Monday",
    unread: false
  },
  {
    id: 8,
    name: "Amanda Byers",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
    lastMessage: "Can't wait to see you!",
    time: "Monday",
    unread: false
  }
];

/**
 * Main content component for the home page
 * Renders an iMessage-style conversation list
 * 
 * @returns {JSX.Element} The rendered home page content
 */
export default function HomeContent() {
  const { t, fontClass } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isTourVisible, currentTourSteps, completeTour, skipTour } = useTour();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredConversations = mockConversations.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* iMessage 头部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-2xl font-bold text-black ${fontClass}`}>
            Messages
          </h1>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
        
        {/* 搜索框 */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${fontClass}`}
          />
        </div>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link href={`/character?id=char_${conversation.id}`}>
              <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                {/* 头像 */}
                <div className="relative flex-shrink-0 mr-3">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.unread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* 对话内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold text-black truncate ${fontClass}`}>
                      {conversation.name}
                    </h3>
                    <span className={`text-xs text-gray-500 flex-shrink-0 ml-2 ${fontClass}`}>
                      {conversation.time}
                    </span>
                  </div>
                  <p className={`text-sm text-gray-600 truncate ${fontClass}`}>
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* 未读指示器 */}
                {conversation.unread && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* 底部操作区域 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <Link href="/character-cards">
          <motion.button
            className={`w-full bg-blue-500 text-white py-3 rounded-lg font-medium ${fontClass} hover:bg-blue-600 transition-colors`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t("homePage.immediatelyStart")}
          </motion.button>
        </Link>
      </div>

      <UserTour
        steps={currentTourSteps}
        isVisible={isTourVisible}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </div>
  );
}

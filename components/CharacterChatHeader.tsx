/**
 * Character Chat Header Component
 *
 * This component provides the header interface for character chat interactions with the following features:
 * - Character avatar and name display
 * - View switching controls (chat, worldbook, regex, preset)
 * - Sidebar toggle functionality
 * - Responsive design with mobile adaptation
 * - Interactive button states and animations
 *
 * The component handles:
 * - Header layout and positioning
 * - View navigation controls
 * - Sidebar collapse/expand functionality
 * - Character information display
 * - Button interactions and tracking
 *
 * Dependencies:
 * - useLanguage: For internationalization
 * - CharacterAvatarBackground: For avatar display
 * - trackButtonClick: For analytics tracking
 */

"use client";

import { useState, useEffect } from "react";
import { CharacterAvatarBackground } from "@/components/CharacterAvatarBackground";
import { trackButtonClick } from "@/utils/google-analytics";
import { useLanguage } from "@/app/i18n";

/**
 * Interface definitions for the component's props
 */
interface Props {
  character: {
    name: string;
    avatar_path?: string;
  };
  serifFontClass: string;
  sidebarCollapsed: boolean;
  activeView: "chat" | "worldbook" | "regex" | "preset";
  toggleSidebar: () => void;
  onSwitchToView: (view: "chat" | "worldbook" | "regex" | "preset") => void;
  onToggleView: () => void;
  onToggleRegexEditor: () => void;
}

/**
 * Character chat header component
 *
 * Provides the main header interface for character interactions with:
 * - Character information display
 * - Navigation controls for different views
 * - Sidebar toggle functionality
 * - Responsive design adaptation
 *
 * @param {Props} props - Component props
 * @returns {JSX.Element} The character chat header interface
 */
export default function CharacterChatHeader({
  character,
  serifFontClass,
  sidebarCollapsed,
  activeView,
  toggleSidebar,
  onSwitchToView,
}: Props) {
  const { t, fontClass } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center">
      {sidebarCollapsed && (
        <button
          onClick={() => {
            trackButtonClick("page", "切换侧边栏");
            toggleSidebar();
          }}
          className="relative group ml-3 mr-3 px-3 py-1.5 rounded-lg bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-gray-300/60 hover:border-gray-400/70 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

          <div className="relative z-5 text-gray-600 group-hover:text-blue-600 transition-all duration-300 flex items-center justify-center cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5"
            >
              <path d="M5 12H19" />
              <polyline points="12 5 19 12 12 19" />
              <circle
                cx="19"
                cy="12"
                r="1"
                fill="currentColor"
                opacity="0.4"
                className="animate-pulse"
              >
                <animate
                  attributeName="opacity"
                  values="0.4;0.8;0.4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx="5"
                cy="12"
                r="0.5"
                fill="currentColor"
                opacity="0.6"
                className="animate-pulse"
              >
                <animate
                  attributeName="opacity"
                  values="0.6;1;0.6"
                  dur="1.5s"
                  repeatCount="indefinite"
                  begin="0.5s"
                />
              </circle>
            </svg>
            <span className={`ml-2 text-xs ${fontClass} group-hover:text-blue-600 transition-colors duration-300`}>
              {t("characterChat.expandSidebar")}
            </span>
          </div>

          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent group-hover:w-3/4 transition-all duration-500"></div>
        </button>
      )}

      <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 flex-1">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
            {character.avatar_path ? (
              <CharacterAvatarBackground avatarPath={character.avatar_path} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-5 md:w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          <h2
            className={`text-base md:text-lg text-gray-800 magical-text ${serifFontClass} truncate max-w-[120px] md:max-w-[200px]`}
          >
            {character.name}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 md:gap-0">
          <button
            onClick={() => {
              trackButtonClick("page", "切换世界书");
              if (activeView === "worldbook") {
                onSwitchToView("chat");
              } else {
                onSwitchToView("worldbook");
              }
            }}
            data-tour="worldbook-button"
            className={`group px-2 py-1.5 md:px-3 md:py-1 md:ml-2 flex items-center rounded-md border transition-all duration-300 shadow-md relative overflow-hidden portal-button ${
              activeView === "worldbook"
                ? "border-emerald-400/60 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:from-emerald-50 hover:to-emerald-100 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            }`}
          >
            <div
              className={`relative w-6 h-6 md:mr-2 flex items-center justify-center transition-colors ${
                activeView === "worldbook"
                  ? "text-emerald-600"
                  : "text-emerald-500 group-hover:text-emerald-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 eye-icon"
              >
                <path d="M2 12c2-4 6-7 10-7s8 3 10 7c-2 4-6 7-10 7s-8-3-10-7z" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <ellipse cx="12" cy="12" rx="0.5" ry="2" fill="#1a1816" />
              </svg>
              <span className="absolute inset-0 rounded-full border border-emerald-400/40 group-hover:border-emerald-500/60 animate-ring-pulse pointer-events-none"></span>
              <span className="absolute w-3 h-3 rounded-full bg-emerald-500/40 blur-sm animate-ping-fast top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></span>
            </div>
            <span
              className={`font-medium text-sm transition-all duration-300 ${serifFontClass} hidden md:block ${
                activeView === "worldbook"
                  ? "text-emerald-600"
                  : "text-emerald-500 group-hover:text-emerald-600"
              }`}
            >
              {t("characterChat.worldBook")}
            </span>
          </button>

          <button
            onClick={() => {
              trackButtonClick("page", "切换正则编辑器");
              if (activeView === "regex") {
                onSwitchToView("chat");
              } else {
                onSwitchToView("regex");
              }
            }}
            data-tour="regex-button"
            className={`group px-2 py-1.5 md:px-3 md:py-1 md:ml-2 flex items-center rounded-md border transition-all duration-300 shadow-md relative overflow-hidden ${
              activeView === "regex"
                ? "border-orange-400/60 bg-gradient-to-br from-orange-50 to-orange-100 shadow-[0_0_12px_rgba(251,146,60,0.3)]"
                : "border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:from-orange-50 hover:to-orange-100 hover:shadow-[0_0_12px_rgba(251,146,60,0.2)]"
            }`}
          >
            <div
              className={`relative w-6 h-6 md:mr-2 flex items-center justify-center transition-colors ${
                activeView === "regex"
                  ? "text-orange-600"
                  : "text-orange-500 group-hover:text-orange-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="absolute inset-0 rounded-full border border-orange-400/40 group-hover:border-orange-500/60 animate-ring-pulse pointer-events-none"></span>
              <span className="absolute w-3 h-3 rounded-full bg-orange-500/40 blur-sm animate-ping-fast top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></span>
            </div>
            <span
              className={`font-medium text-sm transition-all duration-300 ${serifFontClass} hidden md:block ${
                activeView === "regex"
                  ? "text-orange-600"
                  : "text-orange-500 group-hover:text-orange-600"
              }`}
            >
              {t("characterChat.regex")}
            </span>
          </button>

          <button
            onClick={() => {
              trackButtonClick("page", "切换预设编辑器");
              if (activeView === "preset") {
                onSwitchToView("chat");
              } else {
                onSwitchToView("preset");
              }
            }}
            data-tour="preset-button"
            className={`group px-2 py-1.5 md:px-3 md:py-1 md:ml-2 flex items-center rounded-md border transition-all duration-300 shadow-md relative overflow-hidden ${
              activeView === "preset"
                ? "border-purple-400/60 bg-gradient-to-br from-purple-50 to-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                : "border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:from-purple-50 hover:to-purple-100 hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
            }`}
          >
            <div
              className={`relative w-6 h-6 md:mr-2 flex items-center justify-center transition-colors ${
                activeView === "preset"
                  ? "text-purple-600"
                  : "text-purple-500 group-hover:text-purple-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="absolute inset-0 rounded-full border border-purple-400/40 group-hover:border-purple-500/60 animate-ring-pulse pointer-events-none"></span>
              <span className="absolute w-3 h-3 rounded-full bg-purple-500/40 blur-sm animate-ping-fast top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></span>
            </div>
            <span
              className={`font-medium text-sm transition-all duration-300 ${serifFontClass} hidden md:block ${
                activeView === "preset"
                  ? "text-purple-600"
                  : "text-purple-500 group-hover:text-purple-600"
              }`}
            >
              {t("characterChat.preset")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

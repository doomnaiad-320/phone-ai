/**
 * Character Cards Page Component - Contacts Style
 *
 * This page serves as a contacts/address book interface for managing character cards.
 * Features include:
 * - Contact list view with avatars and status
 * - Character import functionality
 * - Character editing capabilities
 * - Search and filter options
 * - Swipe to delete functionality
 * - Modern social app design
 *
 * The page integrates with various modals for character management and
 * provides a rich user experience with animations and interactive elements.
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/app/i18n";
import { motion } from "framer-motion";
import Link from "next/link";
import ImportCharacterModal from "@/components/ImportCharacterModal";
import EditCharacterModal from "@/components/EditCharacterModal";
import DownloadCharacterModal from "@/components/DownloadCharacterModal";
import { getAllCharacters } from "@/function/character/list";
import { deleteCharacter } from "@/function/character/delete";
import { handleCharacterUpload } from "@/function/character/import";
import { trackButtonClick } from "@/utils/google-analytics";
import { moveToTop } from "@/function/character/move-to-top";
import { Toast } from "@/components/Toast";

/**
 * Interface defining the structure of a character object
 */
interface Character {
  id: string;
  name: string;
  personality: string;
  scenario?: string;
  first_mes?: string;
  creatorcomment?: string;
  created_at: string;
  avatar_path?: string;
}

/**
 * Main character cards page component - Contacts Style
 */
export default function CharacterCards() {
  const { t, fontClass } = useLanguage();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloadingPresets, setIsDownloadingPresets] = useState(false);
  const [swipeStates, setSwipeStates] = useState<{[key: string]: { isOpen: boolean, startX: number, currentX: number }}>({});
  const touchStartRef = useRef<{[key: string]: { x: number, y: number, time: number }}>({});
  
  // ErrorToast state
  const [errorToast, setErrorToast] = useState({
    isVisible: false,
    message: "",
  });

  const showErrorToast = (message: string) => {
    setErrorToast({
      isVisible: true,
      message,
    });
  };

  const hideErrorToast = () => {
    setErrorToast({
      isVisible: false,
      message: "",
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCharacters = async () => {
    setIsLoading(true);
    
    // 直接提供测试数据用于功能验证
    const testCharacters: Character[] = [
      {
        id: "test-1",
        name: "艾莉娅",
        personality: "温柔善良的精灵法师，擅长治疗魔法，总是关心他人的安危。",
        scenario: "在魔法学院中学习",
        first_mes: "你好，我是艾莉娅，很高兴认识你！",
        creatorcomment: "测试角色1",
        created_at: new Date().toISOString(),
        avatar_path: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "test-2",
        name: "雷克斯",
        personality: "勇敢的战士，有着强烈的正义感，永远站在弱者一边。",
        scenario: "在冒险者公会接受任务",
        first_mes: "嘿！需要帮助吗？我是雷克斯！",
        creatorcomment: "测试角色2",
        created_at: new Date().toISOString(),
        avatar_path: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      },
      {
        id: "test-3",
        name: "露娜",
        personality: "神秘的占星师，能够预知未来，说话总是带着诗意。",
        scenario: "在星空下占卜",
        first_mes: "星辰告诉我，我们的相遇并非偶然...",
        creatorcomment: "测试角色3",
        created_at: new Date().toISOString(),
        avatar_path: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
      }
    ];
    
    // 模拟加载延迟
    setTimeout(() => {
      setCharacters(testCharacters);
      setIsLoading(false);
    }, 1000);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    setIsLoading(true);
    try {
      const response = await deleteCharacter(characterId);

      if (!response.success) {
        throw new Error(t("characterCardsPage.deleteFailed"));
      }

      fetchCharacters();
    } catch (err) {
      console.error("Error deleting character:", err);
      showErrorToast(t("characterCardsPage.deleteFailed") || "Failed to delete character");
      setIsLoading(false);
    }
  };

  const handleEditClick = (character: Character, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setCurrentCharacter(character);
    setIsEditModalOpen(true);
  };

  // 左滑删除相关函数
  const handleTouchStart = (characterId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current[characterId] = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    setSwipeStates(prev => ({
      ...prev,
      [characterId]: {
        isOpen: prev[characterId]?.isOpen || false,
        startX: touch.clientX,
        currentX: 0
      }
    }));
  };

  const handleTouchMove = (characterId: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const startTouch = touchStartRef.current[characterId];
    
    if (!startTouch) return;
    
    const deltaX = touch.clientX - startTouch.x;
    const deltaY = Math.abs(touch.clientY - startTouch.y);
    
    // 只有水平滑动距离大于垂直滑动距离时才处理
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
      e.preventDefault();
      
      // 只允许向左滑动
      const currentX = Math.min(0, deltaX);
      
      setSwipeStates(prev => ({
        ...prev,
        [characterId]: {
          ...prev[characterId],
          currentX: currentX
        }
      }));
    }
  };

  const handleTouchEnd = (characterId: string, e: React.TouchEvent) => {
    const startTouch = touchStartRef.current[characterId];
    const swipeState = swipeStates[characterId];
    
    if (!startTouch || !swipeState) return;
    
    const deltaX = swipeState.currentX;
    const deltaTime = Date.now() - startTouch.time;
    
    // 判断是否应该打开删除按钮
    const shouldOpen = deltaX < -60 || (deltaX < -30 && deltaTime < 300);
    
    setSwipeStates(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        isOpen: shouldOpen,
        currentX: shouldOpen ? -80 : 0
      }
    }));
    
    // 清理触摸开始数据
    delete touchStartRef.current[characterId];
  };

  const handleDeleteClick = (characterId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDeleteCharacter(characterId);
    
    // 关闭滑动状态
    setSwipeStates(prev => ({
      ...prev,
      [characterId]: { isOpen: false, startX: 0, currentX: 0 }
    }));
  };

  const closeSwipe = (characterId: string) => {
    setSwipeStates(prev => ({
      ...prev,
      [characterId]: { isOpen: false, startX: 0, currentX: 0 }
    }));
  };

  const handleEditSuccess = () => {
    fetchCharacters();
    setIsEditModalOpen(false);
    setCurrentCharacter(null);
  };

  /**
   * Downloads preset character cards for first-time users or when character list is empty
   */
  const downloadPresetCharacters = async () => {
    setIsDownloadingPresets(true);
    try {
      const response = await fetch("https://api.github.com/repos/Narratium/Character-Card/contents");
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error("Failed to fetch character files from GitHub");
        showErrorToast(t("characterCardsPage.downloadError") || "Failed to fetch preset characters");
        return;
      }

      const presetCharacterNames = [
        "《致炽焰以战歌》(二次元)(同人、二创).png",
        "为美好的世界献上祝福恋爱角色扮演--纯爱，同人二创(同人、二创).png",
        "在地下城寻求邂逅是否搞错了什么（拓展神明扮演）--纯爱，系统工具(玄幻、同人、二创).png",
      ];

      const pngFiles = data.filter((item: any) => 
        item.name.endsWith(".png") && presetCharacterNames.includes(item.name),
      );

      for (const file of pngFiles) {
        try {
          const fileResponse = await fetch(file.download_url || `https://raw.githubusercontent.com/Narratium/Character-Card/main/${file.name}`);
          if (!fileResponse.ok) {
            console.error(`Failed to download ${file.name}`);
            showErrorToast(`Failed to download ${file.name}`);
            continue;
          }
          
          const blob = await fileResponse.blob();
          const fileObj = new File([blob], file.name, { type: blob.type });
          
          await handleCharacterUpload(fileObj);
        } catch (error) {
          console.error(`Failed to import ${file.name}:`, error);
        }
      }

      await fetchCharacters();
      
      const isFirstVisit = localStorage.getItem("characterCardsFirstVisit") !== "false";
      if (isFirstVisit) {
        localStorage.setItem("characterCardsFirstVisit", "false");
      }
      
    } catch (error) {
      console.error("Error downloading preset characters:", error);
    } finally {
      setIsDownloadingPresets(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  // Check if this is the first visit and auto-download preset characters
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("characterCardsFirstVisit") !== "false";
    
    if ((isFirstVisit || characters.length === 0) && characters.length === 0 && !isLoading && !isDownloadingPresets) {
      downloadPresetCharacters();
    }
  }, [characters.length, isLoading, isDownloadingPresets]);

  if (!mounted) return null;

  // Filter characters based on search query
  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.personality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate status messages for characters
  const getCharacterStatus = (character: Character) => {
    const statusMessages = [
      "在线",
      "最近活跃",
      "忙碌中",
      "离开",
      "隐身"
    ];
    // Use character ID to consistently assign status
    const statusIndex = parseInt(character.id.slice(-1)) % statusMessages.length;
    return statusMessages[statusIndex];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "在线": return "bg-green-500";
      case "最近活跃": return "bg-yellow-500";
      case "忙碌中": return "bg-red-500";
      case "离开": return "bg-gray-500";
      case "隐身": return "bg-gray-400";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 通讯录头部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className={`text-2xl font-bold text-black ${fontClass}`}>
            通讯录
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button 
              onClick={() => setIsDownloadModalOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
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
            placeholder="搜索联系人"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${fontClass}`}
          />
        </div>
      </div>

      {/* 联系人列表 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-indigo-400 border-b-blue-300 border-l-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-t-indigo-400 border-r-blue-500 border-b-indigo-300 border-l-transparent animate-spin-slow"></div>
              <div className={`absolute w-full text-center top-20 text-blue-600 ${fontClass}`}>
                {isDownloadingPresets ? "下载预设角色中..." : "加载中..."}
              </div>
            </div>
          </div>
        ) : filteredCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4">
            <div className="mb-6 opacity-60">
              <svg className="mx-auto" width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 0L38 20H60L42 32L48 52L32 40L16 52L22 32L4 20H26L32 0Z" fill="#3b82f6" fillOpacity="0.3" />
              </svg>
            </div>
            <p className={`text-gray-600 mb-6 text-center ${fontClass}`}>
              {searchQuery ? "未找到匹配的联系人" : "还没有联系人"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className={`bg-blue-500 text-white px-6 py-3 rounded-lg ${fontClass} font-medium hover:bg-blue-600 transition-colors`}
              >
                添加第一个联系人
              </button>
            )}
          </div>
        ) : (
          filteredCharacters.map((character, index) => {
            const status = getCharacterStatus(character);
            const statusColor = getStatusColor(status);
            const swipeState = swipeStates[character.id] || { isOpen: false, startX: 0, currentX: 0 };
            
            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative overflow-hidden"
              >
                {/* 删除按钮背景 */}
                <div className="absolute right-0 top-0 h-full w-20 bg-red-500 flex items-center justify-center">
                  <button
                    onClick={(e) => handleDeleteClick(character.id, e)}
                    className="text-white p-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>

                {/* 主要内容区域 */}
                <div
                  className="bg-white transition-transform duration-200 ease-out"
                  style={{
                    transform: `translateX(${swipeState.currentX}px)`
                  }}
                  onTouchStart={(e) => handleTouchStart(character.id, e)}
                  onTouchMove={(e) => handleTouchMove(character.id, e)}
                  onTouchEnd={(e) => handleTouchEnd(character.id, e)}
                  onClick={() => {
                    if (swipeState.isOpen) {
                      closeSwipe(character.id);
                    }
                  }}
                >
                  <div className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                    {/* 可点击的主要区域 */}
                    <Link href={`/character?id=${character.id}`} className="flex items-center flex-1 min-w-0">
                      {/* 头像 */}
                      <div className="relative flex-shrink-0 mr-3">
                        <img
                          src={character.avatar_path || `https://images.unsplash.com/photo-${1500000000000 + parseInt(character.id.slice(-3))}?w=100&h=100&fit=crop&crop=face`}
                          alt={character.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&size=100&background=3b82f6&color=ffffff`;
                          }}
                        />
                        {/* 状态指示器 */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusColor} rounded-full border-2 border-white`}></div>
                      </div>

                      {/* 联系人信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold text-black truncate ${fontClass}`}>
                            {character.name}
                          </h3>
                          <span className={`text-xs text-gray-500 flex-shrink-0 ml-2 ${fontClass}`}>
                            {status}
                          </span>
                        </div>
                        <p className={`text-sm text-gray-600 truncate ${fontClass}`}>
                          {character.personality.length > 50
                            ? character.personality.substring(0, 50) + "..."
                            : character.personality}
                        </p>
                      </div>
                    </Link>

                    {/* 编辑按钮 - 独立于Link */}
                    <div className="flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => handleEditClick(character, e)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 模态框 */}
      <ImportCharacterModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={fetchCharacters}
      />
      <DownloadCharacterModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onImport={fetchCharacters}
      />
      {currentCharacter && (
        <EditCharacterModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          characterId={currentCharacter.id}
          characterData={{
            name: currentCharacter.name,
            personality: currentCharacter.personality,
            scenario: currentCharacter.scenario,
            first_mes: currentCharacter.first_mes,
            creatorcomment: currentCharacter.creatorcomment,
            avatar_path: currentCharacter.avatar_path,
          }}
          onSave={handleEditSuccess}
        />
      )}
      
      <Toast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        onClose={hideErrorToast}
        type="error"
      />
    </div>
  );
}

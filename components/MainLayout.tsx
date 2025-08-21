/**
 * Main layout component for the Narratium application
 * 
 * This component provides the core layout structure including:
 * - Responsive sidebar navigation
 * - Model settings sidebar
 * - Login modal integration
 * - Settings dropdown
 * - Mobile responsiveness handling
 * - Mobile bottom navigation
 * 
 * The layout uses a fantasy-themed UI with dynamic sidebar states
 * and responsive design considerations.
 * 
 * Dependencies:
 * - Sidebar: Main navigation component
 * - ModelSidebar: Model settings panel
 * - SettingsDropdown: Global settings menu
 * - LoginModal: Authentication modal
 * - MobileBottomNav: Mobile bottom navigation
 */

"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ModelSidebar from "@/components/ModelSidebar";
import SettingsDropdown from "@/components/SettingsDropdown";
import LoginModal from "@/components/LoginModal";
import AccountModal from "@/components/AccountModal";
import DownloadModal from "@/components/DownloadModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import { PluginRegistry } from "@/lib/plugins/plugin-registry";
import { PluginDiscovery } from "@/lib/plugins/plugin-discovery";
import { ToolRegistry } from "@/lib/tools/tool-registry";
import "@/app/styles/fantasy-ui.css";

/**
 * Main layout wrapper component that manages the application's core structure
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered in the main content area
 * @returns {JSX.Element} The complete layout structure with sidebars and content area
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelSidebarOpen, setModelSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    
    window.addEventListener("resize", checkIfMobile);
    
    // Handle closing model sidebar when character sidebar opens on mobile
    const handleCloseModelSidebar = () => {
      setModelSidebarOpen(false);
    };

    window.addEventListener("closeModelSidebar", handleCloseModelSidebar);
    
    // Handle opening login modal from other components
    const handleShowLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener("showLoginModal", handleShowLoginModal);
    
    // Initialize enhanced plugin system
    const initializePlugins = async () => {
      try {
        const pluginRegistry = PluginRegistry.getInstance();
        const pluginDiscovery = PluginDiscovery.getInstance();
        
        await pluginRegistry.initialize();
        await pluginDiscovery.discoverPlugins();
        
        // Expose plugin system to global scope for testing and debugging
        (window as any).pluginRegistry = pluginRegistry;
        (window as any).pluginDiscovery = pluginDiscovery;
        (window as any).toolRegistry = ToolRegistry;
        
        console.log("🔌 Enhanced plugin system initialized and exposed to window object");
      } catch (error) {
        console.error("❌ Failed to initialize enhanced plugin system:", error);
      }
    };

    initializePlugins();
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
      window.removeEventListener("closeModelSidebar", handleCloseModelSidebar);
      window.removeEventListener("showLoginModal", handleShowLoginModal);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleModelSidebar = () => {
    const newModelSidebarState = !modelSidebarOpen;
    setModelSidebarOpen(newModelSidebarState);
    
    // On mobile, when opening ModelSidebar, close CharacterSidebar to prevent conflicts
    if (isMobile && newModelSidebarState) {
      // Dispatch custom event to notify character page to close its sidebar
      const closeCharacterSidebarEvent = new CustomEvent("closeCharacterSidebar");
      window.dispatchEvent(closeCharacterSidebarEvent);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-full overflow-hidden fantasy-bg relative">
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
      
      {/* 移动端优先布局 - 完全移除桌面端侧边栏 */}
      <main className="flex-1 h-full overflow-auto pb-20 w-full">
        <div className="h-full relative">
          {/* 移动端设置按钮 - 右上角 */}
          <div className={`absolute top-4 right-4 z-[999] ${modelSidebarOpen ? "hidden" : ""}`}>
            <SettingsDropdown toggleModelSidebar={toggleModelSidebar} />
          </div>

          {children}
        </div>
      </main>

      {/* 移动端模型设置侧边栏 */}
      <div className="fixed right-0 top-0 h-full z-40">
        <ModelSidebar isOpen={modelSidebarOpen} toggleSidebar={toggleModelSidebar} />
      </div>

      {/* 移动端底部导航 */}
      <MobileBottomNav
        openLoginModal={() => setIsLoginModalOpen(true)}
        openAccountModal={() => setIsAccountModalOpen(true)}
      />
    </div>
  );
}

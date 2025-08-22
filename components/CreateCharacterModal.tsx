/**
 * Create Character Modal Component
 * 
 * 这个组件提供创建新角色的界面，包含以下功能：
 * - 角色基本信息编辑（姓名、备注、性别、喜好、厌恶、习惯、背景资料）
 * - 头像上传功能
 * - 表单验证和错误处理
 * - 简洁明了的样式设计
 * - 模态框状态管理和动画
 * 
 * 表单字段：
 * - 姓名（必填）
 * - 备注（对TA的称呼）
 * - 性别
 * - 喜好
 * - 厌恶
 * - 习惯
 * - 背景资料
 * - 头像上传
 */

import React, { useState, useRef } from "react";
import { useLanguage } from "@/app/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Toast } from "@/components/Toast";
import { createCharacter, validateCharacterData, CreateCharacterRequest } from "@/function/character/create";

/**
 * 创建角色模态框的属性接口
 */
interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 角色表单数据接口
 */
interface CharacterFormData {
  name: string;
  nickname: string;
  gender: string;
  likes: string;
  dislikes: string;
  habits: string;
  background: string;
  avatar?: File;
}

/**
 * 创建角色模态框组件
 */
const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, fontClass } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 表单状态
  const [formData, setFormData] = useState<CharacterFormData>({
    name: "",
    nickname: "",
    gender: "",
    likes: "",
    dislikes: "",
    habits: "",
    background: "",
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 错误提示状态
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

  // 处理表单字段变化
  const handleInputChange = (field: keyof CharacterFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理头像上传
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        showErrorToast("请选择图片文件");
        return;
      }
      
      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("图片文件不能超过5MB");
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 移除头像
  const removeAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: undefined
    }));
    setAvatarPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      nickname: "",
      gender: "",
      likes: "",
      dislikes: "",
      habits: "",
      background: "",
    });
    setAvatarPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 构建请求数据
    const requestData: CreateCharacterRequest = {
      name: formData.name,
      nickname: formData.nickname,
      gender: formData.gender,
      likes: formData.likes,
      dislikes: formData.dislikes,
      habits: formData.habits,
      background: formData.background,
      avatar: formData.avatar,
    };
    
    // 验证数据
    const validation = validateCharacterData(requestData);
    if (!validation.isValid) {
      showErrorToast(validation.errors[0]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用创建角色函数
      const response = await createCharacter(requestData);
      
      if (!response.success) {
        throw new Error(response.error || "创建角色失败");
      }
      
      // 成功后重置表单并关闭模态框
      resetForm();
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error("创建角色失败:", error);
      showErrorToast(error.message || "创建角色失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理模态框关闭
  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl z-10 max-h-[95vh] overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className={`text-xl font-semibold text-gray-900 ${fontClass}`}>
                添加新角色
              </h2>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 表单内容 */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              <div className="space-y-6">
                {/* 头像上传 */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="头像预览"
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-3 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${fontClass}`}
                  >
                    {avatarPreview ? "更换头像" : "上传头像"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`}
                      placeholder="请输入角色姓名"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                      备注（对TA的称呼）
                    </label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange('nickname', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`}
                      placeholder="昵称或称呼"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    性别
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`}
                  >
                    <option value="">请选择性别</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    喜好
                  </label>
                  <textarea
                    value={formData.likes}
                    onChange={(e) => handleInputChange('likes', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`}
                    placeholder="描述角色的喜好和兴趣..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    厌恶
                  </label>
                  <textarea
                    value={formData.dislikes}
                    onChange={(e) => handleInputChange('dislikes', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`}
                    placeholder="描述角色厌恶或不喜欢的事物..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    习惯
                  </label>
                  <textarea
                    value={formData.habits}
                    onChange={(e) => handleInputChange('habits', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`}
                    placeholder="描述角色的行为习惯和特点..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 ${fontClass}`}>
                    背景资料
                  </label>
                  <textarea
                    value={formData.background}
                    onChange={(e) => handleInputChange('background', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fontClass}`}
                    placeholder="描述角色的背景故事、经历等..."
                  />
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className={`px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors ${fontClass}`}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${fontClass}`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      创建中...
                    </div>
                  ) : (
                    "创建角色"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      <Toast
        isVisible={errorToast.isVisible}
        message={errorToast.message}
        onClose={hideErrorToast}
        type="error"
      />
    </AnimatePresence>
  );
};

export default CreateCharacterModal;
/**
 * Character Creation Function
 * 
 * 这个函数处理新角色的创建逻辑，包括：
 * - 角色数据验证和处理
 * - 头像文件保存
 * - 角色记录创建
 * - 错误处理和响应
 */

import { LocalCharacterRecordOperations } from "@/lib/data/roleplay/character-record-operation";
import { setBlob } from "@/lib/data/local-storage";
import { RawCharacterData } from "@/lib/models/rawdata-model";

/**
 * 创建角色的请求参数接口
 */
export interface CreateCharacterRequest {
  name: string;
  nickname?: string;
  gender?: string;
  likes?: string;
  dislikes?: string;
  habits?: string;
  background?: string;
  avatar?: File;
}

/**
 * 创建角色的响应接口
 */
export interface CreateCharacterResponse {
  success: boolean;
  characterId?: string;
  message?: string;
  error?: string;
}

/**
 * 创建新角色
 * 
 * @param characterData - 角色数据
 * @returns 创建结果
 */
export async function createCharacter(characterData: CreateCharacterRequest): Promise<CreateCharacterResponse> {
  try {
    // 验证必填字段
    if (!characterData.name || !characterData.name.trim()) {
      return {
        success: false,
        error: "角色姓名不能为空"
      };
    }

    // 生成角色ID
    const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 处理头像
    let imagePath = "";
    if (characterData.avatar) {
      imagePath = `${characterId}.${characterData.avatar.name.split('.').pop()}`;
      await setBlob(imagePath, characterData.avatar);
    }

    // 构建性格描述
    const personalityParts = [];
    if (characterData.gender) personalityParts.push(`性别：${characterData.gender}`);
    if (characterData.likes) personalityParts.push(`喜好：${characterData.likes}`);
    if (characterData.dislikes) personalityParts.push(`厌恶：${characterData.dislikes}`);
    if (characterData.habits) personalityParts.push(`习惯：${characterData.habits}`);
    if (characterData.background) personalityParts.push(`背景：${characterData.background}`);
    
    const personality = personalityParts.length > 0 ? personalityParts.join('；') : "一个有趣的角色";
    
    // 构建描述
    const description = characterData.nickname ? `被称为"${characterData.nickname}"的角色` : `名为${characterData.name}的角色`;
    
    // 构建第一条消息
    const firstMessage = `你好，我是${characterData.name}${characterData.nickname ? `，你可以叫我${characterData.nickname}` : ''}！很高兴认识你！`;

    // 构建完整的角色数据
    const rawCharacterData: RawCharacterData = {
      id: characterId,
      name: characterData.name.trim(),
      description: description,
      personality: personality,
      first_mes: firstMessage,
      scenario: "日常对话场景",
      mes_example: "",
      creatorcomment: "用户自定义角色",
      avatar: imagePath,
      sample_status: "在线",
      data: {
        name: characterData.name.trim(),
        description: description,
        personality: personality,
        first_mes: firstMessage,
        scenario: "日常对话场景",
        mes_example: "",
        creator_notes: "用户自定义角色",
        system_prompt: `你是${characterData.name}${characterData.nickname ? `（${characterData.nickname}）` : ''}。${personality ? `你的特点：${personality}。` : ''}请根据这些特点来回复用户的消息，保持角色的一致性。`,
        post_history_instructions: "",
        tags: ["自定义", "用户创建"],
        creator: "用户",
        character_version: "1.0",
        alternate_greetings: [],
        character_book: {
          entries: []
        }
      }
    };

    // 创建角色记录
    const characterRecord = await LocalCharacterRecordOperations.createCharacter(
      characterId,
      rawCharacterData,
      imagePath
    );

    return {
      success: true,
      characterId: characterRecord.id,
      message: "角色创建成功"
    };

  } catch (error: any) {
    console.error("创建角色失败:", error);
    return {
      success: false,
      error: error.message || "创建角色时发生未知错误"
    };
  }
}

/**
 * 验证角色数据
 * 
 * @param characterData - 要验证的角色数据
 * @returns 验证结果
 */
export function validateCharacterData(characterData: CreateCharacterRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证姓名
  if (!characterData.name || !characterData.name.trim()) {
    errors.push("角色姓名不能为空");
  } else if (characterData.name.trim().length > 50) {
    errors.push("角色姓名不能超过50个字符");
  }

  // 验证昵称
  if (characterData.nickname && characterData.nickname.length > 30) {
    errors.push("昵称不能超过30个字符");
  }

  // 验证其他字段长度
  if (characterData.likes && characterData.likes.length > 500) {
    errors.push("喜好描述不能超过500个字符");
  }

  if (characterData.dislikes && characterData.dislikes.length > 500) {
    errors.push("厌恶描述不能超过500个字符");
  }

  if (characterData.habits && characterData.habits.length > 500) {
    errors.push("习惯描述不能超过500个字符");
  }

  if (characterData.background && characterData.background.length > 1000) {
    errors.push("背景资料不能超过1000个字符");
  }

  // 验证头像文件
  if (characterData.avatar) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (characterData.avatar.size > maxSize) {
      errors.push("头像文件不能超过5MB");
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(characterData.avatar.type)) {
      errors.push("头像文件格式不支持，请使用 JPG、PNG、GIF 或 WebP 格式");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
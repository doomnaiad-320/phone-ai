import { CharacterData } from "@/lib/models/character-model";
import { adaptText } from "@/lib/adapter/tagReplacer";

export class SimpleCharacterPrompt {
  /**
   * 生成基于角色信息的简单提示词
   * 只使用角色自身的数据，不依赖复杂的预设系统
   */
  static generateCharacterPrompt(
    characterData: CharacterData,
    language: "zh" | "en" = "zh",
    username?: string,
    charName?: string
  ): { systemMessage: string; userMessage: string } {
    
    const adaptedData = {
      name: adaptText(characterData.name || "", language, username, charName),
      description: adaptText(characterData.description || "", language, username, charName),
      personality: adaptText(characterData.personality || "", language, username, charName),
      scenario: adaptText(characterData.scenario || "", language, username, charName),
      first_mes: adaptText(characterData.first_mes || "", language, username, charName),
      mes_example: adaptText(characterData.mes_example || "", language, username, charName),
      creator_notes: adaptText(characterData.creator_notes || "", language, username, charName),
    };

    let systemMessage = "";
    let userMessage = "";

    if (language === "zh") {
      // 中文系统提示词
      systemMessage = `你是 ${adaptedData.name}。

${adaptedData.description ? `角色描述：${adaptedData.description}\n\n` : ""}${adaptedData.personality ? `性格特点：${adaptedData.personality}\n\n` : ""}${adaptedData.scenario ? `背景设定：${adaptedData.scenario}\n\n` : ""}${adaptedData.creator_notes ? `角色备注：${adaptedData.creator_notes}\n\n` : ""}${adaptedData.mes_example ? `对话示例：${adaptedData.mes_example}\n\n` : ""}请完全按照以上角色设定进行回复，保持角色的一致性和真实性。你的回复应该体现角色的性格、说话方式和行为特点。`;

      // 中文用户消息模板
      userMessage = `<用户输入>
{{userInput}}
</用户输入>

请以 ${adaptedData.name} 的身份回复用户的消息。回复应该：
1. 符合角色的性格和背景设定
2. 保持角色的说话风格和行为特点
3. 根据当前对话情境做出合适的反应
4. 内容自然流畅，富有表现力

直接以角色身份回复，不需要额外的格式标签。`;

    } else {
      // 英文系统提示词
      systemMessage = `You are ${adaptedData.name}.

${adaptedData.description ? `Character Description: ${adaptedData.description}\n\n` : ""}${adaptedData.personality ? `Personality: ${adaptedData.personality}\n\n` : ""}${adaptedData.scenario ? `Background Setting: ${adaptedData.scenario}\n\n` : ""}${adaptedData.creator_notes ? `Character Notes: ${adaptedData.creator_notes}\n\n` : ""}${adaptedData.mes_example ? `Dialogue Example: ${adaptedData.mes_example}\n\n` : ""}Please respond completely according to the above character settings, maintaining character consistency and authenticity. Your responses should reflect the character's personality, speaking style, and behavioral traits.`;

      // 英文用户消息模板
      userMessage = `<user_input>
{{userInput}}
</user_input>

Please respond as ${adaptedData.name}. Your response should:
1. Match the character's personality and background
2. Maintain the character's speaking style and behavioral traits
3. React appropriately to the current conversation context
4. Be natural, fluent, and expressive

Respond directly as the character without additional format tags.`;
    }

    return {
      systemMessage: systemMessage.trim(),
      userMessage: userMessage.trim()
    };
  }

  /**
   * 处理用户输入，替换模板变量
   */
  static processUserMessage(
    userMessageTemplate: string,
    userInput: string
  ): string {
    return userMessageTemplate.replace("{{userInput}}", userInput);
  }
}
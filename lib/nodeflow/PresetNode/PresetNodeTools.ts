import { NodeTool } from "@/lib/nodeflow/NodeTool";
import { SimpleCharacterPrompt } from "@/lib/core/simple-character-prompt";
import { LocalCharacterRecordOperations } from "@/lib/data/roleplay/character-record-operation";
import { Character } from "@/lib/core/character";
import { PromptKey } from "@/lib/prompts/preset-prompts";

export class PresetNodeTools extends NodeTool {
  protected static readonly toolType: string = "preset";
  protected static readonly version: string = "1.0.0";

  static getToolType(): string {
    return this.toolType;
  }

  static async executeMethod(methodName: string, ...params: any[]): Promise<any> {
    const method = (this as any)[methodName];
    
    if (typeof method !== "function") {
      console.error(`Method lookup failed: ${methodName} not found in PresetNodeTools`);
      console.log("Available methods:", Object.getOwnPropertyNames(this).filter(name => 
        typeof (this as any)[name] === "function" && !name.startsWith("_"),
      ));
      throw new Error(`Method ${methodName} not found in ${this.getToolType()}Tool`);
    }

    try {
      this.logExecution(methodName, params);
      return await (method as Function).apply(this, params);
    } catch (error) {
      this.handleError(error as Error, methodName);
    }
  }

  static async buildPromptFramework(
    characterId: string,
    language: "zh" | "en" = "zh",
    username?: string,
    charName?: string,
    number?: number,
    fastModel: boolean = false,
    systemPresetType: PromptKey = "mirror_realm",
  ): Promise<{ systemMessage: string; userMessage: string; presetId?: string }> {
    try {
      const characterRecord = await LocalCharacterRecordOperations.getCharacterById(characterId);
      const character = new Character(characterRecord);

      // 使用简化的角色提示词生成器，只基于角色数据
      const { systemMessage, userMessage } = SimpleCharacterPrompt.generateCharacterPrompt(
        character.characterData,
        language,
        username,
        charName || character.characterData.name
      );

      console.log(`Using simple character prompt for character ${characterId} (${character.characterData.name})`);

      return {
        systemMessage,
        userMessage,
        presetId: `simple-character-${characterId}`
      };
    } catch (error) {
      this.handleError(error as Error, "buildPromptFramework");
    }
  }
} 

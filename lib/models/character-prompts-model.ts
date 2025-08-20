export interface CharacterPromptParams {
  username?: string;
  name: string;
  number: number;
  prefixPrompt?: string;
  chainOfThoughtPrompt?: string;
  suffixPrompt?: string;
  language?: "zh" | "en";
  systemPrompt?: string;
  storyHistory?: string;
  conversationHistory?: string;
  userInput?: string;
  sampleStatus?: string;
}

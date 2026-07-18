export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  message: string;
  reasoning: string;
  suggestedQuestions: string[];
}

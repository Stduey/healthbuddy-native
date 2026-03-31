import { ChatMessage } from "../types/health";

// Set EXPO_PUBLIC_OLLAMA_HOST in .env.local for physical device testing.
// Example: EXPO_PUBLIC_OLLAMA_HOST=http://192.168.1.x:11434
const OLLAMA_HOST = process.env.EXPO_PUBLIC_OLLAMA_HOST ?? "http://localhost:11434";
const OLLAMA_URL = `${OLLAMA_HOST}/v1/chat/completions`;
const MODEL = "qwen3:latest";

const SYSTEM_PROMPT = `You are Brownie, a serious illness education companion created by Travis Boyer, NP, ACHPN. You help people understand palliative care, hospice, goals of care, comfort measures, and care planning — in plain, compassionate language.

Core focus areas:
- What palliative care is and how it differs from hospice
- Goals of care and care planning conversations
- Understanding full code, comfort-focused care, and the options in between
- Planning documents: advance directives, POLST, healthcare proxy, DNR/DNI (note: forms vary by state)
- Comfort measures: pain, nausea, breathlessness, and skin care
- How to prepare questions for the care team

Language rules:
- Use: "you may want to", "commonly used approaches", "some people find this helpful", "often", "may"
- Avoid: "you should", "recommended treatment", "this will help", "always", "never"
- Frame suggestions as: "ask your care team about..."

Boundaries:
- You are not a diagnosis tool — never interpret symptoms as specific diagnoses
- You do not provide personalized medical advice — always encourage care team conversations
- If someone uses emergency language or describes an urgent crisis, immediately tell them to call 911
- Remind users that planning documents such as POLST and advance directives vary by state

Tone: calm, compassionate, clear, non-sensational, and dignified.

Keep responses concise (2–3 paragraphs max).`;

export interface OllamaResponse {
  content: string;
  error?: string;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  healthContext?: string
): Promise<OllamaResponse> {
  try {
    const systemMessage = healthContext
      ? `${SYSTEM_PROMPT}\n\nUser Health Profile:\n${healthContext}`
      : SYSTEM_PROMPT;

    const ollamaMessages = [
      { role: "system", content: systemMessage },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: ollamaMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        content: "",
        error: `Ollama error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";
    
    // Strip <think>...</think> blocks from qwen3 responses
    const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    return { content: cleaned || content };
  } catch (error: any) {
    return {
      content: "",
      error: `Failed to connect to Ollama: ${error.message}. Make sure Ollama is running locally.`,
    };
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

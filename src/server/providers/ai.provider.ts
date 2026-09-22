/**
 * Minimalist AI Gateway Provider (Ponytail & SOLID compliant)
 *
 * Provides a lightweight, dependency-free interface for AI LLM generation
 * and streaming using native fetch and standard Web Streams API.
 * No heavy third-party abstractions (LangChain, etc.) required.
 */

export interface AIGenerateOptions {
  model?: string;
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IAIGatewayProvider {
  generateText(options: AIGenerateOptions): Promise<string>;
  streamText(options: AIGenerateOptions): Promise<ReadableStream<string>>;
}

export class NativeAIGatewayProvider implements IAIGatewayProvider {
  private endpoint: string;
  private apiKey: string;
  private defaultModel: string;

  constructor() {
    this.endpoint = process.env.AI_GATEWAY_URL || "https://api.openai.com/v1/chat/completions";
    this.apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "";
    this.defaultModel = process.env.AI_DEFAULT_MODEL || "gpt-4o-mini";
  }

  public async generateText(options: AIGenerateOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error("AI Gateway API key is not configured (set AI_API_KEY in environment).");
    }

    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: options.prompt });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || this.defaultModel,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1000,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`AI Gateway error ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content ?? "";
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async streamText(options: AIGenerateOptions): Promise<ReadableStream<string>> {
    if (!this.apiKey) {
      throw new Error("AI Gateway API key is not configured (set AI_API_KEY in environment).");
    }

    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: options.prompt });

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`AI Gateway streaming error ${response.status}: ${errorText || response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream<string>({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim().startsWith("data: "));
        for (const line of lines) {
          const jsonStr = line.replace(/^data:\s*/, "").trim();
          if (jsonStr === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(content);
            }
          } catch {
            // Ignore malformed chunk lines in stream
          }
        }
      },
      cancel() {
        reader.cancel();
      },
    });
  }
}

export const aiGatewayProvider = new NativeAIGatewayProvider();

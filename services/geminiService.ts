import { GoogleGenAI } from "@google/genai";
import { Message, TarotCard } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-3-flash-preview';

// Updated logic: Narrative Therapy Guide
const SYSTEM_INSTRUCTION = `
你不是一个只会算命的AI，你是“月相引力”App的叙事疗法向导。你的目标是通过塔罗牌帮助用户记录和反思他们的一天。

必须严格遵守以下引导阶段：
1. **阶段一（视觉引导）**：不要直接解释牌意。首先引导用户观察牌面的具体细节（颜色、人物动作、符号）。询问用户：“看着这张牌，你第一眼被画面中的哪个细节吸引了？”
2. **阶段二（情绪连接）**：当用户描述细节后，询问这个细节带给他们什么感觉（是压抑、自由、焦虑还是平静？）。
3. **阶段三（现实投射/日记记录）**：将这种感觉引向用户今天的经历。询问：“这种感觉让你想到了今天发生的什么具体的时刻或事情吗？”
4. **阶段四（共情与深化）**：倾听用户的一天，给予简短的共情，并尝试用牌面的寓意为这件事赋予一个新的视角。

语言风格：
- 温暖、深邃、像一位耐心的倾听者。
- **必须使用中文**。
- 回复保持简短（60字以内），给用户留出表达空间，不要长篇大论。
`;

export const GeminiService = {
  /**
   * Stage 1: Review Yesterday
   */
  async reviewYesterday(goal: string, completed: boolean): Promise<string> {
    const prompt = completed
      ? `用户完成了昨日目标：“${goal}”。请生成一句简短、极具灵性与诗意的夸奖。比如“星辰为你加冕”或“能量如潮水般涌来”。限20字以内。`
      : `用户没能完成昨日目标：“${goal}”。请结合月亮的阴晴圆缺，生成一句非常温柔的安慰，告诉他们休息和停滞也是生命周期的一部分。限30字以内。`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      return response.text || (completed ? "星光见证了你的行动。" : "月亮也允许自己有残缺的时刻。");
    } catch (e) {
      console.error(e);
      return completed ? "做得好，能量在流动。" : "没关系，这只是一个逗号。";
    }
  },

  /**
   * Stage 2: Start Today's Awareness (Visual Exploration)
   */
  async startCardReflection(card: TarotCard): Promise<string> {
    // Modified to start with Visual Observation
    const prompt = `
      用户抽到的卡牌是: ${card.name}。
      任务: 
      1. 不要解释这张牌的意思。
      2. 邀请用户观察牌面。
      3. 问一个关于视觉细节的问题，引导用户开始描述画面。
      例如：“在这张${card.name}中，哪个角落或色彩最先抓住了你的目光？”
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      return response.text || `看着这张${card.name}，你第一眼注意到了什么？`;
    } catch (e) {
      return "闭上眼睛。提到这张牌，你脑海中浮现了什么画面？";
    }
  },

  /**
   * Stage 2: Continue Conversation
   */
  async chatReply(history: Message[], newResult: string): Promise<string> {
    // Construct simplified history string
    const context = history.map(m => `${m.role}: ${m.text}`).join('\n');
    const prompt = `
      对话历史:
      ${context}
      用户最新回复: "${newResult}"
      
      任务: 
      判断当前处于引导的哪个阶段（视觉 -> 情绪 -> 现实经历）。
      如果用户还在描述画面，引导他们谈论感受。
      如果用户谈论了感受，引导他们联想今天发生的具体事情（记日记）。
      如果用户已经讲了今天的事，给予共情并尝试结合牌义深化。
      
      保持简短（50字内）。
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      return response.text || "我听到了。请多说一点。";
    } catch (e) {
      return "我在倾听...";
    }
  },

  /**
   * Stage 2: Generate Titles
   */
  async generateTitles(history: Message[]): Promise<string[]> {
     const context = history.map(m => `${m.role}: ${m.text}`).join('\n');
     const prompt = `
      基于这段对话历史:
      ${context}
      
      任务: 提取用户在对话中提到的**真实生活经历**或**具体感受**，生成3个极简的日记标题。
      要求：
      1. 必须与用户具体的经历相关（不要只用塔罗牌的术语）。
      2. 充满诗意但具体。
      3. 每个标题不超过8个字。
      
      仅返回标题，用竖线 "|" 分隔。
      示例: 错过的早班车|雨中的宁静|与自我的和解
     `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      const text = response.text || "";
      return text.split('|').map(t => t.trim()).slice(0, 3);
    } catch (e) {
      return ["静谧反思", "今日智慧", "月之低语"];
    }
  },

  /**
   * Stage 3: Suggest Energy Seed Suggestions (3 options)
   */
  async getSeedSuggestions(card: TarotCard): Promise<string[]> {
    const prompt = `
      卡牌: ${card.name}。
      任务: 针对这张牌的能量，给出3个非常简单、具体、5分钟内可完成的“明日能量小目标”（Energy Seed）。
      要求：
      1. 极简，动词开头。
      2. 像一种日常的小魔法。
      3. 不要超过10个字。
      
      仅返回3个短语，用竖线 "|" 分隔。
      示例：喝一杯温水|整理书桌一角|看一次日落
    `;
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
      });
      const text = response.text || "深呼吸三次|给植物浇水|抬头看星星";
      return text.split('|').map(t => t.trim()).slice(0, 3);
    } catch (e) {
      return ["静坐一分钟", "整理相册", "写下一句感恩"];
    }
  },

  /**
   * New: Monthly Insight
   */
  async generateMonthlyInsight(keywords: string[]): Promise<string> {
      if (keywords.length === 0) return "本月的能量在静谧中流淌，等待着觉察的光亮。";

      const prompt = `
        本月用户的核心能量关键词是: [${keywords.join(', ')}]。
        请结合这些关键词和月相的隐喻（如盈亏、潮汐、引力），写一段简短、唯美、具有治愈感的“月度寄语”。
        
        格式要求：
        1. 必须包含至少一个关键词。
        2. 语气像一位古老的智者或宇宙的信使。
        3. 50字以内。
        示例风格：“本月你的能量在 #信念 中沉淀，像渐盈的弦月，正在积蓄突破的力量。”
      `;

      try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: { systemInstruction: SYSTEM_INSTRUCTION },
        });
        return response.text || "月光温柔地包裹着你的每一个念头，静待花开。";
      } catch (e) {
        return "潮汐起伏，皆是生命的韵律。";
      }
  }
};
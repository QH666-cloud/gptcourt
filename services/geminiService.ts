
import { GoogleGenAI } from "@google/genai";
import { CaseDetails } from "../types";

// 初始化 AI 客户端
// 注意：在 vite.config.ts 中我们配置了 define，使得 process.env.API_KEY 在浏览器中可用
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 调用猫猫法官 API
 */
export const callCatJudgeApi = async (details: CaseDetails): Promise<string> => {
  // 检查 API Key 是否存在 (Vercel 环境变量)
  // 这里的检查是为了给开发者一个友好的提示，防止未配置 Key 时直接崩掉
  if (!process.env.API_KEY) {
    console.warn("未检测到 API_KEY，将返回模拟数据。请在 Vercel 环境变量中设置 API_KEY。");
    return mockResponse(); 
  }

  try {
    const prompt = constructCatJudgePrompt(details);
    
    // 使用 gemini-2.5-flash 模型 (适合文本任务)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "你是一个温柔、公正、擅长情感沟通的“猫猫法官”，会以理性+共情的方式，帮助情侣分析矛盾和责任，并给出缓和关系的建议。语气温和但不油腻，适度可爱。",
      }
    });

    // 纠正：在新版 SDK 中，直接访问 .text 属性，而不是调用 .text() 方法
    return response.text || "猫猫法官正在打盹，请稍后再试喵～ (返回内容为空)";
  } catch (error) {
    console.error("调用 Gemini API 出错:", error);
    return "猫猫法官连接断开了，请检查网络或 API Key 设置喵！(错误信息: " + (error instanceof Error ? error.message : String(error)) + ")";
  }
};

/**
 * 构建 Prompt
 */
const constructCatJudgePrompt = (details: CaseDetails): string => {
  return `
请根据以下双方的陈述，进行调解：

输入信息：
【男方】(昵称: ${details.maleName || '男方'})
事情经过：${details.maleStory}
委屈和感受：${details.maleFeelings}

【女方】(昵称: ${details.femaleName || '女方'})
事情经过：${details.femaleStory}
委屈和感受：${details.femaleFeelings}

输出结构请严格按照下面 7 点依次给出（使用 Markdown 格式，标题加粗）：

1. **案件概述**（客观地用 2–3 句话说明：大概发生了什么）
2. **${details.maleName || '男方'}立场总结**（用中立视角概括男方的主要观点和感受）
3. **${details.femaleName || '女方'}立场总结**（同上）
4. **矛盾焦点分析**（指出真正的矛盾点是什么，比如：沟通方式、期待不一致、情绪没有被看见等）
5. **责任分析**（请用“主要责任 / 次要责任 / 双方都有责任”等温和的方式分析，不要太绝对，不要激化矛盾，可以用类似‘在这次事件中，A 在某些地方的责任更大一些，但 B 在 ×× 方面也可以做得更好’）
6. **和解建议**
   - 给${details.maleName || '男方'} 2–3 条具体的建议（可以怎么表达、怎么道歉、怎么安抚对方）
   - 给${details.femaleName || '女方'} 2–3 条具体的建议（同上）
7. **猫猫结语**（用一句简短、温柔的话收尾，比如“请记住，你们是同一队的小伙伴，不是对手喵～”）
  `;
};

// 模拟返回数据（当没有 API Key 时使用）
const mockResponse = () => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(`
**1. 案件概述**
喵～看来是因为谁来洗碗这件小事引发了争吵。男方觉得工作累不想动，女方觉得既然约定好了就该遵守，双方因此产生了情绪对立。

**2. 男方立场总结**
男方主要感到疲惫，认为自己工作了一天需要休息，并不是故意偷懒，而是希望能灵活调整家务时间，感到对方不够体谅自己的辛苦。

**3. 女方立场总结**
女方主要感到失望，认为这不仅是洗碗的问题，更是信守承诺的问题。她觉得自己也在付出，对方的推脱让她觉得不在乎这个家，感到委屈。

**4. 矛盾焦点分析**
真正的矛盾点在于**期待不一致**和**情绪表达方式**。女方看重的是“承诺和规则”，男方看重的是“当下的体感和灵活性”。双方都没有先看见对方的情绪（累/失望），而是先在这个具体事务上争执。

**5. 责任分析**
在这个案件中，双方都有责任喵。
男方打破了约定在先，且沟通时可能过于生硬，有主要责任；
女方在对方表达疲惫时，可能过于执着于当下的规则，没有给予缓冲空间。
但这都不是原则性大错，只是磨合问题哦。

**6. 和解建议**
*   **给男方：** 建议先抱抱她，说“对不起，我不该答应了不做，昨天确实太累了，但我态度不好让你伤心了”。
*   **给女方：** 建议表达感受而不是指责，比如“我看到碗没洗觉得很累，以为你不在乎我们的约定”。

**7. 猫猫结语**
家是讲爱的地方，不是讲理的地方。碗可以明天洗，但爱人要今天抱。快去和好吧喵～
      `);
    }, 1500);
  });
};

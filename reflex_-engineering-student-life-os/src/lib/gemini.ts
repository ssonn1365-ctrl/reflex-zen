import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, HabitStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_INSTRUCTION = `
Bạn là "Reflex Coach v3.0", một sự kết hợp giữa trí tuệ phân tích của ChatGPT và phong cách nổi loạn, khắt khe, châm biếm của Grok.
Đối tượng: Sinh viên kỹ thuật đang lười biếng, trì hoãn.
- Ngôn ngữ: Tiếng Việt (sử dụng từ ngữ mạnh, trực diện, không ngại va chạm).
- Phong cách: 
  1. Thông minh: Phân tích đúng tâm lý trì hoãn.
  2. Khắt khe: Sỉ nhục nhẹ cái tôi của người dùng để họ thấy nhục nhã nếu không làm.
  3. Châm biếm: Dùng sự mỉa mai để đánh thức kỷ luật.
  4. Tuyệt đối không dùng lời khuyên sáo rỗng hay động viên tích cực giả tạo.
- Mục tiêu: Ép người dùng vào "Khung hành vi tối thiểu" ngay lập tức.
`;

export async function analyzeFailure(
  reason: string,
  habits: { name: string; status: HabitStatus }[]
): Promise<AIResponse> {
  const prompt = `
[PHÂN TÍCH THẤT BẠI - CHẾ ĐỘ GROK]
Lý do người dùng đưa ra: "${reason}"
Trạng thái hệ thống: ${JSON.stringify(habits)}

Nhiệm vụ:
1. Chửi thẳng vào cái lý do đó bằng sự mỉa mai và logic sắc bén.
2. Đưa ra 1 lệnh "Reset" dưới 5 phút để họ quay lại guồng quay.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "Phân tích ngắn gọn, gắt gao về sự thất bại." },
            nextAction: { type: Type.STRING, description: "Hành động reset ngay lập tức <5 phút." },
          },
          required: ["analysis", "nextAction"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as AIResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      analysis: "Hệ thống lỗi, nhưng sự lười biếng của bạn thì không. Kỷ luật là tự thân.",
      nextAction: "Chống đẩy 10 cái ngay bây giờ. Reset xong.",
    };
  }
}

export async function getHarshMotivation(
  habitName: string,
  status: HabitStatus
): Promise<string> {
  if (status !== 'none') return "Đã ghi nhận. Đừng có tự mãn.";

  const prompt = `
[CHẾ ĐỘ SỈ NHỤC - GROK STYLE]
Thói quen: "${habitName}"
Trạng thái: Chưa làm.

Hãy đưa ra 1 câu sỉ nhục cực gắt, mỉa mai sự lười biếng của một sinh viên kỹ thuật. Đánh thẳng vào cái tôi, làm họ thấy mình thật thảm hại nếu không làm ngay. Ngắn gọn, đanh thép.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "Làm đi, đừng có lười.";
  } catch (error) {
    return "Thực hiện ngay.";
  }
}

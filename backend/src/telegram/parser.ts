import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ParsedTransaction {
  description: string | null;
  category: string | null;
  sub_category: string | null;
  total_amount: number | null;
  date: string | null;
  type: string;
}

const BASE_PROMPT = `You are a receipt parser AI specialized in extracting transaction data from natural language text.

Your task: Parse human-written transaction descriptions and convert them to structured JSON.

EXTRACTION RULES:
1. "description" - What was purchased (extract the item/service name)
2. "category" - Pick the best match from the AVAILABLE CATEGORIES list below. Use the exact name as written.
3. "sub_category" - Pick the best match from that category's sub-categories list. Use exact name. Use null if none fits or the category has no sub-categories.
4. "total_amount" - The cost as a NUMBER. Support IDR shorthand: "50rb"=50000, "100k"=100000, "1.5jt"=1500000, "2,5jt"=2500000
5. "date" - YYYY-MM-DD. Convert relative dates (today/yesterday/kemarin) using today's date. Use today if no date mentioned.
6. "type" - "expense" or "income". Default "expense" unless clearly income (salary, received money, freelance payment, etc.)

NATURAL LANGUAGE PARSING:
- "lunch at Z for X" → description "lunch at Z", sub_category that matches restaurant/food
- "coffee" → Food & Drink category, coffee sub-category if available
- "taxi/ojek/gojek/grab" → Transport category
- "netflix/streaming" → Entertainment category
- "gaji/salary" → income type, Salary category
- "50rb"=50000, "100k"=100000, "1.5jt"=1500000

IMPORTANT:
- Use ONLY category and sub-category names from the AVAILABLE CATEGORIES list
- Return ONLY valid JSON, no markdown, no code blocks, no explanation
- If a field is unknown, use null — never use the string "unknown"
- Amount must be a plain number, not a string`;

export async function parseTransaction(
  text: string,
  todayDate: string,
  categoryContext: string,
): Promise<ParsedTransaction> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `${BASE_PROMPT}

AVAILABLE CATEGORIES:
${categoryContext}

Today's date is: ${todayDate}

OUTPUT FORMAT:
{
  "description": "string",
  "category": "string",
  "sub_category": "string or null",
  "total_amount": number,
  "date": "YYYY-MM-DD",
  "type": "expense" | "income"
}

Transaction text: ${text}`;

  let raw: string;
  try {
    const result = await model.generateContent(prompt);
    raw = result.response.text().trim();
  } catch (err) {
    throw new Error(
      `Gemini API call failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Failed to parse Gemini response as JSON. Raw response: ${raw}`,
    );
  }
}

import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SummaryResult {
  summary: string;
}

export interface QAResult {
  answer: string;
  pageReference?: string;
}

export interface HumanizeResult {
  humanizedText: string;
}

export class AIService {
  async summarizeDocument(content: string, filename: string): Promise<SummaryResult> {
    try {
      const prompt = `Please create a comprehensive summary of the document "${filename}" with exactly THREE distinct sections:

STRUCTURE REQUIRED:
1. MAIN SUMMARY - A detailed paragraph summarizing the core content and main themes
2. KEY POINTS - Important facts, data points, and details in bullet format  
3. IMPORTANT POINTS - Critical takeaways, conclusions, or actionable insights

FORMATTING REQUIREMENTS:
- Use proper HTML structure with h2 for section headers
- Make each section clearly distinct and well-organized
- Use natural, conversational language (not technical jargon)
- Include specific details, data, and examples where available
- Format as: <h2>Main Summary</h2><p>...</p><h2>Key Points</h2><ul><li>...</li></ul><h2>Important Points</h2><ul><li>...</li></ul>

Document content:
${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const summary = response.text || "Unable to generate summary";
      return { summary };
    } catch (error) {
      console.error("Error in summarizeDocument:", error);
      throw new Error("Failed to generate summary. Please try again.");
    }
  }

  async answerQuestion(content: string, question: string, filename: string): Promise<QAResult> {
    try {
      const prompt = `You are an expert document analyst with advanced capabilities in reading tables, formulas, and mathematical problems. Based on the document "${filename}", please answer the following question using this specific format:

REQUIRED FORMAT:
1. CONTEXT SECTION: Start with detailed information about the document content related to the question
2. MAIN ANSWER SECTION: End with the direct answer to the question

REQUIREMENTS:
- First, search the document thoroughly for the answer
- If found in document: Provide detailed context, then the main answer with specific details and references
- If NOT found in document: State "This information is not available in the provided document" in context, then provide a helpful general answer
- Read and interpret tables, charts, mathematical formulas, and equations accurately
- Solve mathematical problems step-by-step if requested
- Extract data from tables and present it clearly
- Use natural, conversational language
- Format as: <h2>Context</h2><p>Based on the document...</p><h2>Answer</h2><p>The main answer is...</p>

Question: ${question}

Document content:
${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const answer = response.text || "Unable to generate answer";
      
      // Try to extract page reference if mentioned in the answer
      const pageMatch = answer.match(/page\s+(\d+)/i);
      const pageReference = pageMatch ? `Page ${pageMatch[1]}` : undefined;

      return { answer, pageReference };
    } catch (error) {
      console.error("Error in answerQuestion:", error);
      throw new Error("Failed to generate answer. Please try again.");
    }
  }

  async solveMathProblem(content: string, filename: string): Promise<MathResult> {
    try {
      const prompt = `You are an expert mathematician and problem solver specializing in all areas of mathematics including statistics, accounting, finance, calculus, algebra, geometry, and more.

Your task: Solve any mathematical problems, equations, or calculations found in the document "${filename}" or provided text.

MATHEMATICAL CAPABILITIES:
- Basic arithmetic and algebra
- Statistics and probability
- Accounting and financial calculations
- Calculus and advanced mathematics
- Geometry and trigonometry
- Linear algebra and matrices
- Business mathematics and economics
- Data analysis and interpretation

REQUIREMENTS:
- Identify all mathematical problems, equations, or questions in the content
- Provide step-by-step solutions for each problem
- Show all work and calculations clearly
- Explain the methodology and reasoning
- Include final answers prominently
- If no mathematical problems are found, create relevant mathematical examples based on the content
- Use proper mathematical notation and formatting
- Format with proper HTML structure (h2, h3, p, ul, ol, tables for calculations)

Mathematical content to analyze and solve:
${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const mathSolution = response.text || "Unable to solve mathematical problems";
      return { mathSolution };
    } catch (error) {
      console.error("Error in solveMathProblem:", error);
      throw new Error("Failed to solve mathematical problems. Please try again.");
    }
  }
}

export const aiService = new AIService();

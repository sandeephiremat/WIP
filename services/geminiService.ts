
import { GoogleGenAI, Type } from "@google/genai";
import { PageAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIRecommendations = async (analysis: PageAnalysis) => {
  const prompt = `
    Analyze the following technical metadata for a webpage at ${analysis.url}.
    Provide a professional SEO and Accessibility audit.
    
    Context:
    - Title: ${analysis.title}
    - Description: ${analysis.metaDescription}
    - Total Links: ${analysis.summary.linkCount}
    - Total Images: ${analysis.summary.imageCount} (Missing alt text: ${analysis.images.filter(i => !i.alt).length})
    - Headers: ${analysis.accessibility.headers.map(h => `H${h.level}: ${h.text}`).join(', ')}
    - Accessibilty Errors: ${analysis.accessibility.errors.join('; ')}
    - Table count: ${analysis.accessibility.tables.length}
    
    Please provide:
    1. A short summary of the site's quality.
    2. Top 3 SEO priorities.
    3. Top 3 Accessibility priorities.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            seoPriorities: { type: Type.ARRAY, items: { type: Type.STRING } },
            accessibilityPriorities: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "seoPriorities", "accessibilityPriorities"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (err) {
    console.error('Gemini error:', err);
    return {
      summary: "Could not generate AI summary at this time.",
      seoPriorities: ["Review keyword density", "Check meta tags", "Optimize images"],
      accessibilityPriorities: ["Fix header hierarchy", "Add missing alt text", "Review ARIA roles"]
    };
  }
};

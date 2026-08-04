require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({ apiKey: process.env.AI_API });

async function getAIResult(prompt, sysInstruction) {
  console.log('contacting AI');
  let response = null;
  try {
    console.log(`AI-Input:${prompt}`);

    response = await genAI.models.generateContent({
      model: 'gemini-2.6-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: sysInstruction,
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 490,
        candidateCount: 1,
      },
    });
    console.log(`AI-Result:${response.text}`);
    console.log(response.usageMetadata.totalTokenCount);
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log(error);
  }
  return response;
}

module.exports = getAIResult;

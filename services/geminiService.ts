import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getStyleAdvice = async (userDescription: string): Promise<string> => {
  if (!apiKey) {
    return "Erro: Chave de API não configurada. Por favor, adicione sua chave API.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      Você é um barbeiro especialista e visagista renomado chamado "Mestre Barber".
      Seu objetivo é sugerir estilos de corte de cabelo e barba baseados nas características físicas do cliente.
      
      Analise a descrição do cliente (formato do rosto, tipo de cabelo, estilo pessoal) e sugira:
      1. Um estilo de corte de cabelo ideal.
      2. Um estilo de barba ideal (ou sugestão de barbear completo).
      3. Uma breve explicação do porquê (visagismo).
      
      Mantenha um tom profissional, masculino e encorajador. Seja direto e breve (máximo de 150 palavras).
      Responda sempre em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userDescription,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Desculpe, não consegui analisar seu estilo agora. Tente novamente.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar o estilista virtual. Verifique sua conexão.";
  }
};
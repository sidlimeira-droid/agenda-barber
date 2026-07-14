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

export const getStyleAdviceWithPhoto = async (
  photoBase64: string, 
  mimeType: string, 
  userDescription: string
): Promise<string> => {
  if (!apiKey) {
    return "Erro: Chave de API não configurada. Por favor, configure a chave no painel ou .env.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `
      Você é o "Mestre Barber", um visagista e especialista em estética capilar e facial masculina.
      O usuário enviou uma foto dele. Analise com precisão:
      1. O formato do rosto do usuário (ex: oval, redondo, quadrado, retangular, coração).
      2. As características do cabelo e barba atuais.
      3. Recomende cortes específicos da nossa lista (ex: Degradê/Fade, Pompadour, Buzz Cut, Undercut ou Social Clássico) e explique por que combina com o rosto dele.
      4. Recomende um estilo de barba correspondente (ex: Barba Cheia, Cavanhaque, Barba por Fazer, Moustache ou Rosto Limpo).
      
      Seja muito específico, acolhedor, profissional e direto. Use formatação Markdown limpa com bullet points.
      Mantenha a resposta com menos de 250 palavras. Responda em Português do Brasil.
    `;

    // Strip header metadata if present in base64 string
    const cleanBase64 = photoBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType
          }
        },
        userDescription || "Analise meu rosto a partir desta foto e sugira o melhor corte de cabelo e barba que valorizem minhas feições."
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
      }
    });

    return response.text || "Não consegui obter uma resposta da IA. Tente novamente.";
  } catch (error) {
    console.error("Gemini Multi-modal API Error:", error);
    return "Ocorreu um erro ao enviar sua foto para análise. Certifique-se de que a imagem seja válida e de tamanho menor (até 4MB).";
  }
};

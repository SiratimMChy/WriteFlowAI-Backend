import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ success: false, message: 'Messages are required' });
      return;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const geminiHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
    }));

    const lastMessage = messages[messages.length - 1];
    const prompt = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);

    const chatSession = model.startChat({ history: geminiHistory });
    const result = await chatSession.sendMessageStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`0:${JSON.stringify(chunkText)}\n`);
      }
    }
    res.end();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.write(`3:${JSON.stringify(error.message)}\n`);
      res.end();
    }
  }
};

export const draft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, tone, keywords } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt is required' });
      return;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `You are an expert AI copywriter. Write a draft based on the following topic/prompt: "${prompt}".
Tone: ${tone || 'Professional'}.
Keywords to include: ${keywords || 'None'}.
Return ONLY the drafted content, properly formatted with paragraphs. Do not include any preamble or meta-commentary.`;

    const result = await model.generateContentStream(fullPrompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(chunkText);
      }
    }
    res.end();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
  }
};

export const rewrite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, action, format } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt is required' });
      return;
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const actionDescriptions: Record<string, string> = {
      grammar: 'Fix all grammar, spelling, and punctuation errors while keeping the original meaning.',
      shorten: 'Shorten the text significantly while preserving the key message.',
      lengthen: 'Expand and elaborate on the text with more detail and examples.',
      professional: 'Rewrite the text in a professional, formal business tone.',
      casual: 'Rewrite the text in a friendly, casual conversational tone.',
    };

    const actionInstruction = actionDescriptions[action] || actionDescriptions.grammar;
    const formatInstruction = format === 'bullets' ? 'Format the output as a bulleted list.' : format === 'paragraphs' ? 'Format the output as well-structured paragraphs.' : 'Keep the original format.';

    const fullPrompt = `${actionInstruction} ${formatInstruction}\n\nText to rewrite:\n${prompt}\n\nReturn ONLY the rewritten content, no preamble.`;

    const result = await model.generateContentStream(fullPrompt);
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(chunkText);
      }
    }
    res.end();
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
  }
};

export const generateDescription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ success: false, message: 'Title is required' });
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a compelling and detailed description for an AI content generation template titled: "${title}". Keep it under 150 words.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();

    res.json({ success: true, message: 'Request successful', data: { description } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviews } = req.body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      res.status(400).json({ success: false, message: 'An array of reviews is required' });
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const reviewsText = reviews.map((r: any) => `- Rating: ${r.rating}/5, Comment: ${r.comment}`).join('\n');
    const prompt = `Summarize the following customer reviews and determine the overall sentiment (Positive, Neutral, or Negative).\n\nReviews:\n${reviewsText}\n\nProvide the summary in a concise paragraph followed by the sentiment.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ success: true, message: 'Request successful', data: { summary } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

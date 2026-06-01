import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt is required' });
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, message: 'Request successful', data: { text } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
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

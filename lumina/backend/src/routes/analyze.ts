import { Router } from 'express';
import { analyzeText } from '../services/sentiment.js';
import type { AnalyzeRequest, AnalyzeResponse } from '@lumina/shared';

export const analyzeRoute = Router();

analyzeRoute.post('/', async (req, res) => {
  try {
    const { text, conversationHistory = [] }: AnalyzeRequest = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const sentiment = analyzeText(text, conversationHistory);

    const response: AnalyzeResponse = {
      sentiment
    };

    res.json(response);
  } catch (error: any) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze sentiment',
      message: error.message 
    });
  }
});

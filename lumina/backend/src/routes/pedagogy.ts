import { Router } from 'express';
import { generatePedagogyResponse, streamPedagogyResponse } from '../services/pedagogy.js';
import type { PedagogyRequest, PedagogyResponse } from '@lumina/shared';

export const pedagogyRoute = Router();

pedagogyRoute.post('/', async (req, res) => {
  try {
    const request: PedagogyRequest = req.body;

    if (!request.userQuestion) {
      return res.status(400).json({ error: 'User question is required' });
    }

    const response = await generatePedagogyResponse(request);
    res.json(response);
  } catch (error: any) {
    console.error('Pedagogy error:', error);
    res.status(500).json({ 
      error: 'Failed to generate pedagogy response',
      message: error.message 
    });
  }
});

// Streaming endpoint for real-time responses
pedagogyRoute.post('/stream', async (req, res) => {
  try {
    const request: PedagogyRequest = req.body;

    if (!request.userQuestion) {
      return res.status(400).json({ error: 'User question is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of streamPedagogyResponse(request)) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Streaming pedagogy error:', error);
    res.status(500).json({ 
      error: 'Failed to stream pedagogy response',
      message: error.message 
    });
  }
});

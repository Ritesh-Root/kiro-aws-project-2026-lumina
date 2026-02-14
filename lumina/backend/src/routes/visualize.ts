import { Router } from 'express';
import { parseJavaScript } from '../services/ast-parser.js';
import { generateVisualization } from '../services/visualizer.js';
import type { VisualizeRequest, VisualizeResponse } from '@lumina/shared';

export const visualizeRoute = Router();

visualizeRoute.post('/', async (req, res) => {
  try {
    const { code, language = 'javascript' }: VisualizeRequest = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const startTime = Date.now();

    // Parse code
    const parseResult = parseJavaScript(code);

    if (!parseResult.success) {
      return res.json({
        nodes: [],
        edges: [],
        mermaidDiagram: '',
        errors: parseResult.errors,
        parseTime: Date.now() - startTime
      } as VisualizeResponse);
    }

    // Generate visualization
    const visualization = generateVisualization(parseResult.structure);

    const response: VisualizeResponse = {
      nodes: visualization.nodes,
      edges: visualization.edges,
      mermaidDiagram: visualization.mermaidDiagram,
      errors: parseResult.errors,
      parseTime: Date.now() - startTime
    };

    res.json(response);
  } catch (error: any) {
    console.error('Visualization error:', error);
    res.status(500).json({ 
      error: 'Failed to generate visualization',
      message: error.message 
    });
  }
});

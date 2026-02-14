import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeRoute } from './routes/analyze.js';
import { visualizeRoute } from './routes/visualize.js';
import { pedagogyRoute } from './routes/pedagogy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/analyze', analyzeRoute);
app.use('/api/visualize', visualizeRoute);
app.use('/api/pedagogy', pedagogyRoute);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌟 Lumina backend running on http://localhost:${PORT}`);
});

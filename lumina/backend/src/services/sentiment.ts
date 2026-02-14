import Sentiment from 'sentiment';
import type { SentimentAnalysis } from '@lumina/shared';

const sentiment = new Sentiment();

// Frustration keywords with weights
const FRUSTRATION_KEYWORDS: Record<string, number> = {
  'confused': 15,
  'stuck': 20,
  'frustrated': 25,
  "doesn't work": 20,
  "not working": 20,
  "won't work": 20,
  "I don't understand": 25,
  "makes no sense": 30,
  "tried everything": 35,
  "giving up": 40,
  "can't figure": 20,
  "no idea": 18,
  "help": 10,
  "please": 8,
  "why": 5,
  "error": 12,
  "broken": 18,
  "wrong": 15
};

export function analyzeText(text: string, conversationHistory: string[] = []): SentimentAnalysis {
  // Base sentiment score (-1 to 1)
  const result = sentiment.analyze(text);
  const baseSentiment = Math.max(-1, Math.min(1, result.score / 5)); // Normalize to -1..1

  // Keyword matching with weights
  let keywordScore = 0;
  const detectedMarkers: string[] = [];
  const lowerText = text.toLowerCase();

  Object.entries(FRUSTRATION_KEYWORDS).forEach(([keyword, weight]) => {
    if (lowerText.includes(keyword)) {
      keywordScore += weight;
      detectedMarkers.push(keyword);
    }
  });

  // Repetition detection (asking same question multiple times)
  const repetitionPenalty = detectRepetition(text, conversationHistory) * 15;

  // Message length (over-explaining indicates confusion)
  const lengthPenalty = text.length > 200 ? 10 : 0;

  // Caps lock and exclamation marks (emotional intensity)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  const exclamationCount = (text.match(/!/g) || []).length;
  const intensityPenalty = (capsRatio > 0.3 ? 10 : 0) + (exclamationCount * 5);

  // Combine scores (0-100 scale)
  const rawScore = (
    (1 - baseSentiment) * 25 +  // Convert -1..1 to 0..50
    keywordScore +
    repetitionPenalty +
    lengthPenalty +
    intensityPenalty
  );

  const frustrationScore = Math.min(100, Math.max(0, rawScore));

  // Determine frustration level
  let frustrationLevel: 'low' | 'medium' | 'high';
  if (frustrationScore < 30) {
    frustrationLevel = 'low';
  } else if (frustrationScore < 70) {
    frustrationLevel = 'medium';
  } else {
    frustrationLevel = 'high';
  }

  // Calculate trend if history available
  const trend = conversationHistory.length >= 3 
    ? calculateTrend(conversationHistory) 
    : undefined;

  return {
    score: baseSentiment,
    magnitude: Math.abs(baseSentiment),
    frustrationLevel,
    frustrationScore,
    markers: detectedMarkers,
    trend
  };
}

function detectRepetition(text: string, history: string[]): number {
  if (history.length === 0) return 0;

  // Use Levenshtein distance to detect similar questions
  const recentMessages = history.slice(-5);
  let maxSimilarity = 0;

  recentMessages.forEach(msg => {
    const similarity = levenshteinSimilarity(text.toLowerCase(), msg.toLowerCase());
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
  });

  return maxSimilarity > 0.7 ? 1 : 0; // Binary: repeated or not
}

function levenshteinSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

function calculateTrend(history: string[]): 'improving' | 'declining' | 'stable' {
  if (history.length < 3) return 'stable';

  const recentScores = history.slice(-3).map(msg => {
    const analysis = analyzeText(msg, []);
    return analysis.frustrationScore;
  });

  const firstScore = recentScores[0];
  const lastScore = recentScores[recentScores.length - 1];
  const diff = lastScore - firstScore;

  if (diff > 15) return 'declining'; // Frustration increasing
  if (diff < -15) return 'improving'; // Frustration decreasing
  return 'stable';
}

export function analyzeTrend(history: string[]): {
  direction: 'improving' | 'declining' | 'stable';
  confidence: number;
} {
  const trend = calculateTrend(history);
  const confidence = history.length >= 5 ? 0.8 : 0.5;

  return { direction: trend, confidence };
}

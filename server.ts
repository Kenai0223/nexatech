import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const DEFAULT_SYSTEM_INSTRUCTION = `You are the NexaTech AI Technical Advisor & Partnership Consultant for NexaTech Global Software Solutions (Singapore & International).
NexaTech bridges international software developers and European tech partners with Singapore's premier engineering ecosystem.
Key NexaTech facts you know:
- Mission: Providing top-tier global software development while establishing symbiotic partnerships with European professionals.
- Workflow: European hosts provide a clean, isolated VMware development environment; NexaTech engineering teams deliver full-scale web, mobile, and cloud software for enterprise clients.
- Security & Privacy: Strict VMware isolation ensures partner host machines remain 100% untouched and private. No personal data is accessed.
- Transparent Profit Sharing: Partners receive regular payouts (via direct Bank Transfer/SEPA, PayPal, Wire) based on agreed milestones and account tiers. Equipment allowances are provided for hardware upgrades after proven collaboration.
- Offices & Nodes: Headquarters at Marina Bay Financial Centre, Singapore, with active partner nodes across London (UK), Munich (Germany), Amsterdam (Netherlands), Lyon/Paris (France), and Tokyo (Japan).
Be polite, articulate, technically sound, and encouraging. If asked about VMware setup, explain how virtualized sandboxing protects their host OS. Format answers cleanly with markdown bullets where helpful.`;

// 1. Multi-Turn Gemini Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, systemInstruction } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Model selection validation
    // Allowed: gemini-3.5-flash (general tasks), gemini-3.1-pro-preview (complex tasks), gemini-3.1-flash-lite (fast tasks)
    const validModels = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
    const selectedModel = validModels.includes(model) ? model : 'gemini-3.5-flash';

    // Format contents for generateContent multi-turn
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
      },
    });

    return res.json({
      text: response.text || '',
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process chat message with Gemini',
    });
  }
});

// 2. Google Search Grounding API
app.post('/api/search-grounding', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required for search grounding' });
    }

    let response;
    let fallbackUsed = false;

    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Provide an accurate, up-to-date answer to the following question regarding technology, global software development, remote work regulations, or infrastructure: "${query}"`,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: 'You are a research assistant with real-time Google Search access. Cite facts and provide helpful, concise summaries.',
        },
      });
    } catch (groundingError: any) {
      console.warn('Grounding tool rate-limited or unavailable, falling back:', groundingError?.message);
      fallbackUsed = true;
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Provide an accurate, helpful answer regarding technology, global software development, or infrastructure: "${query}"`,
        config: {
          systemInstruction: 'You are a research assistant providing expert technology insights.',
        },
      });
    }

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    const webSearchQueries = groundingMetadata?.webSearchQueries || (fallbackUsed ? [query] : []);
    const groundingChunks = (groundingMetadata as any)?.groundingChunks || [];

    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Web Reference',
        url: chunk.web?.uri,
      }))
      .slice(0, 5);

    return res.json({
      text: response.text || '',
      webSearchQueries,
      sources,
      grounded: !fallbackUsed,
    });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to perform search grounding',
    });
  }
});

// 3. Google Maps Grounding API
app.post('/api/maps-grounding', async (req, res) => {
  try {
    const { locationQuery } = req.body;
    if (!locationQuery) {
      return res.status(400).json({ error: 'Location query is required for maps grounding' });
    }

    let response;
    let fallbackUsed = false;

    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Describe the geographic location, tech ecosystem, tech hubs, proximity to financial centers or network infrastructure for: "${locationQuery}". Highlight key landmarks and relevance to NexaTech's global presence.`,
        config: {
          tools: [{ googleMaps: {} }],
          systemInstruction: 'You are a geospatial and tech infrastructure advisor using Google Maps Grounding to give accurate geographic context.',
        },
      });
    } catch (mapsError: any) {
      console.warn('Maps tool rate-limited or unavailable, falling back:', mapsError?.message);
      fallbackUsed = true;
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Describe the tech ecosystem, geography, and strategic IT relevance of: "${locationQuery}" in context of international software engineering partnerships.`,
        config: {
          systemInstruction: 'You are a geospatial tech advisor.',
        },
      });
    }

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    return res.json({
      text: response.text || '',
      groundingMetadata,
      grounded: !fallbackUsed,
    });
  } catch (error: any) {
    console.error('Maps grounding error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to perform maps grounding',
    });
  }
});

// 4. Mount Vite Middleware or Static Files
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NexaTech server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

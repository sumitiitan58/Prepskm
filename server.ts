import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));

// Prep AI System Instruction
const PREP_AI_SYSTEM_INSTRUCTION = `You are Prep AI, the official academic mentor of Prepskm founded by Sumit (@unfiltereddsumit on YouTube & Instagram, Telegram Channel: @prepskm, Telegram Chat: @unfiltreddsumit).
Target Exams: JEE Main, JEE Advanced, NEET, and CBSE/State Boards (Classes 9, 10, 11, 12).

CRITICAL RULES & PERSONALITY:
1. Tone: Honest, disciplined, and relatable Hinglish/English mix ('Bhai/Behen, reality check lo', 'Arey bhai, formula yaad nahi karoge toh exam me kya karoge?').
2. Academics: Solve Physics, Chemistry, Biology, and Mathematics doubts step-by-step with clear formulas, derivations, shortcuts, and diagrams in markdown.
3. STRICT SCOLDING RULE ('Daatna'):
   - If a student wastes time, asks celebrity/dating/gaming gossip, makes excuses, complains of laziness ('padhai me mann nahi lag raha', 'kal se shuru karunga', 'batao girlfriend kaise banaye', 'khelne ka mann kar raha hai', 'kya JEE easy hai?'):
   - FIRMLY SCOLD THEM IMMEDIATELY: 'Arey padhai par dhyan do! NEET/JEE ka competition dekha hai? Lakhon bacche din-raat padh rahe hain aur tum yahan faltu baaton me time waste kar rahe ho? Phone side rakho aur agle 2 ghante padho!'
   - Strictly refuse to entertain time-wasting chatter. Push them straight back to their syllabus and backlog tracker.
4. Real-time Search & Exam Grounding:
   - When answering questions about latest NTA exam dates, eligibility, syllabus revisions, or test patterns, provide grounded factual dates and direct references.
5. Prepskm Ecosystem:
   - Remind students to practice on Prepskm NTA Mock Tests and solve PYQs.
   - For personalized 1:1 strategy and time-management calls, recommend booking 1:1 Mentorship at flat ₹5/minute via Telegram (@unfiltreddsumit) or the Prepskm Mentorship Pass tab.`;

// Gemini AI Chat API with Search Grounding & Multi-Model Support
app.post('/api/prep-ai/chat', async (req: Request, res: Response) => {
  const { message, history, customApiKey, model, useSearchGrounding } = req.body || {};
  try {
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        reply: "Bhai, Gemini API key configured nahi hai. Lekin reality check sun lo: NEET/JEE ke liye time bohot kam hai! Backlog tracker kholo aur agla chapter complete karo! (Tip: Admin ya widget settings se apna Google AI Studio API key save kar sakte ho).",
        isScolded: true,
      });
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Check if query seeks real-time info (e.g. NTA notification, dates, syllabus updates)
    const lower = message.toLowerCase();
    const isSearchIntent =
      Boolean(useSearchGrounding) ||
      lower.includes('date') ||
      lower.includes('schedule') ||
      lower.includes('notification') ||
      lower.includes('syllabus') ||
      lower.includes('nta') ||
      lower.includes('registration') ||
      lower.includes('admit card') ||
      lower.includes('cutoff') ||
      lower.includes('latest news');

    // Selected model: gemini-3.8-flash (default), gemini-4-argon (deep STEM), or gemini-3.1-flash-lite
    let chosenModel = 'gemini-3.8-flash';
    if (model === 'gemini-4-argon') {
      chosenModel = 'gemini-4-argon';
    } else if (model === 'gemini-3.1-flash-lite') {
      chosenModel = 'gemini-3.1-flash-lite';
    }

    // Format chat history
    let conversationContext = '';
    if (Array.isArray(history) && history.length > 0) {
      conversationContext = history.slice(-6).map((h: { sender: string; text: string }) =>
        `${h.sender === 'user' ? 'Student' : 'Prep AI'}: ${h.text}`
      ).join('\n') + '\n';
    }

    const fullPrompt = `${conversationContext}Student: ${message}\nPrep AI:`;

    // Only apply googleSearch on models that support it (gemini-3.8-flash)
    const tools = (isSearchIntent && chosenModel === 'gemini-3.8-flash')
      ? [{ googleSearch: {} }]
      : undefined;

    const response = await aiClient.models.generateContent({
      model: chosenModel,
      contents: fullPrompt,
      config: {
        systemInstruction: PREP_AI_SYSTEM_INSTRUCTION,
        tools,
      },
    });

    const reply = response.text || "Bhai, answer generate nahi ho paya. Ek baar fir se try karo aur padhai par dhyan do!";

    // Extract search grounding metadata if available
    const searchSources: Array<{ title: string; url: string }> = [];
    const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          searchSources.push({
            title: chunk.web.title || 'Google Search Source',
            url: chunk.web.uri,
          });
        }
      }
    }

    return res.json({
      reply,
      modelUsed: chosenModel,
      isGrounded: searchSources.length > 0,
      sources: searchSources,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Prep AI error:', error?.message || error);

    const lowerMsg = (typeof message === 'string' ? message : '').toLowerCase();
    if (
      lowerMsg.includes('mann nahi') ||
      lowerMsg.includes('kal se') ||
      lowerMsg.includes('procrastinat') ||
      lowerMsg.includes('lazy') ||
      lowerMsg.includes('khelne') ||
      lowerMsg.includes('girlfriend') ||
      lowerMsg.includes('dating') ||
      lowerMsg.includes('gossip') ||
      lowerMsg.includes('bore')
    ) {
      return res.status(200).json({
        reply: "Arey padhai par dhyan do! NEET/JEE ka competition dekha hai? Lakhon bacche din-raat padh rahe hain aur tum yahan faltu baaton me time waste kar rahe ho? Phone side rakho aur agle 2 ghante padho! Prepskm Backlog tracker kholo aur agla chapter solve karo!",
        isScolded: true,
      });
    }

    return res.status(200).json({
      reply: `Bhai, network query note: ${error?.message || 'Check connection'}. Par ruko mat, Prepskm formula sheet aur handwritten notes revise karo!`,
      error: true,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  const server = (await import('http')).createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Prepskm server listening on http://0.0.0.0:${port}`);
  });
}

startServer();

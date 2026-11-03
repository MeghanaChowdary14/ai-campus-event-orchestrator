const OpenAI = require('openai');

let openai = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY.trim(),
    });
    console.log('[AI System] OpenAI client initialized successfully with API key.');
  } catch (err) {
    console.warn('[AI System] Warning initializing OpenAI client:', err.message);
  }
} else {
  console.log('[AI System] No OPENAI_API_KEY provided. Operating in High-Fidelity Heuristic Multi-Agent Mode.');
}

module.exports = openai;

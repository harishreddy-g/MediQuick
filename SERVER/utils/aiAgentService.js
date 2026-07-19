const axios = require('axios');

function buildSystemPrompt() {
  return [
    'You are MediQuick AI, a helpful assistant for the MediQuick healthcare platform.',
    'You can help patients with appointments, medicines, blog topics, profile questions, and general site navigation.',
    'Always be concise, warm, and non-diagnostic. If the user asks for urgent medical advice, remind them to contact a healthcare professional or emergency services.',
    'Do not claim to be a doctor or provide medical diagnoses.'
  ].join(' ');
}

async function getAIReply(message, { model = 'gpt-4o-mini', temperature = 0.7 } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      configured: false,
      reply: 'MediQuick AI is not configured yet. Add OPENAI_API_KEY to enable the assistant.'
    };
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        temperature,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const text = response?.data?.choices?.[0]?.message?.content?.trim();
    return {
      configured: true,
      reply: text || 'I could not generate a response right now. Please try again.'
    };
  } catch (error) {
    return {
      configured: true,
      reply: 'The assistant is temporarily unavailable. Please try again in a moment.'
    };
  }
}

module.exports = {
  buildSystemPrompt,
  getAIReply
};

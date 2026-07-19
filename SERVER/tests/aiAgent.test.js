const { buildSystemPrompt, getAIReply } = require('../utils/aiAgentService');

describe('AI agent helper', () => {
  test('builds a Mediquick-specific system prompt', () => {
    const prompt = buildSystemPrompt();

    expect(prompt).toContain('MediQuick');
    expect(prompt).toContain('appointments');
    expect(prompt).toContain('medicines');
    expect(prompt).toContain('urgent medical advice');
  });

  test('returns a friendly fallback when the OpenAI API key is missing', async () => {
    delete process.env.OPENAI_API_KEY;

    const result = await getAIReply('Hello there');

    expect(result.configured).toBe(false);
    expect(result.reply).toContain('not configured');
  });
});

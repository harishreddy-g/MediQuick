const express = require('express');
const router = express.Router();
const { getAIReply } = require('../utils/aiAgentService');

router.post('/assistant', async (req, res) => {
  try {
    const message = req.body?.message || '';

    if (!message.trim()) {
      return res.status(400).json({ success: false, message: 'A message is required.' });
    }

    const result = await getAIReply(message);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to reach the AI assistant.' });
  }
});

module.exports = router;

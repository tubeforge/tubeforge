const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

    const OPENAI_KEY = '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';

    const data = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.9
    });

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const result = await new Promise((resolve, reject) => {
      const apiReq = https.request(options, (apiRes) => {
        let body = '';
        apiRes.on('data', chunk => body += chunk);
        apiRes.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error('Invalid JSON response')); }
        });
      });
      apiReq.on('error', reject);
      apiReq.write(data);
      apiReq.end();
    });

    if (result.error) throw new Error(result.error.message);
    const text = result?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response');

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

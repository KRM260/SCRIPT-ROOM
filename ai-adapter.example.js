/*
  Script Room: bring your own AI.

  Outside claude.ai there is no built-in Claude. Copy this file to ai-adapter.js
  next to index.html and point it at a server you control. Never put an API key
  in this file: browsers can read it. Call your own backend, which holds the key.

  Script Room calls:
    ScriptRoomAI.sample(prompt, {signal, onText})  -> Promise<{text}>
    ScriptRoomAI.json(prompt)                      -> Promise<any>   (optional)
*/
window.ScriptRoomAI = {
  async sample(prompt, opts = {}) {
    const r = await fetch('/api/ai', {            // your backend route
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({prompt}),
      signal: opts.signal
    });
    if (!r.ok) throw {code: 'rate_limited', message: 'AI backend answered ' + r.status};
    const {text} = await r.json();
    if (opts.onText) opts.onText({text, delta: text});
    return {text, truncated: false};
  }
  // json(prompt) is optional. Without it Script Room asks for JSON and parses the text.
};
/*
  Example backend (Node, Express) using the Anthropic API:

  app.post('/api/ai', async (req, res) => {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'},
      body: JSON.stringify({model: process.env.MODEL, max_tokens: 8000, messages: [{role: 'user', content: req.body.prompt}]})
    });
    const j = await r.json();
    res.json({text: (j.content || []).map(c => c.text || '').join('')});
  });
*/

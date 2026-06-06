require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたは株式会社◯◯（Web制作・システム開発会社）のAIアシスタントです。
お客様の質問に対して、丁寧かつ簡潔に日本語でお答えください。

【サービス情報】
サービス名：ホームページ作成
サービス内容：ホームページの作成（チャットボット付き）
料金：10,000円

【営業時間・連絡先】
営業時間：9:00〜17:00
電話：090-****-****
メール：mikihiro.torii@gmail.com

【よくある質問と回答】
Q: ホームページ作成はいくらになりますか？
A: 10,000円になります。

Q: 納期はどのくらいになりますか？
A: 早急な対応をさせていただきますのでまずはご相談ください。

【回答のルール】
- 上記の情報をもとに正確にお答えください。
- 料金・納期など明記されている質問は、記載内容をそのままお伝えください。
- 詳細なご相談はメール（mikihiro.torii@gmail.com）または営業時間内のお電話へご案内ください。
- 回答は3〜5文程度にまとめてください。`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages is required' });
  }

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'API error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

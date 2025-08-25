import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * POST /api/generate-slides
 * Body: { text: string, title?: string, subtitle?: string, templateId?: string }
 * Returns: { id: string, url: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

    const { text, title: givenTitle, subtitle, templateId: clientTemplateId } =
      (req.body || {}) as { text?: string; title?: string; subtitle?: string; templateId?: string };

    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Missing text' });

    const parsed = parseToSlides(text);
    const title = givenTitle || parsed.title || 'New Deck';

    const webhook = process.env.SLIDES_WEBHOOK_URL;
    const secret = process.env.SLIDES_API_SECRET;
    const defaultTemplate = process.env.SLIDES_TEMPLATE_ID;

    if (!webhook || !secret) {
      return res.status(500).json({ error: 'Missing SLIDES_WEBHOOK_URL / SLIDES_API_SECRET' });
    }
    const templateId = clientTemplateId || defaultTemplate;
    if (!templateId) return res.status(400).json({ error: 'No templateId provided and SLIDES_TEMPLATE_ID not set' });

    const r = await fetch(`${webhook}?secret=${encodeURIComponent(secret)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subtitle, templateId, slides: parsed.slides })
    });

    const json = await r.json();
    if (!r.ok) return res.status(500).json({ error: json.error || 'Slides build failed' });
    return res.status(200).json(json); // { id, url }
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}

function parseToSlides(raw: string): { title?: string; slides: { title: string; bullets: string[]; notes?: string }[] } {
  const text = raw.replace(/\r\n?/g, '\n').trim();
  const lines = text.split('\n');

  let deckTitle: string | undefined;
  const slides: { title: string; bullets: string[]; notes?: string }[] = [];
  let current: { title: string; bullets: string[]; notes?: string } | null = null;

  const flush = () => { if (current) { slides.push(current); current = null; } };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('# ')) { deckTitle = line.slice(2).trim(); continue; }
    if (line.startsWith('## ')) { flush(); current = { title: line.slice(3).trim(), bullets: [] }; continue; }

    if (!current) current = { title: 'Slide', bullets: [] };

    if (/^(-|\*|•)\s+/.test(line)) { current.bullets.push(line.replace(/^(-|\*|•)\s+/, '')); continue; }

    if (/^Notes?:/i.test(line)) {
      current.notes = (current.notes ? current.notes + '\n' : '') + line.replace(/^Notes?:\s*/i, '');
      continue;
    }

    const sentences = line.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(s => s.trim()).filter(Boolean);
    if (sentences.length) current.bullets.push(...sentences);
  }
  flush();

  return { title: deckTitle, slides };
}

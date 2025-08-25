import { useState } from 'react';

const TEMPLATES = [
  { label: 'Template A', id: '1NzjvBGLQLb9qPwyilk59uvvfjfkkNkKY' },
  { label: 'Template B', id: '1Hi_4GdHQw_xk-ul4Ueo42Qvedz28f9a_' },
  { label: 'Template C', id: '1nP0FRwjKKMNwKba3BSI5QX0fxq5cR5qQ' },
  { label: 'Template D', id: '1UMsGwC4VaVSx9U4lLZu1eZn17_xzP3lg' },
  { label: 'Custom (paste ID below)', id: '' },
];

export default function SlidesBuilder() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selected, setSelected] = useState(TEMPLATES[0].id);
  const [customId, setCustomId] = useState('');
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true); setError(null); setUrl(null);
    const templateId = selected || customId.trim();
    const r = await fetch('/api/generate-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title, subtitle, templateId })
    });
    const json = await r.json();
    setLoading(false);
    if (!r.ok) return setError(json.error || 'Failed');
    setUrl(json.url);
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16, lineHeight: 1.5 }}>
      <h1>Generate Slides</h1>

      <label style={{ display: 'block', marginBottom: 6 }}>Template</label>
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      >
        {TEMPLATES.map(t => <option key={t.label} value={t.id}>{t.label}</option>)}
      </select>
      {selected === '' && (
        <input
          placeholder="Paste a Google Slides Presentation ID"
          value={customId}
          onChange={e => setCustomId(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 12 }}
        />
      )}

      <input
        placeholder="Deck title (optional, or use # in text)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />
      <input
        placeholder="Subtitle (optional)"
        value={subtitle}
        onChange={e => setSubtitle(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />

      <textarea
        placeholder={"# CE Course Title\n\n## Section 1\n- Bullet A\n- Bullet B\nNotes: Speaker notes here.\n\n## Section 2\nParagraphs become bullets by sentence."}
        value={text}
        onChange={e => setText(e.target.value)}
        rows={18}
        style={{ width: '100%', padding: 12, fontFamily: 'monospace' }}
      />

      <button onClick={generate} disabled={loading || !text} style={{ marginTop: 12, padding: '10px 16px' }}>
        {loading ? 'Generating…' : 'Generate Slides'}
      </button>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {url && <p>Done → <a href={url} target="_blank" rel="noreferrer">Open Slides</a></p>}
    </div>
  );
}

import { useState } from 'react';

const apiBase = (import.meta.env.VITE_AI_ASSISTANT_URL || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3002' : window.location.origin)).replace(/\/$/, '');
const assistantEndpoint = `${apiBase}/ai/assistant`;

export default function OpenAIAgent() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setReply('');

    try {
      const response = await fetch(assistantEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      setReply(data.reply || 'The assistant is unavailable right now.');
    } catch (error) {
      setReply('Unable to connect to the assistant service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', right: '1rem', bottom: '1rem', zIndex: 1000, maxWidth: 'min(92vw, 360px)' }}>
      <button
        onClick={() => setOpen((value) => !value)}
        style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 999, padding: '0.8rem 1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)' }}
      >
        {open ? 'Close MediQuick AI' : 'Ask MediQuick AI'}
      </button>

      {open && (
        <div style={{ marginTop: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)' }}>
          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>MediQuick AI Assistant</h3>
          <p style={{ margin: '0 0 0.8rem', color: '#4b5563', fontSize: '0.9rem' }}>Ask about appointments, medicines, blogs, or how to use the site.</p>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Try: How do I book an appointment?"
            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #d1d5db', boxSizing: 'border-box' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{ marginTop: '0.75rem', padding: '0.7rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%' }}
          >
            {loading ? 'Thinking…' : 'Ask Assistant'}
          </button>
          {reply && (
            <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: '#f8fafc', borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: '0.92rem' }}>
              {reply}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Config ────────────────────────────────────────────────────────────────────
const STORAGE_KEY   = 'sg_chat_history';
const MAX_MESSAGES  = 40;
const MAX_INPUT_LEN = 2000;

const GREETING = {
  role: 'assistant',
  content:
    "Hi! I'm the StructGuru Assistant. Ask me anything about the calculators on this site — ISO 834 / EN 1993-1-2 steel fire, EN 1991-1-2 parametric fire, iTFM, rebar heat transfer, or beam analysis (SFD/BMD/deflection). What would you like to know?",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [GREETING];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [GREETING];
    // Always start the visible thread with the greeting — if storage is stale,
    // drop any leading assistant greeting so we don't show two.
    const cleaned = parsed.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');
    if (cleaned.length === 0) return [GREETING];
    if (cleaned[0].role === 'assistant') return cleaned;
    return [GREETING, ...cleaned];
  } catch {
    return [GREETING];
  }
}

function saveHistory(messages) {
  try {
    // Drop the seeded greeting when persisting so storage stays clean;
    // loadHistory re-adds it.
    const toStore = messages[0]?.content === GREETING.content ? messages.slice(1) : messages;
    const trimmed = toStore.slice(-MAX_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage unavailable (private mode, quota) — silently skip.
  }
}

function renderText(text) {
  // Very small renderer: preserve newlines as <br>. Keeps the bundle small
  // and matches the plain-text voice of the rest of the app.
  return text.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ));
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ChatBot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput]       = useState('');
  const [pending, setPending]   = useState(false);
  const [error, setError]       = useState('');

  const listRef     = useRef(null);
  const inputRef    = useRef(null);
  const abortRef    = useRef(null);

  // Persist on every change.
  useEffect(() => { saveHistory(messages); }, [messages]);

  // Auto-scroll to bottom on new message.
  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, pending, open]);

  // Focus input when opened.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Abort in-flight request on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || pending) return;
    if (trimmed.length > MAX_INPUT_LEN) {
      setError(`Message too long (max ${MAX_INPUT_LEN} characters).`);
      return;
    }

    const userMsg = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setPending(true);

    // Send only user/assistant turns to the API; the server injects the system prompt.
    const apiMessages = nextMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-MAX_MESSAGES);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || `Chat failed (${res.status})`);
        // Roll back the optimistic user message on hard failure.
        setMessages(prev => prev.slice(0, -1));
        setInput(trimmed); // restore what they typed
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      if (err.name === 'AbortError') return; // intentional, ignore
      setError('Network error — please try again.');
      setMessages(prev => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  }, [input, messages, pending]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleClear() {
    abortRef.current?.abort();
    setMessages([GREETING]);
    setError('');
    setInput('');
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      {/* Floating bubble — always visible */}
      <button
        type="button"
        className="chatbot-bubble"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat assistant' : 'Open AI chat assistant'}
        aria-expanded={open}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M6 6l12 12M18 6l-12 12" />
          </svg>
        ) : (
          // AI + chat bubble — "AI" letters on a chat bubble.
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />
            <text
              x="12"
              y="14.5"
              textAnchor="middle"
              fontFamily="'DM Sans', system-ui, sans-serif"
              fontSize="7.2"
              fontWeight="700"
              fill="currentColor"
              stroke="none"
              letterSpacing="0.3"
            >
              AI
            </text>
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="chatbot-panel" role="dialog" aria-modal="true" aria-label="StructGuru Assistant">
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span className="chatbot-header-dot" aria-hidden="true" />
              <span className="chatbot-header-badge">AI</span>
              StructGuru Assistant
            </div>
            <div className="chatbot-header-actions">
              <button type="button" className="chatbot-icon-btn" onClick={handleClear} title="Clear conversation" aria-label="Clear conversation">
                ⟲
              </button>
              <button type="button" className="chatbot-icon-btn" onClick={handleClose} title="Close" aria-label="Close chat">
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-messages" ref={listRef} aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${m.role}`}>
                {renderText(m.content)}
              </div>
            ))}
            {pending && (
              <div className="chatbot-msg chatbot-msg--assistant chatbot-typing" aria-label="Assistant is typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          {error && <div className="chatbot-error" role="alert">{error}</div>}

          <form
            className="chatbot-input-row"
            onSubmit={e => { e.preventDefault(); send(); }}
          >
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder={pending ? 'Waiting for reply…' : 'Ask our AI'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={pending}
              rows={1}
              maxLength={MAX_INPUT_LEN}
            />
            <button
              type="submit"
              className="chatbot-send"
              disabled={pending || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
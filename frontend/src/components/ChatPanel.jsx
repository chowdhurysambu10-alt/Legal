import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, BookOpen, Sparkles, CornerDownRight, Search } from 'lucide-react';
import { askQuestion, getChatHistory } from '../services/api';

export default function ChatPanel({ documentId, filename }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);
  const chatCacheRef = useRef(new Map());

  useEffect(() => {
    if (!documentId) return;
    loadHistory(documentId);
  }, [documentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadHistory = async (docId) => {
    try {
      const history = await getChatHistory(docId);
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: `I've indexed **${filename || 'this agreement'}**. You can ask any question about termination rights, indemnification liability, IP ownership, or statutory governing rules.`
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleSend = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || !documentId || sendingRef.current || loading) return;

    // Check client session cache to eliminate duplicate AI calls
    const cacheKey = `${documentId}:${textToSend.toLowerCase()}`;
    if (chatCacheRef.current.has(cacheKey)) {
      const cached = chatCacheRef.current.get(cacheKey);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: textToSend },
        {
          role: 'assistant',
          content: cached.answer,
          sources: cached.citations || [],
          confidence: cached.confidence
        }
      ]);
      setInput('');
      return;
    }

    sendingRef.current = true;
    const userMessage = {
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await askQuestion(documentId, textToSend);
      chatCacheRef.current.set(cacheKey, res);
      const botMessage = {
        role: 'assistant',
        content: res.answer,
        sources: res.citations || [],
        confidence: res.confidence,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Unable to retrieve answer: ${err.message}. Ensure the backend is connected.`,
        }
      ]);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const toggleSources = (msgIndex) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex],
    }));
  };

  const promptSuggestions = [
    'Find termination clauses',
    'Identify liability caps',
    'What is the indemnification clause?',
    'What is the governing law?',
    'Are there non-solicitation covenants?'
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#dfe8dc] shadow-xs flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#edf2ea] flex items-center justify-between bg-[#fafcf9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#edf5eb] border border-[#d5e7d2] flex items-center justify-center text-[#2f662a]">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#18201a]">Contract Q&A Assistant</h3>
            <p className="text-[11px] text-[#69826c]">Grounded strictly in your contract text</p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#eaf7e6] text-[#2c6e26] border border-[#cbe6c4]">
          Assistant Ready
        </span>
      </div>

      {/* Message Stream */}
      <div 
        className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5"
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const hasSources = msg.sources && msg.sources.length > 0;
          const isSourcesOpen = !!expandedSources[idx];

          return (
            <div
              key={idx}
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                isUser
                  ? 'self-end bg-[#18201a] text-white shadow-xs rounded-tr-xs'
                  : 'self-start bg-[#f6f9f4] border border-[#e2eae0] text-[#18201a] rounded-tl-xs'
              }`}
            >
              <div className={`flex items-center gap-1.5 mb-1 text-[10px] font-semibold ${
                isUser ? 'text-[#b4f070]' : 'text-[#5a715d]'
              }`}>
                {isUser ? <User size={11} aria-hidden="true" /> : <Bot size={11} aria-hidden="true" />}
                <span>{isUser ? 'You' : 'Legal AI'}</span>
              </div>

              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations Accordion */}
              {hasSources && (
                <div className="mt-2 pt-2 border-t border-[#dce8da]">
                  <button
                    type="button"
                    onClick={() => toggleSources(idx)}
                    aria-expanded={isSourcesOpen}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#2d6e27] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2d6e27]"
                  >
                    <BookOpen size={11} aria-hidden="true" />
                    <span>
                      {isSourcesOpen ? 'Hide' : 'View'} {msg.sources.length} verified clause citations
                    </span>
                  </button>

                  {isSourcesOpen && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {msg.sources.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-xl bg-white border border-[#dfe8dc] text-[11px]"
                        >
                          <div className="flex justify-between text-[#69826c] font-bold text-[9px] uppercase tracking-wider mb-0.5">
                            <span>Page {s.page || 1} &bull; Clause Excerpt</span>
                            <span className="text-[#2c6e26]">{Math.round((s.relevance || 0.9) * 100)}% match</span>
                          </div>
                          <div className="font-mono text-[#283b2a] italic text-[10px] leading-relaxed">
                            "{s.excerpt}"
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div role="status" aria-live="assertive" className="self-start bg-[#f6f9f4] border border-[#e2eae0] rounded-2xl rounded-tl-xs p-3 text-xs text-[#526a54] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#418738] animate-ping" aria-hidden="true"></span>
            <span>Analyzing contract clauses & preparing response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 bg-[#fafcf9] border-t border-[#edf2ea] flex gap-1.5 overflow-x-auto" aria-label="Suggested contract queries">
        {promptSuggestions.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(p)}
            className="px-3 py-1 rounded-full bg-white border border-[#dce8da] hover:border-[#a0be9e] hover:bg-[#f0f6ee] text-[11px] font-medium text-[#405643] whitespace-nowrap transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4b6b4e]"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 bg-white border-t border-[#edf2ea] flex items-center gap-2"
      >
        <div className="relative flex-1">
          <label htmlFor="chat-query-input" className="sr-only">
            Ask a question about this contract
          </label>
          <input
            id="chat-query-input"
            type="text"
            placeholder="Ask anything about this contract..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-9 pr-3 py-2 rounded-full border border-[#dce8da] text-xs text-[#18201a] placeholder:text-[#889d8b] focus:outline-none focus:border-[#4b6b4e] focus:ring-1 focus:ring-[#4b6b4e] bg-[#fafcf9]"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#7f9982]" aria-hidden="true" />
        </div>

        <button
          id="btn-send-chat"
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="btn-lime-pill p-2 rounded-full disabled:opacity-40 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4b6b4e]"
        >
          <Send size={15} className="text-[#13240c]" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

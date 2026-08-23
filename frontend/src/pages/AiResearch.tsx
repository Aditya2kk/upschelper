import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Bot, User as UserIcon, BookOpen,
  FileText, CheckCircle2, AlertCircle, RefreshCw, Upload,
  Globe, Shield, TrendingUp, Leaf, Cpu, Copy, Check, Loader2
} from 'lucide-react';
import { api } from '../services/api';

interface DocumentItem {
  id: string;
  filename: string;
  originalName: string;
  pageCount: number;
  fileSize: number;
  processingStatus: string;
}

interface SourceCitation {
  title: string;
  pageNumber: number;
  excerpt: string;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  docName?: string;
  sources?: SourceCitation[];
}

// Inline markdown formatter for AI responses
const formatInlineMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-400">$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px] font-mono">$1</code>')
    .replace(/Page\s+(\d+)/gi, '<span class="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">Page $1</span>');
};

const MarkdownBlock: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let inList = false;
  let listItems: JSX.Element[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${key++}`} className="space-y-1 ml-1">{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); continue; }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h-${key++}`} className="text-sm font-bold text-indigo-300 mt-3 mb-1.5 flex items-center gap-2">
          <span className="w-1 h-4 bg-indigo-500 rounded-full shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.replace(/^##\s+/, '')) }} />
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h3-${key++}`} className="text-xs font-bold text-slate-200 mt-2 mb-1 border-b border-slate-800/50 pb-1">
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.replace(/^###\s+/, '')) }} />
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={`bq-${key++}`} className="border-l-2 border-amber-500/50 pl-3 py-1 my-1.5 text-slate-300 italic text-xs bg-amber-500/5 rounded-r-lg">
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.replace(/^>\s+/, '')) }} />
        </blockquote>
      );
      continue;
    }

    const listMatch = trimmed.match(/^[-*•]\s+(.*)/);
    const numMatch = trimmed.match(/^\d+[.)]\s+(.*)/);
    if (listMatch || numMatch) {
      inList = true;
      listItems.push(
        <li key={`li-${key++}`} className="flex items-start gap-2 text-xs text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/70 mt-1.5 shrink-0" />
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown((listMatch || numMatch)![1]) }} />
        </li>
      );
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${key++}`} className="text-xs text-slate-300 leading-relaxed my-1">
        <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
      </p>
    );
  }
  flushList();
  return <div className="space-y-0.5">{elements}</div>;
};

export const AiResearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'AI',
      text: 'Hello! I am your UPSC Document Research Assistant.\n\nSelect one of your uploaded newspaper/study PDFs above, and ask me any analytical or factual question. I will ground my answers strictly in your document with page citations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    loadUserDocuments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        const docs: DocumentItem[] = res.data.data;
        // Only show READY documents for querying
        const readyDocs = docs.filter(d => d.processingStatus === 'READY');
        setDocuments(readyDocs);
        if (readyDocs.length > 0) {
          setSelectedDocId(readyDocs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load user documents', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    if (!selectedDocId) {
      setError('Please select or upload a document first to ask questions.');
      return;
    }

    setError(null);
    const userText = query.trim();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/document-query', {
        documentId: selectedDocId,
        query: userText,
        action: 'QUERY',
      });

      if (res.data.success) {
        const data = res.data.data;
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          docName: data.documentName,
          sources: data.sources,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to query the document. Please verify the document is processed.';
      setError(errorMsg);
      const aiErrMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        text: `⚠️ Error: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiErrMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuickAction = async (action: string, actionPrompt: string) => {
    if (!selectedDocId || isLoading) return;

    setError(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: `[Quick Action] ${actionPrompt}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.post('/ai/document-query', {
        documentId: selectedDocId,
        query: actionPrompt,
        action: action,
      });

      if (res.data.success) {
        const data = res.data.data;
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'AI',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          docName: data.documentName,
          sources: data.sources,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to query the document. Please verify the document is processed.';
      setError(errorMsg);
      const aiErrMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        text: `⚠️ Error: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiErrMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const topicActions = [
    { label: 'Defence', icon: Shield, color: 'text-rose-400', query: 'Extract all defence, military, armed forces, DRDO, and national security content' },
    { label: 'Geopolitics', icon: Globe, color: 'text-purple-400', query: 'Extract all geopolitics and international relations content with structured UPSC topics' },
    { label: 'Polity', icon: Shield, color: 'text-indigo-400', query: 'Extract all polity and governance content with structured UPSC topics' },
    { label: 'Economy', icon: TrendingUp, color: 'text-amber-400', query: 'Extract all economy and finance content with structured UPSC topics' },
    { label: 'Environment', icon: Leaf, color: 'text-emerald-400', query: 'Extract all environment and ecology content with structured UPSC topics' },
    { label: 'Sci & Tech', icon: Cpu, color: 'text-blue-400', query: 'Extract all science and technology content with structured UPSC topics' },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-3">
      {/* Header & Document Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document-Grounded UPSC RAG</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">AI Research Assistant</h1>
        </div>

        {/* Active Document Selector */}
        <div className="flex items-center gap-2">
          {documents.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Active Document:</span>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 font-semibold max-w-[220px] truncate"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.originalName} ({d.pageCount} Pages)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button
              onClick={() => navigate('/documents')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF to Begin</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'AI' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl p-4 border text-xs sm:text-sm leading-relaxed space-y-3 ${
                msg.sender === 'USER'
                  ? 'bg-indigo-600/20 border-indigo-500/30 text-slate-100 rounded-tr-none'
                  : 'glass-panel border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.sender === 'AI' ? (
                <MarkdownBlock text={msg.text} />
              ) : (
                <p className="whitespace-pre-line text-xs">{msg.text}</p>
              )}

              {/* Copy button for AI messages */}
              {msg.sender === 'AI' && msg.id !== 'welcome' && (
                <button
                  onClick={() => copyMessage(msg.text, msg.id)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-300 transition-colors mt-2"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === msg.id ? 'Copied!' : 'Copy'}</span>
                </button>
              )}

              {/* Verified Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Verified Page Citations</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((src, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-indigo-300">
                          <span className="truncate">{src.title}</span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] shrink-0 ml-2">
                            Page {src.pageNumber}
                          </span>
                        </div>
                        {src.excerpt && (
                          <p className="text-slate-500 italic text-[10px] line-clamp-2">
                            "{src.excerpt}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'USER' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Searching document chunks & synthesizing UPSC response...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Topic Chips + Quick Actions */}
      {selectedDocId && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {topicActions.map((topic) => {
            const Icon = topic.icon;
            return (
              <button
                key={topic.label}
                type="button"
                disabled={isLoading}
                onClick={() => executeQuickAction('QUERY', topic.query)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Icon className={`w-3 h-3 ${topic.color}`} />
                <span>{topic.label}</span>
              </button>
            );
          })}
          <span className="w-px h-5 bg-slate-800" />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => executeQuickAction('UPSC_TOPICS', 'Find all important UPSC topics in this document')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Topics</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => executeQuickAction('SUMMARIZE', 'Summarize key developments in this document')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <BookOpen className="w-3 h-3 text-amber-400" />
            <span>Summarize</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => executeQuickAction('MCQS', 'Generate 5 Prelims MCQs based on this document')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>MCQs</span>
          </button>
        </div>
      )}

      {/* Query Input Box */}
      <form onSubmit={handleSend} className="relative pt-1">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={
              selectedDocId
                ? 'Ask about your document (e.g. "What are the key foreign policy developments?")...'
                : 'Upload or select a document to start asking questions...'
            }
            disabled={!selectedDocId || isLoading}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!query.trim() || !selectedDocId || isLoading}
            className="absolute right-2.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

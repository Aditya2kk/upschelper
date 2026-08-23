import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, FileText, CheckCircle2, Clock, Trash2, Sparkles,
  MessageSquare, AlertCircle, Send, BookOpen, Layers,
  HelpCircle, FileCheck, ArrowRight, RefreshCw, X, ChevronDown,
  ChevronUp, Globe, Shield, TrendingUp, Leaf, Cpu, Loader2,
  Zap, Copy, Check
} from 'lucide-react';
import { api } from '../services/api';

interface DocumentItem {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  processingStatus: string;
  pageCount: number;
  fileSize: number;
  createdAt: string;
}

interface SourceCitation {
  title: string;
  pageNumber: number;
  excerpt: string;
}

interface QueryResponse {
  documentId: string;
  documentName: string;
  query: string;
  answer: string;
  upscRelevance: string;
  sources: SourceCitation[];
  timestamp: string;
}

// Simple markdown renderer for AI responses
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const elements: JSX.Element[] = [];
    let inList = false;
    let listItems: JSX.Element[] = [];
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(<ul key={`ul-${key++}`} className="space-y-1.5 ml-1">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        continue;
      }

      // H2 headers
      if (trimmed.startsWith('## ')) {
        flushList();
        const headerText = trimmed.replace(/^##\s+/, '');
        elements.push(
          <h3 key={`h2-${key++}`} className="text-sm font-bold text-indigo-300 mt-4 mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(headerText) }} />
          </h3>
        );
        continue;
      }

      // H3 headers
      if (trimmed.startsWith('### ')) {
        flushList();
        const headerText = trimmed.replace(/^###\s+/, '');
        elements.push(
          <h4 key={`h3-${key++}`} className="text-xs font-bold text-slate-200 mt-3 mb-1.5 border-b border-slate-800/60 pb-1">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(headerText) }} />
          </h4>
        );
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList();
        const quoteText = trimmed.replace(/^>\s+/, '');
        elements.push(
          <blockquote key={`bq-${key++}`} className="border-l-2 border-amber-500/50 pl-3 py-1 my-2 text-slate-300 italic text-xs bg-amber-500/5 rounded-r-lg">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(quoteText) }} />
          </blockquote>
        );
        continue;
      }

      // List items (- or * or numbered)
      const listMatch = trimmed.match(/^[-*•]\s+(.*)/);
      const numListMatch = trimmed.match(/^\d+[.)]\s+(.*)/);
      if (listMatch || numListMatch) {
        inList = true;
        const content = listMatch ? listMatch[1] : numListMatch![1];
        listItems.push(
          <li key={`li-${key++}`} className="flex items-start gap-2 text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/70 mt-1.5 shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </li>
        );
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${key++}`} className="text-xs text-slate-300 leading-relaxed my-1.5">
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
        </p>
      );
    }

    flushList();
    return elements;
  };

  const formatInlineMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-slate-400">$1</em>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px] font-mono">$1</code>')
      .replace(/Page\s+(\d+)/gi, '<span class="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">Page $1</span>');
  };

  return <div className="space-y-0.5">{renderMarkdown(text)}</div>;
};

export const MyDocuments: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Processing poll state
  const pollingRef = useRef<Set<string>>(new Set());
  const pollingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Q&A state
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<QueryResponse[]>([]);
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
    return () => {
      // Cleanup all polling timers on unmount
      pollingTimersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Auto-scroll to latest answer
  useEffect(() => {
    if (chatHistory.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        const docs: DocumentItem[] = res.data.data;
        setDocuments(docs);
        if (docs.length > 0 && !selectedDoc) {
          // Auto-select first READY document, or first document
          const readyDoc = docs.find(d => d.processingStatus === 'READY');
          setSelectedDoc(readyDoc || docs[0]);
        }
        // Resume polling for any PROCESSING documents
        docs.forEach(doc => {
          if (doc.processingStatus === 'PROCESSING') {
            startPolling(doc.id);
          }
        });
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const startPolling = useCallback((docId: string) => {
    if (pollingRef.current.has(docId)) return; // Already polling
    pollingRef.current.add(docId);

    const poll = async () => {
      try {
        const res = await api.get(`/documents/${docId}/status`);
        if (res.data.success) {
          const updatedDoc: DocumentItem = res.data.data;
          setDocuments(prev => prev.map(d => d.id === docId ? updatedDoc : d));

          if (updatedDoc.processingStatus === 'READY' || updatedDoc.processingStatus === 'FAILED') {
            // Done polling
            pollingRef.current.delete(docId);
            pollingTimersRef.current.delete(docId);

            // Auto-select if this was the most recent upload
            if (updatedDoc.processingStatus === 'READY') {
              setSelectedDoc(updatedDoc);
            }
            return;
          }
        }
      } catch (err) {
        console.error('Polling error for', docId, err);
      }

      // Continue polling every 3 seconds
      const timer = setTimeout(poll, 3000);
      pollingTimersRef.current.set(docId, timer);
    };

    // Start first poll after 2 seconds
    const initialTimer = setTimeout(poll, 2000);
    pollingTimersRef.current.set(docId, initialTimer);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please select a valid PDF document (.pdf).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size exceeds maximum limit of 50 MB.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgressText('Uploading file to server...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        const newDoc: DocumentItem = res.data.data;
        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedDoc(newDoc);
        setUploadProgressText('✓ File uploaded! Processing in background...');

        // Start polling for this document
        startPolling(newDoc.id);

        setTimeout(() => setIsUploading(false), 1200);
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to upload PDF. Please try again.');
      setIsUploading(false);
    } finally {
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/documents/${id}`);
      // Stop polling if active
      pollingRef.current.delete(id);
      const timer = pollingTimersRef.current.get(id);
      if (timer) {
        clearTimeout(timer);
        pollingTimersRef.current.delete(id);
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) {
        const remaining = documents.filter((d) => d.id !== id);
        setSelectedDoc(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  const handleAskAI = async (e?: React.FormEvent, overrideAction?: string, overrideQuery?: string) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedDoc) {
      setQueryError('Please select a document first.');
      return;
    }
    if (selectedDoc.processingStatus !== 'READY') {
      setQueryError('This document is still processing. Please wait until it\'s ready.');
      return;
    }

    const activeQuery = overrideQuery !== undefined ? overrideQuery : query;
    const action = overrideAction || 'QUERY';

    if (!activeQuery.trim() && action === 'QUERY') {
      setQueryError('Please enter a question or click a Quick Action button.');
      return;
    }

    setIsQuerying(true);
    setQueryError(null);

    try {
      const res = await api.post('/ai/document-query', {
        documentId: selectedDoc.id,
        query: activeQuery.trim(),
        action: action,
      });

      if (res.data.success) {
        const result: QueryResponse = res.data.data;
        setChatHistory((prev) => [...prev, result]);
        if (!overrideQuery) {
          setQuery('');
        }
      }
    } catch (err: any) {
      setQueryError(err.response?.data?.message || 'Failed to query document. Please try again.');
    } finally {
      setIsQuerying(false);
    }
  };

  const toggleSources = (idx: number) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const copyAnswer = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'READY':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Ready</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-500/15 text-slate-400 border border-slate-500/30 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>{status}</span>
          </span>
        );
    }
  };

  // UPSC topic-specific action chips
  const topicActions = [
    { label: 'Defence & Security', icon: Shield, color: 'text-rose-400', borderColor: 'border-rose-500/30', bgColor: 'bg-rose-500/10 hover:bg-rose-600', query: 'Extract all defence, military, armed forces, army, navy, air force, DRDO, missiles, weapons, and national security developments.' },
    { label: 'Geopolitics & IR', icon: Globe, color: 'text-purple-400', borderColor: 'border-purple-500/30', bgColor: 'bg-purple-500/10 hover:bg-purple-600', query: 'Extract all geopolitics, international relations, foreign policy, bilateral summits, treaties, and global affairs.' },
    { label: 'Polity & Gov', icon: Shield, color: 'text-indigo-400', borderColor: 'border-indigo-500/30', bgColor: 'bg-indigo-500/10 hover:bg-indigo-600', query: 'Extract all polity, governance, constitutional matters, judiciary, supreme court, bills, and parliament news.' },
    { label: 'Economy', icon: TrendingUp, color: 'text-amber-400', borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/10 hover:bg-amber-600', query: 'Extract all economy, GDP, RBI, inflation, trade, banking, fiscal policy, and budget developments.' },
    { label: 'Environment', icon: Leaf, color: 'text-emerald-400', borderColor: 'border-emerald-500/30', bgColor: 'bg-emerald-500/10 hover:bg-emerald-600', query: 'Extract all environment, climate change, carbon emissions, biodiversity, wildlife, and ecology news.' },
    { label: 'Science & Tech', icon: Cpu, color: 'text-blue-400', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/10 hover:bg-blue-600', query: 'Extract all science, technology, ISRO, space missions, AI, digital, and biotechnology news.' },
  ];

  const quickActions = [
    { label: 'UPSC Topics', icon: Sparkles, action: 'UPSC_TOPICS', query: 'Find all important UPSC topics', color: 'text-indigo-400' },
    { label: 'Summarize', icon: FileCheck, action: 'SUMMARIZE', query: 'Summarize key developments', color: 'text-amber-400' },
    { label: 'MCQs', icon: HelpCircle, action: 'MCQS', query: 'Generate 5 Prelims MCQs', color: 'text-emerald-400' },
    { label: 'Mains 200W', icon: BookOpen, action: 'MAINS_ANSWER', query: 'Give me a 200-word UPSC Mains answer structure', color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Document Intelligence RAG</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Upload Document & Ask AI
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload your newspaper PDF, notes, or government reports. AI analysis powered by document-grounded RAG.
          </p>
        </div>

        <button
          onClick={loadDocuments}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className="glass-panel p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 transition-all text-center relative overflow-hidden group cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          disabled={isUploading}
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="max-w-md mx-auto flex items-center gap-4 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div className="text-left flex-1">
            <h3 className="font-bold text-white text-sm">
              {isUploading ? uploadProgressText : 'Upload Newspaper or Study Material PDF'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isUploading ? 'Processing starts automatically in background' : 'PDF up to 50 MB • Instant upload • Background OCR processing'}
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shrink-0">
            {isUploading ? 'Uploading...' : 'Browse'}
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="ml-auto">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Documents Library */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Documents ({documents.length})</span>
            </h2>
          </div>

          {documents.length === 0 && !isLoadingDocs && (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No documents yet.</p>
              <p className="text-[11px] text-slate-500">Upload a PDF above to begin.</p>
            </div>
          )}

          {isLoadingDocs && documents.length === 0 && (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center">
              <Loader2 className="w-8 h-8 text-indigo-400 mx-auto animate-spin" />
              <p className="text-xs text-slate-400 mt-2">Loading documents...</p>
            </div>
          )}

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              const isProcessing = doc.processingStatus === 'PROCESSING';
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                      : isProcessing
                      ? 'glass-panel border-amber-500/30 animate-pulse'
                      : 'glass-panel border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : isProcessing ? 'bg-amber-600/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white text-xs truncate max-w-[160px]">
                          {doc.originalName}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {doc.pageCount ? `${doc.pageCount} Pages` : 'PDF'} • {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60">
                    {getStatusBadge(doc.processingStatus)}
                    {isSelected && (
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                        <span>Active</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: AI Q&A Console */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDoc ? (
            <div className="glass-panel p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 space-y-5">
              
              {/* Active Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Analyzing</span>
                    <h3 className="text-sm font-bold text-white truncate max-w-md">
                      {selectedDoc.originalName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedDoc.processingStatus)}
                  {selectedDoc.pageCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {selectedDoc.pageCount} Pages
                    </span>
                  )}
                </div>
              </div>

              {selectedDoc.processingStatus === 'PROCESSING' && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">Processing your document...</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Extracting text, running OCR on scanned pages, and building search index. This takes 30-60 seconds for newspapers.
                    </p>
                  </div>
                </div>
              )}

              {selectedDoc.processingStatus === 'FAILED' && (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">Processing failed</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Could not extract text from this PDF. Please try re-uploading or use a different file.
                    </p>
                  </div>
                </div>
              )}

              {selectedDoc.processingStatus === 'READY' && (
                <>
                  {/* UPSC Topic Chips */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Extract by UPSC Topic
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {topicActions.map((topic) => {
                        const Icon = topic.icon;
                        return (
                          <button
                            key={topic.label}
                            disabled={isQuerying}
                            onClick={() => handleAskAI(undefined, 'QUERY', topic.query)}
                            className={`px-3 py-2 rounded-xl ${topic.bgColor} border ${topic.borderColor} text-xs font-semibold transition-all flex items-center gap-1.5 text-slate-200 hover:text-white disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98]`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${topic.color}`} />
                            <span>{topic.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick UPSC Actions */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Quick Actions
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {quickActions.map((qa) => {
                        const Icon = qa.icon;
                        return (
                          <button
                            key={qa.label}
                            disabled={isQuerying}
                            onClick={() => handleAskAI(undefined, qa.action, qa.query)}
                            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 text-xs font-semibold transition-all text-center flex flex-col items-center justify-center gap-1 disabled:opacity-40"
                          >
                            <Icon className={`w-3.5 h-3.5 ${qa.color}`} />
                            <span>{qa.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ask Question Form */}
                  <form onSubmit={(e) => handleAskAI(e)} className="relative">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        disabled={isQuerying}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder='Ask anything about this document (e.g. "What does it say about climate change?")...'
                        className="w-full pl-5 pr-28 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!query.trim() || isQuerying}
                        className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40"
                      >
                        {isQuerying ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Ask AI</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {queryError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{queryError}</span>
                  <button onClick={() => setQueryError(null)} className="ml-auto">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isQuerying && (
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-indigo-500/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Retrieving document chunks & synthesizing UPSC answer...</h4>
                    <p className="text-[11px] text-slate-400">Grounding response in {selectedDoc.originalName}</p>
                  </div>
                </div>
              )}

              {/* Chat History with Interactive Markdown Rendering */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl overflow-hidden"
                    style={{ animation: 'fadeInUp 0.3s ease-out' }}
                  >
                    {/* Question Bar */}
                    <div className="px-5 py-3 bg-indigo-600/10 border-b border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">Q</span>
                        <h4 className="font-bold text-white text-xs truncate max-w-md">{item.query}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyAnswer(item.answer, idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                          title="Copy answer"
                        >
                          {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                      </div>
                    </div>

                    {/* Answer Body with Markdown */}
                    <div className="px-5 py-4">
                      <MarkdownRenderer text={item.answer} />

                      {/* UPSC Relevance Tag */}
                      {item.upscRelevance && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-semibold">
                          <Zap className="w-3 h-3" />
                          <span>{item.upscRelevance}</span>
                        </div>
                      )}
                    </div>

                    {/* Collapsible Source Citations */}
                    {item.sources && item.sources.length > 0 && (
                      <div className="border-t border-slate-800/80">
                        <button
                          onClick={() => toggleSources(idx)}
                          className="w-full px-5 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-900/50 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Page Sources ({item.sources.length})</span>
                          </span>
                          {expandedSources.has(idx) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        
                        {expandedSources.has(idx) && (
                          <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ animation: 'fadeInUp 0.2s ease-out' }}>
                            {item.sources.map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1"
                              >
                                <div className="flex items-center justify-between font-bold text-indigo-300">
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
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No Document Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a newspaper PDF or select an existing document from the left list to begin analyzing and asking UPSC questions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

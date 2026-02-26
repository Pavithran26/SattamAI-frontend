'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, FileText, Download, History, PlusCircle } from 'lucide-react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://127.0.0.1:8000');
const ACTIVE_SESSION_STORAGE_KEY = 'sattam_active_session_id';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  references?: Array<{
    title: string;
    source: string;
    type: string;
    url?: string;
  }>;
}

interface ChatSessionSummary {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatHistoryMessage {
  role: string;
  content: string;
  language?: string;
  sources?: string[];
  created_at: string;
}

interface ChatHistoryResponse {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatHistoryMessage[];
}

interface ChatInterfaceProps {
  category: string | null;
  onBack: () => void;
  language: 'en' | 'ta';
  onLanguageChange: (language: 'en' | 'ta') => void;
}

function getWelcomeMessage(language: 'en' | 'ta', category: string | null): Message {
  return {
    id: `welcome-${Date.now()}`,
    content: language === 'en'
      ? `Hello! I'm your Tamil Nadu Legal Assistant. I can help you with ${category || 'various legal matters'}. Please describe your situation in detail.`
      : `வணக்கம்! நான் உங்கள் தமிழ்நாடு சட்ட உதவியாளர். நான் ${category || 'பல்வேறு சட்ட விஷயங்களில்'} உங்களுக்கு உதவ முடியும். தயவுசெய்து உங்கள் நிலைமையை விரிவாக விவரிக்கவும்.`,
    sender: 'bot',
    timestamp: new Date(),
  };
}

function isPdfLikeSource(value: string) {
  return /(^|[\\/])[^\\/\s]+\.pdf($|[?#\s])/i.test((value || '').trim());
}

function toReferences(sources: string[], language: 'en' | 'ta') {
  const sanitized = sources
    .map((source) => source.replace(/\s+/g, ' ').trim())
    .filter((source) => source.length > 0 && !isPdfLikeSource(source));

  return sanitized.slice(0, 5).map((source, index) => {
    const isUrl = /^https?:\/\//i.test(source);
    const title = isUrl
      ? (language === 'en' ? `Reference ${index + 1}` : `குறிப்பு ${index + 1}`)
      : (source.length > 180 ? `${source.slice(0, 177)}...` : source);

    return {
      title,
      source,
      type: isUrl ? 'Link' : (language === 'en' ? 'Excerpt' : 'உள்ளடக்கம்'),
      url: isUrl ? source : undefined,
    };
  });
}

function shouldHideReferences(answer: string) {
  const text = (answer || '').toLowerCase();
  return (
    text.includes('quota is exceeded') ||
    text.includes('ai generation is currently unavailable') ||
    text.includes('api key is invalid or unauthorized') ||
    text.includes('missing api key') ||
    text.includes('unauthorized') ||
    text.includes('billing/quota') ||
    text.includes('llm quota') ||
    text.includes('api key செல்லுபடியாக இல்லை')
  );
}

function formatSessionTime(rawDate: string, language: 'en' | 'ta') {
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString(language === 'en' ? 'en-IN' : 'ta-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatInterface({ category, onBack, language, onLanguageChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage(language, category)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [historySessions, setHistorySessions] = useState<ChatSessionSummary[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const persistActiveSessionId = (nextSessionId: string | null) => {
    setSessionId(nextSessionId);
    if (typeof window === 'undefined') {
      return;
    }
    if (nextSessionId) {
      window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, nextSessionId);
    } else {
      window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const savedSessionId = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }
  }, []);

  useEffect(() => {
    setMessages((previous) => {
      if (previous.length === 1 && previous[0].id.startsWith('welcome-')) {
        return [getWelcomeMessage(language, category)];
      }
      return previous;
    });
  }, [category, language]);

  const fetchSessions = async () => {
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/sessions?limit=30`);
      if (!response.ok) {
        throw new Error(`Failed to load sessions (${response.status})`);
      }
      const data = await response.json() as ChatSessionSummary[];
      setHistorySessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Session list error:', error);
      setHistorySessions([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadSessionConversation = async (targetSessionId: string) => {
    setIsHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/history/${targetSessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to load history (${response.status})`);
      }
      const data = await response.json() as ChatHistoryResponse;
      const mappedMessages: Message[] = (data.messages || []).map((item, index) => {
        const role = item.role === 'user' ? 'user' : 'bot';
        const sources = Array.isArray(item.sources) ? item.sources.map((src) => String(src)) : [];
        const hideReferences = role === 'bot' && shouldHideReferences(item.content || '');

        return {
          id: `history-${targetSessionId}-${index}`,
          content: item.content || '',
          sender: role,
          timestamp: item.created_at ? new Date(item.created_at) : new Date(),
          references: role === 'bot' && sources.length && !hideReferences
            ? toReferences(sources, language)
            : undefined,
        };
      });

      setMessages(mappedMessages.length ? mappedMessages : [getWelcomeMessage(language, category)]);
      persistActiveSessionId(data.session_id || targetSessionId);
      setIsHistoryOpen(false);
    } catch (error) {
      console.error('Session history error:', error);
      setMessages((previous) => [
        ...previous,
        {
          id: `history-error-${Date.now()}`,
          content: language === 'en'
            ? 'Could not load that conversation history.'
            : 'அந்த உரையாடல் வரலாற்றை ஏற்ற முடியவில்லை.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleToggleHistory = async () => {
    const next = !isHistoryOpen;
    setIsHistoryOpen(next);
    if (next) {
      await fetchSessions();
    }
  };

  const handleNewConversation = () => {
    persistActiveSessionId(null);
    setMessages([getWelcomeMessage(language, category)]);
    setInput('');
    setIsHistoryOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const prompt = input.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = language === 'ta' ? '/api/v1/chat/tamil-query' : '/api/v1/chat/query';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          language,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || `Request failed with status ${response.status}`);
      }

      const data = await response.json() as {
        answer?: string;
        response?: string;
        sources?: string[];
        session_id?: string;
      };

      const answer = data.answer || data.response || (language === 'en'
        ? 'No answer was returned from the server.'
        : 'சர்வரிலிருந்து பதில் கிடைக்கவில்லை.');

      const rawSources: string[] = Array.isArray(data.sources) ? data.sources.map((item) => String(item)) : [];
      const references = shouldHideReferences(answer) ? [] : toReferences(rawSources, language);

      if (data.session_id) {
        persistActiveSessionId(data.session_id);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: answer,
        sender: 'bot',
        timestamp: new Date(),
        references: references.length ? references : undefined,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'en'
          ? 'The backend is unavailable or returned an error. Please try again.'
          : 'பின்தள சேவையில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
        sender: 'bot',
        timestamp: new Date(),
      };
      console.error('Chat API error:', error);
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white p-2.5 sm:p-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 sm:items-center sm:gap-4">
          <button
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:h-11 sm:w-11"
            aria-label={language === 'en' ? 'Go back' : 'பின்செல்'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-[15px] font-bold leading-tight text-gray-900 sm:text-lg">
              {language === 'en' ? 'Legal Assistant Chat' : 'சட்ட உதவியாளர் அரட்டை'}
            </h2>
            {category && (
              <p className="text-[11px] text-emerald-700 sm:text-sm">
                {language === 'en' ? `Category: ${category}` : `வகை: ${category}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
          <button
            onClick={handleNewConversation}
            className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:min-h-10 sm:px-3 sm:py-2 sm:text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {language === 'en' ? 'New' : 'புது'}
          </button>
          <button
            onClick={handleToggleHistory}
            className={`inline-flex min-h-8 items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:min-h-10 sm:px-3 sm:py-2 sm:text-xs ${isHistoryOpen
              ? 'border-emerald-500 bg-emerald-100 text-gray-900'
              : 'border-gray-300 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
          >
            <History className="w-3.5 h-3.5" />
            {language === 'en' ? 'History' : 'வரலாறு'}
          </button>
          <div className="inline-flex overflow-hidden rounded-lg border border-gray-300">
            <button
              onClick={() => onLanguageChange('en')}
              className={`min-h-8 px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400 sm:min-h-10 sm:px-3 sm:text-sm ${language === 'en'
                ? 'bg-emerald-200 text-gray-900'
                : 'bg-white text-gray-700 hover:bg-emerald-50'
                }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`min-h-8 px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400 sm:min-h-10 sm:px-3 sm:text-sm ${language === 'ta'
                ? 'bg-emerald-200 text-gray-900'
                : 'bg-white text-gray-700 hover:bg-emerald-50'
                }`}
            >
              தமிழ்
            </button>
          </div>
          <span className="hidden text-sm text-gray-500 sm:inline">
            {language === 'en' ? 'Powered by AI' : 'AI ஆல் இயக்கப்படுகிறது'}
          </span>
          <Bot className="h-5 w-5 text-emerald-600" />
        </div>
        </div>
      </div>

      {isHistoryOpen && (
        <div className="bg-white border-b border-gray-200 px-3 py-2.5 sm:px-4 sm:py-3">
          {isHistoryLoading ? (
            <p className="text-sm text-gray-600">
              {language === 'en' ? 'Loading history...' : 'வரலாறு ஏற்றப்படுகிறது...'}
            </p>
          ) : historySessions.length === 0 ? (
            <p className="text-sm text-gray-600">
              {language === 'en' ? 'No saved conversations yet.' : 'சேமிக்கப்பட்ட உரையாடல்கள் இல்லை.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {historySessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => loadSessionConversation(session.session_id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${sessionId === session.session_id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                >
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session.title || (language === 'en' ? 'New Conversation' : 'புதிய உரையாடல்')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatSessionTime(session.updated_at, language)} • {session.message_count} {language === 'en' ? 'messages' : 'செய்திகள்'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 space-y-3 overflow-y-auto p-2.5 sm:space-y-6 sm:p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[94%] rounded-2xl p-2.5 sm:max-w-[82%] sm:p-4 lg:max-w-[70%] ${message.sender === 'user'
                ? 'rounded-br-none border border-emerald-200 bg-emerald-100 text-gray-900'
                : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                }`}
            >
              <div className="mb-1.5 flex items-center gap-2">
                {message.sender === 'bot' ? (
                  <Bot className="w-4 h-4 text-emerald-600" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="text-[11px] text-gray-700 sm:text-xs">
                  {message.sender === 'bot'
                    ? (language === 'en' ? 'Legal Assistant' : 'சட்ட உதவியாளர்')
                    : (language === 'en' ? 'You' : 'நீங்கள்')
                  }
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[14px] leading-[1.45] text-gray-900 sm:text-[15px]">
                {message.content}
              </p>

              {/* References */}
              {message.sender === 'bot' && message.references && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium sm:text-sm">
                      {language === 'en' ? 'References' : 'குறிப்புகள்'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {message.references.map((ref, index) => (
                      <div key={index} className="rounded-lg bg-gray-50 p-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-medium sm:text-sm">{ref.title}</p>
                            <p className="text-[11px] text-gray-500 sm:text-xs">{ref.type}</p>
                          </div>
                          <button
                            onClick={() => ref.url && window.open(ref.url, '_blank')}
                            disabled={!ref.url}
                            className={`inline-flex min-h-8 items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${ref.url
                              ? 'text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900'
                              : 'text-gray-500 cursor-default'
                              }`}
                          >
                            <Download className="w-3 h-3" />
                            {ref.url
                              ? (language === 'en' ? 'View' : 'காண்க')
                              : (language === 'en' ? 'Excerpt' : 'உள்ளடக்கம்')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-1.5 text-right text-[10px] text-gray-500 sm:text-xs">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[94%] rounded-2xl rounded-bl-none border border-gray-200 bg-white p-3 sm:max-w-[82%] sm:p-4 lg:max-w-[70%]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-[11px] sm:text-xs">
                  {language === 'en' ? 'AI is thinking...' : 'AI யோசிக்கிறது...'}
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-2.5 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] sm:p-4">
        <div className="flex items-end gap-1.5 sm:gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'en'
              ? 'Describe your legal situation here... (Example: My landlord is not returning my security deposit in Chennai)'
              : 'உங்கள் சட்ட நிலைமையை இங்கே விவரிக்கவும்... (எடுத்துக்காட்டு: சென்னையில் என் வீட்டுக்கு வந்தவர் என் பாதுகாப்பு வைப்புத்தொகையை திருப்பித் தரவில்லை)'
            }
            className="min-h-10 flex-1 resize-none rounded-xl border border-gray-300 p-2.5 text-[14px] leading-[1.4] text-gray-900 placeholder:text-[13px] placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:min-h-11 sm:p-3 sm:text-[15px]"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="inline-flex min-h-10 min-w-10 items-center justify-center self-end rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 p-2.5 text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-12 sm:min-w-12 sm:p-3"
            aria-label={language === 'en' ? 'Send message' : 'செய்தி அனுப்பு'}
          >
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-3 sm:mt-4">
          <p className="mb-1.5 text-xs text-gray-500 sm:mb-2 sm:text-sm">
            {language === 'en' ? 'Quick suggestions:' : 'விரைவு பரிந்துரைகள்:'}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {[
              language === 'en' ? 'Property dispute resolution' : 'சொத்து விவகார தீர்வு',
              language === 'en' ? 'Police complaint procedure' : 'போலீஸ் புகார் நடைமுறை',
              language === 'en' ? 'Legal aid eligibility' : 'சட்ட உதவி தகுதி',
              language === 'en' ? 'Court fee structure' : 'நீதிமன்ற கட்டண அமைப்பு'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className="inline-flex min-h-8 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 transition-all hover:-translate-y-0.5 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:min-h-9 sm:px-3 sm:text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User, FileText, Download } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  references?: Array<{
    title: string;
    source: string;
    type: string;
  }>;
}

interface ChatInterfaceProps {
  category: string | null;
  onBack: () => void;
  language: 'en' | 'ta';
}

export default function ChatInterface({ category, onBack, language }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: language === 'en' 
        ? `Hello! I'm your Tamil Nadu Legal Assistant. I can help you with ${category || 'various legal matters'}. Please describe your situation in detail.`
        : `வணக்கம்! நான் உங்கள் தமிழ்நாடு சட்ட உதவியாளர். நான் ${category || 'பல்வேறு சட்ட விஷயங்களில்'} உங்களுக்கு உதவ முடியும். தயவுசெய்து உங்கள் நிலைமையை விரிவாக விவரிக்கவும்.`,
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'en'
          ? `Based on your query about "${input}", I've found relevant Tamil Nadu laws. Here's what applies to your situation...`
          : `"${input}" பற்றிய உங்கள் கேள்வியின் அடிப்படையில், தொடர்புடைய தமிழ்நாடு சட்டங்களைக் கண்டறிந்துள்ளேன். உங்கள் நிலைக்கு பொருந்தக்கூடியவை இங்கே...`,
        sender: 'bot',
        timestamp: new Date(),
        references: [
          {
            title: language === 'en' ? 'Tamil Nadu Land Reforms Act, 1961' : 'தமிழ்நாடு நில சீர்திருத்தச் சட்டம், 1961',
            source: 'https://tn.gov.in/acts',
            type: 'Act'
          },
          {
            title: language === 'en' ? 'Madras High Court Judgment 2023' : 'மெட்ராஸ் உயர் நீதிமன்ற தீர்ப்பு 2023',
            source: 'https://judgments.tn.nic.in',
            type: 'Judgment'
          }
        ]
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-gray-900">
              {language === 'en' ? 'Legal Assistant Chat' : 'சட்ட உதவியாளர் அரட்டை'}
            </h2>
            {category && (
              <p className="text-sm text-blue-600">
                {language === 'en' ? `Category: ${category}` : `வகை: ${category}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {language === 'en' ? 'Powered by AI' : 'AI ஆல் இயக்கப்படுகிறது'}
          </span>
          <Bot className="w-5 h-5 text-blue-500" />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {message.sender === 'bot' ? (
                  <Bot className="w-4 h-4 text-blue-500" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="text-xs opacity-75">
                  {message.sender === 'bot' 
                    ? (language === 'en' ? 'Legal Assistant' : 'சட்ட உதவியாளர்')
                    : (language === 'en' ? 'You' : 'நீங்கள்')
                  }
                </span>
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* References */}
              {message.sender === 'bot' && message.references && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === 'en' ? 'References' : 'குறிப்புகள்'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {message.references.map((ref, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{ref.title}</p>
                            <p className="text-xs text-gray-500">{ref.type}</p>
                          </div>
                          <button
                            onClick={() => window.open(ref.source, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            {language === 'en' ? 'View' : 'காண்க'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs opacity-50 mt-2 text-right">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-xs">AI is thinking...</span>
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
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'en' 
              ? 'Describe your legal situation here... (Example: My landlord is not returning my security deposit in Chennai)'
              : 'உங்கள் சட்ட நிலைமையை இங்கே விவரிக்கவும்... (எடுத்துக்காட்டு: சென்னையில் என் வீட்டுக்கு வந்தவர் என் பாதுகாப்பு வைப்புத்தொகையை திருப்பித் தரவில்லை)'
            }
            className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="self-end bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Quick Suggestions */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">
            {language === 'en' ? 'Quick suggestions:' : 'விரைவு பரிந்துரைகள்:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              language === 'en' ? 'Property dispute resolution' : 'சொத்து விவகார தீர்வு',
              language === 'en' ? 'Police complaint procedure' : 'போலீஸ் புகார் நடைமுறை',
              language === 'en' ? 'Legal aid eligibility' : 'சட்ட உதவி தகுதி',
              language === 'en' ? 'Court fee structure' : 'நீதிமன்ற கட்டண அமைப்பு'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full transition-colors"
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
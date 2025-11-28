import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIStatus } from '../types';
import { Send, Bot, Sparkles, Loader2, Search as SearchIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIFeedbackProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  status: AIStatus;
  onSearch: (query: string) => void;
}

export const AIFeedback: React.FC<AIFeedbackProps> = ({ messages, onSendMessage, status, onSearch }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || status !== 'idle') return;
    
    // Check if it's a search command (simple heuristic for this demo)
    if (inputText.toLowerCase().startsWith('/search ')) {
        onSearch(inputText.slice(8));
        setInputText('');
        return;
    }

    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 flex flex-col h-[600px]">
      <div className="p-4 border-b border-earth-100 bg-earth-800 text-white rounded-t-xl flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          CampCraft AI
        </h2>
        <span className="text-xs bg-earth-700 px-2 py-1 rounded text-earth-200">
           {status === 'thinking' ? 'Analyzing...' : status === 'loading' ? 'Processing...' : 'Ready'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-earth-50">
        {messages.length === 0 && (
            <div className="text-center text-earth-400 mt-20 space-y-2">
                <Bot className="w-12 h-12 mx-auto opacity-50" />
                <p>Build your pack and ask for a review!</p>
                <p className="text-xs max-w-xs mx-auto">Try commands like "Quick Check", "Deep Review" or just ask "Do I have enough water?"</p>
            </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-moss-600 text-white rounded-br-none'
                  : 'bg-white text-earth-800 border border-earth-100 rounded-bl-none prose prose-sm prose-p:my-1 prose-headings:text-moss-700 prose-headings:my-2 prose-ul:my-1 prose-li:my-0'
              }`}
            >
              {msg.role === 'model' ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        
        {(status === 'loading' || status === 'thinking') && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-earth-100 flex items-center gap-2 text-earth-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-moss-600" />
                {status === 'thinking' ? 'Thinking deeply about your trip...' : 'CampCraft is typing...'}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-earth-200 bg-white rounded-b-xl flex gap-2">
        <input
          type="text"
          className="flex-1 bg-earth-50 border border-earth-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-moss-400 outline-none"
          placeholder="Ask about your pack..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={status !== 'idle'}
        />
        <button
          type="button"
          onClick={() => {
              if(!inputText.trim()) return;
              onSearch(inputText);
              setInputText('');
          }}
          className="p-2 text-earth-500 hover:bg-earth-100 rounded-lg transition-colors"
          title="Search Google"
          disabled={status !== 'idle'}
        >
            <SearchIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          className="bg-moss-600 text-white p-2 rounded-lg hover:bg-moss-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={status !== 'idle' || !inputText.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Search, Calendar, Trash2, ArrowUpRight, 
  ChevronRight, Bot, User, Clock, AlertCircle, Inbox
} from 'lucide-react';
import api from '../services/api';

interface ChatSession {
  id: string;
  title: string;
  pinned: boolean;
  date?: string; // generated dynamically
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export const ChatHistory: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const response = await api.get('/chat/');
      // Mock dates for design appeal
      const mockDates = ['Today', 'Yesterday', '3 days ago', '1 week ago'];
      const enrichedChats = response.data.map((chat: any, index: number) => ({
        ...chat,
        date: mockDates[index % mockDates.length]
      }));
      setChats(enrichedChats);
      
      // Auto select first chat if available
      if (enrichedChats.length > 0) {
        setSelectedChatId(enrichedChats[0].id);
        fetchMessages(enrichedChats[0].id);
      }
    } catch (err) {
      console.error("Failed to load chat sessions", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const response = await api.get(`/chat/${chatId}`);
      setMessages(response.data);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    fetchMessages(chatId);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;
    
    try {
      // In the real system, you might issue a DELETE api.delete(`/chat/${chatId}`) 
      // But we will also update local state instantly
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete chat session", err);
    }
  };

  const handleResumeChat = () => {
    if (selectedChatId) {
      navigate(`/chat?id=${selectedChatId}`);
    }
  };

  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chat History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review, search, and resume past interactions with the AI assistant.</p>
      </div>

      {/* Main Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        
        {/* LEFT COLUMN: Sessions List (Col Span: 4) */}
        <div className="lg:col-span-4 glass-card p-4 flex flex-col justify-between overflow-hidden">
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            {/* Search Bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </span>
              <input 
                type="text" 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Sessions Scroll List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {loadingChats ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400">
                  <RefreshCw className="animate-spin" size={24} />
                  <span className="text-xs">Loading sessions...</span>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400 dark:text-slate-500">
                  <Inbox size={32} />
                  <span className="text-xs font-medium">No conversations found</span>
                </div>
              ) : (
                filteredChats.map((c) => {
                  const isActive = c.id === selectedChatId;
                  return (
                    <div 
                      key={c.id} 
                      onClick={() => handleSelectChat(c.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer group transition-all border ${isActive ? 'bg-brand-50/50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800/40 text-brand-700 dark:text-brand-300 font-semibold shadow-sm' : 'bg-white dark:bg-slate-800/30 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare size={18} className={isActive ? 'text-brand-500' : 'text-slate-400'} />
                        <div className="truncate">
                          <h4 className="text-sm truncate">{c.title}</h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{c.date || 'Past Chat'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => handleDeleteChat(e, c.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Preview Feed (Col Span: 8) */}
        <div className="lg:col-span-8 glass-card flex flex-col justify-between overflow-hidden relative">
          
          {selectedChatId ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header Info */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/40 dark:bg-slate-800/40 backdrop-blur-md flex justify-between items-center">
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{selectedChat?.title}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Calendar size={10} /> Active session preview
                  </p>
                </div>
                <button 
                  onClick={handleResumeChat}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  Resume Chat <ArrowUpRight size={14} />
                </button>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20 dark:bg-slate-900/10">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400">
                    <RefreshCw className="animate-spin" size={24} />
                    <span className="text-xs">Loading message logs...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400 dark:text-slate-500">
                    <AlertCircle size={24} />
                    <span className="text-xs font-medium">No messages saved in this session.</span>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isAgent = msg.role === 'agent';
                    return (
                      <div 
                        key={msg.id || index}
                        className={`flex gap-3 max-w-[85%] ${isAgent ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${isAgent ? 'bg-gradient-to-br from-brand-500 to-purple-600 text-white border-brand-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                          {isAgent ? <Bot size={16} /> : <User size={16} />}
                        </div>

                        {/* Speech Bubble */}
                        <div className="space-y-1">
                          <div className={`p-4 rounded-2xl shadow-sm leading-relaxed text-sm ${isAgent ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-none' : 'bg-brand-600 text-white rounded-tr-none'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <span className={`text-[9px] text-slate-400 flex items-center gap-0.5 mt-1 ${isAgent ? 'justify-start' : 'justify-end'}`}>
                            <Clock size={8} /> {msg.timestamp || 'Just now'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4">
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <MessageSquare size={36} className="text-brand-500 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Select a Conversation</h4>
                <p className="text-xs text-slate-400 max-w-[280px]">Click any conversation from the list to preview the message history and resume chat.</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

// Simple Refresh Spinner Component
const RefreshCw: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
  </svg>
);

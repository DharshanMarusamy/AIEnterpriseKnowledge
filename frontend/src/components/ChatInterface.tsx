import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, Bot, User, Paperclip, Mic, FileText, 
  ThumbsUp, ThumbsDown, Copy, RefreshCw, 
  Plus, Search, MessageSquare, Pin, Trash2, Edit2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  citations?: Citation[];
  timestamp: string;
}

interface Citation {
  id: string;
  title: string;
  confidence: number;
}

export const ChatInterface: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultGreeting = {
    id: '1',
    role: 'agent' as const,
    content: 'Hello! I am your Enterprise Knowledge Assistant. I can search through company documents, analyze data, and answer questions. How can I help you today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<Message[]>([defaultGreeting]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recentChats, setRecentChats] = useState<{id: string, title: string, pinned: boolean}[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
    const queryChatId = searchParams.get('id');
    if (queryChatId) {
      loadChat(queryChatId);
    }
  }, [searchParams]);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat/');
      setRecentChats(response.data);
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      if (response.data.length > 0) {
        setMessages(response.data);
      } else {
        setMessages([defaultGreeting]);
      }
      setCurrentChatId(chatId);
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([defaultGreeting]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const payload: any = { message: userMsg.content };
      if (currentChatId) {
        payload.chat_id = parseInt(currentChatId);
      }
      
      const agentMsgId = (Date.now() + 1).toString();
      const agentMsg: Message = {
        id: agentMsgId,
        role: 'agent',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false); // Stop typing indicator as the response box is now shown

      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/v1/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to stream');
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      
      let fetchedChatId = null;
      let finalReply = '';
      let msgCitations = undefined;
      
      while (!done && reader) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              try {
                const data = JSON.parse(dataStr);
                if (data.type === 'chat_id') {
                  fetchedChatId = data.chat_id;
                  if (!currentChatId) {
                    setCurrentChatId(fetchedChatId.toString());
                    fetchChats();
                  }
                } else if (data.type === 'citations') {
                  msgCitations = data.citations;
                  setMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, citations: msgCitations } : m));
                } else if (data.type === 'chunk') {
                  finalReply += data.content;
                  setMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, content: finalReply } : m));
                } else if (data.type === 'error') {
                  finalReply = data.content;
                  setMessages(prev => prev.map(m => m.id === agentMsgId ? { ...m, content: finalReply } : m));
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: "Sorry, I encountered an error while processing your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] -m-6 bg-white dark:bg-slate-900 overflow-hidden">
      
      {/* Sidebar for Chat History */}
      <div className="w-72 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 btn-primary py-2 rounded-lg mb-4">
            <Plus size={18} /> New Chat
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Pinned</h3>
            {recentChats.filter(c => c.pinned).map(chat => (
              <div key={chat.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Pin size={14} className="text-brand-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{chat.title}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Recent</h3>
            {recentChats.filter(c => !c.pinned).map(chat => (
              <div key={chat.id} onClick={() => loadChat(chat.id)} className={`group flex items-center justify-between p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer ${currentChatId === chat.id ? 'bg-slate-200 dark:bg-slate-800' : ''}`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageSquare size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{chat.title}</span>
                </div>
                <div className="hidden group-hover:flex items-center gap-1">
                  <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"><Edit2 size={12} /></button>
                  <button className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 custom-scrollbar scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Agent Avatar */}
              {msg.role === 'agent' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                  <Bot size={18} />
                </div>
              )}

              <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-brand-500 to-purple-500 text-white rounded-tr-sm shadow-md border border-brand-400/50' 
                    : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-md'
                }`}>
                  {/* Markdown content */}
                  <div className="text-sm leading-relaxed font-sans max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-md my-4 shadow-sm text-xs"
                            />
                          ) : (
                            <code {...props} className={`${className || ''} bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-600 dark:text-brand-400 font-mono text-[13px]`}>
                              {children}
                            </code>
                          )
                        },
                        p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-4 mt-6 text-slate-900 dark:text-white" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-3 mt-5 text-slate-900 dark:text-white" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-4 text-slate-900 dark:text-white" {...props} />,
                        a: ({node, ...props}) => <a className="text-brand-600 dark:text-brand-400 hover:underline" {...props} />
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Citations Panel */}
                  {msg.citations && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <FileText size={14} /> Sources ({msg.citations.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cit, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-xs cursor-pointer hover:border-brand-300 transition-colors">
                            <span className="text-brand-600 dark:text-brand-400 font-medium">[{idx + 1}]</span>
                            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{cit.title}</span>
                            <span className={`ml-1 px-1 rounded text-[10px] ${cit.confidence > 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                              {cit.confidence}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className={`flex items-center gap-3 mt-2 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs text-slate-400">{msg.timestamp}</span>
                  {msg.role === 'agent' && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"><Copy size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"><RefreshCw size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"><ThumbsUp size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"><ThumbsDown size={14} /></button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0 mt-1 overflow-hidden shadow-inner">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                <Bot size={18} />
              </div>
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-2xl rounded-tl-sm shadow-md p-4 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all p-2">
            
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
              <Paperclip size={20} />
            </button>
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask the AI Knowledge Assistant..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
              rows={1}
            />

            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
              <Mic size={20} />
            </button>

            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className={`p-2 rounded-lg transition-colors ${
                input.trim() 
                  ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md' 
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send size={20} />
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-slate-400 dark:text-slate-500">
            AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
};

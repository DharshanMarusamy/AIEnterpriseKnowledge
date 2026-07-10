import React, { useState } from 'react';
import { 
  HelpCircle, Search, MessageSquare, BookOpen, Cpu, 
  ChevronDown, ChevronUp, Star, Shield, Play
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const faqs: FaqItem[] = [
    {
      category: 'General',
      question: 'What is the Enterprise Knowledge Assistant?',
      answer: 'It is a secure retrieval-augmented generation (RAG) platform that processes company documents locally, indexing them into vector databases (Qdrant) and matching your queries to documents using highly optimized LLM streaming agents.'
    },
    {
      category: 'Documents',
      question: 'How do I upload and index my documents?',
      answer: 'Navigate to the "Upload Documents" page. Drag and drop any company PDFs. Our backend parsing pipeline splits the document into semantic paragraphs, generates vector embeddings, and saves them to our Qdrant vector database so they are instantly searchable.'
    },
    {
      category: 'AI Assistant',
      question: 'How do Citations and Confidence scores work?',
      answer: 'When you ask a question in the AI Assistant chat, Qdrant searches for matching context paragraphs. The sources used are displayed below the assistant\'s answer as clickable citations, showing document names and accuracy confidence metrics.'
    },
    {
      category: 'Orchestrator',
      question: 'What does the "Agent Monitor" show?',
      answer: 'The Agent Monitor is an administrator dashboard displaying microservices health (Postgres, Qdrant, Redis), system load metrics, latency trends, and a Master Toggle. If the system is set to "Inactive", LLM request processing is paused, protecting tokens and rate limits.'
    },
    {
      category: 'Security',
      question: 'Are my enterprise queries private and secure?',
      answer: 'Yes. All indexed documents, vectors, and database operations are run within our isolated local container networks. LLM API calls are executed directly through validated secure private endpoints, preventing data leakage.'
    }
  ];

  const categories = ['All', 'General', 'Documents', 'AI Assistant', 'Orchestrator', 'Security'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Title Header banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-lg border border-slate-800">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        
        <div className="relative space-y-4 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wide">
            Help Center
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">How can we help you?</h1>
          <p className="text-slate-400 text-sm">Find answers regarding RAG architecture, document processing, agent configurations, and safety constraints.</p>
          
          <div className="relative pt-2">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Search guidebooks, terms, and FAQs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeCategory === cat
                ? 'bg-brand-600 border-brand-500 text-white shadow-md shadow-brand-500/10'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQs list accordion */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div 
              key={index}
              className="glass-card overflow-hidden border border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <button 
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-800 dark:text-slate-100 bg-slate-50/20 dark:bg-slate-800/10"
              >
                <span className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {faq.question}
                </span>
                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400 leading-relaxed animate-slide-down">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No help topics found matching your query.
          </div>
        )}
      </div>

      {/* Helpful links grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="glass-card p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
            <MessageSquare size={16} />
          </div>
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">AI Assistant Tutorial</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">Learn parameters for prompting, citations, and clearing chat history.</p>
        </div>
        <div className="glass-card p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-500 flex items-center justify-center">
            <BookOpen size={16} />
          </div>
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Knowledge Base Admin</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">Understand document segmenting, deduplication, and vector storage.</p>
        </div>
        <div className="glass-card p-5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center">
            <Cpu size={16} />
          </div>
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">System Architecture</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">RAG pipeline, latency charts, container network maps, and API limits.</p>
        </div>
      </div>

    </div>
  );
};

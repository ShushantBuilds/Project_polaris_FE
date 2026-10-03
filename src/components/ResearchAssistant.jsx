import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ResearchAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [thread, setThread] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const endOfThreadRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-expanding textarea logic
  const handleInput = (e) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  // Smooth scroll to the newest synthesis
  useEffect(() => {
    if (endOfThreadRef.current) {
      endOfThreadRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread, isTyping, isOpen]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    const userQ = query.trim();
    setQuery('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto'; // reset height
    
    // Add user query as a new "Section Header"
    setThread(prev => [...prev, { type: 'user', text: userQ }]);
    setIsTyping(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/assistant/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userQ })
      });
      const data = await res.json();
      
      // Append AI synthesis and cited papers
      setThread(prev => [...prev, { 
        type: 'ai', 
        text: data.response, 
        papers: data.papers_referenced || []
      }]);
    } catch (err) {
      setThread(prev => [...prev, { 
        type: 'error', 
        text: "Connection failed. Ensure the Django server is running." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-10 z-40 bg-white/40 backdrop-blur-xl border border-slate/20 text-ink px-5 py-3 rounded-full shadow-sm hover:bg-white/70 hover:border-slate/40 hover:shadow-md transition-all duration-300 flex items-center gap-3 group ${isOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'}`}
      >
        <span className="text-xl text-focus leading-none transition-transform group-hover:rotate-90 duration-700 ease-in-out">❈</span>
        <span className="font-mono text-xs uppercase tracking-widest text-slate group-hover:text-ink transition-colors mt-[2px]">Ask Polaris</span>
      </button>

      {/* Backdrop Overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-slate/10 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      ></div>

      {/* Slide-out Research Canvas */}
      <aside 
        className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-white/70 backdrop-blur-2xl border-l border-slate/20 shadow-2xl z-50 flex flex-col transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer Header */}
        <header className="px-8 py-6 border-b border-slate/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl text-focus leading-none">❈</span>
            <h2 className="font-display text-xl tracking-tight font-medium text-ink">Research Assistant</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate hover:text-ink transition-colors p-2 rounded-full hover:bg-slate/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Threaded Synthesis Area */}
        <div className="flex-1 overflow-y-auto px-8 py-10 pb-32">
          {thread.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <span className="text-4xl text-slate mb-4">❈</span>
              <p className="font-display text-2xl text-ink mb-2">What are we researching?</p>
              <p className="text-sm font-body text-slate max-w-xs">Ask a question to synthesize insights directly from your local academic corpus.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {thread.map((msg, idx) => (
                <div key={idx} className="animate-fade-in-up">
                  {msg.type === 'user' && (
                    <h3 className="font-display text-2xl md:text-3xl text-ink leading-tight mb-6">
                      {msg.text}
                    </h3>
                  )}
                  
                  {msg.type === 'ai' && (
                    <div className="border-l-2 border-focus pl-5 ml-2">
                      <div className="text-slate text-base font-body">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                            h3: ({node, ...props}) => <h3 className="font-display text-xl text-ink mt-6 mb-3 font-medium tracking-tight" {...props} />,
                            h4: ({node, ...props}) => <h4 className="font-mono text-sm uppercase tracking-widest text-ink mt-5 mb-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-medium text-ink" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-focus/50" {...props} />,
                            li: ({node, ...props}) => <li className="leading-relaxed pl-1" {...props} />,
                            a: ({node, ...props}) => <a className="text-focus hover:underline underline-offset-4" {...props} />
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      
                      {msg.papers && msg.papers.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <span className="text-xs font-mono uppercase tracking-widest text-slate/60 block mb-2">Sources Consulted</span>
                          {msg.papers.map(p => (
                            <div key={p.id} className="bg-white/50 border border-slate/20 rounded-xl p-3 px-4 text-sm text-ink flex items-center gap-3 hover:border-slate/40 transition-colors shadow-sm">
                              <span className="text-focus">📄</span>
                              <span className="font-medium line-clamp-1">{p.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {msg.type === 'error' && (
                    <div className="border-l-2 border-red-400 pl-5 ml-2">
                      <p className="text-red-500 text-sm font-body">{msg.text}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="border-l-2 border-slate/20 pl-5 ml-2 animate-pulse">
                  <p className="text-slate/60 text-sm font-mono uppercase tracking-widest">Synthesizing papers...</p>
                </div>
              )}
              <div ref={endOfThreadRef} />
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/90 via-white/70 to-transparent pt-12">
          <form 
            onSubmit={handleSubmit}
            className="relative bg-white border border-slate/20 shadow-lg rounded-2xl overflow-hidden focus-within:border-focus focus-within:ring-4 ring-focus/10 transition-all"
          >
            <textarea
              ref={textareaRef}
              value={query}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              className="w-full bg-transparent text-ink placeholder:text-slate p-4 pr-14 outline-none resize-none overflow-hidden text-base font-body"
              style={{ minHeight: '56px' }}
            />
            <button 
              type="submit"
              disabled={!query.trim() || isTyping}
              className="absolute bottom-3 right-3 p-2 bg-focus text-white rounded-lg hover:bg-focus/90 disabled:opacity-30 disabled:hover:bg-focus transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate/40">Powered by Gemini & pgvector</span>
          </div>
        </div>
      </aside>
    </>
  );
}
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const TOC_SECTIONS = [
  { id: 'the-problem', title: '1. The Problem' },
  { id: 'key-features', title: '2. Key Features' },
  { id: 'tech-stack', title: '3. Tech Stack' },
  { id: 'architecture', title: '4. System Architecture' },
  { id: 'recommendation-engine', title: '5. Recommendation Engine' },
  { id: 'search-pipeline', title: '6. Search Pipeline' },
  { id: 'content-ingestion', title: '7. Content Ingestion' },
  { id: 'auth-security', title: '8. Auth & Security' },
  { id: 'database-schema', title: '9. Database Schema' },
];

const architectureText = `┌─────────────────┐      HTTPS/JSON       ┌──────────────────────┐
│   React (Vite)  │◄─────────────────────►│   Django REST API    │
│ Tailwind CSS v4 │                       │ (JWT-authenticated)  │
└─────────────────┘                       └──────────┬───────────┘
                                                     │
                      ┌──────────────────────────────┼──────────────────────────────┐
                      │                              │                              │
             ┌────────▼────────┐          ┌──────────▼──────────┐          ┌────────▼────────┐
             │   PostgreSQL    │          │  Recommendation     │          │  Background     │
             │  (Docker)       │          │  Engine (tiered)    │          │  Scheduler      │
             │  + full-text    │          │  + local embeddings │          │  (apscheduler)  │
             │    search index │          └─────────────────────┘          └────────┬────────┘
             └─────────────────┘                                                    │
                                                                         ┌──────────┴──────────┐
                                                                         │                     │
                                                                ┌────────▼───────┐    ┌────────▼─────────┐
                                                                │  OpenAlex API  │    │  Mistral AI API  │
                                                                │ (paper ingest) │    │ (metadata enrich)│
                                                                └────────────────┘    └──────────────────┘`;

export default function Documentation() {
  // Feature 1: Scrollspy State
  const [activeSection, setActiveSection] = useState('');
  
  // Feature 2: Command Palette State
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const searchInputRef = useRef(null);

  // Feature 3: API Sandbox State
  const [sandboxQuery, setSandboxQuery] = useState('deep learning');
  const [sandboxResults, setSandboxResults] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [latency, setLatency] = useState(0);

  // Micro-interaction: Copy State
  const [copiedText, setCopiedText] = useState(false);

  // Scrollspy Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );
    
    TOC_SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    
    return () => observer.disconnect();
  }, []);

  // Cmd+K Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsCmdKOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus Cmd+K Input
  useEffect(() => {
    if (isCmdKOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isCmdKOpen]);

  const filteredSections = TOC_SECTIONS.filter(sec => 
    sec.title.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const runSandbox = async () => {
    setSandboxLoading(true);
    const start = performance.now();
    try {
      // Hits your local Django API endpoint directly
      const res = await fetch(`http://127.0.0.1:8000/api/content-items/?search=${encodeURIComponent(sandboxQuery)}`);
      const data = await res.json();
      setSandboxResults(data);
    } catch (err) {
      setSandboxResults({ error: "Failed to fetch. Ensure Django server is running." });
    }
    setLatency(Math.round(performance.now() - start));
    setSandboxLoading(false);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-body selection:bg-focus selection:text-white pb-24 scroll-smooth relative">
      
      {/* Cmd+K Modal */}
      {isCmdKOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <div className="absolute inset-0 bg-slate/20 backdrop-blur-sm" onClick={() => setIsCmdKOpen(false)}></div>
          <div className="relative bg-white border border-slate/20 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all">
            <div className="p-4 border-b border-slate/10 flex items-center gap-3">
              <span className="text-slate font-mono">⌘</span>
              <input 
                ref={searchInputRef}
                type="text" 
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search documentation..."
                className="w-full bg-transparent outline-none text-ink placeholder:text-slate"
              />
              <span className="text-xs text-slate border border-slate/20 px-2 py-1 rounded">ESC</span>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {filteredSections.length > 0 ? (
                filteredSections.map(sec => (
                  <a 
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setIsCmdKOpen(false)}
                    className="block p-3 rounded-xl hover:bg-slate/5 text-ink transition-colors"
                  >
                    {sec.title}
                  </a>
                ))
              ) : (
                <div className="p-6 text-center text-slate text-sm">No results found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ambient Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-halo rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-focus rounded-full mix-blend-multiply filter blur-[120px] opacity-10"></div>
      </div>

      <nav className="w-full px-8 py-6 flex items-center justify-between border-b border-slate/10 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-2xl tracking-tight font-medium">Polaris</span>
        </Link>
        <button 
          onClick={() => setIsCmdKOpen(true)}
          className="hidden md:flex items-center gap-2 bg-white/40 border border-slate/20 hover:border-slate/40 px-3 py-1.5 rounded-lg text-sm text-slate transition-colors"
        >
          Search docs... <kbd className="font-sans font-medium bg-slate/10 px-1.5 py-0.5 rounded text-xs tracking-widest">⌘+K/Ctrl+K</kbd>
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-16 flex flex-col lg:flex-row gap-12 relative z-10">
        
        {/* Sticky Sidebar (Table of Contents) */}
        <aside className="hidden lg:block lg:w-1/4">
          <div className="sticky top-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 shadow-sm">
            <h3 className="font-mono text-xs uppercase tracking-widest text-slate mb-6 border-b border-slate/10 pb-2">Contents</h3>
            <ul className="space-y-4 font-mono text-sm text-slate">
              {TOC_SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className={`block transition-all duration-200 ${
                      activeSection === sec.id
                        ? 'text-focus font-medium border-l-2 border-focus pl-3 -ml-3'
                        : 'hover:text-focus pl-0'
                    }`}
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:w-3/4">
          <header className="mb-12 border-b border-slate/20 pb-12">
            <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-6">Project Polaris</h1>
            <p className="text-xl text-slate leading-relaxed max-w-2xl">
              Solving the "Cold Start" Problem in Personalized Research Content Discovery.
            </p>
          </header>

          <div className="space-y-12">
            <section id="the-problem" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">1. The Problem</h2>
              <p className="text-slate leading-relaxed mb-4">
                Recommendation engines are only as good as the behavioral history they have to learn from — and a brand-new user has none. Most platforms either show everyone the same generic popular content until enough data accumulates.
              </p>
              <p className="text-slate leading-relaxed">
                Project Polaris addresses this directly with a <strong>three-tier hybrid strategy</strong> that closes the cold-start gap immediately at signup.
              </p>
            </section>

            <section id="key-features" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">2. Key Features</h2>
              <ul className="list-disc pl-5 space-y-4 text-slate leading-relaxed">
                <li><strong className="text-ink font-medium">Three-tier cold-start recommendation engine</strong> — popularity fallback → explicit preference matching → hybrid explicit + inferred + semantic scoring.</li>
                <li><strong className="text-ink font-medium">Live-growing research corpus</strong> — automated ingestion from the OpenAlex API (250M+ scholarly works).</li>
                <li><strong className="text-ink font-medium">Semantic search & matching</strong> — local sentence-transformer embeddings power both search fallback and recommendation scoring.</li>
              </ul>
            </section>

            <section id="tech-stack" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">3. Tech Stack</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="border border-slate/20 p-6 rounded-xl bg-white/50">
                  <h4 className="font-mono uppercase tracking-widest text-xs text-slate mb-3">Backend</h4>
                  <p className="text-ink">Python, Django, Django REST Framework, PostgreSQL, pgvector.</p>
                </div>
                <div className="border border-slate/20 p-6 rounded-xl bg-white/50">
                  <h4 className="font-mono uppercase tracking-widest text-xs text-slate mb-3">Frontend</h4>
                  <p className="text-ink">React (Vite), Tailwind CSS v4, React Router, Axios.</p>
                </div>
              </div>
            </section>

            <section id="architecture" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">4. System Architecture</h2>
              <div className="relative group bg-[#0D1117] text-[#C9D1D9] p-6 rounded-xl overflow-x-auto font-mono text-sm leading-tight border border-slate/20 shadow-inner">
                <button 
                  onClick={() => handleCopy(architectureText)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-xs backdrop-blur-md"
                >
                  {copiedText ? '✓ Copied!' : 'Copy'}
                </button>
                <pre>{architectureText}</pre>
              </div>
            </section>

            <section id="recommendation-engine" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">5. The Recommendation Engine</h2>
              <p className="text-slate leading-relaxed mb-6">
                The core algorithm scores every candidate paper for a user through a layered scoring model, computed fresh on every request.
              </p>
              <div className="overflow-hidden border border-slate/20 rounded-xl mb-8 bg-white/50">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate/20 font-mono uppercase tracking-wider text-xs text-slate">
                    <tr>
                      <th className="p-4 font-medium">Signal</th>
                      <th className="p-4 font-medium">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate/10 text-slate">
                    <tr>
                      <td className="p-4"><strong className="text-ink font-medium">Explicit preference</strong></td>
                      <td className="p-4">Tags selected during onboarding. Immediate personalization from session one.</td>
                    </tr>
                    <tr>
                      <td className="p-4"><strong className="text-ink font-medium">Semantic similarity</strong></td>
                      <td className="p-4">Cosine similarity between the user's "taste vector" and embeddings.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="search-pipeline" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">6. Search Pipeline</h2>
              <ol className="list-decimal pl-5 space-y-3 text-slate">
                <li><strong className="text-ink font-medium">Semantic search:</strong> Bypasses standard keyword matching by finding conceptual relationships via cosine distance.</li>
                <li><strong className="text-ink font-medium">PostgreSQL pgvector:</strong> Fast, local embedding similarity scoring on the database level.</li>
              </ol>

              {/* API Sandbox Element */}
              <div className="mt-8 border border-slate/20 rounded-xl bg-white/50 overflow-hidden shadow-sm">
                <div className="bg-slate/5 border-b border-slate/10 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="font-mono text-xs text-slate uppercase tracking-wider">Live API Sandbox</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate/20 rounded-md px-3 py-1.5 focus-within:border-focus transition-colors">
                      <span className="text-slate font-mono text-xs mr-2">GET</span>
                      <input 
                        type="text" 
                        value={sandboxQuery}
                        onChange={(e) => setSandboxQuery(e.target.value)}
                        placeholder="Search query..."
                        className="bg-transparent border-none outline-none text-sm w-48 text-ink font-mono"
                      />
                    </div>
                    <button 
                      onClick={runSandbox}
                      disabled={sandboxLoading}
                      className="bg-focus text-white px-4 py-1.5 rounded-md text-sm hover:opacity-90 transition-opacity font-medium disabled:opacity-50 min-w-[90px]"
                    >
                      {sandboxLoading ? 'Fetching' : 'Send'}
                    </button>
                  </div>
                </div>
                {sandboxResults && (
                  <div className="p-6 bg-[#0D1117] text-[#C9D1D9] font-mono text-sm overflow-y-auto max-h-96 relative">
                    <div className="absolute top-4 right-6 text-xs text-slate/40 bg-white/5 px-2 py-1 rounded">{latency}ms</div>
                    <pre>{JSON.stringify(sandboxResults, null, 2)}</pre>
                  </div>
                )}
              </div>
            </section>

            <section id="content-ingestion" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">7. Content Ingestion</h2>
              <ul className="list-disc pl-5 space-y-4 text-slate leading-relaxed">
                <li><strong className="text-ink font-medium">Source:</strong> OpenAlex API — deduplicated via each paper's unique ID.</li>
                <li><strong className="text-ink font-medium">Automation:</strong> Scheduled background tasks cycle fresh papers in via APScheduler.</li>
              </ul>
            </section>

            <section id="auth-security" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">8. Auth & Security</h2>
              <ul className="list-disc pl-5 space-y-3 text-slate leading-relaxed">
                <li><strong className="text-ink font-medium">Custom user model</strong> — email + password login.</li>
                <li><strong className="text-ink font-medium">JWT authentication</strong> API access protected by throttles.</li>
              </ul>
            </section>

            <section id="database-schema" className="scroll-mt-32 bg-white/40 backdrop-blur-xl border border-slate/20 rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="font-display text-3xl mb-6">9. Database Schema</h2>
              <p className="text-slate">Core tables mapped via Django ORM to standard PostgreSQL instances.</p>
            </section>
            
          </div>
        </main>
      </div>
    </div>
  );
}
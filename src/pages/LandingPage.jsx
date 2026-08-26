import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { searchContentItems } from '../api/contentItems';
import ContentCard from '../components/ContentCard';

export default function LandingPage() {
  // Theme logic has been completely removed.
  
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  
  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['publicSearch', activeQuery],
    queryFn: () => searchContentItems(activeQuery),
    enabled: activeQuery.trim().length > 0,
  });

  const handleSearch = (e) => { 
    e.preventDefault(); 
    setActiveQuery(searchInput.trim()); 
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden text-ink font-body">
      
      {/* 1. Ambient Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-halo rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
         <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-focus rounded-full mix-blend-multiply filter blur-[120px] opacity-10"></div>
      </div>

      {/* 2. The Navigation Bar (Minimal Chrome) */}
      <nav className="z-20 w-full px-8 py-6 flex items-center justify-between backdrop-blur-md bg-paper/80 border-b border-slate/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-2xl tracking-tight font-medium">Polaris</span>
        </div>
        
        <div className="flex items-center gap-6 font-mono text-sm uppercase tracking-wider">
          <Link to="/login" className="text-slate hover:text-ink transition-colors ml-2">Log In</Link>
          <Link to="/register" className="border border-slate/30 px-6 py-2 rounded-full hover:border-ink hover:bg-ink hover:text-paper transition-all">
            Initialize
          </Link>
        </div>
      </nav>

      {/* 3. The Search Engine Core */}
      <main className="z-10 flex-1 flex flex-col items-center justify-start pt-24 md:pt-32 px-6 w-full max-w-6xl mx-auto"> 
        
        {/* Hero Branding */}
        <div className="text-center mb-10 w-full">
           <span className="font-mono text-xs tracking-widest text-slate uppercase  transition-all duration-700 mb-6 block">
             Academic Search Engine v1.0
           </span>
           <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.05] mb-6">
             Discover your <span className="text-focus blur-[5px] hover:blur-none transition-all duration-1000">true signal.</span>
           </h1>
           <p className="font-body text-lg text-slate max-w-2xl mx-auto mb-2">
             Query millions of research papers without the noise.
           </p>
        </div>

        {/* Massive Centered Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl relative group mb-16 shadow-2xl shadow-focus/5 rounded-full">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
             <svg className="w-6 h-6 text-slate group-focus-within:text-focus transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <input 
            type="text" 
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)} 
            placeholder="Search by topic, keyword, or author..."
            className="w-full border-2 border-slate/20 rounded-full pl-16 pr-36 py-5 bg-white/70 backdrop-blur-md text-lg focus:outline-none focus:border-focus focus:bg-white transition-all" 
          />
          <button 
            type="submit" 
            className="absolute right-2 top-2 bottom-2 bg-ink text-paper rounded-full px-8 font-medium hover:bg-focus hover:-translate-y-0.5 transition-all duration-300"
          >
            Search
          </button>
        </form>

        {/* Dynamic Results Area */}
        <div className="w-full pb-20">
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-3 mt-10">
               <div className="w-6 h-6 border-2 border-focus border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate font-mono text-sm uppercase tracking-widest">Scanning database…</p>
            </div>
          )}
          
          {isError && <p className="text-center text-red-600 font-medium">Search connection failed. Please try again.</p>}
          
          {activeQuery && !isLoading && results?.length === 0 && (
            <p className="text-center text-slate">No matches found for <span className="font-medium text-ink">"{activeQuery}"</span>.</p>
          )}
          
          {results?.length > 0 && (
            <div className="animate-fade-in">
              <p className="text-sm text-slate font-mono uppercase tracking-widest mb-6 border-b border-slate/20 pb-2">
                Showing {results.length} results for "{activeQuery}"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => <ContentCard key={item.id} item={item} score={1} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. The Technical Footer */}
      <footer className="z-20 w-full px-8 py-6 border-t border-slate/10 flex flex-col md:flex-row items-center justify-between text-slate font-mono text-xs uppercase tracking-wide mt-auto">
        <p>© {new Date().getFullYear()} Project Polaris. Engineered for academic research.</p>
        <div className="flex gap-8 mt-4 md:mt-0 items-center">
          <a href="#" className="hover:text-ink transition-colors">Documentation</a>
          <a href="#" className="hover:text-ink transition-colors">GitHub</a>
          <span className="flex items-center gap-2 bg-slate/5 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            PostgreSQL Online
          </span>
        </div>
      </footer>
      
    </div>
  );
}
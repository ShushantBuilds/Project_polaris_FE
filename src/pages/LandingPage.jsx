import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { searchContentItems } from '../api/contentItems';
import ContentCard from '../components/ContentCard';

export default function LandingPage() {
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

  const executeQuickSearch = (term) => {
    setSearchInput(term);
    setActiveQuery(term);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden text-ink font-body">
      
      {/* 1. Ambient Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-halo rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
      </div>

      {/* 2. The Navigation Bar */}
      <nav className="z-20 w-full px-8 py-6 flex items-center justify-between bg-transparent">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-2xl tracking-tight font-medium">Polaris</span>
        </div>
        
        <div className="flex items-center gap-6 font-mono text-sm uppercase tracking-wider">
          <Link to="/login" className="text-slate hover:text-ink transition-colors ml-2">Log In</Link>
          <Link to="/register" className="border border-slate/30 bg-white/50 px-6 py-2 rounded-full hover:border-ink hover:bg-ink hover:text-paper transition-all shadow-sm">
            Initialize Profile
          </Link>
        </div>
      </nav>

      {/* 3. The Search Engine Core */}
      <main className="z-10 flex-1 flex flex-col items-center pt-[15vh] px-6 w-full max-w-6xl mx-auto"> 
        
        {/* Hero Branding */}
        <div className="text-center mb-10 w-full">
           <span className="font-mono text-xs tracking-widest text-slate uppercase mb-6 block">
             Open Academic Index
           </span>
           <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.05] mb-4">
             Precision research <br className="hidden md:block"/> without the noise.
           </h1>
        </div>

        {/* Massive Centered Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl relative group mb-8 shadow-xl shadow-focus/5 rounded-full">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
             <svg className="w-6 h-6 text-slate group-focus-within:text-focus transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <input 
            type="text" 
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)} 
            placeholder="Search by topic, methodology, or keyword..."
            className="w-full border-2 border-slate/20 rounded-full pl-16 pr-36 py-5 bg-white/80 backdrop-blur-md text-lg focus:outline-none focus:border-focus focus:bg-white transition-all shadow-inner" 
          />
          <button 
            type="submit" 
            disabled={!searchInput.trim()}
            className="absolute right-2 top-2 bottom-2 bg-ink text-paper rounded-full px-8 font-medium hover:bg-focus hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            Search
          </button>
        </form>

        {/* Suggested Queries - Only show if not actively searching */}
        {!activeQuery && !isLoading && (
          <div className="flex flex-wrap justify-center items-center gap-3 animate-fade-in">
             <span className="font-mono text-xs text-slate uppercase tracking-widest mr-2">Try searching:</span>
             {['Transformer Models', 'CRISPR-Cas9', 'Quantum Cryptography', 'Behavioral Economics'].map(term => (
               <button 
                 key={term} 
                 onClick={() => executeQuickSearch(term)}
                 className="px-4 py-1.5 rounded-full border border-slate/20 bg-white/50 text-sm text-slate hover:border-focus hover:text-focus transition-all"
               >
                 {term}
               </button>
             ))}
          </div>
        )}

        {/* Dynamic Results Area */}
        <div className="w-full pb-12 mt-12">
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 mt-10">
               <div className="w-8 h-8 border-2 border-focus border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate font-mono text-sm uppercase tracking-widest">Querying database…</p>
            </div>
          )}
          
          {/* Error State */}
          {isError && (
             <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-xl text-center max-w-2xl mx-auto">
                 <p className="font-medium mb-1">Search connection failed.</p>
                 <p className="text-sm opacity-80">Please check your network connection or try again later.</p>
             </div>
          )}
          
          {/* No Results State */}
          {activeQuery && !isLoading && results?.length === 0 && (
            <div className="text-center py-10">
               <span className="text-4xl block mb-4">📭</span>
               <p className="text-slate text-lg">No matches found for <span className="font-medium text-ink">"{activeQuery}"</span>.</p>
               <p className="text-slate text-sm mt-2">Try adjusting your keywords or using broader terms.</p>
            </div>
          )}
          
          {/* Populated Results State */}
          {results?.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate/20 pb-3 mb-6">
                 <p className="text-sm text-slate font-mono uppercase tracking-widest">
                   Search Results
                 </p>
                 <p className="text-sm text-slate">
                   Found <span className="font-medium text-ink">{results.length}</span> papers
                 </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => <ContentCard key={item.id} item={item} score={1} />)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. The Technical Footer */}
      <footer className="z-20 w-full px-8 py-6 border-t border-slate/10 flex flex-col md:flex-row items-center justify-between text-slate font-mono text-xs uppercase tracking-wide mt-auto bg-transparent">
        <p>© {new Date().getFullYear()} Project Polaris. Engineered for academic research.</p>
        <div className="flex gap-8 mt-4 md:mt-0 items-center">
          <Link to="/documentation" className="hover:text-ink transition-colors">Documentation</Link>
          <a href="https://github.com/ShushantBuilds" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">GitHub</a>
          
          <span className="flex items-center gap-2 bg-slate/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Engine Online
          </span>
        </div>
      </footer>
      
    </div>
  );
}
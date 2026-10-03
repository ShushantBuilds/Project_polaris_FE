import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { searchContentItems, getDailySearchSuggestions, toggleInteraction, voteOnItem } from '../api/contentItems';
import ContentCard from '../components/ContentCard';
import ReadingModal from '../components/ReadingModal';

const FALLBACK_SUGGESTIONS = ['Transformer Models', 'CRISPR-Cas9', 'Quantum Cryptography', 'Behavioral Economics'];

export default function LandingPage() {
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [readingItem, setReadingItem] = useState(null);
  const canvasRef = useRef(null); 

  const { data: dailySuggestions } = useQuery({
    queryKey: ['dailySearchSuggestions', new Date().toDateString()],
    queryFn: getDailySearchSuggestions,
    staleTime: 1000 * 60 * 60,
  });
  const suggestions = dailySuggestions?.length ? dailySuggestions : FALLBACK_SUGGESTIONS;

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['publicSearch', activeQuery],
    queryFn: () => searchContentItems(activeQuery),
    enabled: activeQuery.trim().length > 0,
  });

  const handleToggleLike = (id) => {
    setReadingItem((prev) => (prev && prev.id === id ? { ...prev, is_liked: !prev.is_liked } : prev));
    toggleInteraction(id, 'LIKE');
  };
  const handleToggleSave = (id) => {
    setReadingItem((prev) => (prev && prev.id === id ? { ...prev, is_saved: !prev.is_saved } : prev));
    toggleInteraction(id, 'SAVE');
  };
  const handleVote = (id, type) => {
    setReadingItem((prev) => {
      if (!prev || prev.id !== id) return prev;
      let { upvotes, downvotes, user_vote } = prev;
      if (user_vote === type) { user_vote = null; type === 'UPVOTE' ? upvotes-- : downvotes--; }
      else if (user_vote) { user_vote === 'UPVOTE' ? upvotes-- : downvotes--; type === 'UPVOTE' ? upvotes++ : downvotes++; user_vote = type; }
      else { type === 'UPVOTE' ? upvotes++ : downvotes++; user_vote = type; }
      return { ...prev, upvotes, downvotes, user_vote };
    });
    voteOnItem(id, type);
  };

  const handleSearch = (e) => { 
    e.preventDefault(); 
    setActiveQuery(searchInput.trim()); 
  };

  const executeQuickSearch = (term) => {
    setSearchInput(term);
    setActiveQuery(term);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const mouse = { x: null, y: null, radius: 150 };
    const handleMouseMove = (e) => { mouse.x = e.x; mouse.y = e.y; };
    const handleMouseLeave = () => { mouse.x = null; mouse.y = null; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1.5; 
        this.speedX = (Math.random() - 0.5) * 0.5; 
        this.speedY = (Math.random() - 0.5) * 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        if (mouse.x != null && mouse.y != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= forceDirectionX * force * 2;
            this.y -= forceDirectionY * force * 2;
          }
        }
      }
      draw() {
        ctx.fillStyle = 'rgba(3, 56, 109, 0.7)'; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const particleCount = (canvas.width * canvas.height) / 15000; 
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    init();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(20, 24, 28, ${0.15 - distance/600})`; 
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    // FIX 1: overflow-x-hidden completely restores native vertical scrolling while preventing horizontal stretch
    <div className="min-h-screen bg-paper flex flex-col relative overflow-x-hidden text-ink font-body">
      
      {/* FIX 2: Canvas and Glows are locked to the camera (fixed) so they never end abruptly */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none" 
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-halo rounded-full mix-blend-multiply filter blur-[100px] opacity-200"></div>
      </div>

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

      {/* Main container naturally pads downward */}
      <main className="z-10 flex-1 flex flex-col items-center pt-[10vh] px-6 w-full max-w-6xl mx-auto pb-20"> 
        
        {/* FIX 3: Static, permanent header that never hides */}
        <div className="text-center mb-10 w-full relative">
           <span className="font-mono text-xs tracking-widest text-slate uppercase mb-6 block">
             Open Academic Index
           </span>
           <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.05] mb-4">
             Precision research <br className="hidden md:block"/> without the noise.
           </h1>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-3xl relative group mb-8 shadow-xl shadow-focus/5 rounded-full z-20">
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

        {!activeQuery && !isLoading && (
          <div className="flex flex-wrap justify-center items-center gap-3 animate-fade-in z-20 relative">
             <span className="font-mono text-xs text-slate uppercase tracking-widest mr-2">Try searching:</span>
             {suggestions.map(term => (
               <button 
                 key={term} 
                 onClick={() => executeQuickSearch(term)}
                 className="px-4 py-1.5 rounded-full border border-slate/20 bg-white/80 backdrop-blur-sm text-sm text-slate hover:border-focus hover:text-focus transition-all shadow-sm"
               >
                 {term}
               </button>
             ))}
          </div>
        )}

        {/* Results grid dynamically expands page height, allowing native smooth scrolling */}
        <div className="w-full mt-8 relative z-20">
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 mt-10">
               <div className="w-8 h-8 border-2 border-focus border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate font-mono text-sm uppercase tracking-widest">Querying database…</p>
            </div>
          )}
          
          {isError && (
             <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-xl text-center max-w-2xl mx-auto backdrop-blur-sm">
                 <p className="font-medium mb-1">Search connection failed.</p>
                 <p className="text-sm opacity-80">Please check your network connection or try again later.</p>
             </div>
          )}
          
          {activeQuery && !isLoading && results?.length === 0 && (
            <div className="text-center py-10 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate/10 max-w-3xl mx-auto">
               <span className="text-4xl block mb-4">📭</span>
               <p className="text-slate text-lg">No matches found for <span className="font-medium text-ink">"{activeQuery}"</span>.</p>
               <p className="text-slate text-sm mt-2">Try adjusting your keywords or using broader terms.</p>
            </div>
          )}
          
          {results?.length > 0 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate/20 pb-3 mb-6 bg-white/50 backdrop-blur-md p-4 rounded-xl">
                 <p className="text-sm text-slate font-mono uppercase tracking-widest">
                   Search Results
                 </p>
                 <p className="text-sm text-slate">
                   Found <span className="font-medium text-ink">{results.length}</span> papers
                 </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item) => (
                  <ContentCard 
                    key={item.id} 
                    item={item} 
                    score={1} 
                    onOpen={setReadingItem}
                    onToggleLike={handleToggleLike}
                    onToggleSave={handleToggleSave}
                    onVote={handleVote}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="z-20 w-full px-8 py-6 border-t border-slate/10 flex flex-col md:flex-row items-center justify-between text-slate font-mono text-xs uppercase tracking-wide bg-white/50 backdrop-blur-md mt-auto">
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
      
      <ReadingModal
        item={readingItem}
        onClose={() => setReadingItem(null)}
        onToggleLike={handleToggleLike}
        onToggleSave={handleToggleSave}
        onVote={handleVote}
      />

    </div>
  );
}
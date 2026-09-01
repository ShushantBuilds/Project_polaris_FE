import { Link } from 'react-router-dom';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-paper text-ink font-body selection:bg-focus selection:text-white pb-24 scroll-smooth">
      {/* Minimal Nav */}
      <nav className="w-full px-8 py-6 flex items-center justify-between border-b border-slate/10 bg-paper/90 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3 hover:opacity-70 transition-opacity">
          <span className="text-2xl text-focus leading-none">❈</span>
          <span className="font-display text-2xl tracking-tight font-medium">Polaris</span>
        </Link>
        <div className="font-mono text-sm uppercase tracking-wider text-slate">
          Documentation
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-16 flex flex-col lg:flex-row gap-16">
        
        {/* Sticky Sidebar (Table of Contents) */}
        <aside className="hidden lg:block lg:w-1/4">
          <div className="sticky top-32">
            <h3 className="font-mono text-xs uppercase tracking-widest text-slate mb-6">Contents</h3>
            <ul className="space-y-3 font-mono text-sm text-slate">
              <li><a href="#the-problem" className="hover:text-focus transition-colors">1. The Problem</a></li>
              <li><a href="#key-features" className="hover:text-focus transition-colors">2. Key Features</a></li>
              <li><a href="#tech-stack" className="hover:text-focus transition-colors">3. Tech Stack</a></li>
              <li><a href="#architecture" className="hover:text-focus transition-colors">4. System Architecture</a></li>
              <li><a href="#recommendation-engine" className="hover:text-focus transition-colors">5. Recommendation Engine</a></li>
              <li><a href="#search-pipeline" className="hover:text-focus transition-colors">6. Search Pipeline</a></li>
              <li><a href="#content-ingestion" className="hover:text-focus transition-colors">7. Content Ingestion</a></li>
              <li><a href="#auth-security" className="hover:text-focus transition-colors">8. Auth & Security</a></li>
              <li><a href="#database-schema" className="hover:text-focus transition-colors">9. Database Schema</a></li>
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:w-3/4">
          <header className="mb-20 border-b border-slate/20 pb-12">
            <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-6">Project Polaris</h1>
            <p className="text-xl text-slate leading-relaxed max-w-2xl">
              Solving the "Cold Start" Problem in Personalized Research Content Discovery[cite: 9].
            </p>
          </header>

          <div className="space-y-24">
            
            <section id="the-problem" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">1. The Problem</h2>
              <p className="text-slate leading-relaxed mb-4">
                Recommendation engines are only as good as the behavioral history they have to learn from — and a brand-new user has none[cite: 9]. Most platforms either show everyone the same generic popular content until enough data accumulates, or offer no personalization at all in the meantime[cite: 9]. This is the "cold start" problem, and it's especially costly in research content discovery: a researcher's very first session is often when they most need relevant, well-targeted results — not after weeks of training an algorithm on their clicks[cite: 9].
              </p>
              <p className="text-slate leading-relaxed">
                Project Polaris addresses this directly with a <strong>three-tier hybrid strategy</strong> that closes the cold-start gap immediately at signup, then quietly improves as real usage accumulates[cite: 9].
              </p>
            </section>

            <section id="key-features" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">2. Key Features</h2>
              <ul className="list-disc pl-5 space-y-4 text-slate leading-relaxed">
                <li><strong className="text-ink">Three-tier cold-start recommendation engine</strong> — popularity fallback → explicit preference matching → hybrid explicit + inferred + semantic scoring[cite: 9].</li>
                <li><strong className="text-ink">Live-growing research corpus</strong> — automated ingestion from the OpenAlex API (250M+ scholarly works), with on-demand live fetching[cite: 9].</li>
                <li><strong className="text-ink">AI-powered metadata enrichment</strong> — Mistral AI generates plain-language summaries, difficulty ratings, and topic tags for every ingested paper[cite: 9].</li>
                <li><strong className="text-ink">Semantic search & matching</strong> — local sentence-transformer embeddings power both search fallback and recommendation scoring, understanding meaning beyond exact keyword overlap[cite: 9].</li>
                <li><strong className="text-ink">Community-driven ranking</strong> — upvotes/downvotes re-weight recommendation scores platform-wide, not just for the voter[cite: 9].</li>
              </ul>
            </section>

            <section id="tech-stack" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">3. Tech Stack</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="border border-slate/20 p-6 rounded-xl">
                  <h4 className="font-mono uppercase tracking-widest text-xs text-slate mb-3">Backend</h4>
                  <p className="text-ink">Python, Django, Django REST Framework, PostgreSQL (Docker), Django REST Framework SimpleJWT[cite: 9].</p>
                </div>
                <div className="border border-slate/20 p-6 rounded-xl">
                  <h4 className="font-mono uppercase tracking-widest text-xs text-slate mb-3">Frontend</h4>
                  <p className="text-ink">React (Vite), Tailwind CSS v4, React Router, TanStack Query, Axios, react-google-recaptcha[cite: 9].</p>
                </div>
                <div className="border border-slate/20 p-6 rounded-xl">
                  <h4 className="font-mono uppercase tracking-widest text-xs text-slate mb-3">AI / ML</h4>
                  <p className="text-ink">Mistral AI (metadata enrichment), Sentence-Transformers / all-MiniLM-L6-v2 (local embeddings, no API cost)[cite: 9].</p>
                </div>
                <div className="border border-slate/20 p-6 rounded-xl">
                  <h4 className="font-mono uppercase tracking-widest text-xs text-slate mb-3">Data & Infra</h4>
                  <p className="text-ink">OpenAlex API, django-apscheduler, Docker, python-decouple[cite: 9].</p>
                </div>
              </div>
            </section>

            <section id="architecture" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">4. System Architecture</h2>
              <div className="bg-[#0D1117] text-[#C9D1D9] p-6 rounded-xl overflow-x-auto font-mono text-sm leading-tight border border-slate/20 shadow-inner">
<pre>{`┌─────────────────┐      HTTPS/JSON       ┌──────────────────────┐
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
                                                                └────────────────┘    └──────────────────┘`}</pre>
              </div>
            </section>

            <section id="recommendation-engine" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">5. The Recommendation Engine</h2>
              <p className="text-slate leading-relaxed mb-6">
                The core algorithm (discovery_engine/recommendations.py) scores every candidate paper for a user through a layered scoring model, computed fresh on every request[cite: 9]:
              </p>
              <div className="overflow-hidden border border-slate/20 rounded-xl mb-8">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate/5 border-b border-slate/20 font-mono uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4 font-medium">Signal</th>
                      <th className="p-4 font-medium">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate/10 text-slate">
                    <tr>
                      <td className="p-4"><strong className="text-ink">Explicit preference</strong></td>
                      <td className="p-4">Tags selected during onboarding. Immediate personalization from session one[cite: 9].</td>
                    </tr>
                    <tr>
                      <td className="p-4"><strong className="text-ink">Inferred behavior</strong></td>
                      <td className="p-4">Weighted interaction history (VIEW {'<'} CLICK {'<'} LIKE/SAVE/UPVOTE). Learns from real usage over time[cite: 9].</td>
                    </tr>
                    <tr>
                      <td className="p-4"><strong className="text-ink">Semantic similarity</strong></td>
                      <td className="p-4">Cosine similarity between the user's "taste vector" (averaged embeddings of liked/saved/upvoted papers) and each candidate's embedding[cite: 9].</td>
                    </tr>
                    <tr>
                      <td className="p-4"><strong className="text-ink">Vote multiplier</strong></td>
                      <td className="p-4">Platform-wide net upvotes/downvotes on each paper. Community-vetted quality signal[cite: 9].</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h4 className="font-display text-xl mb-3">Three tiers of discovery:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-slate">
                <li><strong className="text-ink">True cold start:</strong> (no preferences, no interactions) → community-vetted popularity fallback[cite: 9].</li>
                <li><strong className="text-ink">Explicit cold start:</strong> (onboarding done, no interactions yet) → pure tag-based content matching[cite: 9].</li>
                <li><strong className="text-ink">Warm:</strong> (real interaction history) → full hybrid: tags + inferred behavior + semantic similarity + vote weighting[cite: 9].</li>
              </ol>
            </section>

            <section id="search-pipeline" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">6. Search: Keyword → Semantic → Live Discovery</h2>
              <p className="text-slate leading-relaxed mb-4">
                Search (GET /api/content-items/?search=) runs a three-step fallback chain, each step only triggering if the previous one found nothing[cite: 9]:
              </p>
              <ol className="list-decimal pl-5 space-y-3 text-slate">
                <li><strong className="text-ink">PostgreSQL full-text keyword search:</strong> (SearchVectorField + GIN index) — fast, exact[cite: 9].</li>
                <li><strong className="text-ink">Semantic search:</strong> falls back to embedding similarity if no literal keyword match exists, catching paraphrased or conceptually-related queries[cite: 9].</li>
                <li><strong className="text-ink">Live OpenAlex fetch:</strong> if genuinely nothing local matches at all, the backend fetches real results directly from OpenAlex for that exact query, permanently caches them, and returns them[cite: 9].</li>
              </ol>
            </section>

            <section id="content-ingestion" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">7. Content Ingestion Pipeline</h2>
              <ul className="list-disc pl-5 space-y-4 text-slate leading-relaxed">
                <li><strong className="text-ink">Source:</strong> OpenAlex API — no API key required, deduplicated via each paper's unique OpenAlex ID[cite: 9].</li>
                <li><strong className="text-ink">Tagging & Embeddings:</strong> Papers are tagged using OpenAlex's concept classifications. Embeddings are computed inline at ingestion time using a local sentence-transformer model[cite: 9].</li>
                <li><strong className="text-ink">AI Enrichment:</strong> A separate scheduled pass sends each new paper's abstract to Mistral AI once, generating a plain-language summary, an inferred difficulty level, and additional topical tags[cite: 9].</li>
                <li><strong className="text-ink">Automated Schedule:</strong> A background job (django-apscheduler) runs every 6 hours: ingest_papers → enrich_papers → prune_stale_tags[cite: 9].</li>
              </ul>
            </section>

            <section id="auth-security" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">8. Authentication & Security</h2>
              <ul className="list-disc pl-5 space-y-3 text-slate leading-relaxed">
                <li><strong className="text-ink">Custom user model</strong> — email + password login (no username field), with first name, last name, and a 10-digit-validated phone number[cite: 9].</li>
                <li><strong className="text-ink">JWT authentication</strong> via SimpleJWT, with a custom authentication class that checks each access token's issue time against the user's password_changed_at timestamp[cite: 9].</li>
                <li><strong className="text-ink">reCAPTCHA v2</strong> on registration, verified server-side[cite: 9].</li>
                <li><strong className="text-ink">Inline OTP email verification</strong> — a 6-digit code sent before an account is ever created[cite: 9].</li>
                <li><strong className="text-ink">Anti-Enumeration</strong> — Forgot/reset password flows are deliberately silent on whether an email exists[cite: 9].</li>
              </ul>
            </section>

            <section id="database-schema" className="scroll-mt-32">
              <h2 className="font-display text-3xl mb-6">9. Database Schema</h2>
              <div className="overflow-x-auto border border-slate/20 rounded-xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate/5 border-b border-slate/20 font-mono uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4 font-medium">Model</th>
                      <th className="p-4 font-medium">Key Fields</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate/10 text-slate">
                    <tr>
                      <td className="p-4 font-mono text-ink">CustomUser</td>
                      <td className="p-4">email, first/last name, phone_number, is_email_verified[cite: 9]</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-ink">ContentItem</td>
                      <td className="p-4">title, description, tags (M2M), search_vector, external_id, upvotes, embedding[cite: 9]</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-ink">Interaction</td>
                      <td className="p-4">user, content_item, interaction_type (VIEW/CLICK/LIKE/SAVE/UPVOTE/DOWNVOTE)[cite: 9]</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono text-ink">UserProfile</td>
                      <td className="p-4">user (1:1), onboarding_completed, explicit_preferences (M2M → Tag)[cite: 9]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            
          </div>
        </main>
      </div>
    </div>
  );
}
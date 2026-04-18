import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { LandingSection, FeatureCard, BentoItem } from "../components/LandingSection";

export default function Landing() {
  const [stats, setStats] = useState({ problems: 0, solutions: 0, contributors: 0 });

  useEffect(() => {
    api.get("/problems/stats").then(({ data }) => setStats(data)).catch(console.error);
  }, []);

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-brand-light text-brand-dark text-sm font-bold px-4 py-2 rounded-full mb-6 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-brand animate-ping" />
              Powered by Llama 3.3 & The Crowd
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              Forge Your Ideas <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">
                Into Solutions.
              </span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              IdeaForge connects complex challenges with global minds. Use AI to analyze, 
              innovators to solve, and humans to lead.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/register" className="btn-primary px-8 py-4 text-lg rounded-2xl shadow-xl shadow-brand/20 hover:scale-105 transition-transform w-full sm:w-auto text-center">
                Get Started Free
              </Link>
              <Link to="/" className="btn-secondary px-8 py-4 text-lg rounded-2xl w-full sm:w-auto text-center">
                Explore Feed
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-${i*100+100}`} />
                ))}
              </div>
              <p>Join <span className="text-gray-900 font-bold">{stats.contributors}+</span> innovators worldwide</p>
            </div>
          </div>
          
          <div className="flex-1 relative animate-fade-in group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand/20 to-accent/20 rounded-[40px] blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <img 
              src="/hero.png" 
              alt="IdeaForge Innovation" 
              className="relative rounded-[32px] shadow-2xl border border-gray-100 z-10 transform group-hover:rotate-1 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <LandingSection className="bg-gray-50 border-y border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { label: "Problems Posted", value: stats.problems, icon: "◈" },
            { label: "Solutions Generated", value: stats.solutions, icon: "◎" },
            { label: "Active Contributors", value: stats.contributors, icon: "⬡" }
          ].map((s, i) => (
            <div key={i} className="text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-3xl mb-2 text-brand">{s.icon}</div>
              <div className="text-4xl font-black text-gray-900 mb-1">{s.value.toLocaleString()}</div>
              <div className="text-sm font-semibold uppercase tracking-widest text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </LandingSection>

      {/* Features Bento */}
      <LandingSection 
        title="Innovation Powered by Intelligence" 
        subtitle="IdeaForge combines the creative reach of the crowd with the analytical precision of world-class AI."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">
          <BentoItem 
            className="md:col-span-2 md:row-span-1"
            title="AI-Powered Problem Diagnostics"
            description="Our Llama-3.3 engine instantly evaluates your problem statement for clarity, feasibility, and impact. No more vague challenges—just actionable innovation."
            icon="✦"
            color="accent"
          />
          <BentoItem 
            title="Smart Expert Matching"
            description="We find the best minds for your specific technical or social challenge."
            icon="⬡"
            color="brand"
          />
          <BentoItem 
            title="Gamified Rewards"
            description="Earn points, level up, and unlock exclusive badges as you solve global problems."
            icon="★"
            color="amber"
          />
          <BentoItem 
            className="md:col-span-2"
            title="Collaborative Idea Forging"
            description="Iterate and boost solutions through versioning and community feedback. Watch as initial concepts are forged into production-ready solutions."
            icon="⚒"
            color="pink"
          />
        </div>
      </LandingSection>

      {/* How it works */}
      <LandingSection 
        title="The Innovation Loop" 
        subtitle="Moving from friction to functionality in four clear steps."
        dark
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Post", desc: "Define your challenge with AI assistance." },
            { step: "02", title: "Collect", desc: "The crowd submits diverse solutions." },
            { step: "03", title: "Rank", desc: "AI identifies the most viable directions." },
            { step: "04", title: "Solve", desc: "Forge and implement the winning idea." }
          ].map((s, i) => (
            <div key={i} className="relative">
              <div className="text-6xl font-black text-white/5 absolute -top-8 -left-4">{s.step}</div>
              <h4 className="text-xl font-bold mb-3 relative z-10">{s.title}</h4>
              <p className="text-gray-400 text-sm">{s.desc}</p>
              {i < 3 && <div className="hidden md:block absolute top-1/4 -right-4 text-brand text-2xl">→</div>}
            </div>
          ))}
        </div>
      </LandingSection>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-brand rounded-[48px] p-12 lg:p-20 relative overflow-hidden shadow-2xl shadow-brand/40">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
          
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 relative z-10">
            Ready to solve the next <br /> big challenge?
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center relative z-10">
            <Link to="/register" className="h-16 px-10 bg-white text-brand font-bold rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
              Join the Forge
            </Link>
            <Link to="/" className="h-16 px-10 bg-brand-dark text-white font-bold rounded-2xl flex items-center justify-center hover:bg-opacity-80 transition-all border border-white/20">
              Browse Problems
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <span className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-xs">IF</span>
            IdeaForge
          </div>
          <p className="text-gray-400 text-sm">© 2026 IdeaForge Innovation Marketplace. Fully AI Integrated.</p>
          <div className="flex gap-6 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-brand">Twitter</a>
            <a href="#" className="hover:text-brand">Discord</a>
            <a href="#" className="hover:text-brand">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

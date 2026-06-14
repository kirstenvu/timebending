import React, { useState } from 'react';
import { Archetype } from '../types';
import { Share2, ArrowRight, CheckCircle2, RotateCcw, Play, FileText, TrendingUp, ShieldAlert, Lightbulb, MailCheck, Copy, Check } from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  archetype: Archetype;
  userName: string;
  onReset: () => void;
}

export const ResultCard: React.FC<Props> = ({ archetype, userName, onReset }) => {
  const [shareText, setShareText] = useState('Deel dit resultaat');
  const [isCopied, setIsCopied] = useState(false);

  // Helper: Visual success feedback
  const showSuccess = () => {
    setShareText('Link gekopieerd!');
    setIsCopied(true);
    setTimeout(() => {
        setShareText('Deel dit resultaat');
        setIsCopied(false);
    }, 3000);
  };

  // Helper: Legacy Copy Method (works in non-secure contexts/previews)
  const legacyCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure it's not visible but part of DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      showSuccess();
    } catch (err) {
      console.error('Legacy copy failed', err);
      window.prompt("Kopiëren lukte niet. Kopieer de link hieronder:", text);
    }
    
    document.body.removeChild(textArea);
  };

  const handleShare = async () => {
    const title = 'Mijn Timebending® resultaat';
    const text = `Ik ben de ${archetype.name}. Benieuwd welk Timebending® type jij bent? Doe de quiz op:`;
    const url = 'https://meavia.nu/quiz';

    // 1. Try Native Share (Mobile)
    if (navigator.share) {
        try {
            await navigator.share({ title, text, url });
            return;
        } catch (error) {
            console.log('User closed share dialog or error:', error);
            // If user cancels share on mobile, we stop here.
            // If it's a real error, we could fall through, but usually share() is distinct.
        }
        return;
    }

    // 2. Try Modern Clipboard API (Desktop - Secure Contexts)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(url);
            showSuccess();
            return;
        } catch (err) {
            console.warn('Clipboard API failed, trying legacy...', err);
        }
    }

    // 3. Fallback to Legacy Method (Development / Non-HTTPS)
    legacyCopy(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up pb-12">
      
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-brand-light mt-8">
        
        {/* 1. VIDEO SECTION (Top of Card) */}
        <div className="bg-brand-light/10 p-4 md:p-8 border-b border-brand-light">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-brand-light bg-brand-dark group">
                {/* Fallback/Poster if video doesn't load immediately */}
                <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/80 z-0">
                    <Loader2 className="w-10 h-10 text-brand-light animate-spin opacity-50" />
                </div>
                
                <video 
                    controls 
                    autoPlay 
                    className="relative z-10 w-full h-full object-cover"
                    poster={archetype.image} // Using icon as fallback poster
                >
                    <source src={archetype.videoUrl} type="video/mp4" />
                    Jouw browser ondersteunt geen video.
                </video>
            </div>
        </div>

        {/* 2. SUMMARY & INSIGHTS SECTION */}
        <div className="p-8 md:p-14 bg-white relative z-10">
          
          {/* Intro Text */}
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12 border-b border-brand-light pb-12 text-center md:text-left">
             <div className="flex-shrink-0 relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                 {/* Soft halo for the archetype in light theme */}
                 <div className="absolute inset-[-40%] bg-brand-light/50 rounded-full blur-[40px] opacity-60 pointer-events-none"></div>
                 <div className="absolute inset-[-10%] bg-white/40 rounded-full blur-[20px] opacity-100 pointer-events-none animate-pulse"></div>
                 
                 {/* Container that 'swallows' any remaining white background using multiply */}
                 <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-b from-white via-brand-light to-transparent p-4 flex items-center justify-center overflow-hidden shadow-inner">
                    <img 
                        src={archetype.image} 
                        alt={archetype.name} 
                        style={{ mixBlendMode: 'multiply' }}
                        className="w-full h-full object-contain"
                    />
                 </div>
             </div>
             <div>
                <h3 className="text-2xl font-serif text-brand-dark mb-4">Gefeliciteerd, {userName}!</h3>
                <div className="text-brand-dark/80 leading-relaxed text-lg space-y-4">
                    <p>
                        Wat goed dat je dit moment voor jezelf hebt gepakt. Inzicht in jouw eigen ritme is de basis voor rust en regie.
                        Uit jouw antwoorden komt duidelijk naar voren dat jouw natuurlijke tijd-DNA overeenkomt met de <strong className="text-brand-primary text-xl font-bold">{archetype.name}</strong>.
                    </p>
                    <div className="pt-4 mt-4 border-l-4 border-brand-gold bg-[#F8F5FA] py-6 rounded-r-xl text-center md:text-left md:pl-6">
                        <em className="text-brand-gold font-sans text-2xl block mb-3 italic leading-tight">"{archetype.title}"</em>
                        <p className="text-brand-dark/80 text-base leading-relaxed italic px-6 md:px-0">
                           {archetype.description}
                        </p>
                    </div>
                </div>
             </div>
          </div>

          {/* INSIGHT BLOCKS */}
          <div className="space-y-10 mb-20">
            
            {/* Characteristics Box */}
            <div className="bg-brand-light/5 rounded-2xl p-8 border border-brand-light shadow-sm">
              <h4 className="text-brand-primary font-bold uppercase text-xs tracking-widest mb-8 flex items-center justify-center md:justify-start">
                 <CheckCircle2 size={18} className="mr-2 text-brand-accent" /> Jouw Unieke Krachten
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {archetype.characteristics.map((char, idx) => (
                  <li key={idx} className="flex items-start text-brand-dark/80">
                    <span className="w-2 h-2 bg-brand-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Challenges Section */}
                <div className="bg-white rounded-2xl p-8 border border-red-50 shadow-sm flex flex-col items-center text-center md:items-start md:text-left gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                        <ShieldAlert className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h4 className="text-brand-dark font-serif text-xl mb-2">Grootste Valkuil</h4>
                        <p className="text-brand-dark/70 leading-relaxed text-sm">{archetype.fullReport.challenges}</p>
                    </div>
                </div>

                {/* Growth Path Section */}
                <div className="bg-white rounded-2xl p-8 border border-brand-gold/10 shadow-sm flex flex-col items-center text-center md:items-start md:text-left gap-4">
                    <div className="w-12 h-12 bg-brand-gold/5 rounded-xl flex items-center justify-center border border-brand-gold/10">
                        <TrendingUp className="text-brand-gold" size={24} />
                    </div>
                    <div>
                        <h4 className="text-brand-dark font-serif text-xl mb-2">Jouw Groeipad</h4>
                        <p className="text-brand-dark/70 leading-relaxed text-sm">{archetype.fullReport.growthPath}</p>
                    </div>
                </div>
            </div>

             {/* Strategy Section */}
             <div className="bg-brand-primary/5 rounded-2xl p-8 md:p-10 border border-brand-primary/10 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center border border-brand-primary/20">
                        <Lightbulb className="text-brand-primary" size={32} />
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="text-brand-dark font-serif text-2xl mb-2">De Timebending Strategie</h4>
                    <p className="text-brand-primary font-medium leading-relaxed italic text-lg opacity-80 font-serif">
                        "{archetype.fullReport.strategy}"
                    </p>
                </div>
            </div>

          </div>

          {/* EMAIL SUCCESS BANNER */}
          <div className="mb-20 bg-brand-accent/5 border border-brand-accent/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left animate-fade-in-up">
             <div className="p-4 bg-white rounded-full text-brand-accent shadow-sm flex-shrink-0">
                <MailCheck size={32} />
             </div>
             <div>
                <p className="text-brand-dark font-serif text-2xl mb-1">Onderweg naar je inbox</p>
                <p className="text-brand-dark/60 text-lg">
                    Het uitgebreide PDF-rapport met jouw diepgaande analyse is onderweg naar je inbox.
                </p>
             </div>
          </div>

          {/* MAIN CTA OFFER */}
          <div className="flex items-center gap-4 mb-12">
             <div className="flex-grow h-px bg-brand-light/60"></div>
             <span className="text-brand-accent font-black uppercase text-sm sm:text-base tracking-[0.2em] whitespace-nowrap">
                Jouw Volgende Stap
             </span>
             <div className="flex-grow h-px bg-brand-light/60"></div>
          </div>

          <div className="bg-[#2D1B4E] rounded-3xl px-5 py-12 md:p-14 text-center relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-30"></div>
             
             <h4 className="text-3xl md:text-4xl font-serif text-white mb-8 relative z-10 leading-tight">Meesterschap over jouw tijd?</h4>
             
             <p className="text-brand-light mb-10 max-w-2xl mx-auto relative z-10 text-base md:text-xl italic font-sans leading-relaxed whitespace-pre-line">
                "{archetype.advice}"
             </p>
             
             <p className="text-brand-light/90 mb-10 max-w-xl mx-auto relative z-10 text-base md:text-lg font-sans">
                In mijn programma <strong>Timebending®LIV</strong> ontdek je exact hoe je jouw unieke ritme optimaal inzet.
             </p>
              
             <a 
                href={archetype.ctaLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto justify-center items-center bg-brand-accent hover:bg-emerald-400 text-brand-dark font-bold text-sm sm:text-lg md:text-xl py-4 md:py-5 px-4 md:px-12 rounded-full shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/40 transition-all transform hover:-translate-y-1 relative z-10"
              >
                <span className="text-center">Bekijk Timebending®LIV</span> <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6 shrink-0" />
              </a>
          </div>

        </div>

        {/* Footer of Card */}
        <div className="bg-brand-light/10 p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-brand-light">
           <button 
             onClick={handleShare}
             className="flex items-center text-brand-primary font-bold uppercase tracking-widest text-sm px-10 py-4 rounded-full bg-white border border-brand-light hover:bg-brand-light/50 transition-all shadow-sm"
           >
             {isCopied ? <Check size={20} className="mr-2 text-brand-accent font-bold" /> : <Share2 size={20} className="mr-2" />}
             {shareText}
           </button>
        </div>
      </div>
      
      <div className="mt-12 text-center">
         <button 
            onClick={onReset}
            className="inline-flex items-center text-brand-primary/40 hover:text-brand-primary text-xs uppercase tracking-widest transition-colors font-bold group"
         >
            <RotateCcw size={14} className="mr-2 group-hover:-rotate-180 transition-transform duration-500" />
            Start de quiz opnieuw
         </button>
      </div>

    </div>
  );
};

function Loader2({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
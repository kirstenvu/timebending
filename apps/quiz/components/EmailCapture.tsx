import React, { useState } from 'react';
import { ArrowRight, Loader2, RotateCcw, Lock } from 'lucide-react';
import { Archetype } from '../types';

interface Props {
  onSubmit: (name: string, email: string) => void;
  archetype: Archetype;
  onReset: () => void;
}

export const EmailCapture: React.FC<Props> = ({ onSubmit, archetype, onReset }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Vul alsjeblieft beide velden in.');
      return;
    }
    if (!email.includes('@')) {
      setError('Vul een geldig e-mailadres in.');
      return;
    }
    if (!agreed) {
        setError('Vink het vakje aan om toestemming te geven voor het ontvangen van je uitkomst.');
        return;
    }
    
    setError('');
    setIsSubmitting(true);

    // Simulate API call / Funnel hook
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(name, email);
    }, 1000);
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-2xl max-w-2xl mx-auto text-center animate-fade-in-up relative overflow-visible z-20 shadow-xl border border-brand-light">
      
      {/* 1. HEADLINE SECTION */}
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-serif mb-3 text-brand-dark leading-tight">
          Inzicht is het begin van regie
        </h2>
        <p className="text-brand-dark/70 text-lg max-w-md mx-auto leading-relaxed">
            Je Timebending® type is vastgesteld.
        </p>
      </div>

      {/* 2. VISUAL "LOCKED RESULT" CARD (The Reveal) */}
      <div className="mb-8 relative max-w-sm mx-auto z-10">
         <div className="absolute inset-0 bg-brand-primary/5 rounded-xl blur-xl transform scale-110 pointer-events-none"></div>
         
         <div className="relative bg-white border border-brand-light rounded-2xl overflow-hidden shadow-lg">
            
            {/* Header: VISIBLE (Name & Title & Icon) */}
            <div className="p-8 pb-6 bg-brand-light/20 relative z-10">
                <span className="text-brand-primary text-xs font-bold tracking-widest uppercase mb-3 block opacity-60">
                    Jouw Timebending® type is
                </span>
                
                <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                    {/* Soft halo for the archetype */}
                    <div className="absolute inset-0 bg-white rounded-full shadow-[0_0_40px_rgba(243,232,255,1)]"></div>
                    
                    <img 
                        src={archetype.image} 
                        alt={archetype.name} 
                        style={{ mixBlendMode: 'multiply' }}
                        className="relative z-10 w-full h-full object-contain"
                    />
                </div>

                <h3 className="text-2xl md:text-3xl font-serif text-brand-dark mb-1">
                    {archetype.name}
                </h3>
            </div>

            {/* Body: LOCKED (Description) */}
            <div className="relative p-6 px-8 pt-4 min-h-[120px] bg-white">
                
                {/* The Blur overlay with Lock - Covering only the body */}
                <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-white/40 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center shadow-lg mb-3 animate-bounce shadow-brand-gold/20">
                      <Lock className="text-brand-dark w-5 h-5" />
                    </div>
                </div>

                {/* Blurred Background Content (Simulating text) */}
                <div className="opacity-20 select-none pointer-events-none filter blur-[2px] text-left space-y-3">
                    <div className="h-3 bg-brand-dark/20 rounded w-full"></div>
                    <div className="h-3 bg-brand-dark/20 rounded w-11/12"></div>
                    <div className="h-3 bg-brand-dark/20 rounded w-10/12"></div>
                </div>
            </div>
         </div>
      </div>

      {/* 3. CTA TEXT */}
      <p className="text-brand-dark/80 text-base max-w-md mx-auto mb-8 leading-relaxed">
          Laat je gegevens achter en bekijk direct de <strong>persoonlijke video</strong> en download je <strong>volledige rapport</strong>.
      </p>

      {/* 4. FORM */}
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto relative z-30">
        <div className="space-y-3">
            <input
                type="text"
                placeholder="Jouw voornaam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-brand-light text-brand-dark placeholder-brand-dark/40 rounded-xl px-4 py-4 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
            />
            <input
                type="email"
                placeholder="Jouw e-mailadres"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-brand-light text-brand-dark placeholder-brand-dark/40 rounded-xl px-4 py-4 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
            />
        </div>

        {/* Custom Styled Checkbox for GDPR */}
        <div className="flex flex-col items-start gap-1">
            <label className="flex items-start gap-3 text-left p-1 group cursor-pointer hover:bg-brand-light/20 rounded-lg transition-colors w-full">
                <div className="relative flex items-center mt-0.5">
                    <input
                        type="checkbox"
                        id="consent"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="peer h-6 w-6 min-w-[1.5rem] cursor-pointer appearance-none rounded border-2 border-brand-light bg-white transition-all checked:border-brand-primary checked:bg-brand-primary hover:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-white"
                    />
                    {/* SVG Checkmark */}
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 font-bold" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
                <div className="text-xs md:text-sm text-brand-dark/70 leading-snug pt-0.5 select-none group-hover:text-brand-dark transition-colors">
                    Ik geef toestemming om mij te mailen over mijn uitkomst.
                </div>
            </label>
            
            <a 
                href="https://www.meavia.nu/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-10 text-xs text-brand-dark/40 underline hover:text-brand-primary transition-colors font-medium"
            >
                Bekijk hoe wij met je data omgaan.
            </a>
        </div>
        
        {error && <p className="text-red-600 text-sm text-left animate-fade-in-up bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-5 rounded-xl shadow-lg shadow-brand-primary/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center group text-lg"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin text-white" />
          ) : (
            <>
              Stuur mij het volledige rapport <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-12">
        <button 
            onClick={onReset}
            className="inline-flex items-center text-brand-primary/40 hover:text-brand-primary text-xs uppercase tracking-widest transition-colors font-bold group"
        >
            <RotateCcw size={12} className="mr-2 group-hover:-rotate-180 transition-transform duration-500" />
            Terug naar start
        </button>
      </div>
    </div>
  );
};
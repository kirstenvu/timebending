
import React, { useState, useMemo, useEffect } from 'react';
import { Logo } from './components/Logo';
import { ProgressBar } from './components/ProgressBar';
import { EmailCapture } from './components/EmailCapture';
import { ResultCard } from './components/ResultCard';
import { QUESTIONS, ARCHETYPES } from './constants';
import { QuizState } from './types';
import { ChevronRight, Clock, Sparkles, Loader2, ListFilter, ArrowRight } from 'lucide-react';

// --- ANALYTICS HELPER ---
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

// --- CONFIGURATIE ---
// Plak hier je Zapier of Make Webhook URL
const WEBHOOK_URL = ''; 

const INITIAL_STATE: QuizState = {
  currentStep: 'intro',
  currentQuestionIndex: 0,
  answers: {},
  scores: {},
  userEmail: '',
  userName: '',
};

function App() {
  const [state, setState] = useState<QuizState>(INITIAL_STATE);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-start if ?start=true is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('start') === 'true') {
      setState(prev => ({ ...prev, currentStep: 'quiz' }));
    }
  }, []);

  const handleStart = () => {
    trackEvent('quiz_start');
    setState(prev => ({ ...prev, currentStep: 'quiz' }));
  };

  const handleDevSkip = (archetypeId: string) => {
      setState(prev => ({
          ...prev,
          currentStep: 'result',
          userName: 'Tester',
          scores: { [archetypeId]: 100 }
      }));
  };

  const handleAnswer = (optionId: string, points: Record<string, number>) => {
    if (isTransitioning) return;
    
    setSelectedOption(optionId);
    setIsTransitioning(true);

    setTimeout(() => {
        const newScores = { ...state.scores };
        Object.entries(points).forEach(([archetypeId, value]) => {
          newScores[archetypeId] = (newScores[archetypeId] || 0) + value;
        });

        const newAnswers = { ...state.answers, [state.currentQuestionIndex]: optionId };

        if (state.currentQuestionIndex < QUESTIONS.length - 1) {
          trackEvent('quiz_proceed', {
            step: state.currentQuestionIndex + 1,
            total_steps: QUESTIONS.length,
            question_id: currentQuestion.id
          });
          setState(prev => ({ ...prev, scores: newScores, answers: newAnswers, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
          setSelectedOption(null);
          setIsTransitioning(false);
        } else {
          trackEvent('quiz_all_questions_answered');
          setState(prev => ({ ...prev, scores: newScores, answers: newAnswers, currentStep: 'analyzing' }));
          setSelectedOption(null);
          setIsTransitioning(false);
        }
    }, 700);
  };

  const winningArchetype = useMemo(() => {
    let maxScore = -1;
    let winnerId = Object.keys(ARCHETYPES)[0];

    Object.entries(state.scores).forEach(([id, score]) => {
      const numericScore = score as number;
      if (numericScore > maxScore) {
        maxScore = numericScore;
        winnerId = id;
      }
    });

    return ARCHETYPES[winnerId];
  }, [state.scores]);

  useEffect(() => {
    if (state.currentStep === 'analyzing') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const timer = setTimeout(() => {
            setState(prev => ({ ...prev, currentStep: 'email' }));
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [state.currentStep]);

  const handleEmailSubmit = async (name: string, email: string) => {
    // 1. Bereid de data voor
    const payload = {
      name: name,
      email: email,
      archetype_id: winningArchetype.id,
      archetype_name: winningArchetype.name,
      datum: new Date().toISOString(),
      bron: 'Timebending Quiz Website'
    };

    // 2. Verstuur naar de eigen backend (MailerLite integratie)
    try {
      const mlResponse = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!mlResponse.ok) {
        console.warn("MailerLite koppeling mislukt, data mogelijk niet opgeslagen.");
      }
    } catch (err) {
      console.error("Fout bij het versturen naar de backend:", err);
    }

    // 3. Verstuur naar Webhook (Zapier/Maker) als Fallback
    if (WEBHOOK_URL) {
      try {
        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             voornaam: name,
             email: email,
             archetype: winningArchetype.name,
             archetype_id: winningArchetype.id,
             datum: new Date().toISOString(),
             bron: 'Timebending Quiz Website'
          })
        });
      } catch (err) {
        console.error("Fout bij het versturen naar de webhook:", err);
      }
    }

    // 4. Toon resultaat aan de gebruiker
    trackEvent('quiz_lead', {
      archetype: winningArchetype.name
    });
    setState(prev => ({
      ...prev,
      userName: name,
      userEmail: email,
      currentStep: 'result'
    }));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setState(INITIAL_STATE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentQuestion = QUESTIONS[state.currentQuestionIndex];

  return (
    <div className="min-h-screen w-full bg-[#F8F5FA] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFFFFF] via-[#F8F5FA] to-[#F3E8FF] text-brand-dark font-sans selection:bg-brand-accent selection:text-brand-dark overflow-x-hidden">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8 min-h-screen flex flex-col">
        
        {state.currentStep === 'intro' && (
           <header className="mb-8 flex justify-center">
             <Logo />
           </header>
        )}

        <main className="flex-grow flex flex-col justify-center">
          
          {state.currentStep === 'intro' && (
            <div className="glass-panel max-w-3xl mx-auto rounded-3xl p-8 md:p-16 text-center animate-fade-in-up border border-white/5 shadow-2xl">
              <span className="inline-block py-1 px-4 rounded-full bg-brand-primary/30 text-brand-accent text-sm font-bold tracking-widest uppercase mb-6 border border-brand-accent/20">
                Ontdek jouw kracht
              </span>
              <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-tight">
                De Timebending® Quiz
              </h1>
              <p className="text-2xl md:text-3xl font-serif text-brand-gold italic mb-8 leading-snug">
                Leef jij volgens je tijd....of volgens je bestemming?
              </p>
              <p className="text-lg text-brand-light/90 mb-10 leading-relaxed max-w-2xl mx-auto">
                Ontdek welk <strong>Timebending® type</strong> jij bent. Zie welke sleutels je van nature beheerst én welke nieuwe sleutels jou helpen om een leven te creëren op jouw voorwaarden.
              </p>
              
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-12 text-sm text-brand-light/70 font-medium">
                <div className="flex items-center"><Clock size={18} className="mr-2 text-brand-accent" /> 2 minuten</div>
                <div className="flex items-center"><Sparkles size={18} className="mr-2 text-brand-accent" /> Concrete inzichten</div>
                <div className="flex items-center"><ChevronRight size={18} className="mr-2 text-brand-accent" /> Direct resultaat</div>
              </div>

              <div className="flex flex-col items-center">
                <button 
                    onClick={handleStart}
                    className="group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold text-white transition-all duration-200 bg-brand-primary font-sans rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent hover:bg-brand-primary/90 hover:scale-105 shadow-lg shadow-brand-primary/30"
                >
                    Start de Quiz
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-12 pt-8 border-t border-white/10 w-full max-w-md">
                   <p className="text-xs text-brand-light/30 uppercase tracking-widest mb-4 font-bold text-center">[Developer Menu] Test de flows:</p>
                   <div className="space-y-6">
                       <div>
                           <p className="text-[10px] text-brand-light/40 uppercase mb-2 text-center">Sla over naar Uitslag:</p>
                           <div className="grid grid-cols-2 gap-3">
                               {Object.values(ARCHETYPES).map((arch) => (
                                   <button
                                   key={arch.id}
                                   onClick={() => handleDevSkip(arch.id)}
                                   className="px-3 py-2 text-xs font-semibold text-brand-light/50 bg-brand-dark/30 hover:bg-brand-dark/60 hover:text-brand-accent rounded border border-white/5 transition-colors uppercase tracking-wide"
                                   >
                                   {arch.name}
                                   </button>
                               ))}
                           </div>
                       </div>
                       <div>
                           <p className="text-[10px] text-brand-light/40 uppercase mb-2 text-center">Sla over naar Opt-in (Email):</p>
                           <div className="grid grid-cols-2 gap-3">
                               {Object.values(ARCHETYPES).map((arch) => (
                                   <button
                                       key={`optin-${arch.id}`}
                                       onClick={() => {
                                           setState(prev => ({
                                               ...prev,
                                               currentStep: 'email',
                                               scores: { [arch.id]: 100 }
                                           }));
                                       }}
                                       className="px-3 py-2 text-[10px] font-semibold text-brand-accent/50 bg-brand-primary/10 hover:bg-brand-primary/20 hover:text-brand-accent rounded border border-brand-accent/10 transition-colors uppercase"
                                   >
                                       Toon {arch.name} Opt-in
                                   </button>
                               ))}
                           </div>
                       </div>
                   </div>
                </div>

              </div>
            </div>
          )}

          {state.currentStep === 'quiz' && (
            <div className="max-w-2xl mx-auto w-full">
              <ProgressBar current={state.currentQuestionIndex} total={QUESTIONS.length} />
              
              <div key={state.currentQuestionIndex} className="glass-panel rounded-2xl p-6 md:p-12 mt-4 md:mt-6 animate-fade-in-right">
                
                <h2 className="text-2xl md:text-3xl font-serif text-white mb-4 leading-snug">
                  {currentQuestion.text}
                </h2>

                <div className="flex items-center mb-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-xs text-brand-light/70 font-semibold tracking-wide uppercase">
                        <ListFilter size={12} className="mr-2 text-brand-accent" />
                        Kies uit {currentQuestion.options.length} antwoorden
                    </div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedOption === option.id;
                    return (
                        <button
                          key={option.id}
                          onClick={() => handleAnswer(option.id, option.points)}
                          disabled={isTransitioning}
                          className={`w-full text-left p-4 md:p-5 rounded-xl border transition-all duration-300 group flex items-center justify-between relative overflow-hidden
                            ${isSelected 
                                ? 'bg-brand-gold/10 border-brand-gold shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-[1.02]' 
                                : 'bg-brand-dark/50 border-brand-primary/30 hover:border-brand-accent/50 hover:bg-brand-primary/20'
                            }
                          `}
                        >
                          <div className="flex items-center">
                              <span className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm mr-4 transition-colors duration-300
                                ${isSelected
                                    ? 'border-brand-gold text-brand-gold bg-brand-gold/10'
                                    : 'border-brand-light/30 group-hover:border-brand-accent group-hover:text-brand-accent'
                                }
                              `}>
                                {option.id}
                              </span>
                              <span className={`text-base md:text-lg transition-colors duration-300 ${isSelected ? 'text-white font-medium' : 'text-brand-light group-hover:text-white'}`}>
                                {option.text}
                              </span>
                          </div>
                          
                          {isSelected && isTransitioning && (
                             <Loader2 className="w-5 h-5 text-brand-gold animate-spin ml-2" />
                          )}
                        </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

           {state.currentStep === 'analyzing' && (
            <div className="max-w-xl mx-auto text-center animate-fade-in-up pt-12">
                <div className="relative w-full max-w-sm aspect-video mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 bg-white">
                    <video 
                        src="/assets/logo-animation.mp4" 
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                </div>
                
                <h2 className="text-3xl font-serif text-brand-dark mb-4">Jouw Timebending type wordt berekend...</h2>
                <div className="text-brand-dark/70 text-lg space-y-2">
                    <p className="animate-pulse">Antwoorden verwerken...</p>
                    <p className="animate-pulse delay-[1000ms]">Jouw unieke kracht identificeren...</p>
                    <p className="animate-pulse delay-[2000ms] text-brand-primary font-bold">Nog een moment... je type is bijna bekend</p>
                </div>
            </div>
          )}

          {state.currentStep === 'email' && (
            <EmailCapture 
              onSubmit={handleEmailSubmit} 
              archetype={winningArchetype}
              onReset={handleReset}
            />
          )}

          {state.currentStep === 'result' && (
            <ResultCard 
              archetype={winningArchetype} 
              userName={state.userName}
              onReset={handleReset}
            />
          )}

        </main>
        
        <footer className="mt-12 text-center text-brand-dark/50 text-sm pb-4">
          <p>&copy; {new Date().getFullYear()} Meavia - Timebending®</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

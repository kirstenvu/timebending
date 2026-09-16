import React, { useState } from "react";
import { Shield, ArrowRight, Loader2 } from "lucide-react";

const STORAGE_KEY = "begrotingsapp_optin_v1";

interface StoredOptIn {
  name: string;
  email: string;
  completedAt: string;
}

export function getStoredOptIn(): StoredOptIn | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredOptIn;
  } catch {
    return null;
  }
}

function storeOptIn(data: StoredOptIn) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage kan onbeschikbaar zijn (privémodus / opslag vol) — dan
    // vragen we bij een volgend bezoek gewoon opnieuw, geen harde blokkade.
  }
}

interface OptInGateProps {
  onComplete: () => void;
}

export default function OptInGate({ onComplete }: OptInGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = name.trim().length > 1 && emailLooksValid && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);

    const payload = { name: name.trim(), email: email.trim() };

    try {
      // We proberen de aanmelding door te sturen naar de mailinglijst, maar een
      // haperende koppeling mag een deelnemer nooit buiten de sluiten voor de
      // begrotingstool zelf — dus we laten ze sowieso door na de poging.
      await fetch("/api/begroting-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);
    } finally {
      storeOptIn({ ...payload, completedAt: new Date().toISOString() });
      setIsSubmitting(false);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}meavia-logo.png`}
            alt="Meavia"
            className="h-16 w-auto object-contain opacity-90"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-6">
            <h1 className="text-xl font-bold font-display tracking-tight">
              Slimme Begrotingsplanner
            </h1>
            <p className="text-emerald-200/80 text-sm mt-1 leading-relaxed">
              Gratis tool van Meavia om moeiteloos je bankafschriften te categoriseren en een jaarbegroting te maken.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="optin-name">
                Naam
              </label>
              <input
                id="optin-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je voornaam"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                autoComplete="given-name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="optin-email">
                E-mailadres
              </label>
              <input
                id="optin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jij@bedrijf.nl"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Start de Begrotingsplanner</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Je naam en e-mailadres gebruiken we om je op de hoogte te houden vanuit Meavia. Dit is volledig los van je bankgegevens hieronder: die verlaten nooit je computer.
            </p>
          </form>

          <div className="bg-emerald-50/60 border-t border-emerald-100 p-4 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-800/90 leading-relaxed">
              <span className="font-bold">Je bankafschriften verlaten nooit je computer.</span> Alle verwerking gebeurt lokaal in je eigen browser, wij zien of bewaren dat nergens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

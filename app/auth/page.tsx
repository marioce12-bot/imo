"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Mode = "signup" | "login";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    if (requestedMode === "login" || requestedMode === "signup") setMode(requestedMode);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const result = mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;
      if (mode === "signup") {
        setMessage("Votre compte est créé. Vérifiez votre e-mail pour confirmer votre adresse.");
      } else {
        window.location.assign("/explorer");
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page"><div className="auth-backdrop" /><header className="auth-header wrap"><Link href="/explorer"><Image src="/icimo-logo.png" alt="ICIMO" width={112} height={41} priority /></Link><Link className="auth-back-link" href="/explorer">Retour à l'exploration</Link></header><section className="auth-layout wrap"><div className="auth-intro"><p className="eyebrow">Votre espace ICIMO</p><h1>Les bonnes adresses commencent par une conversation.</h1><p>Créez votre compte pour contacter un propriétaire, réserver un logement et retrouver vos favoris au même endroit.</p><div className="auth-perks"><span>✓ Explorer sans engagement</span><span>✓ Réserver en toute sécurité</span><span>✓ Un seul compte, même comme propriétaire</span></div></div><div className="auth-card"><div className="auth-tabs"><button className={mode === "signup" ? "active" : ""} type="button" onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Créer un compte</button><button className={mode === "login" ? "active" : ""} type="button" onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Se connecter</button></div><h2>{mode === "signup" ? "Bienvenue chez vous." : "Ravi de vous revoir."}</h2><p className="auth-card-lead">{mode === "signup" ? "Quelques secondes pour commencer." : "Retrouvez vos recherches et vos réservations."}</p><form onSubmit={submit}>{mode === "signup" && <label>Nom complet<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Amina Sossou" required /></label>}<label>Adresse e-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.com" required /></label><label>Mot de passe<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" minLength={8} required /></label>{mode === "login" && <button className="forgot-button" type="button">Mot de passe oublié ?</button>}{error && <p className="auth-error" role="alert">{error}</p>}{message && <p className="auth-success" role="status">{message}</p>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? "Veuillez patienter..." : mode === "signup" ? "Créer mon compte" : "Me connecter"}<span>↗</span></button></form><p className="auth-legal">En continuant, vous acceptez les conditions d'utilisation d'ICIMO.</p></div></section></main>
  );
}

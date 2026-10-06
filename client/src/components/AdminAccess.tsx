import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import { useDemo } from "@/components/DemoStore";

type AccessState = "checking" | "locked" | "authenticated" | "unavailable";

export default function AdminAccess({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessState>("checking");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { notify } = useDemo();

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/session", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!mounted) return;
        if (response.status === 503 || result.configured === false) setState("unavailable");
        else setState(response.ok && result.authenticated ? "authenticated" : "locked");
      })
      .catch(() => {
        if (mounted) setState("unavailable");
      });
    return () => { mounted = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 503) setState("unavailable");
        setError(result.error ?? "Connexion impossible. Réessayez.");
        return;
      }
      setPassword("");
      setState("authenticated");
      notify("Accès à l’administration autorisé pour cette session.");
    } catch {
      setError("Le service de vérification est indisponible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "authenticated") return <>{children}</>;

  return (
    <section className="admin-access content-section" aria-labelledby="admin-access-title">
      <div className="admin-access-card">
        <span className="eyebrow"><LockKeyhole size={14} /> ICIMO OPS · ACCÈS PROTÉGÉ</span>
        <h1 id="admin-access-title">Administration</h1>
        <p>Entrez le mot de passe d’administration pour continuer.</p>
        {state === "checking" && <p className="admin-access-status" role="status">Vérification de la session…</p>}
        {state === "unavailable" && <p className="admin-access-error" role="alert">Le contrôle serveur n’est pas disponible. Vérifiez le déploiement Vercel et sa variable de mot de passe.</p>}
        <form className="stack-form" onSubmit={submit}>
          <label>Mot de passe
            <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe d’administration" />
          </label>
          {error && <p className="admin-access-error" role="alert">{error}</p>}
          <button className="button button-primary button-block" type="submit" disabled={busy || state === "checking" || state === "unavailable"}>
            {busy ? "Vérification…" : "Accéder à l’administration"} <ArrowRight size={16} />
          </button>
        </form>
        <Link href="/" className="admin-access-back">Retour au site ICIMO</Link>
      </div>
    </section>
  );
}

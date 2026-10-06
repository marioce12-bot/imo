import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Building2, CalendarDays, Heart, Home, LayoutDashboard, MessageCircle, UserRound, Wallet } from "lucide-react";
import { useDemo } from "@/components/DemoStore";
import { supabase, useSupabaseAuth } from "@/lib/supabase";

type Destination = { label: string; href: string; icon: typeof Home };

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 44 44" role="img" aria-label="ICIMO">
      <path d="M7 21 22 8l15 13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19v17h20V19M19 36V25h7v11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 8v7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function activeFor(location: string, href: string) {
  const currentPath = location.split("?")[0];
  if (href.includes("?")) return `${window.location.pathname}${window.location.search}` === href;
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function BrandShell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { mode, setMode, favorites, toast, profile, notify } = useDemo();
  const { user } = useSupabaseAuth();
  const displayName = user ? String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? profile.firstName) : `${profile.firstName} ${profile.lastName.charAt(0)}.`;
  const initials = user ? displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() : `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
  const admin = location.startsWith("/admin");
  const destinations: Destination[] = admin
    ? [
        { label: "Tableau", href: "/admin", icon: LayoutDashboard },
        { label: "Annonces", href: "/admin?section=annonces", icon: Building2 },
        { label: "Finances", href: "/admin?section=finances", icon: Wallet },
        { label: "Signalements", href: "/admin?section=signalements", icon: MessageCircle },
      ]
    : mode === "owner"
      ? [
          { label: "Accueil", href: "/hote", icon: Home },
          { label: "Logements", href: "/hote/logements", icon: Building2 },
          { label: "Calendrier", href: "/hote/calendrier", icon: CalendarDays },
          { label: "Revenus", href: "/hote/revenus", icon: Wallet },
          { label: "Profil", href: "/profil", icon: UserRound },
        ]
      : [
          { label: "Découvrir", href: "/", icon: Home },
          { label: "Favoris", href: "/favoris", icon: Heart },
          { label: "Séjours", href: "/mes-reservations", icon: CalendarDays },
          { label: "Messages", href: "/messages", icon: MessageCircle },
          { label: "Profil", href: "/profil", icon: UserRound },
        ];

  const changeMode = () => {
    const next = mode === "client" ? "owner" : "client";
    setMode(next);
    setLocation(next === "owner" ? "/hote" : "/");
  };

  async function handleSignOut() {
    if (supabase && user) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        notify(error.message);
        return;
      }
      notify("Session Supabase fermée.");
    }
    setMode("client");
    setLocation("/auth/connexion");
  }

  return (
    <div className={`app-frame ${admin ? "admin-frame" : ""}`}>
      <div className="demo-strip"><span className="demo-dot" /> Démonstration interactive <span className="demo-strip-note">· annonces et paiements fictifs</span></div>
      <header className="topbar">
        <Link href="/" className="brand-lockup" aria-label="ICIMO, accueil">
          <Mark />
          <span>ICIMO<small>VOTRE LIEU, VOTRE RYTHME</small></span>
        </Link>
        {!admin && mode === "client" && (
          <nav className="desktop-links" aria-label="Navigation principale">
            <Link href="/recherche">Trouver un logement</Link>
            <Link href="/mes-reservations">Mes séjours</Link>
            <Link href="/messages">Messages</Link>
          </nav>
        )}
        {!admin && mode === "owner" && (
          <nav className="desktop-links" aria-label="Navigation propriétaire">
            <Link href="/hote">Vue d’ensemble</Link>
            <Link href="/hote/logements">Mes logements</Link>
            <Link href="/hote/calendrier">Calendrier</Link>
            <Link href="/hote/revenus">Revenus</Link>
          </nav>
        )}
        <div className="topbar-actions">
          {!admin && <button className="mode-switch" onClick={changeMode}>{mode === "client" ? "Devenir hôte" : "Mode voyageur"}</button>}
          <details className="account-menu">
            <summary><span className="avatar avatar-small">{profile.avatar ? <img src={profile.avatar} alt="" /> : initials}</span><span className="account-name">{displayName}</span></summary>
            <div className="account-popover">
              <Link href="/profil">Mon profil</Link>
              <Link href="/notifications">Notifications</Link>
              <Link href="/parametres">Paramètres</Link>
              <Link href="/admin">Console de démonstration</Link>
              <button onClick={() => void handleSignOut()}>{user ? "Se déconnecter" : "Connexion"}</button>
            </div>
          </details>
        </div>
      </header>
      {admin && <div className="admin-mode-banner"><strong>ICIMO Ops</strong><span>Console d’administration · données fictives</span><button onClick={() => setLocation("/")}>Retour au site</button></div>}
      <main className="main-content">{children}</main>
      {!admin && (
        <footer className="site-footer">
          <div className="footer-brand"><Mark /><span>ICIMO</span><p>Le logement qui vous rapproche du Bénin, pour une nuit ou pour la durée.</p></div>
          <div className="footer-links"><span>Explorer</span><Link href="/recherche">Locations au Bénin</Link><Link href="/recherche?type=long">Longue durée</Link><Link href="/favoris">Mes favoris ({favorites.length})</Link></div>
          <div className="footer-links"><span>Votre compte</span><Link href="/profil">Profil</Link><Link href="/hote">Espace propriétaire</Link><Link href="/admin">Console de démonstration</Link></div>
          <div className="footer-bottom">© 2026 ICIMO · Une marque ICE HOLDING <span>Les annonces et transactions affichées sont des exemples.</span></div>
        </footer>
      )}
      <nav className="mobile-nav" aria-label="Navigation téléphone">
        {destinations.slice(0, 5).map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} className={`mobile-nav-item ${activeFor(location, href) ? "is-active" : ""}`}>
            <span className="mobile-nav-icon"><Icon size={20} strokeWidth={activeFor(location, href) ? 2.15 : 1.7} />{label === "Favoris" && favorites.length > 0 && <i className="nav-count">{favorites.length}</i>}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      {toast && <div className="toast-message" role="status"><span className="toast-check">✓</span>{toast}</div>}
    </div>
  );
}

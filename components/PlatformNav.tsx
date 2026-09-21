"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const mainLinks = [
  ["Explorer", "/explorer", "home"],
  ["Mes favoris", "/dashboard/favorites", "heart"],
  ["Réservations", "/dashboard/bookings", "calendar"],
  ["Messages", "/dashboard/messages", "message"],
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, string> = { home: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z", heart: "m12 20-1.5-1.35C5.2 13.8 2 10.9 2 7.35A4.35 4.35 0 0 1 6.35 3 4.8 4.8 0 0 1 12 6.05 4.8 4.8 0 0 1 17.65 3 4.35 4.35 0 0 1 22 7.35c0 3.55-3.2 6.45-8.5 11.3Z", calendar: "M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm-2 5h18M8 2v4m8-4v4", message: "M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 3v-5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4", user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8" };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.user} /></svg>;
}

export default function PlatformNav() {
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!hasSupabaseConfig) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ? { email: data.session.user.email, name: data.session.user.user_metadata?.full_name } : null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ? { email: session.user.email, name: session.user.user_metadata?.full_name } : null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await createSupabaseBrowserClient().auth.signOut();
    }
    window.location.assign("/explorer");
  }

  return <>
    <header className="platform-mobile-header">
      <Link href="/explorer" aria-label="ICIMO accueil"><Image src="/icimo-logo.png" alt="ICIMO" width={100} height={37} priority /></Link>
      <Link className="mobile-header-profile" href={user ? "/dashboard/profile" : "/auth?mode=login"}>{user ? (user.name || user.email || "U").slice(0, 1).toUpperCase() : "Se connecter"}</Link>
    </header>
    <aside className="platform-sidebar">
      <Link className="platform-brand" href="/explorer"><Image src="/icimo-logo.png" alt="ICIMO" width={112} height={41} priority /></Link>
      <p className="platform-nav-label">Découvrir</p>
      <nav aria-label="Navigation principale">{mainLinks.map(([label, href, icon]) => <Link className={href === "/explorer" ? "is-active" : ""} href={href} key={href}><span><NavIcon name={icon} /></span>{label}</Link>)}</nav>
      <p className="platform-nav-label platform-nav-spacer">Mon activité</p>
      <nav aria-label="Compte"><Link href="/dashboard/notifications"><span><NavIcon name="bell" /></span>Notifications</Link><Link href="/dashboard/profile"><span><NavIcon name="user" /></span>Mon profil</Link></nav>
      <div className="platform-sidebar-bottom"><Link className="owner-link" href="/dashboard/owner"><span>＋</span><div><strong>Vous êtes propriétaire ?</strong><small>Publier un logement</small></div></Link>{user ? <div className="nav-user"><span className="nav-avatar">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</span><div><strong>{user.name || "Mon compte"}</strong><small>{user.email}</small></div><button type="button" onClick={signOut} aria-label="Se déconnecter">↪</button></div> : <div className="nav-guest"><Link className="nav-signin" href="/auth?mode=login">Se connecter <span>→</span></Link><Link className="nav-signup" href="/auth?mode=signup">Créer un compte</Link></div>}</div>
    </aside>
    <nav className="platform-mobile-nav" aria-label="Navigation mobile">{mainLinks.slice(0, 4).map(([label, href, icon]) => <Link className={href === "/explorer" ? "is-active" : ""} href={href} key={href}><span><NavIcon name={icon} /></span>{label}</Link>)}<Link href="/dashboard/profile"><span><NavIcon name="user" /></span>Profil</Link></nav>
  </>;
}

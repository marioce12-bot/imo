"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const mainLinks = [
  ["Explorer", "/explorer", "⌂"],
  ["Mes favoris", "/dashboard/favorites", "♡"],
  ["Réservations", "/dashboard/bookings", "▣"],
  ["Messages", "/dashboard/messages", "◌"],
];

export default function PlatformNav() {
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!hasSupabaseConfig) return;
    const supabase = createSupabaseBrowserClient();
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data.user) setUser({ email: data.user.email, name: data.user.user_metadata?.full_name });
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
    <aside className="platform-sidebar">
      <Link className="platform-brand" href="/explorer"><Image src="/icimo-logo.png" alt="ICIMO" width={112} height={41} priority /></Link>
      <p className="platform-nav-label">Découvrir</p>
      <nav aria-label="Navigation principale">{mainLinks.map(([label, href, icon]) => <Link className={href === "/explorer" ? "is-active" : ""} href={href} key={href}><span>{icon}</span>{label}</Link>)}</nav>
      <p className="platform-nav-label platform-nav-spacer">Mon activité</p>
      <nav aria-label="Compte"><Link href="/dashboard/notifications"><span>◉</span>Notifications</Link><Link href="/dashboard/profile"><span>○</span>Mon profil</Link></nav>
      <div className="platform-sidebar-bottom"><Link className="owner-link" href="/dashboard/owner"><span>＋</span><div><strong>Vous êtes propriétaire ?</strong><small>Publier un logement</small></div></Link>{user ? <div className="nav-user"><span className="nav-avatar">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</span><div><strong>{user.name || "Mon compte"}</strong><small>{user.email}</small></div><button type="button" onClick={signOut} aria-label="Se déconnecter">↪</button></div> : <Link className="nav-signin" href="/auth?mode=login">Se connecter <span>→</span></Link>}</div>
    </aside>
    <nav className="platform-mobile-nav" aria-label="Navigation mobile">{mainLinks.slice(0, 4).map(([label, href, icon]) => <Link className={href === "/explorer" ? "is-active" : ""} href={href} key={href}><span>{icon}</span>{label}</Link>)}<Link href="/dashboard/profile"><span>○</span>Profil</Link></nav>
  </>;
}

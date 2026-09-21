"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setEmail(user.email || "");
        setName(user.user_metadata?.full_name || "");
        setPhone(user.user_metadata?.phone || "");
      } catch (profileError) {
        setError(profileError instanceof Error ? profileError.message : "Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ data: { full_name: name, phone } });
      if (updateError) throw updateError;
      setMessage("Vos informations ont été mises à jour.");
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace("/explorer");
    router.refresh();
  }

  if (loading) return <section className="dashboard-placeholder"><p className="eyebrow">Mon compte</p><h1>Chargement du profil...</h1></section>;

  return <section className="profile-page"><div className="profile-heading"><div><h1>Mon profil</h1></div><span className="profile-avatar">{(name || email || "U").slice(0, 1).toUpperCase()}</span></div><div className="profile-grid"><form className="profile-card" onSubmit={saveProfile}><h2>Informations personnelles</h2><label>Nom complet<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Votre nom complet" /></label><label>Adresse e-mail<input value={email} disabled /></label><label>Téléphone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+229 00 00 00 00" /></label>{error && <p className="profile-error">{error}</p>}{message && <p className="profile-success">{message}</p>}<button className="btn btn-ink" type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</button></form><div className="profile-side"><article className="profile-card"><h2>Votre activité</h2><div className="profile-stat"><strong>0</strong><span>réservation</span></div><div className="profile-stat"><strong>0</strong><span>favori</span></div><div className="profile-stat"><strong>0</strong><span>message</span></div></article><article className="profile-card profile-owner-card"><span className="profile-card-icon">⌂</span><h2>Vous avez un logement ?</h2><p>Activez votre espace propriétaire pour publier une annonce et suivre vos revenus.</p><a href="/dashboard/owner">Accéder à l'espace propriétaire →</a></article><button className="profile-signout" type="button" onClick={signOut}>Se déconnecter</button></div></div></section>;
}

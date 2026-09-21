"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Status = "Confirmée" | "En attente" | "Terminée" | "Annulée";
type Booking = { id: string; title: string; city: string; dates: string; guests: number; price: string; status: Status; image: string };

const demoBookings: Booking[] = [
  { id: "IC-2408", title: "Appartement lumineux avec vue sur la marina", city: "Fidjrossè, Cotonou", dates: "12 - 16 août 2026", guests: 2, price: "112 000 FCFA", status: "Confirmée", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=700&q=85" },
  { id: "IC-2317", title: "Maison paisible entre jardin et océan", city: "Centre, Ouidah", dates: "04 - 08 septembre 2026", guests: 4, price: "88 000 FCFA", status: "En attente", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=85" },
  { id: "IC-1982", title: "Studio central, tout à pied", city: "Ouando, Porto-Novo", dates: "18 - 20 juin 2026", guests: 1, price: "36 000 FCFA", status: "Terminée", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=700&q=85" },
];

export default function BookingsPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<"Toutes" | Status>("Toutes");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState(demoBookings);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) { setAuthenticated(false); return; }
    createSupabaseBrowserClient().auth.getUser().then(({ data }) => setAuthenticated(Boolean(data.user)));
  }, []);

  const visibleBookings = useMemo(() => filter === "Toutes" ? bookings : bookings.filter((booking) => booking.status === filter), [bookings, filter]);
  if (authenticated === null) return <section className="dashboard-placeholder"><p className="eyebrow">Mon activité</p><h1>Chargement...</h1></section>;
  if (!authenticated) return <section className="auth-required"><div className="auth-required-icon">▣</div><h1>Vos séjours au même endroit.</h1><Link className="btn btn-ink" href="/auth?mode=login">Se connecter</Link></section>;

  return <section className="dashboard-screen"><div className="screen-heading"><div><h1>Mes réservations</h1></div><Link className="btn btn-ink" href="/explorer">＋ Trouver un logement</Link></div><div className="booking-tabs">{(["Toutes", "Confirmée", "En attente", "Terminée", "Annulée"] as const).map((item) => <button className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)} key={item}>{item}{item !== "Toutes" && <span>{bookings.filter((booking) => booking.status === item).length}</span>}</button>)}</div>{visibleBookings.length ? <div className="booking-list">{visibleBookings.map((booking) => <article className="booking-card" key={booking.id}><Image src={booking.image} alt={booking.title} width={180} height={150} /><div className="booking-card-body"><div className="booking-card-top"><span className={`status status-${booking.status.toLowerCase().replace(" ", "-")}`}>{booking.status}</span><small>#{booking.id}</small></div><h2>{booking.title}</h2><p>{booking.city} · {booking.dates} · {booking.guests} voyageur{booking.guests > 1 ? "s" : ""}</p><div className="booking-card-footer"><strong>{booking.price}</strong><button type="button" onClick={() => setSelected(booking)}>Voir les détails <span>→</span></button></div></div></article>)}</div> : <div className="empty-state"><strong>Aucune réservation dans cette catégorie.</strong><button className="btn btn-ink" type="button" onClick={() => setFilter("Toutes")}>Voir toutes les réservations</button></div>}{selected && <div className="detail-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="booking-detail" role="dialog" aria-modal="true"><button className="detail-close" type="button" onClick={() => setSelected(null)} aria-label="Fermer">×</button><Image src={selected.image} alt={selected.title} width={700} height={260} /><span className={`status status-${selected.status.toLowerCase().replace(" ", "-")}`}>{selected.status}</span><h2>{selected.title}</h2><p>{selected.city}</p><div className="detail-grid"><span>Dates<strong>{selected.dates}</strong></span><span>Voyageurs<strong>{selected.guests}</strong></span><span>Total<strong>{selected.price}</strong></span></div><Link className="btn btn-ink" href="/dashboard/messages">Contacter le propriétaire</Link></div></div>}</section>;
}

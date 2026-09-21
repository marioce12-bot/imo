"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Conversation = { id: number; name: string; property: string; preview: string; time: string; unread: number; image: string; online: boolean; messages: { from: "me" | "them"; text: string; time: string }[] };
const demoConversations: Conversation[] = [
  { id: 1, name: "Koffi Hounkpatin", property: "Appartement Fidjrossè", preview: "Bonjour, le logement est disponible...", time: "10:42", unread: 2, image: "https://i.pravatar.cc/120?img=12", online: true, messages: [{ from: "them", text: "Bonjour, merci pour votre intérêt pour l'appartement.", time: "10:38" }, { from: "me", text: "Bonjour Koffi, est-ce que le wifi et le parking sont inclus ?", time: "10:40" }, { from: "them", text: "Oui, les deux sont inclus. Le logement est disponible pour vos dates.", time: "10:42" }] },
  { id: 2, name: "Awa Adéoti", property: "Maison jardin à Ouidah", preview: "Je peux vous envoyer les dimensions...", time: "Hier", unread: 0, image: "https://i.pravatar.cc/120?img=47", online: false, messages: [{ from: "them", text: "Je peux vous envoyer les dimensions de la maison si vous le souhaitez.", time: "Hier" }] },
  { id: 3, name: "Jean-Marc Soglo", property: "Villa Arconville", preview: "Merci pour votre réservation.", time: "12 juin", unread: 0, image: "https://i.pravatar.cc/120?img=68", online: false, messages: [{ from: "them", text: "Merci pour votre réservation, à très bientôt.", time: "12 juin" }] },
];

export default function MessagesPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState(demoConversations);
  const [activeId, setActiveId] = useState(1);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const active = conversations.find((conversation) => conversation.id === activeId) || conversations[0];
  const filtered = useMemo(() => conversations.filter((conversation) => `${conversation.name} ${conversation.property}`.toLowerCase().includes(search.toLowerCase())), [conversations, search]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) { setAuthenticated(false); return; }
    createSupabaseBrowserClient().auth.getUser().then(({ data }) => setAuthenticated(Boolean(data.user)));
  }, []);

  function sendMessage(event: FormEvent) { event.preventDefault(); if (!draft.trim()) return; setConversations((current) => current.map((conversation) => conversation.id === active.id ? { ...conversation, preview: draft, time: "À l'instant", messages: [...conversation.messages, { from: "me", text: draft.trim(), time: "À l'instant" }] } : conversation)); setDraft(""); }
  if (authenticated === null) return <section className="dashboard-placeholder"><p className="eyebrow">Mon activité</p><h1>Chargement...</h1></section>;
  if (!authenticated) return <section className="auth-required"><div className="auth-required-icon">◌</div><p className="eyebrow">Mon activité</p><h1>Les échanges, en toute simplicité.</h1><p>Connectez-vous pour retrouver vos conversations et contacter les propriétaires des logements qui vous intéressent.</p><Link className="btn btn-ink" href="/auth?mode=login">Se connecter</Link><Link className="auth-required-link" href="/explorer">Explorer les logements →</Link></section>;

  return <section className="dashboard-screen messages-screen"><div className="screen-heading"><div><p className="eyebrow">Mon activité</p><h1>Messages</h1><p>Échangez directement avec les propriétaires.</p></div><Link className="btn btn-ink" href="/explorer">Explorer</Link></div><div className="messages-layout"><aside className="conversation-list"><div className="conversation-list-head"><strong>Conversations</strong><span>{conversations.length}</span></div><label className="conversation-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher" /></label>{filtered.map((conversation) => <button className={`conversation-item ${conversation.id === active.id ? "active" : ""}`} type="button" key={conversation.id} onClick={() => setActiveId(conversation.id)}><Image src={conversation.image} alt="" width={42} height={42} /><span className="conversation-copy"><strong>{conversation.name}</strong><small>{conversation.property}</small><em>{conversation.preview}</em></span><span className="conversation-meta"><small>{conversation.time}</small>{conversation.unread > 0 && <b>{conversation.unread}</b>}</span></button>)}</aside><section className="chat-panel"><header className="chat-head"><Image src={active.image} alt="" width={44} height={44} /><div><strong>{active.name}</strong><span>{active.online ? "En ligne" : "Propriétaire ICIMO"}</span></div><button type="button" aria-label="Plus d'options">•••</button></header><div className="chat-property">{active.property}<Link href="/explorer">Voir le logement →</Link></div><div className="chat-messages">{active.messages.map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.time}-${index}`}><p>{message.text}</p><small>{message.time}</small></div>)}</div><form className="chat-compose" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Écrire un message..." /><button type="submit" aria-label="Envoyer">↑</button></form></section></div></section>;
}

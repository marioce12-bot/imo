"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import PlatformNav from "@/components/PlatformNav";

type Property = {
  id: number;
  title: string;
  city: string;
  neighborhood: string;
  type: string;
  price: number;
  bedrooms: number;
  guests: number;
  rating: number;
  verified: boolean;
  image: string;
  imageUrl: string;
};

const properties: Property[] = [
  { id: 1, title: "Appartement lumineux avec vue sur la marina", city: "Cotonou", neighborhood: "Fidjrossè", type: "Appartement", price: 28000, bedrooms: 2, guests: 4, rating: 4.9, verified: true, image: "Maison contemporaine", imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85" },
  { id: 2, title: "Maison paisible entre jardin et océan", city: "Ouidah", neighborhood: "Centre", type: "Maison", price: 22000, bedrooms: 3, guests: 6, rating: 4.8, verified: true, image: "Maison jardin", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85" },
  { id: 3, title: "Studio central, tout à pied", city: "Porto-Novo", neighborhood: "Ouando", type: "Studio", price: 18000, bedrooms: 1, guests: 2, rating: 4.7, verified: false, image: "Studio central", imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85" },
  { id: 4, title: "Villa familiale avec piscine privée", city: "Abomey-Calavi", neighborhood: "Arconville", type: "Villa", price: 45000, bedrooms: 4, guests: 8, rating: 4.9, verified: true, image: "Villa piscine", imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85" },
  { id: 5, title: "Deux pièces calme proche des commerces", city: "Cotonou", neighborhood: "Haie Vive", type: "Appartement", price: 32000, bedrooms: 1, guests: 3, rating: 4.6, verified: true, image: "Appartement calme", imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85" },
  { id: 6, title: "Escapade au bord du lac", city: "Ganvié", neighborhood: "Lac Nokoué", type: "Maison", price: 25000, bedrooms: 2, guests: 4, rating: 4.8, verified: false, image: "Maison sur le lac", imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=85" },
];

type AuthAction = "Réserver" | "Contacter" | "Ajouter aux favoris";

export default function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Tous les types");
  const [maxPrice, setMaxPrice] = useState("90000");
  const [guests, setGuests] = useState("Tous");
  const [view, setView] = useState<"list" | "map">("list");
  const [authAction, setAuthAction] = useState<AuthAction | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredProperties = useMemo(() => properties.filter((property) => {
    const searchable = `${property.title} ${property.city} ${property.neighborhood}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) &&
      (type === "Tous les types" || property.type === type) &&
      property.price <= Number(maxPrice) &&
      (guests === "Tous" || property.guests >= Number(guests));
  }), [query, type, maxPrice, guests]);

  function requestAuth(action: AuthAction, propertyId?: number) {
    if (action === "Ajouter aux favoris" && propertyId) {
      setFavorites((current) => current.includes(propertyId) ? current.filter((id) => id !== propertyId) : [...current, propertyId]);
      return;
    }
    if (action === "Ajouter aux favoris") return;
    window.location.assign(`/auth?mode=${action === "Réserver" ? "signup" : "login"}`);
  }

  return (
    <main className="platform-shell">
      <PlatformNav />
      <div className="platform-page-content">
      <header className="platform-header">
        <div className="wrap platform-header-inner">
          <div className="platform-header-copy"><span className="eyebrow">Explorer ICIMO</span><strong>Les logements qui vous ressemblent.</strong></div>
          <div className="platform-actions"><Link className="text-button" href="/dashboard/notifications">Notifications</Link><Link className="btn btn-ink" href="/dashboard/profile">Mon profil</Link></div>
        </div>
      </header>

      <div className="wrap platform-content">
        <section className="platform-intro">
          <div><p className="eyebrow">Bénin · 6 logements sélectionnés</p><h1>Votre prochain chez-vous commence ici.</h1><p>Explorez librement les annonces. Créez un compte seulement au moment de contacter, réserver ou sauvegarder un logement.</p></div>
          <div className="platform-tip"><span>✦</span><div><strong>Une location, deux façons</strong><p>Pour une nuit ou pour longtemps, trouvez le bon espace.</p></div></div>
        </section>

        <section className="search-panel" aria-label="Filtres de recherche">
          <label className="search-main"><span>Destination ou quartier</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex. Cotonou, Fidjrossè..." /></label>
          <label><span>Type de logement</span><select value={type} onChange={(event) => setType(event.target.value)}><option>Tous les types</option><option>Appartement</option><option>Maison</option><option>Studio</option><option>Villa</option></select></label>
          <label><span>Budget maximum</span><select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}><option value="90000">Tous les budgets</option><option value="25000">25 000 FCFA</option><option value="35000">35 000 FCFA</option><option value="50000">50 000 FCFA</option></select></label>
          <label><span>Voyageurs</span><select value={guests} onChange={(event) => setGuests(event.target.value)}><option>Tous</option><option value="2">2+ voyageurs</option><option value="4">4+ voyageurs</option><option value="6">6+ voyageurs</option></select></label>
          <button className="btn btn-ink search-submit" type="button">Rechercher</button>
        </section>

        <div className="results-head"><div><strong>{filteredProperties.length} logements</strong><span> disponibles selon vos critères</span></div><div className="view-toggle" role="group" aria-label="Mode d'affichage"><button className={view === "list" ? "active" : ""} onClick={() => setView("list")} type="button">☷ Liste</button><button className={view === "map" ? "active" : ""} onClick={() => setView("map")} type="button">⌖ Carte</button></div></div>

        {view === "map" ? <section className="map-preview"><div className="map-grid" /><div className="map-label map-label-1">Cotonou <strong>28k</strong></div><div className="map-label map-label-2">Ouidah <strong>22k</strong></div><div className="map-label map-label-3">Porto-Novo <strong>18k</strong></div><p>Carte interactive disponible avec la localisation approximative des logements.</p></section> : <section className="property-grid" aria-label="Logements disponibles">{filteredProperties.map((property) => <article className="property-card" key={property.id}><div className="property-image"><Image src={property.imageUrl} alt={property.image} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" className="property-photo" /><div className="property-image-shade" /><button className={`favorite ${favorites.includes(property.id) ? "is-favorite" : ""}`} type="button" onClick={() => requestAuth("Ajouter aux favoris", property.id)} aria-label={favorites.includes(property.id) ? "Retirer des favoris" : "Ajouter aux favoris"}>{favorites.includes(property.id) ? "♥" : "♡"}</button>{property.verified && <span className="verified-badge">✓ Vérifié</span>}</div><div className="property-body"><div className="property-location"><span>{property.city} · {property.neighborhood}</span><span>★ {property.rating}</span></div><h2>{property.title}</h2><div className="property-meta"><span>{property.bedrooms} chambre{property.bedrooms > 1 ? "s" : ""}</span><span>·</span><span>{property.guests} voyageurs</span><span>·</span><span>{property.type}</span></div><div className="property-footer"><strong>{property.price.toLocaleString("fr-FR")} FCFA <small>/ nuit</small></strong><button type="button" onClick={() => requestAuth("Réserver")}>Voir le logement <span>→</span></button></div><button className="contact-link" type="button" onClick={() => requestAuth("Contacter")}>Contacter le propriétaire</button></div></article>)}</section>}

        {filteredProperties.length === 0 && <div className="empty-state"><strong>Aucun logement ne correspond à votre recherche.</strong><button className="btn btn-ink" type="button" onClick={() => { setQuery(""); setType("Tous les types"); setMaxPrice("90000"); setGuests("Tous"); }}>Réinitialiser les filtres</button></div>}
        <div className="visitor-note"><span>◉</span><p><strong>Vous visitez en mode libre.</strong> Toutes les annonces sont consultables sans compte. La connexion sera demandée juste avant votre première action.</p></div>
      </div>

      {authAction && null}
      </div>
    </main>
  );
}

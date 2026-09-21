"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const properties = [
  { id: "1", title: "Appartement lumineux avec vue sur la marina", city: "Cotonou", neighborhood: "Fidjrossè", type: "Appartement", price: "28 000", rating: "4,9", guests: 4, bedrooms: 2, bathrooms: 2, verified: true, owner: "Koffi Hounkpatin", ownerImage: "https://i.pravatar.cc/120?img=12", images: ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=88", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=88", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=88"] },
  { id: "2", title: "Maison paisible entre jardin et océan", city: "Ouidah", neighborhood: "Centre", type: "Maison", price: "22 000", rating: "4,8", guests: 6, bedrooms: 3, bathrooms: 2, verified: true, owner: "Awa Adéoti", ownerImage: "https://i.pravatar.cc/120?img=47", images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=88", "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=900&q=88", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=88"] },
  { id: "3", title: "Studio central, tout à pied", city: "Porto-Novo", neighborhood: "Ouando", type: "Studio", price: "18 000", rating: "4,7", guests: 2, bedrooms: 1, bathrooms: 1, verified: false, owner: "Jean-Marc Soglo", ownerImage: "https://i.pravatar.cc/120?img=68", images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=88", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=88", "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=88"] },
];

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const property = properties.find((item) => item.id === params.id) || properties[0];
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) { setAuthLoading(false); return; }
    createSupabaseBrowserClient().auth.getUser().then(({ data }) => { setUser(Boolean(data.user)); setAuthLoading(false); });
  }, []);

  return (
    <main className="property-detail-page">
      <header className="property-detail-header">
        <Link href="/explorer" className="back-link">← <span>Retour aux logements</span></Link>
        <Image src="/icimo-logo.png" alt="ICIMO" width={100} height={37} priority />
        {authLoading ? <span className="detail-header-placeholder" aria-hidden="true" /> : user ? <span className="detail-header-actions"><Link href="/dashboard/notifications" aria-label="Notifications">◌</Link><Link href="/dashboard/profile" aria-label="Mon profil">Profil</Link></span> : <Link className="detail-header-action" href="/auth?mode=login">Se connecter</Link>}
      </header>

      <div className="property-detail-wrap">
        <div className="detail-breadcrumb">Explorer <span>/</span> {property.city} <span>/</span> {property.type}</div>
        <section className="detail-gallery" aria-label="Photos du logement">
          <div className="gallery-main"><Image src={property.images[0]} alt={property.title} fill priority sizes="(max-width: 800px) 100vw, 66vw" /></div>
          <div className="gallery-side"><div><Image src={property.images[1]} alt="Intérieur du logement" fill sizes="(max-width: 800px) 50vw, 33vw" /></div><div><Image src={property.images[2]} alt="Détail du logement" fill sizes="(max-width: 800px) 50vw, 33vw" /><span className="gallery-count">3 photos</span></div></div>
        </section>

        <div className="property-detail-grid">
          <article className="property-detail-copy">
            <div className="detail-eyebrow"><span>{property.city} · {property.neighborhood}</span>{property.verified && <b>✓ Propriétaire vérifié</b>}</div>
            <h1>{property.title}</h1>
            <p className="detail-rating">★ {property.rating} <span>·</span> Logement très apprécié <span>·</span> {property.type}</p>
            <div className="detail-facts"><span><strong>{property.guests}</strong> voyageurs</span><span><strong>{property.bedrooms}</strong> chambre{property.bedrooms > 1 ? "s" : ""}</span><span><strong>{property.bathrooms}</strong> salle{property.bathrooms > 1 ? "s" : ""} de bain</span></div>
            <hr />
            <section><h2>À propos de ce logement</h2><p>Profitez d’un espace confortable et soigneusement préparé dans un quartier vivant. La localisation, les équipements et l’accueil du propriétaire ont été pensés pour un séjour simple et agréable.</p></section>
            <section className="detail-section"><h2>Ce que propose ce logement</h2><div className="amenity-list"><span>✓ Wi-Fi haut débit</span><span>✓ Climatisation</span><span>✓ Cuisine équipée</span><span>✓ Parking privé</span></div></section>
            <section className="detail-section owner-section-detail"><h2>Votre hôte</h2><div className="owner-profile"><Image src={property.ownerImage} alt={property.owner} width={54} height={54} /><div><strong>{property.owner}</strong><span>Répond généralement en moins d'une heure</span></div></div></section>
          </article>

          <aside className="booking-box"><div className="booking-box-top"><div><strong>{property.price} FCFA</strong><span> / nuit</span></div><small>★ {property.rating}</small></div><div className="booking-fields"><label>Arrivée<input type="date" /></label><label>Départ<input type="date" /></label></div><label>Voyageurs<select defaultValue="2"><option value="1">1 voyageur</option><option value="2">2 voyageurs</option><option value="4">4 voyageurs</option><option value="6">6 voyageurs</option></select></label><Link className="btn btn-ink" href={user ? `/dashboard/bookings?property=${property.id}` : `/auth?mode=signup&next=/properties/${property.id}`}>Réserver ce logement</Link><Link className="detail-contact-link" href={user ? `/dashboard/messages?property=${property.id}` : `/auth?mode=login&next=/properties/${property.id}`}>Contacter le propriétaire</Link><small className="booking-note">Vous pourrez confirmer les détails avant tout paiement.</small></aside>
        </div>
      </div>
    </main>
  );
}

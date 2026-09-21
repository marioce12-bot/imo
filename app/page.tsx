import Image from "next/image";
import Link from "next/link";

const cities = ["Cotonou", "Porto-Novo", "Ouidah", "Abomey-Calavi"];

const highlights = [
  ["01", "Une vraie adresse", "Des logements situés dans les quartiers que vous voulez vraiment vivre."],
  ["02", "Un échange direct", "Posez vos questions au propriétaire, sans intermédiaire opaque."],
  ["03", "Un prix lisible", "Le montant affiché reste clair avant votre réservation."],
];

export default function Home() {
  return (
    <main className="landing">
      <div className="landing-orb landing-orb-one" />
      <div className="landing-orb landing-orb-two" />
      <header className="landing-nav wrap">
        <Link className="landing-brand" href="/" aria-label="ICIMO accueil"><Image src="/icimo-logo.png" alt="ICIMO" width={112} height={41} priority /></Link>
        <nav className="landing-links" aria-label="Navigation principale"><a href="#experience">L'expérience</a><a href="#proprietaires">Propriétaires</a><a href="#aide">Aide</a></nav>
        <div className="landing-nav-actions"><Link className="landing-login" href="/explorer">Se connecter</Link><Link className="glass-button glass-button-strong" href="/explorer">Explorer</Link></div>
      </header>

      <section className="landing-hero wrap" id="contenu">
        <div className="hero-copy"><p className="landing-kicker"><span /> La nouvelle façon d'habiter le Bénin</p><h1>Un lieu à vous.<br /><em>Une vie à vivre.</em></h1><p className="hero-description">ICIMO rassemble les logements qui ont une histoire, les propriétaires qui vous répondent et les séjours qui commencent simplement.</p><div className="hero-actions"><Link className="glass-button glass-button-warm" href="/explorer">Voir les logements <span>↗</span></Link><a className="hero-text-link" href="#experience">Découvrir ICIMO <span>↓</span></a></div><div className="hero-proof"><div className="proof-avatars"><span>AM</span><span>KO</span><span>YA</span></div><p><strong>Déjà adopté par des voyageurs curieux</strong><br /><span>Une plateforme pensée ici, pour vous.</span></p></div></div>
        <div className="hero-visual"><div className="hero-photo-card"><Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=88" alt="Intérieur lumineux d'un logement ICIMO" fill priority sizes="(max-width: 800px) 92vw, 50vw" /><div className="photo-gradient" /><div className="photo-caption"><span className="live-dot" /> Disponible maintenant <strong>Cotonou</strong></div></div><div className="floating-glass floating-rating"><span>★</span><div><strong>4,9 / 5</strong><small>avis voyageurs</small></div></div><div className="floating-glass floating-place"><small>À découvrir</small><strong>Fidjrossè<br />Cotonou</strong><span>→</span></div><div className="hero-stamp">ICI<br /><span>MO</span></div></div>
      </section>

      <section className="glass-search wrap" aria-label="Rechercher un logement"><div className="search-heading"><span className="search-icon">⌕</span><div><small>Je cherche un logement à</small><strong>Où allez-vous ?</strong></div></div><label><span>Arrivée</span><input type="date" /></label><label><span>Départ</span><input type="date" /></label><label><span>Voyageurs</span><select defaultValue="2"><option value="1">1 voyageur</option><option value="2">2 voyageurs</option><option value="3">3 voyageurs</option><option value="4">4 voyageurs</option></select></label><button type="button" onClick={() => window.location.href = "/explorer"}>Rechercher <span>↗</span></button></section>

      <section className="landing-section wrap" id="experience"><div className="section-intro"><p className="landing-kicker"><span /> L'expérience ICIMO</p><h2>Pas seulement<br /><em>un toit.</em></h2><p>Un bon logement change la manière dont on découvre une ville. Nous avons conçu ICIMO pour rendre cette rencontre plus humaine, plus simple, plus sûre.</p></div><div className="highlight-grid">{highlights.map(([number, title, text]) => <article className="highlight-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><a href="/explorer" aria-label={`Découvrir ${title}`}>↗</a></article>)}</div></section>

      <section className="editorial-panel wrap"><div className="editorial-image"><Image src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88" alt="Salon chaleureux d'une maison" fill sizes="(max-width: 800px) 92vw, 45vw" /><span>01 / 03</span></div><div className="editorial-copy"><p className="landing-kicker"><span /> À votre rythme</p><h2>Pour une nuit.<br /><em>Ou pour longtemps.</em></h2><p>Appartement meublé pour un déplacement, maison familiale pour s'installer, villa pour respirer. Sur ICIMO, la durée s'adapte à votre histoire.</p><div className="editorial-links"><Link href="/explorer?type=courte">Séjours courts <span>↗</span></Link><Link href="/explorer?type=longue">Locations longues <span>↗</span></Link></div></div></section>

      <section className="owner-section wrap" id="proprietaires"><div className="owner-copy"><p className="landing-kicker"><span /> Vous avez un logement ?</p><h2>Faites-lui<br /><em>une place.</em></h2><p>Publiez une adresse qui compte pour vous. ICIMO vous aide à la présenter, la gérer et rencontrer les bonnes personnes.</p><Link className="glass-button glass-button-warm" href="/explorer?mode=proprietaire">Proposer mon logement <span>↗</span></Link></div><div className="owner-art"><div className="owner-art-card"><Image src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=88" alt="Maison avec terrasse" fill sizes="(max-width: 800px) 80vw, 35vw" /></div><div className="owner-note floating-glass"><strong>Votre espace.</strong><span>Votre rythme.</span></div></div></section>

      <section className="landing-final wrap" id="aide"><p className="landing-kicker"><span /> Commencez simplement</p><h2>Votre prochaine<br /><em>adresse est ici.</em></h2><Link className="glass-button glass-button-warm" href="/explorer">Explorer sans compte <span>↗</span></Link></section>

      <footer className="landing-footer wrap"><Link href="/"><Image src="/icimo-logo.png" alt="ICIMO" width={95} height={35} /></Link><span>Une marque ICE HOLDING · Bénin</span><span>© 2026 ICIMO</span></footer>
    </main>
  );
}

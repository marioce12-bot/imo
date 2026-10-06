import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, BadgeCheck, BedDouble, Building2, Check, Heart, MapPin, MapPinned, Search, ShieldCheck, SlidersHorizontal, Star, Users } from "lucide-react";
import { formatDate, formatPrice, listingPrice, type Property, type RentalKind } from "@/data/demo";
import { useDemo } from "@/components/DemoStore";

function toggleFavorite(current: string[], slug: string) {
  return current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
}

function nextDay(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function SearchForm({ initialCity = "", compact = false, onSearch }: { initialCity?: string; compact?: boolean; onSearch?: (values: { city: string; kind: string; start: string; end: string; guests: string }) => void }) {
  const params = new URLSearchParams(window.location.search);
  const [city, setCity] = useState(initialCity || params.get("destination") || "");
  const [kind, setKind] = useState(params.get("type") === "long" ? "long" : "short");
  const [start, setStart] = useState(params.get("arrivee") ?? "");
  const [end, setEnd] = useState(params.get("depart") ?? "");
  const [guests, setGuests] = useState(params.get("voyageurs") ?? "2");
  const [, setLocation] = useLocation();

  function search(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("destination", city);
    params.set("type", kind);
    if (start) params.set("arrivee", start);
    if (end) params.set("depart", end);
    params.set("voyageurs", guests);
    onSearch?.({ city, kind, start, end, guests });
    setLocation(`/recherche?${params.toString()}`);
  }

  return (
    <form className={`search-panel ${compact ? "search-panel-compact" : ""}`} onSubmit={search}>
      <label className="search-field"><span>Où allez-vous ?</span><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville ou quartier" list="benin-places" /><datalist id="benin-places"><option value="Cotonou" /><option value="Fidjrossè" /><option value="Haie Vive" /><option value="Abomey-Calavi" /><option value="Porto-Novo" /><option value="Grand-Popo" /></datalist></label>
      <label className="search-field"><span>Type de location</span><select value={kind} onChange={(e) => setKind(e.target.value)}><option value="short">Courte durée</option><option value="long">Longue durée</option></select></label>
      <label className="search-field search-date"><span>Arrivée</span><input type="date" value={start} onChange={(e) => { const value = e.target.value; setStart(value); if (end && value && end <= value) setEnd(nextDay(value)); }} /></label>
      <label className="search-field search-date"><span>Départ</span><input type="date" min={start ? nextDay(start) : undefined} value={end} onChange={(e) => setEnd(e.target.value)} /></label>
      <label className="search-field guests-field"><span>Voyageurs</span><select value={guests} onChange={(e) => setGuests(e.target.value)}><option value="1">1 personne</option><option value="2">2 personnes</option><option value="3">3 personnes</option><option value="4">4 personnes</option><option value="5">5 personnes</option><option value="6">6+ personnes</option></select></label>
      <button className="search-submit" type="submit"><Search size={18} /><span>{compact ? "Modifier" : "Rechercher"}</span></button>
    </form>
  );
}

export function PropertyCard({ property, horizontal = false, kind }: { property: Property; horizontal?: boolean; kind?: RentalKind }) {
  const { favorites, setFavorites } = useDemo();
  const saved = favorites.includes(property.slug);
  const price = listingPrice(property, kind);
  return (
    <article className={`property-card ${horizontal ? "property-card-horizontal" : ""}`}>
      <div className="property-image-wrap">
        <Link href={`/logement/${property.slug}`} className="property-image-link" aria-label={`Voir ${property.title}`}><img className="property-image" src={property.image} alt={`Aperçu du logement de démonstration « ${property.title} » à ${property.city}`} loading="lazy" /></Link>
        {property.featured && <span className="featured-tag">Choix ICIMO</span>}
        {property.verified && <span className="verified-tag"><BadgeCheck size={13} /> Vérifié</span>}
        <button className={`favorite-button ${saved ? "favorite-selected" : ""}`} aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={saved} onClick={() => setFavorites((prev) => toggleFavorite(prev, property.slug))}><Heart size={19} fill={saved ? "currentColor" : "none"} /></button>
      </div>
      <div className="property-card-body">
        <div className="card-title-row"><Link href={`/logement/${property.slug}`} className="property-title">{property.title}</Link><span className="property-rating"><Star size={14} fill="currentColor" /> {property.rating.toFixed(2)}</span></div>
        <div className="property-location"><MapPin size={13} /> {property.district}, {property.city}</div>
        <div className="property-meta"><span>{property.guests} voyageurs</span><i /> <span>{property.beds} chambre{property.beds > 1 ? "s" : ""}</span><i /> <span>{property.area} m²</span></div>
        <div className="property-price"><strong>{formatPrice(price.amount)}</strong> <span>{price.unit}</span></div>
        <small className="demo-caption">Annonce de démonstration</small>
      </div>
    </article>
  );
}

export function HomePage() {
  const { properties } = useDemo();
  const featured = properties.find((property) => property.featured) ?? properties[0];
  const cards = properties.slice(0, 4);
  return (
    <>
      <section className="hero-section">
        <img className="hero-image" src={featured?.image} alt="Intérieur d’un appartement fictif à Cotonou" />
        <div className="hero-shade" />
        <div className="hero-copy"><span className="eyebrow eyebrow-light"><span className="eyebrow-mark" /> L’HOSPITALITÉ, À LA BÉNINOISE</span><h1>Votre prochain<br /><em>chez-vous</em> commence ici.</h1><p>Une nuit, un mois ou un peu plus longtemps.<br className="desktop-only" /> Trouvez l’endroit qui vous ressemble au Bénin.</p><div className="hero-trust"><span><ShieldCheck size={16} /> Prix transparents</span><span>Locations vérifiées</span></div></div>
        <div className="hero-search"><SearchForm /></div>
        <span className="hero-image-credit">Logement fictif · visuel de démonstration</span>
      </section>

      <section className="content-section intro-section">
        <div className="intro-copy"><span className="eyebrow">ICIMO, AU BÉNIN</span><h2>Bien plus qu’une adresse.</h2><p>Des logements choisis avec soin, des prix lisibles et une équipe qui connaît le pays. À Cotonou, à Grand-Popo ou là où la vie vous mène.</p></div>
        <div className="intro-stat"><strong>01</strong><span>compte pour explorer<br />ou accueillir</span></div>
        <div className="intro-stat"><strong>2</strong><span>façons de louer<br />selon votre projet</span></div>
      </section>

      <section className="content-section listing-section">
        <div className="section-heading"><div><span className="eyebrow">À DÉCOUVRIR</span><h2>Des lieux qui ont une âme.</h2><p>Quelques adresses de notre sélection au Bénin.</p></div><Link href="/recherche" className="text-link">Voir tous les logements <ArrowRight size={17} /></Link></div>
        <div className="property-grid">{cards.map((property) => <PropertyCard key={property.slug} property={property} />)}</div>
      </section>

      <section className="city-section content-section"><div className="section-heading"><div><span className="eyebrow">AU FIL DES VILLES</span><h2>Le Bénin, à votre façon.</h2></div></div><div className="city-pills"><Link href="/recherche?destination=Cotonou">Cotonou <span>Le cœur qui bouge</span></Link><Link href="/recherche?destination=Abomey-Calavi">Abomey-Calavi <span>Un autre rythme</span></Link><Link href="/recherche?destination=Grand-Popo">Grand-Popo <span>Le temps de souffler</span></Link><Link href="/recherche?destination=Porto-Novo">Porto-Novo <span>La capitale côté culture</span></Link></div></section>

      <section className="long-stay-band"><div className="long-band-content"><span className="eyebrow eyebrow-light">S’INSTALLER AUTREMENT</span><h2>Un chez-vous,<br />pour <em>plus longtemps.</em></h2><p>Besoin d’un logement pour le travail, les études ou une nouvelle étape ? Échangez avec le propriétaire et définissez les modalités ensemble.</p><Link href="/recherche?type=long" className="button button-light">Explorer la longue durée <ArrowRight size={17} /></Link></div><div className="long-band-art"><div className="circle-art"><span>ICIMO</span><small>POUR VIVRE<br />À SON RYTHME</small></div><span className="arc-art" /></div></section>

      <section className="host-cta content-section"><div className="host-cta-icon"><Building2 size={25} /></div><div><span className="eyebrow">VOUS AVEZ UN LOGEMENT ?</span><h2>Une adresse à partager ?</h2><p>Présentez votre logement et gérez les demandes au même endroit.</p></div><Link href="/hote" className="button button-outline">Découvrir l’espace hôte <ArrowRight size={17} /></Link></section>
    </>
  );
}

function MapDemo({ properties, kind }: { properties: Property[]; kind?: RentalKind }) {
  return <div className="map-demo" aria-label="Carte schématique des logements de démonstration"><div className="map-label map-label-cotonou">COTONOU</div><div className="map-label map-label-ocean">GOLFE DU BÉNIN</div><span className="map-road map-road-one" /><span className="map-road map-road-two" /><span className="map-road map-road-three" /><span className="map-water" />{properties.map((property) => <Link key={property.slug} href={`/logement/${property.slug}`} className="map-pin" style={{ left: `${property.coordinates[0]}%`, top: `${property.coordinates[1]}%` }}>{formatPrice(listingPrice(property, kind).amount).replace(" F CFA", "")}</Link>)}<div className="map-demo-label">Carte schématique · emplacements approximatifs</div></div>;
}

export function SearchPage() {
  const { properties, searches, setSearches, notify, blockedDates } = useDemo();
  const query = new URLSearchParams(window.location.search);
  const [destination, setDestination] = useState(query.get("destination") ?? "");
  const [kind, setKind] = useState(query.get("type") ?? "all");
  const [arrival, setArrival] = useState(query.get("arrivee") ?? "");
  const [departure, setDeparture] = useState(query.get("depart") ?? "");
  const [guests, setGuests] = useState(query.get("voyageurs") ?? "1");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [availabilityOnly, setAvailabilityOnly] = useState(Boolean(query.get("arrivee") && query.get("depart")));
  const [showMore, setShowMore] = useState(false);
  const [bedrooms, setBedrooms] = useState("0");
  const [bathrooms, setBathrooms] = useState("0");
  const [minArea, setMinArea] = useState("0");
  const [minRating, setMinRating] = useState("0");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState("1000000");
  const [mapMode, setMapMode] = useState(false);
  const [sort, setSort] = useState("recommended");

  const results = useMemo(() => {
    const normalized = destination.trim().toLocaleLowerCase("fr-FR");
    let found = properties.filter((property) => {
      const area = `${property.city} ${property.district}`.toLocaleLowerCase("fr-FR");
      const matchesPlace = !normalized || area.includes(normalized) || normalized.includes(property.city.toLocaleLowerCase("fr-FR"));
      const matchesKind = kind === "all" || (kind === "short" ? property.kind !== "long" : property.kind !== "short");
      const matchesBeds = property.beds >= Number(bedrooms || 0);
      const matchesBaths = property.baths >= Number(bathrooms || 0);
      const matchesArea = property.area >= Number(minArea || 0);
      const matchesGuests = property.guests >= Number(guests || 1);
      const matchesRating = property.rating >= Number(minRating || 0);
      const matchesAmenities = amenities.every((amenity) => property.amenities.some((item) => item.toLowerCase().includes(amenity.toLowerCase())));
      const monthly = kind === "long" || (kind === "all" && property.kind === "long");
      const matchesPrice = (monthly ? property.priceMonth : property.priceNight) <= Number(maxPrice || 1000000);
      let matchesAvailability = true;
      if (availabilityOnly && arrival && departure) {
        const current = new Date(`${arrival}T12:00:00`);
        const end = new Date(`${departure}T12:00:00`);
        while (current < end) {
          const date = current.toISOString().slice(0, 10);
          if (blockedDates.includes(date) || blockedDates.includes(`${property.slug}:${date}`)) matchesAvailability = false;
          current.setDate(current.getDate() + 1);
        }
      }
      return matchesPlace && matchesKind && matchesBeds && matchesBaths && matchesArea && matchesGuests && matchesRating && matchesAmenities && matchesAvailability && matchesPrice && (!verifiedOnly || property.verified) && (!furnishedOnly || property.furnished);
    });
    if (sort === "price-low") found = [...found].sort((a, b) => {
      const aMonthly = kind === "long" || (kind === "all" && a.kind === "long");
      const bMonthly = kind === "long" || (kind === "all" && b.kind === "long");
      return (aMonthly ? a.priceMonth : a.priceNight) - (bMonthly ? b.priceMonth : b.priceNight);
    });
    if (sort === "rating") found = [...found].sort((a, b) => b.rating - a.rating);
    return found;
  }, [properties, destination, kind, bedrooms, bathrooms, minArea, minRating, amenities, maxPrice, guests, arrival, departure, availabilityOnly, blockedDates, verifiedOnly, furnishedOnly, sort]);

  function saveSearch() {
    const entry = { id: `search-${Date.now()}`, city: destination || "Tout le Bénin", kind, date: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date()), arrival: arrival || undefined, departure: departure || undefined, guests: Number(guests) };
    setSearches((items) => [entry, ...items]);
    notify("Votre recherche est sauvegardée dans la démo.");
  }

  return <section className="content-section search-page"><div className="breadcrumb"><Link href="/">Accueil</Link><span>/</span> Explorer</div><div className="section-heading search-heading"><div><span className="eyebrow">TROUVER VOTRE LIEU</span><h1>On cherche pour vous.</h1><p>{results.length} logement{results.length > 1 ? "s" : ""} de démonstration · données fictives</p></div><button className="text-button" onClick={saveSearch}>Sauvegarder cette recherche <Heart size={16} /></button></div>
    <SearchForm initialCity={destination} compact onSearch={(values) => { setDestination(values.city); setKind(values.kind); setArrival(values.start); setDeparture(values.end); setGuests(values.guests); setAvailabilityOnly(Boolean(values.start && values.end)); }} />
    <div className="filter-toolbar"><div className="filter-type-pills"><button className={kind === "all" ? "active" : ""} onClick={() => setKind("all")}>Tout voir</button><button className={kind === "short" ? "active" : ""} onClick={() => setKind("short")}>Courte durée</button><button className={kind === "long" ? "active" : ""} onClick={() => setKind("long")}>Longue durée</button></div><button className={`filter-chip ${verifiedOnly ? "selected" : ""}`} onClick={() => setVerifiedOnly(!verifiedOnly)}><BadgeCheck size={15} /> Vérifiés</button><button className={`filter-chip ${furnishedOnly ? "selected" : ""}`} onClick={() => setFurnishedOnly(!furnishedOnly)}>Meublés</button><button className={`filter-chip ${showMore ? "selected" : ""}`} onClick={() => setShowMore(!showMore)}><SlidersHorizontal size={15} /> Plus de filtres</button><label className="sort-select">Trier <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommandés</option><option value="price-low">Prix croissant</option><option value="rating">Meilleures notes</option></select></label><button className="view-toggle" onClick={() => setMapMode(!mapMode)}>{mapMode ? <><Search size={15} /> Liste</> : <><MapPinned size={15} /> Carte</>}</button></div>
    {showMore && <div className="advanced-filters"><label>Chambres<select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}><option value="0">Indifférent</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></label><label>Salles de bain<select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)}><option value="0">Indifférent</option><option value="1">1+</option><option value="2">2+</option></select></label><label>Surface minimale<select value={minArea} onChange={(e) => setMinArea(e.target.value)}><option value="0">Indifférent</option><option value="40">40 m²+</option><option value="70">70 m²+</option><option value="100">100 m²+</option></select></label><label>Note minimale<select value={minRating} onChange={(e) => setMinRating(e.target.value)}><option value="0">Indifférent</option><option value="4">4+ étoiles</option><option value="4.5">4,5+ étoiles</option></select></label><label>Budget maximum ({kind === "long" ? "mois" : kind === "short" ? "nuit" : "nuit ou mois"})<select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}><option value="30000">30 000 F</option><option value="50000">50 000 F</option><option value="100000">100 000 F</option><option value="1000000">Sans limite</option></select></label><label>Voyageurs<select value={guests} onChange={(e) => setGuests(e.target.value)}><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label><label className="amenity-filter">Équipements<select value={amenities[0] ?? ""} onChange={(e) => setAmenities(e.target.value ? [e.target.value] : [])}><option value="">Indifférent</option><option value="Wi-Fi">Wi-Fi</option><option value="climatisation">Climatisation</option><option value="cuisine">Cuisine équipée</option><option value="jardin">Jardin</option><option value="terrasse">Terrasse</option></select></label><label className="availability-filter"><input type="checkbox" checked={availabilityOnly} disabled={!arrival || !departure} onChange={(e) => setAvailabilityOnly(e.target.checked)} /> Disponible à vos dates</label><span><Check size={15} /> Tarifs et disponibilités illustratifs.</span></div>}
    {mapMode ? <div className="search-results-layout"><MapDemo properties={results} kind={kind === "long" ? "long" : kind === "short" ? "short" : undefined} /><div className="map-side-list">{results.slice(0, 3).map((property) => <PropertyCard key={property.slug} property={property} horizontal kind={kind === "long" ? "long" : kind === "short" ? "short" : undefined} />)}</div></div> : results.length ? <div className="property-grid search-results-grid">{results.map((property) => <PropertyCard key={property.slug} property={property} kind={kind === "long" ? "long" : kind === "short" ? "short" : undefined} />)}</div> : <div className="empty-state"><span className="empty-icon"><Search /></span><h2>Aucune adresse ne correspond</h2><p>Essayez d’élargir la ville, le budget ou le nombre de chambres.</p><button className="button button-dark" onClick={() => { setDestination(""); setKind("all"); setBedrooms("0"); setBathrooms("0"); setMinArea("0"); setMinRating("0"); setAmenities([]); setGuests("1"); setMaxPrice("1000000"); setAvailabilityOnly(false); setVerifiedOnly(false); setFurnishedOnly(false); }}>Réinitialiser les filtres</button></div>}
  </section>;
}

export function PropertyPage({ slug }: { slug: string }) {
  const { properties, favorites, setFavorites, notify } = useDemo();
  const [, setLocation] = useLocation();
  const property = properties.find((item) => item.slug === slug);
  if (!property) return <section className="content-section empty-state"><h1>Logement introuvable</h1><Link href="/recherche" className="button button-dark">Retour à la recherche</Link></section>;
  const saved = favorites.includes(slug);
  const shortPrice = formatPrice(property.priceNight);
  const longPrice = formatPrice(property.priceMonth);
  return <section className="content-section property-detail"><div className="breadcrumb"><Link href="/">Accueil</Link><span>/</span><Link href="/recherche">Logements</Link><span>/</span>{property.district}</div><div className="detail-heading"><div><span className="eyebrow">{property.city.toUpperCase()} · {property.district.toUpperCase()}</span><h1>{property.title}</h1><p><Star size={15} fill="currentColor" /> <strong>{property.rating.toFixed(2)}</strong> · {property.reviewCount} avis fictifs <span>·</span> <MapPin size={14} /> Emplacement approximatif</p></div><button className={`button ${saved ? "button-saved" : "button-outline"}`} onClick={() => { setFavorites((items) => toggleFavorite(items, slug)); notify(saved ? "Retiré de vos favoris." : "Ajouté à vos favoris."); }}><Heart size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Enregistré" : "Enregistrer"}</button></div>
    <div className="detail-gallery"><div className="detail-image-main"><img src={property.image} alt={`Logement fictif ${property.title}`} /><span className="demo-image-pill">Visuel de démonstration</span></div><div className="detail-image-side"><div><img src={property.image} alt="Détail du logement de démonstration" /></div><div className="gallery-more"><img src={property.image} alt="Ambiance du logement de démonstration" /><button onClick={() => notify("La galerie complète sera disponible avec le dossier média du logement.")}>Voir toutes les photos</button></div></div></div>
    <div className="detail-columns"><div className="detail-main"><div className="host-intro"><div><h2>Un logement pensé pour vivre pleinement.</h2><p>{property.guests} voyageurs · {property.beds} chambre{property.beds > 1 ? "s" : ""} · {property.baths} salle{property.baths > 1 ? "s" : ""} de bain · {property.area} m²</p></div><div className="avatar host-avatar">{property.ownerInitials}</div></div><div className="divider" /><div className="owner-card"><span className="eyebrow">VOTRE HÔTE</span><h3>{property.owner} {property.verified && <BadgeCheck size={17} className="verified-text" />}</h3><p>Profil de propriétaire illustratif · {property.verified ? "identité vérifiée en démonstration" : "vérification non indiquée"}</p><button className="button button-outline button-small" onClick={() => setLocation("/messages")}>Contacter l’hôte</button></div><div className="divider" /><div className="detail-description"><h2>À propos de ce lieu</h2><p>{property.summary}</p><p>La localisation affichée est approximative. Les informations de cette annonce sont des exemples créés pour présenter ICIMO.</p></div><div className="detail-amenities"><h2>Ce que propose le logement</h2><div className="amenities-grid">{property.amenities.map((item) => <div key={item}><Check size={16} />{item}</div>)}</div><button className="text-button" onClick={() => notify("Les détails complets apparaîtront sur l’annonce reliée au backend.")}>Voir les équipements détaillés</button></div><div className="detail-rules"><h2>À savoir</h2><div className="rule-pills">{property.rules.map((rule) => <span key={rule}>{rule}</span>)}</div></div><div className="review-preview"><h2>Les voyageurs en parlent <span><Star size={14} fill="currentColor" /> {property.rating.toFixed(2)} · {property.reviewCount}</span></h2><div className="review-quote"><div className="avatar avatar-small">KM</div><div><strong>Kossi M.</strong><p>« Un séjour reposant, un hôte réactif et un appartement vraiment agréable. »</p><small>Avis de démonstration · septembre 2026</small></div></div><Link href="/avis" className="text-link">Conditions pour laisser un avis <ArrowRight size={15} /></Link></div></div>
      <aside className="booking-card"><span className="eyebrow">TARIFS TRANSPARENTS</span><div className="booking-card-price"><strong>{formatPrice(property.kind === "long" ? property.priceMonth : property.priceNight)}</strong><span>{property.kind === "long" ? "/ mois" : "/ nuit"}</span></div>{property.kind !== "long" && <p className="booking-month-price">ou {longPrice} / mois, sur demande</p>}<div className="mini-price-line"><span>Courte durée</span><strong>{property.kind !== "long" ? shortPrice : "Non proposée"}</strong></div><div className="mini-price-line"><span>Longue durée</span><strong>{property.kind !== "short" ? longPrice : "Non proposée"}</strong></div><div className="booking-assurance"><ShieldCheck size={16} /><span>Le détail des frais apparaît avant la confirmation.</span></div>{property.kind !== "long" && <button className="button button-primary button-block" onClick={() => setLocation(`/reserver/${slug}?type=courte`)}>Choisir mes dates <ArrowRight size={16} /></button>}{property.kind !== "short" && <button className="button button-outline button-block" onClick={() => setLocation(`/reserver/${slug}?type=longue`)}>Demander au mois</button>}<button className="text-button contact-link" onClick={() => { setLocation("/messages"); notify("Conversation de démonstration ouverte."); }}>Poser une question à {property.owner}</button><p className="detail-fine-print">Aucune réservation ou transaction réelle · logement fictif</p></aside></div>
  </section>;
}

export function FavoritesPage() {
  const { properties, favorites } = useDemo();
  const saved = properties.filter((item) => favorites.includes(item.slug));
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/">Accueil</Link><span>/</span> Favoris</div><div className="section-heading"><div><span className="eyebrow">VOTRE SÉLECTION</span><h1>Les lieux gardés en tête.</h1><p>{saved.length} favori{saved.length > 1 ? "s" : ""} · sauvegarde locale de démonstration</p></div><Link className="text-link" href="/recherche">Continuer à explorer <ArrowRight size={16} /></Link></div>{saved.length ? <div className="property-grid">{saved.map((property) => <PropertyCard key={property.slug} property={property} />)}</div> : <div className="empty-state"><span className="empty-icon"><Heart /></span><h2>Votre sélection commence ici</h2><p>Appuyez sur le cœur d’un logement pour le garder à portée de main.</p><Link className="button button-dark" href="/recherche">Explorer les logements</Link></div>}</section>;
}

export function BookingsPage() {
  const { bookings, properties } = useDemo();
  const [tab, setTab] = useState("à venir");
  const sorted = [...bookings].sort((a, b) => b.start.localeCompare(a.start));
  const visible = sorted.filter((booking) => tab === "historique" ? booking.end < new Date().toISOString().slice(0, 10) : booking.end >= new Date().toISOString().slice(0, 10));
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/">Accueil</Link><span>/</span> Mes séjours</div><div className="section-heading"><div><span className="eyebrow">VOS VOYAGES</span><h1>Chaque séjour a son histoire.</h1><p>Réservations et demandes de démonstration enregistrées dans ce navigateur.</p></div></div><div className="segmented-tabs"><button className={tab === "à venir" ? "active" : ""} onClick={() => setTab("à venir")}>À venir</button><button className={tab === "historique" ? "active" : ""} onClick={() => setTab("historique")}>Historique</button></div>{visible.length ? <div className="booking-list">{visible.map((booking) => { const property = properties.find((item) => item.slug === booking.slug); const statusClass = booking.status === "confirmed" ? "status-confirmed" : "status-request"; const statusLabel = booking.status === "confirmed" ? "Confirmée · démo" : booking.status === "accepted" ? "Demande acceptée · bail à définir · démo" : booking.status === "declined" ? "Demande déclinée · démo" : booking.status === "request" ? "Demande envoyée · démo" : "En attente · démo"; return <article className="booking-row" key={booking.id}><img src={property?.image} alt="" /><div className="booking-row-main"><span className={`status-pill ${statusClass}`}>{statusLabel}</span><h3>{property?.title ?? "Logement"}</h3><p>{property?.district}, {property?.city} · {booking.kind === "short" ? "Courte durée" : "Longue durée"}</p><small>{formatDate(booking.start)} → {formatDate(booking.end)} · {booking.guests} voyageur{booking.guests > 1 ? "s" : ""}</small></div><div className="booking-row-side"><strong>{formatPrice(booking.total)}</strong><Link href={`/reservation/${booking.id}`} className="text-link">Détails <ArrowRight size={14} /></Link></div></article>; })}</div> : <div className="empty-state"><span className="empty-icon"><BedDouble /></span><h2>Rien de prévu pour le moment</h2><p>Quand vous réservez un logement, il apparaît ici.</p><Link href="/recherche" className="button button-dark">Trouver un logement</Link></div>}</section>;
}

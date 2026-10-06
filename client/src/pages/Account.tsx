import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, BadgeCheck, Bell, CalendarDays, Check, CheckCircle2, ChevronRight, CreditCard, FileText, Heart, LockKeyhole, Mail, MessageCircle, Search, ShieldCheck, Star, UserRound, Wallet } from "lucide-react";
import { formatDate, formatPrice, type DemoBooking, type RentalKind } from "@/data/demo";
import { useDemo } from "@/components/DemoStore";
import { getSupabaseRedirectUrl, isSupabaseConfigured, supabase, useSupabaseAuth } from "@/lib/supabase";

function todayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
function nightsBetween(start: string, end: string) {
  if (!start || !end) return 1;
  const count = Math.round((new Date(`${end}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime()) / 86_400_000);
  return Math.max(1, count);
}
function addDays(start: string, days: number) {
  const date = new Date(`${start}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function AuthPage({ mode = "connexion" }: { mode?: string }) {
  const { profile, setProfile, notify } = useDemo();
  const { user, passwordRecovery, clearPasswordRecovery } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(profile.phone);
  const [name, setName] = useState(`${profile.firstName} ${profile.lastName}`);
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "inscription";
  const isOtp = mode === "otp";
  const isReset = mode === "mot-de-passe";
  const isRecovery = isReset && (passwordRecovery || (typeof window !== "undefined" && (window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).get("type") === "recovery")));

  useEffect(() => {
    if (user && mode === "connexion") setLocation("/");
  }, [mode, setLocation, user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    if (isOtp) {
      setLocation("/");
      notify(isSupabaseConfigured ? "Confirmez d’abord votre adresse e-mail pour vous connecter." : "Code de démonstration accepté · bienvenue sur ICIMO.");
      return;
    }

    if (!supabase) {
      if (isSignup) {
        const [firstName, ...last] = name.trim().split(" ");
        setProfile((current) => ({ ...current, firstName: firstName || "Aïcha", lastName: last.join(" ") || "Dossou", email, phone }));
      }
      if (!isReset) setLocation("/auth/otp");
      else {
        notify("Réinitialisation en démonstration · aucun e-mail n’est envoyé.");
        setLocation("/auth/connexion");
      }
      return;
    }

    setBusy(true);
    try {
      if (isRecovery) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        clearPasswordRecovery();
        notify("Mot de passe mis à jour avec Supabase.");
        setLocation("/auth/connexion");
        return;
      }

      if (isReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: getSupabaseRedirectUrl("/auth/mot-de-passe"),
        });
        if (error) throw error;
        notify("Si cette adresse existe, Supabase enverra un lien de réinitialisation.");
        setLocation("/auth/connexion");
        return;
      }

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim(), phone },
            emailRedirectTo: getSupabaseRedirectUrl("/auth/connexion"),
          },
        });
        if (error) throw error;
        if (data.session && data.user) {
          const [firstName, ...last] = name.trim().split(/\s+/);
          setProfile((current) => ({ ...current, firstName: firstName || "Utilisateur", lastName: last.join(" "), email: email.trim(), phone }));
          notify("Compte créé et connecté avec Supabase.");
          setLocation("/");
        } else {
          notify("Compte créé. Confirmez votre adresse e-mail avant de vous connecter.");
          setLocation("/auth/connexion");
        }
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (data.user) {
        const fullName = String(data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? data.user.email?.split("@")[0] ?? "Utilisateur");
        const [firstName, ...last] = fullName.trim().split(/\s+/);
        setProfile((current) => ({
          ...current,
          firstName: firstName || "Utilisateur",
          lastName: last.join(" "),
          email: data.user.email ?? email,
          phone: typeof data.user.user_metadata?.phone === "string" ? data.user.user_metadata.phone : current.phone,
        }));
      }
      notify("Connexion sécurisée avec Supabase.");
      setLocation("/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Connexion à Supabase impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  if (isOtp && isSupabaseConfigured) {
    return <section className="auth-page"><div className="auth-visual"><span className="eyebrow eyebrow-light">ICIMO · BÉNIN</span><h1>Votre adresse e-mail.<br /><em>Votre accès sécurisé.</em></h1><p>La confirmation de compte est gérée directement par Supabase.</p></div><div className="auth-card"><span className="eyebrow">VÉRIFICATION</span><h2>Consultez votre e-mail.</h2><p>Suivez le lien de confirmation envoyé par Supabase, puis connectez-vous à votre compte.</p><Link className="button button-primary button-block" href="/auth/connexion">Retour à la connexion <ArrowRight size={16} /></Link></div></section>;
  }

  return <section className="auth-page"><div className="auth-visual"><span className="eyebrow eyebrow-light">ICIMO · BÉNIN</span><h1>Une nouvelle adresse.<br /><em>De belles histoires.</em></h1><p>Un espace pour chercher, trouver et se sentir chez soi.</p><span className="auth-visual-note">{isSupabaseConfigured ? "Connexion sécurisée par Supabase." : "Mode démonstration · Supabase non configuré localement."}</span></div><div className="auth-card"><Link className="back-link" href="/"><ArrowLeft size={16} /> Retour à l’accueil</Link><span className="eyebrow">VOTRE ESPACE ICIMO</span><h2>{isRecovery ? "Choisissez un nouveau mot de passe." : isOtp ? "Vérifions votre numéro." : isSignup ? "Créons votre espace." : isReset ? "Un mot de passe à retrouver." : "Ravi de vous revoir."}</h2><p>{isRecovery ? "Définissez un nouveau mot de passe pour votre compte Supabase." : isOtp ? `Code de vérification envoyé à ${phone || email}. Saisissez un code fictif pour continuer.` : isSignup ? "Un seul compte pour réserver ou accueillir." : isReset ? "Indiquez l’e-mail de votre compte." : "Connectez-vous à votre compte ICIMO."}</p><form className="stack-form" onSubmit={submit}>{isSignup && <label>Nom complet<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Aïcha Dossou" /></label>}{(isSignup || isOtp) && <label>Téléphone<input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 61 00 00 00" /></label>}{!isOtp && !isRecovery && <label>Adresse e-mail<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" /></label>}{isOtp && <label>Code à 6 chiffres<input required inputMode="numeric" pattern="[0-9]{4,6}" maxLength={6} placeholder="000000" /></label>}{(isRecovery || (!isReset && !isOtp)) && <label>{isRecovery ? "Nouveau mot de passe" : "Mot de passe"}<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" /></label>}{mode === "connexion" && <div className="form-side-link"><span>Vous découvrez ICIMO ? <Link href="/auth/inscription">Créer un compte</Link></span><Link href="/auth/mot-de-passe">Mot de passe oublié ?</Link></div>}{errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}<button type="submit" className="button button-primary button-block" disabled={busy}>{busy ? "Connexion…" : isRecovery ? "Enregistrer le nouveau mot de passe" : isOtp ? "Continuer" : isSignup ? "Créer mon compte" : isReset ? "Envoyer le lien de réinitialisation" : "Se connecter"} <ArrowRight size={16} /></button></form><div className="auth-security"><LockKeyhole size={15} /><span>{isSupabaseConfigured ? "Authentification via Supabase · annonces et réservations encore en démonstration." : "Simulation locale uniquement · aucune donnée n’est envoyée."}</span></div></div></section>;
}

export function BookingPage({ slug }: { slug: string }) {
  const { properties, demoFee, setDraft } = useDemo();
  const [, setLocation] = useLocation();
  const property = properties.find((item) => item.slug === slug);
  const params = new URLSearchParams(window.location.search);
  const [kind, setKind] = useState<RentalKind>(params.get("type") === "longue" ? "long" : "short");
  const [start, setStart] = useState(todayPlus(14));
  const [end, setEnd] = useState(todayPlus(17));
  const [guests, setGuests] = useState("2");
  const [months, setMonths] = useState("1");
  useEffect(() => {
    if (kind === "short" && start && end <= start) setEnd(addDays(start, 1));
  }, [kind, start, end]);
  if (!property) return <section className="content-section empty-state"><h1>Logement introuvable</h1><Link href="/recherche" className="button button-dark">Revenir aux logements</Link></section>;

  const nights = nightsBetween(start, end);
  const subtotal = kind === "short" ? property.priceNight * nights : property.priceMonth * Number(months);
  const cleaning = kind === "short" ? 7000 : 0;
  const fee = Math.round(subtotal * demoFee / 100);
  const total = subtotal + cleaning + fee;
  const startDate = start || todayPlus(14);
  const endDate = kind === "long" ? addDays(startDate, 30 * Number(months)) : end || todayPlus(17);
  const canChooseShort = property.kind !== "long";
  const canChooseLong = property.kind !== "short";

  function continueFlow() {
    setDraft({ slug, kind, start: startDate, end: endDate, guests: Number(guests), nights: kind === "short" ? nights : 30 * Number(months), subtotal, cleaning, fee, total });
    setLocation(kind === "long" ? `/paiement/${slug}?type=longue` : `/paiement/${slug}`);
  }

  return <section className="content-section booking-flow-page"><div className="breadcrumb"><Link href={`/logement/${slug}`}>{property.title}</Link><span>/</span> {kind === "short" ? "Réservation" : "Demande longue durée"}</div><div className="flow-progress"><span className="flow-step active"><i>1</i> Vos dates</span><span className="flow-line" /><span className="flow-step"><i>2</i> Récapitulatif</span><span className="flow-line" /><span className="flow-step"><i>3</i> Confirmation</span></div><div className="booking-layout"><div className="booking-form-area"><span className="eyebrow">ÉTAPE 1 · VOTRE SÉJOUR</span><h1>{kind === "short" ? "Choisissez vos dates." : "Faisons connaissance."}</h1><p className="page-lede">{kind === "short" ? "Les prix et frais sont détaillés avant la confirmation." : "Décrivez votre projet ; le propriétaire reviendra vers vous dans le parcours réel."}</p><div className="rental-switch"><button className={kind === "short" ? "active" : ""} disabled={!canChooseShort} onClick={() => setKind("short")}>À la nuit</button><button className={kind === "long" ? "active" : ""} disabled={!canChooseLong} onClick={() => setKind("long")}>Au mois</button></div>{kind === "short" ? <div className="date-grid"><label>Arrivée<input type="date" min={todayPlus(0)} value={start} onChange={(e) => setStart(e.target.value)} /></label><label>Départ<input type="date" min={start} value={end} onChange={(e) => setEnd(e.target.value)} /></label><label className="guest-count-label">Voyageurs<select value={guests} onChange={(e) => setGuests(e.target.value)}>{Array.from({ length: property.guests }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} voyageur{index > 0 ? "s" : ""}</option>)}</select></label></div> : <div className="date-grid"><label>Date d’arrivée souhaitée<input type="date" min={todayPlus(0)} value={start} onChange={(e) => setStart(e.target.value)} /></label><label>Durée envisagée<select value={months} onChange={(e) => setMonths(e.target.value)}><option value="1">1 mois</option><option value="3">3 mois</option><option value="6">6 mois ou plus</option></select></label><label>Nombre d’occupants<select value={guests} onChange={(e) => setGuests(e.target.value)}>{Array.from({ length: property.guests }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} personne{index > 0 ? "s" : ""}</option>)}</select></label><label className="wide-field">Votre projet<textarea placeholder="Présentez brièvement votre demande (optionnel)." rows={3} /></label></div>}<div className="demo-notice"><ShieldCheck size={19} /><span><strong>Tout est encore en mode démo.</strong> Le logement, son calendrier et cette demande ne sont pas connectés au propriétaire.</span></div><button className="button button-primary button-block continue-button" onClick={continueFlow}>{kind === "short" ? "Continuer vers le paiement démo" : "Envoyer ma demande démo"} <ArrowRight size={17} /></button><Link className="back-link" href={`/logement/${slug}`}><ArrowLeft size={15} /> Retour à l’annonce</Link></div><aside className="checkout-summary"><img src={property.image} alt="" /><span className="eyebrow">VOTRE SÉLECTION</span><h3>{property.title}</h3><p>{property.district}, {property.city} · <Star size={14} fill="currentColor" /> {property.rating.toFixed(2)}</p><div className="divider" /><div className="mini-price-line"><span>{formatPrice(kind === "short" ? property.priceNight : property.priceMonth)} × {kind === "short" ? `${nights} nuit${nights > 1 ? "s" : ""}` : `${months} mois indicatifs`}</span><strong>{formatPrice(subtotal)}</strong></div>{kind === "short" && <div className="mini-price-line"><span>Ménage</span><strong>{formatPrice(cleaning)}</strong></div>}<div className="mini-price-line"><span>Commission de démo ({demoFee} %)</span><strong>{formatPrice(fee)}</strong></div><div className="divider" /><div className="total-line"><span>Total indicatif</span><strong>{formatPrice(total)}</strong></div><small>Le calcul et le tarif sont illustratifs. Aucun paiement réel ne sera initié.</small></aside></div></section>;
}

export function PaymentPage({ slug }: { slug: string }) {
  const { properties, draft, demoFee, setBookings, setDraft, setBlockedDates, setNotifications, notify } = useDemo();
  const [, setLocation] = useLocation();
  const property = properties.find((item) => item.slug === slug);
  if (!property) return <div className="content-section empty-state"><h1>Logement introuvable</h1><Link href="/recherche" className="button button-dark">Revenir à la recherche</Link></div>;
  if (!draft || draft.slug !== slug) return <section className="content-section empty-state"><span className="empty-icon"><CalendarDays /></span><h1>Aucune étape en cours</h1><p>Choisissez d’abord vos dates ou envoyez une demande de location.</p><Link className="button button-dark" href={`/reserver/${slug}`}>Reprendre le parcours</Link></section>;

  function complete() {
    if (!draft || !property) return;
    const currentDraft = draft;
    const currentProperty = property;
    const id = `IC-${String(Date.now()).slice(-6)}`;
    const status: DemoBooking["status"] = currentDraft.kind === "short" ? "confirmed" : "request";
    const booking: DemoBooking = { id, slug, kind: currentDraft.kind, status, start: currentDraft.start, end: currentDraft.end, guests: currentDraft.guests, total: currentDraft.total, createdAt: new Date().toISOString().slice(0, 10) };
    setBookings((items) => [booking, ...items]);
    if (currentDraft.kind === "short") {
      const days: string[] = [];
      const current = new Date(`${currentDraft.start}T12:00:00`);
      const finish = new Date(`${currentDraft.end}T12:00:00`);
      while (current < finish) {
        days.push(`${slug}:${current.toISOString().slice(0, 10)}`);
        current.setDate(current.getDate() + 1);
      }
      setBlockedDates((items) => Array.from(new Set([...items, ...days])));
    }
    setNotifications((items) => [{ id: `n-${id}`, title: currentDraft.kind === "short" ? "Réservation confirmée · démo" : "Demande transmise · démo", body: `${currentProperty.title} · ${formatDate(currentDraft.start)}`, time: "À l’instant", read: false, type: "booking" }, ...items]);
    setDraft(null);
    notify(currentDraft.kind === "short" ? "Séjour confirmé en démonstration." : "Demande envoyée en démonstration.");
    setLocation(`/confirmation/${id}`);
  }

  return <section className="content-section booking-flow-page"><div className="breadcrumb"><Link href={`/reserver/${slug}`}>Vos dates</Link><span>/</span> {draft.kind === "short" ? "Paiement" : "Demande"}</div><div className="flow-progress"><span className="flow-step done"><i>✓</i> Vos dates</span><span className="flow-line done" /><span className="flow-step active"><i>2</i> {draft.kind === "short" ? "Paiement" : "Récapitulatif"}</span><span className="flow-line" /><span className="flow-step"><i>3</i> Confirmation</span></div><div className="booking-layout"><div className="booking-form-area"><span className="eyebrow">ÉTAPE 2 · {draft.kind === "short" ? "PAIEMENT" : "DEMANDE"}</span><h1>{draft.kind === "short" ? "Un dernier regard." : "Votre demande est prête."}</h1><p className="page-lede">{draft.kind === "short" ? "Vérifiez votre récapitulatif avant le paiement de démonstration." : "Le propriétaire pourra examiner cette demande dans l’espace hôte de démonstration."}</p><div className="payment-method-card"><div className="payment-method-icon">{draft.kind === "short" ? <CreditCard /> : <MessageCircle />}</div><div><strong>{draft.kind === "short" ? "Paiement mobile · aperçu" : "Demande de location au mois"}</strong><p>{draft.kind === "short" ? "Dans la version connectée, les options locales de paiement seront proposées ici." : "Aucun paiement n’est demandé à cette étape."}</p></div><span className="demo-mini-pill">DÉMO</span></div>{draft.kind === "short" && <div className="demo-notice"><LockKeyhole size={19} /><span><strong>Vous ne serez pas débité.</strong> Le prestataire de paiement et la confirmation serveur ne sont pas connectés.</span></div>}{draft.kind === "long" && <div className="demo-notice"><ShieldCheck size={19} /><span><strong>Pas d’engagement financier.</strong> La signature de contrat et l’échéancier seront à définir avec le propriétaire.</span></div>}<button className="button button-primary button-block continue-button" onClick={complete}>{draft.kind === "short" ? "Simuler la confirmation du paiement" : "Envoyer la demande au propriétaire"} <ArrowRight size={17} /></button><button className="text-button" onClick={() => setLocation(`/reserver/${slug}?type=${draft.kind === "long" ? "longue" : "courte"}`)}><ArrowLeft size={15} /> Modifier les informations</button></div><aside className="checkout-summary"><img src={property.image} alt="" /><span className="eyebrow">RÉCAPITULATIF</span><h3>{property.title}</h3><p>{property.city} · {draft.kind === "short" ? `${draft.guests} voyageur${draft.guests > 1 ? "s" : ""}` : "Séjour longue durée"}</p><div className="divider" /><div className="mini-price-line"><span>Dates</span><strong>{formatDate(draft.start)} — {formatDate(draft.end)}</strong></div>{draft.kind === "long" && <><div className="mini-price-line"><span>Loyer mensuel indicatif</span><strong>{formatPrice(property.priceMonth)}</strong></div><div className="mini-price-line"><span>Durée</span><strong>{Math.max(1, Math.round(draft.nights / 30))} mois</strong></div></>}<div className="mini-price-line"><span>Hébergement · période</span><strong>{formatPrice(draft.subtotal)}</strong></div>{draft.cleaning > 0 && <div className="mini-price-line"><span>Ménage</span><strong>{formatPrice(draft.cleaning)}</strong></div>}<div className="mini-price-line"><span>Commission indicative ({demoFee} %)</span><strong>{formatPrice(draft.fee)}</strong></div><div className="divider" /><div className="total-line"><span>{draft.kind === "short" ? "Total de démonstration" : "Total indicatif pour la période"}</span><strong>{formatPrice(draft.total)}</strong></div></aside></div></section>;
}

export function ConfirmationPage({ bookingId }: { bookingId: string }) {
  const { bookings, properties } = useDemo();
  const booking = bookings.find((item) => item.id === bookingId) ?? bookings[0];
  const property = booking ? properties.find((item) => item.slug === booking.slug) : undefined;
  const isRequest = booking?.status === "request";
  const isAccepted = booking?.status === "accepted";
  const isDeclined = booking?.status === "declined";
  if (!booking) return <section className="content-section empty-state"><h1>Confirmation de démonstration</h1><Link href="/mes-reservations" className="button button-dark">Mes séjours</Link></section>;
  return <section className="content-section confirmation-page"><span className="confirmation-icon"><CheckCircle2 size={42} /></span><span className="eyebrow">{isDeclined ? "DEMANDE DÉCLINÉE · DÉMO" : isAccepted ? "DEMANDE ACCEPTÉE · CONTRAT À DÉFINIR · DÉMO" : isRequest ? "DEMANDE ENREGISTRÉE · DÉMO" : "RÉSERVATION CONFIRMÉE · DÉMO"}</span><h1>{isDeclined ? "Le logement n’est pas disponible pour ces dates." : isAccepted ? "Le propriétaire est d’accord ; prochaine étape : le contrat." : isRequest ? "Votre demande est bien partie." : "C’est noté, c’est chez vous."}</h1><p>{isDeclined ? "Le propriétaire a décliné cette demande de démonstration. Vous pouvez explorer d’autres logements." : isAccepted ? "La demande est acceptée en démonstration, mais le bail reste à définir et à signer. Il ne s’agit pas d’une réservation finale." : isRequest ? "La demande fictive est disponible dans l’espace propriétaire. Dans la version connectée, l’hôte pourra vous répondre ici." : "Une confirmation fictive est enregistrée dans ce navigateur. Aucun paiement n’a été réalisé."}</p><div className="confirmation-card"><img src={property?.image} alt="" /><div><span className="eyebrow">RÉFÉRENCE · {booking.id}</span><h3>{property?.title}</h3><p>{formatDate(booking.start)} — {formatDate(booking.end)} · {booking.guests} voyageur{booking.guests > 1 ? "s" : ""}</p><strong>{formatPrice(booking.total)}</strong></div></div><div className="confirmation-actions"><Link href={`/reservation/${booking.id}`} className="button button-primary">Voir le détail</Link><Link href="/mes-reservations" className="button button-outline">Mes séjours</Link><Link href="/recherche" className="text-link">Explorer d’autres logements</Link></div><small>ICIMO · confirmation de démonstration uniquement</small></section>;
}

function LeaseDetails({ booking, property }: { booking: DemoBooking; property: { title: string; priceMonth: number } }) {
  const [expanded, setExpanded] = useState(false);
  const durationMonths = Math.max(1, Math.round((new Date(`${booking.end}T12:00:00`).getTime() - new Date(`${booking.start}T12:00:00`).getTime()) / 86_400_000 / 30));
  const leaseStatus = booking.status === "request" ? "En attente d’examen · démo" : booking.status === "accepted" ? "Demande acceptée · bail à définir · démo" : booking.status === "confirmed" ? "Séjour confirmé · démo" : booking.status === "declined" ? "Demande déclinée · démo" : "À traiter · démo";
  const schedule = Array.from({ length: Math.min(durationMonths, 12) }, (_, index) => {
    const due = new Date(`${booking.start}T12:00:00`);
    due.setMonth(due.getMonth() + index);
    return { month: index + 1, date: due.toISOString().slice(0, 10) };
  });
  return <section className="lease-details"><div className="lease-heading"><span className="lease-icon"><FileText size={18} /></span><div><span className="eyebrow">LOCATION LONGUE DURÉE · DÉMO</span><h2>Contrat et échéancier</h2></div><span className={`status-pill ${booking.status === "confirmed" ? "status-confirmed" : "status-request"}`}>{leaseStatus}</span></div><div className="lease-overview"><div><small>Logement</small><strong>{property.title}</strong></div><div><small>Loyer mensuel indicatif</small><strong>{formatPrice(property.priceMonth)}</strong></div><div><small>Durée demandée</small><strong>{durationMonths} mois</strong></div></div><button className="text-button lease-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><FileText size={15} /> {expanded ? "Masquer le bail illustratif" : "Afficher le bail illustratif"}</button>{expanded && <div className="lease-contract"><strong>Projet de bail · sans valeur contractuelle</strong><p>Ce document d’aperçu résume la demande de démonstration. Il n’est ni signé, ni validé par un propriétaire, ni opposable et ne crée aucun engagement. Les clauses, dépôt de garantie et conditions devront être établis dans le véritable service.</p><div><span>Locataire</span><strong>Profil de démonstration ICIMO</strong></div><div><span>Statut</span><strong>{leaseStatus}</strong></div></div>}<div className="lease-payment-plan"><div className="panel-heading"><div><h3>Échéancier illustratif</h3><p>Aucun paiement ni prélèvement n’est programmé.</p></div><Wallet size={18} /></div>{schedule.map((item) => <div className="lease-payment-row" key={item.month}><span className="lease-payment-icon"><CalendarDays size={15} /></span><span><strong>Mois {item.month}</strong><small>Échéance indicative · {formatDate(item.date)}</small></span><strong>{formatPrice(property.priceMonth)}</strong><span className="status-pill">À définir · démo</span></div>)}{durationMonths > 12 && <small className="lease-truncated-note">Aperçu limité aux 12 premières échéances.</small>}</div><div className="demo-notice"><ShieldCheck size={17} /><span>Le bail et l’échéancier sont purement illustratifs. Aucune signature, réservation longue durée ni transaction réelle n’est effectuée.</span></div></section>;
}

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const { bookings, properties, reviews } = useDemo();
  const booking = bookings.find((item) => item.id === bookingId);
  const property = booking ? properties.find((item) => item.slug === booking.slug) : undefined;
  if (!booking || !property) return <section className="content-section empty-state"><h1>Séjour introuvable</h1><Link href="/mes-reservations" className="button button-dark">Mes séjours</Link></section>;
  const eligible = booking.status === "confirmed" && booking.end < new Date().toISOString().slice(0, 10);
  const reviewed = reviews.includes(booking.id) || booking.reviewed;
  const statusClass = booking.status === "confirmed" ? "status-confirmed" : "status-request";
  const statusLabel = booking.status === "confirmed" ? "Confirmée · démo" : booking.status === "accepted" ? "Demande acceptée · bail à définir · démo" : booking.status === "declined" ? "Demande déclinée · démo" : booking.status === "pending" ? "En attente · démo" : "Demande envoyée · démo";
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/mes-reservations">Mes séjours</Link><span>/</span> Détail</div><span className="eyebrow">RÉFÉRENCE {booking.id} · DONNÉES DE DÉMO</span><h1>Le détail de votre séjour.</h1><article className="booking-detail-card"><img src={property.image} alt="" /><div><span className={`status-pill ${statusClass}`}>{statusLabel}</span><h2>{property.title}</h2><p>{property.district}, {property.city} · localisation approximative</p><div className="mini-price-line"><span>Dates</span><strong>{formatDate(booking.start)} → {formatDate(booking.end)}</strong></div><div className="mini-price-line"><span>Voyageurs</span><strong>{booking.guests}</strong></div><div className="mini-price-line"><span>{booking.kind === "long" ? "Total indicatif de la période" : "Total indicatif"}</span><strong>{formatPrice(booking.total)}</strong></div>{booking.status === "declined" && <div className="demo-notice"><ShieldCheck size={17} /><span>Cette demande longue durée a été déclinée dans la démonstration. Aucun engagement n’a été pris.</span></div>}{booking.status === "accepted" && <div className="demo-notice"><ShieldCheck size={17} /><span>Le propriétaire a accepté la demande en démonstration ; le bail reste à définir et à signer.</span></div>}<div className="detail-action-row"><Link className="button button-outline" href="/messages">Contacter le propriétaire</Link>{eligible && !reviewed && <Link className="button button-primary" href="/avis">Laisser un avis</Link>}</div>{reviewed && <p className="review-saved"><Check size={15} /> Votre avis de démonstration a été enregistré.</p>}</div></article>{booking.kind === "long" && <LeaseDetails booking={booking} property={property} />}<div className="demo-notice"><ShieldCheck size={18} /><span>Les paiements, messages, coordonnées et confirmations sont fictifs. Une réservation réelle nécessitera le backend ICIMO.</span></div></section>;
}

export function ChatPage() {
  const { messages, setMessages, notify } = useDemo();
  const [draft, setDraft] = useState("");
  function send(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setMessages((items) => [...items, { id: `m-${Date.now()}`, from: "me", text: draft.trim(), time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date()) }]);
    setDraft("");
    notify("Message ajouté à la conversation de démonstration.");
  }
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/">Accueil</Link><span>/</span> Messages</div><div className="section-heading"><div><span className="eyebrow">CONVERSATIONS</span><h1>On reste en contact.</h1><p>Messagerie locale de démonstration · aucun envoi réel.</p></div><button className="button button-outline button-small" onClick={() => notify("L’appel Internet est une évolution prévue au-delà du MVP.")}>Appel Internet · à venir</button></div><div className="chat-panel"><aside className="chat-contacts"><h3>Vos conversations</h3><button className="chat-contact active"><span className="avatar">MA</span><span><strong>Mina A.</strong><small>La terrasse de Fidjrossè</small></span><i className="online-dot" /></button><button className="chat-contact" onClick={() => notify("Les autres conversations apparaîtront après une réservation.")}><span className="avatar avatar-muted">JD</span><span><strong>Josué D.</strong><small>Le studio des bonnes adresses</small></span></button></aside><div className="chat-content"><header className="chat-header"><span className="avatar">MA</span><div><strong>Mina A.</strong><small><BadgeCheck size={12} /> Hôte fictive · à Fidjrossè</small></div><Link href="/logement/terrasse-fidjrosse" className="text-link">Voir l’annonce <ArrowRight size={14} /></Link></header><div className="chat-message-stream">{messages.map((message) => <div key={message.id} className={`message-bubble ${message.from === "me" ? "message-mine" : "message-theirs"}`}><p>{message.text}</p><time>{message.time}</time></div>)}</div><div className="chat-demo-info">Les messages sont conservés uniquement dans l’état local de cette démonstration.</div><form className="chat-compose" onSubmit={send}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Écrire un message…" aria-label="Écrire un message" /><button type="submit" className="button button-primary">Envoyer</button></form></div></div></section>;
}

export function NotificationsPage() {
  const { notifications, setNotifications } = useDemo();
  function markAll() { setNotifications((items) => items.map((item) => ({ ...item, read: true }))); }
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/">Accueil</Link><span>/</span> Notifications</div><div className="section-heading"><div><span className="eyebrow">VOS NOUVELLES</span><h1>Tout reste à portée de main.</h1><p>Notifications de démonstration · aucun push réel.</p></div><button onClick={markAll} className="text-button">Tout marquer comme lu <Check size={15} /></button></div><div className="notification-list">{notifications.map((item) => <article key={item.id} className={`notification-row ${item.read ? "read" : ""}`}><span className="notification-icon">{item.type === "booking" ? <CalendarDays /> : item.type === "message" ? <MessageCircle /> : item.type === "account" ? <UserRound /> : <Bell />}</span><div><h3>{item.title}</h3><p>{item.body}</p><small>{item.time}</small></div>{!item.read && <i className="unread-dot" />}</article>)}</div></section>;
}

export function ProfilePage() {
  const { profile, bookings, favorites, setProfile, notify } = useDemo();
  const [, setLocation] = useLocation();
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
  function save(event: FormEvent) { event.preventDefault(); notify("Profil de démonstration enregistré sur cet appareil."); }
  function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) { notify("Choisissez une image de moins de 1 Mo pour cette démonstration locale."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfile((current) => ({ ...current, avatar: reader.result as string }));
        notify("Photo de profil prévisualisée localement.");
      }
    };
    reader.readAsDataURL(file);
  }
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/">Accueil</Link><span>/</span> Profil</div><div className="section-heading"><div><span className="eyebrow">VOTRE ESPACE</span><h1>Ravi de vous accueillir, {profile.firstName}.</h1><p>Compte unique de démonstration · client et propriétaire.</p></div></div><div className="profile-grid"><div className="profile-sidebar"><div className="profile-intro-card"><label className="avatar-photo-editor" aria-label="Modifier la photo du profil"><span className="avatar profile-avatar">{profile.avatar ? <img src={profile.avatar} alt="Photo de profil" /> : initials}</span><span>Modifier la photo</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={changePhoto} /></label><h2>{profile.firstName} {profile.lastName}</h2><p>{profile.email}</p><span className="status-pill status-confirmed">Profil de démonstration</span></div><Link href="/hote" className="profile-shortcut"><span className="shortcut-mark">⌂</span><span><strong>Passer en mode propriétaire</strong><small>Gérer vos annonces et séjours</small></span><ChevronRight size={17} /></Link><Link href="/admin" className="profile-shortcut"><span className="shortcut-mark">IC</span><span><strong>Console de démonstration</strong><small>Interface d’administration</small></span><ChevronRight size={17} /></Link></div><div className="profile-main"><form className="profile-form" onSubmit={save}><h2>Vos informations</h2><p>Les changements sont enregistrés localement dans cette démo.</p><div className="form-two-col"><label>Prénom<input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></label><label>Nom<input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></label></div><label>E-mail<input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label><label>Téléphone<input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label><div className="profile-form-footer"><span><ShieldCheck size={15} /> Vos informations ne quittent pas ce navigateur.</span><button className="button button-primary" type="submit">Enregistrer</button></div></form><div className="profile-stats"><div><Heart size={19} /><strong>{favorites.length}</strong><span>Favoris</span></div><div><CalendarDays size={19} /><strong>{bookings.length}</strong><span>Séjours</span></div><div><Mail size={19} /><strong>1</strong><span>Conversation</span></div></div><div className="profile-link-grid"><Link href="/favoris">Mes favoris <ArrowRight size={16} /></Link><Link href="/mes-reservations">Mes séjours <ArrowRight size={16} /></Link><Link href="/messages">Messages <ArrowRight size={16} /></Link><Link href="/notifications">Notifications <ArrowRight size={16} /></Link><Link href="/recherches-sauvegardees">Recherches sauvegardées <ArrowRight size={16} /></Link><Link href="/parametres">Paramètres du compte <ArrowRight size={16} /></Link></div><button className="danger-link" onClick={() => setLocation("/parametres#suppression")}>Suppression du compte</button></div></div></section>;
}

export function SettingsPage() {
  const { notify, preferences, setPreferences } = useDemo();
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/profil">Mon profil</Link><span>/</span> Paramètres</div><span className="eyebrow">VOTRE COMPTE</span><h1>À votre manière.</h1><div className="settings-card"><div><Bell /><span><strong>Notifications par e-mail</strong><small>Rappels de réservation et nouveaux messages · mode démo</small></span><input aria-label="Notifications par e-mail" type="checkbox" checked={preferences.email} onChange={(event) => setPreferences((current) => ({ ...current, email: event.target.checked }))} /></div><div><MessageCircle /><span><strong>Notifications SMS</strong><small>Alertes importantes sur le téléphone · mode démo</small></span><input aria-label="Notifications SMS" type="checkbox" checked={preferences.sms} onChange={(event) => setPreferences((current) => ({ ...current, sms: event.target.checked }))} /></div><div><ShieldCheck /><span><strong>Vie privée et sécurité</strong><small>Le futur backend contrôlera les autorisations et les documents privés.</small></span><button className="text-link" onClick={() => notify("Authentification, RLS et documents privés seront configurés côté backend.")}>En savoir plus</button></div></div><button className="button button-outline" onClick={() => notify("Préférences enregistrées localement pour la démo.")}>Enregistrer mes préférences</button><section className="delete-account" id="suppression"><span className="eyebrow">ZONE SENSIBLE</span><h2>Suppression du compte</h2><p>Cette interface ne possède aucun compte réel à supprimer. À terme, ICIMO devra expliquer les données légalement conservées avant toute suppression effective.</p>{!confirmDelete ? <button className="danger-button" onClick={() => setConfirmDelete(true)}>Compris, ouvrir la confirmation</button> : <div className="delete-confirm"><strong>Confirmation de démonstration</strong><p>Aucune donnée réelle ne sera supprimée.</p><button className="danger-button" onClick={() => { setConfirmDelete(false); notify("Aucune suppression effectuée : mode démo."); }}>Confirmer (démo uniquement)</button><button className="text-button" onClick={() => setConfirmDelete(false)}>Annuler</button></div>}</section></section>;
}

export function SavedSearchesPage() {
  const { searches, setSearches, notify } = useDemo();
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/profil">Mon profil</Link><span>/</span> Recherches</div><span className="eyebrow">VOS RECHERCHES</span><h1>Reprenez où vous en étiez.</h1>{searches.length ? <div className="saved-search-list">{searches.map((search) => <article key={search.id}><div className="saved-search-mark"><Search size={18} /></div><div><strong>{search.city}</strong><p>{search.kind === "long" ? "Longue durée" : search.kind === "short" ? "Courte durée" : "Toutes durées"} · {search.arrival ? `${search.arrival} — ${search.departure ?? ""}` : "dates flexibles"} · {search.guests ?? 1} voyageur{(search.guests ?? 1) > 1 ? "s" : ""} · enregistrée le {search.date}</p></div><Link href={`/recherche?destination=${encodeURIComponent(search.city)}&type=${encodeURIComponent(search.kind)}${search.arrival ? `&arrivee=${encodeURIComponent(search.arrival)}` : ""}${search.departure ? `&depart=${encodeURIComponent(search.departure)}` : ""}&voyageurs=${search.guests ?? 1}`} className="button button-outline button-small">Relancer</Link><button aria-label="Supprimer la recherche" className="remove-search" onClick={() => { setSearches((items) => items.filter((item) => item.id !== search.id)); notify("Recherche retirée."); }}>×</button></article>)}</div> : <div className="empty-state"><span className="empty-icon"><Heart /></span><h2>Aucune recherche sauvegardée</h2><p>Dans les résultats, sélectionnez « Sauvegarder cette recherche » pour la retrouver ici.</p><Link href="/recherche" className="button button-dark">Lancer une recherche</Link></div>}</section>;
}

export function ReviewsPage() {
  const { bookings, properties, reviews, setReviews, notify } = useDemo();
  const eligible = bookings.filter((booking) => booking.status === "confirmed" && booking.end < new Date().toISOString().slice(0, 10) && !reviews.includes(booking.id) && !booking.reviewed);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [selected, setSelected] = useState(eligible[0]?.id ?? "");
  const [posted, setPosted] = useState(false);
  const booking = eligible.find((item) => item.id === selected);
  const property = booking ? properties.find((item) => item.slug === booking.slug) : undefined;
  function submit(event: FormEvent) { event.preventDefault(); if (!booking) return; setReviews((items) => [...items, booking.id]); setPosted(true); notify("Votre avis de démonstration est publié."); }
  return <section className="content-section page-section"><div className="breadcrumb"><Link href="/mes-reservations">Mes séjours</Link><span>/</span> Avis</div><span className="eyebrow">APRÈS LE SÉJOUR</span><h1>Les expériences se partagent.</h1><p className="page-lede">Un avis n’est proposé que pour un séjour terminé et confirmé. Les avis ici restent fictifs.</p>{eligible.length && !posted && booking && property ? <form className="review-form" onSubmit={submit}><div className="review-form-property"><img src={property.image} alt="" /><div><span className="eyebrow">SÉJOUR TERMINÉ · {booking.id}</span><h2>{property.title}</h2><small>{formatDate(booking.start)} — {formatDate(booking.end)}</small></div></div><label>Votre note</label><div className="star-picker" role="group" aria-label="Choisir une note">{[1, 2, 3, 4, 5].map((score) => <button key={score} type="button" aria-label={`${score} étoiles`} onClick={() => setRating(score)}><Star fill={score <= rating ? "currentColor" : "none"} /></button>)}</div><label>Votre expérience<textarea rows={5} value={text} required minLength={8} onChange={(e) => setText(e.target.value)} placeholder="Qu’est-ce qui a rendu ce séjour mémorable ?" /></label><button className="button button-primary">Publier mon avis (démo)</button></form> : posted ? <div className="empty-state"><span className="confirmation-icon"><CheckCircle2 /></span><h2>Merci pour votre retour.</h2><p>Votre avis de démonstration est associé au séjour terminé.</p><Link href="/mes-reservations" className="button button-dark">Retour aux séjours</Link></div> : <div className="empty-state"><span className="empty-icon"><Star /></span><h2>Pas encore d’avis à laisser.</h2><p>Une réservation confirmée et terminée fera apparaître le formulaire ici.</p><Link className="button button-outline" href="/mes-reservations">Voir mes séjours</Link></div>}</section>;
}

export function BookingRecordsNote({ booking }: { booking: DemoBooking }) {
  const kindLabel = booking.kind === "short" ? "Courte durée" : "Longue durée";
  return <span className="status-pill">{kindLabel} · {booking.id}</span>;
}

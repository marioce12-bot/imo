import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, FileText, LockKeyhole, ShieldCheck, Upload } from "lucide-react";
import { useDemo } from "@/components/DemoStore";

export default function HostVerificationPage() {
  const { notify } = useDemo();
  const [documentType, setDocumentType] = useState("piece");
  const [filename, setFilename] = useState("");
  const [checked, setChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    notify("Demande de vérification ajoutée à la démonstration.");
  }
  if (submitted) return <section className="content-section verification-page page-section"><span className="confirmation-icon"><CheckCircle2 size={40} /></span><span className="eyebrow">DEMANDE ENREGISTRÉE · DÉMO</span><h1>Votre démarche est notée.</h1><p>Dans le vrai service, l’équipe ICIMO examinerait les documents privés et vous informerait du résultat. Aucun document n’a été envoyé dans cette démonstration.</p><div className="verification-status-card"><BadgeCheck /><span><strong>Statut</strong><small>En attente de revue · illustration locale</small></span></div><Link className="button button-primary" href="/hote">Retour à l’espace propriétaire</Link></section>;
  return <section className="content-section verification-page page-section"><div className="breadcrumb"><Link href="/hote">Espace propriétaire</Link><span>/</span> Vérification</div><Link href="/hote" className="back-link"><ArrowLeft size={15} /> Retour au tableau de bord</Link><div className="verification-intro"><span className="verification-shield"><ShieldCheck /></span><div><span className="eyebrow">CONFIANCE & TRANSPARENCE</span><h1>Faisons vérifier votre profil.</h1><p>Un badge de vérification peut aider les voyageurs à réserver plus sereinement. Cette étape présente le futur parcours, sans traiter de document réel.</p></div></div><form className="verification-form" onSubmit={submit}><label>Type de justificatif<select value={documentType} onChange={(e) => setDocumentType(e.target.value)}><option value="piece">Pièce d’identité</option><option value="domicile">Justificatif de domicile</option><option value="entreprise">Document professionnel</option></select></label><label className="verification-upload"><Upload /><strong>{filename || "Choisir un document (aperçu local)"}</strong><small>Le fichier reste dans cette session et n’est ni stocké ni envoyé.</small><input type="file" accept="image/*,.pdf" onChange={(e) => setFilename(e.target.files?.[0]?.name ?? "")} /></label><label className="verification-consent"><input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} required /><span>Je comprends que la vérification réelle devra être traitée côté serveur et que les documents devront rester privés.</span></label><div className="demo-notice"><LockKeyhole size={18} /><span><strong>Confidentialité en démo.</strong> Ne sélectionnez pas de document sensible ici : aucun mécanisme sécurisé de transfert ou de stockage n’est connecté.</span></div><button className="button button-primary" type="submit" disabled={!checked}>Simuler une demande <ArrowRight size={16} /></button></form><div className="verification-steps"><div><i>01</i><span><strong>Envoyer</strong><small>Dans la vraie application, dépôt chiffré et privé.</small></span></div><div><i>02</i><span><strong>Vérifier</strong><small>Revue par l’équipe ICIMO et journal d’audit.</small></span></div><div><i>03</i><span><strong>Afficher</strong><small>Badge visible après validation réelle.</small></span></div></div></section>;
}

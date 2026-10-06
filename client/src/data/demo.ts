export type RentalKind = "short" | "long";
export type ListingType = "short" | "long" | "both";

export interface Property {
  slug: string;
  title: string;
  city: string;
  district: string;
  image: string;
  priceNight: number;
  priceMonth: number;
  rating: number;
  reviewCount: number;
  beds: number;
  baths: number;
  guests: number;
  area: number;
  kind: ListingType;
  verified: boolean;
  furnished: boolean;
  featured?: boolean;
  coordinates: [number, number];
  owner: string;
  ownerInitials: string;
  summary: string;
  amenities: string[];
  rules: string[];
}

const images = {
  featured: "/assets/icimo-photo-1.webp",
  fidjrosse: "/assets/icimo-photo-2.webp",
  city: "/assets/icimo-photo-3.webp",
  calavi: "/assets/icimo-photo-4.webp",
  popo: "/assets/icimo-photo-5.webp",
};

export const seedProperties: Property[] = [
  {
    slug: "terrasse-fidjrosse",
    title: "La terrasse de Fidjrossè",
    city: "Cotonou",
    district: "Fidjrossè",
    image: images.featured,
    priceNight: 42000,
    priceMonth: 420000,
    rating: 4.92,
    reviewCount: 28,
    beds: 2,
    baths: 2,
    guests: 4,
    area: 86,
    kind: "both",
    verified: true,
    furnished: true,
    featured: true,
    coordinates: [68, 36],
    owner: "Mina A.",
    ownerInitials: "MA",
    summary:
      "Un appartement lumineux et apaisant, à quelques minutes des bonnes adresses de Fidjrossè. Bois chaleureux, terrasse végétalisée et tout le confort pour poser ses valises.",
    amenities: ["Wi-Fi", "Climatisation", "Cuisine équipée", "Terrasse", "Parking", "Eau chaude"],
    rules: ["Arrivée dès 14 h", "Pas de fête", "Logement non-fumeur"],
  },
  {
    slug: "jardin-fidjrosse",
    title: "Un cocon près de la plage",
    city: "Cotonou",
    district: "Fidjrossè",
    image: images.fidjrosse,
    priceNight: 30000,
    priceMonth: 350000,
    rating: 4.87,
    reviewCount: 19,
    beds: 2,
    baths: 1,
    guests: 3,
    area: 72,
    kind: "short",
    verified: true,
    furnished: true,
    coordinates: [62, 62],
    owner: "Armand K.",
    ownerInitials: "AK",
    summary:
      "Un lieu simple et bien pensé pour profiter de Cotonou : un beau séjour, de la lumière et un quartier vivant à portée de main.",
    amenities: ["Wi-Fi", "Climatisation", "Cuisine équipée", "Lave-linge", "Eau chaude"],
    rules: ["Arrivée dès 15 h", "Pas de fête", "Animaux sur demande"],
  },
  {
    slug: "studio-centre",
    title: "Le studio des bonnes adresses",
    city: "Cotonou",
    district: "Haie Vive",
    image: images.city,
    priceNight: 24500,
    priceMonth: 295000,
    rating: 4.81,
    reviewCount: 14,
    beds: 1,
    baths: 1,
    guests: 2,
    area: 48,
    kind: "both",
    verified: true,
    furnished: true,
    coordinates: [45, 38],
    owner: "Josué D.",
    ownerInitials: "JD",
    summary:
      "Un pied-à-terre calme et fonctionnel, idéal pour le travail comme pour découvrir les cafés et restaurants du quartier.",
    amenities: ["Wi-Fi", "Climatisation", "Kitchenette", "Bureau", "Gardien"],
    rules: ["Arrivée flexible à convenir", "Logement non-fumeur"],
  },
  {
    slug: "calavi-vert",
    title: "La chambre claire de Calavi",
    city: "Abomey-Calavi",
    district: "Zogbadjè",
    image: images.calavi,
    priceNight: 22000,
    priceMonth: 240000,
    rating: 4.76,
    reviewCount: 11,
    beds: 2,
    baths: 1,
    guests: 3,
    area: 64,
    kind: "long",
    verified: false,
    furnished: true,
    coordinates: [72, 72],
    owner: "Élodie S.",
    ownerInitials: "ES",
    summary:
      "Un appartement meublé et tranquille, avec une chambre spacieuse et les essentiels du quotidien. Disponible pour un séjour au mois.",
    amenities: ["Cuisine équipée", "Ventilateur", "Parking", "Eau courante"],
    rules: ["Contrat de location à établir", "Durée minimum : 1 mois"],
  },
  {
    slug: "maison-grand-popo",
    title: "Le jardin salé de Grand-Popo",
    city: "Grand-Popo",
    district: "Avlo",
    image: images.popo,
    priceNight: 38000,
    priceMonth: 390000,
    rating: 4.95,
    reviewCount: 33,
    beds: 3,
    baths: 2,
    guests: 6,
    area: 112,
    kind: "short",
    verified: true,
    furnished: true,
    coordinates: [36, 79],
    owner: "Célestin T.",
    ownerInitials: "CT",
    summary:
      "Une maison paisible ouverte sur un jardin tropical, parfaite pour se retrouver et ralentir au bord de la côte béninoise.",
    amenities: ["Jardin", "Terrasse", "Cuisine équipée", "Ventilateur", "Parking"],
    rules: ["Arrivée dès 14 h", "Respect du voisinage", "Animaux sur demande"],
  },
];

export interface DemoBooking {
  id: string;
  slug: string;
  kind: RentalKind;
  status: "confirmed" | "request" | "pending" | "accepted" | "declined";
  start: string;
  end: string;
  guests: number;
  total: number;
  createdAt: string;
  reviewed?: boolean;
}

export interface DraftBooking {
  slug: string;
  kind: RentalKind;
  start: string;
  end: string;
  guests: number;
  nights: number;
  subtotal: number;
  cleaning: number;
  fee: number;
  total: number;
}

export const seedBookings: DemoBooking[] = [
  {
    id: "IC-240819",
    slug: "studio-centre",
    kind: "short",
    status: "confirmed",
    start: "2026-09-12",
    end: "2026-09-16",
    guests: 2,
    total: 118800,
    createdAt: "2026-08-19",
  },
  {
    id: "IC-241006",
    slug: "calavi-vert",
    kind: "long",
    status: "request",
    start: "2026-11-01",
    end: "2027-02-01",
    guests: 2,
    total: Math.round((seedProperties.find((property) => property.slug === "calavi-vert")?.priceMonth ?? 0) * 3 * 1.1),
    createdAt: "2026-10-06",
  },
];

export interface DemoMessage {
  id: string;
  from: "me" | "host";
  text: string;
  time: string;
}

export const seedMessages: DemoMessage[] = [
  { id: "m1", from: "host", text: "Bonjour Aïcha, avec plaisir ! Le logement est prêt pour votre arrivée à partir de 14 h.", time: "09:42" },
  { id: "m2", from: "me", text: "Merci Mina, est-ce qu'il y a un parking sur place ?", time: "09:46" },
  { id: "m3", from: "host", text: "Oui, une place est réservée dans la cour. Je vous enverrai les indications avant votre arrivée.", time: "09:51" },
];

export interface DemoNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "booking" | "message" | "account" | "system";
}

export const seedNotifications: DemoNotification[] = [
  { id: "n1", title: "Votre séjour approche", body: "Le studio des bonnes adresses vous attend la semaine prochaine.", time: "Aujourd’hui", read: false, type: "booking" },
  { id: "n2", title: "Nouveau message de Mina", body: "Je vous enverrai les indications avant votre arrivée.", time: "Hier", read: false, type: "message" },
  { id: "n3", title: "Profil complété", body: "Votre numéro de téléphone a bien été ajouté à votre profil de démonstration.", time: "12 sept.", read: true, type: "account" },
];

export interface SavedSearch {
  id: string;
  city: string;
  kind: string;
  date: string;
  arrival?: string;
  departure?: string;
  guests?: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

export const seedProfile: UserProfile = {
  firstName: "Aïcha",
  lastName: "Dossou",
  email: "aicha.dossou@example.com",
  phone: "+229 61 00 00 00",
};

export function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString("fr-FR")} F CFA`;
}

export function listingPrice(property: Property, kind?: RentalKind): { amount: number; unit: string } {
  const monthly = kind === "long" || (kind === undefined && property.kind === "long");
  return monthly
    ? { amount: property.priceMonth, unit: "/ mois" }
    : { amount: property.priceNight, unit: "/ nuit" };
}

export function formatDate(value: string): string {
  if (!value) return "À définir";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

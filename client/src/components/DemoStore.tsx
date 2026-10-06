import { createContext, useContext, useEffect, useMemo, useRef, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from "react";
import { seedBookings, seedMessages, seedNotifications, seedProfile, seedProperties, type DemoBooking, type DemoMessage, type DemoNotification, type DraftBooking, type Property, type SavedSearch, type UserProfile } from "@/data/demo";

type DemoMode = "client" | "owner";
type DemoPreferences = { email: boolean; sms: boolean };

interface DemoState {
  mode: DemoMode;
  setMode: Dispatch<SetStateAction<DemoMode>>;
  properties: Property[];
  setProperties: Dispatch<SetStateAction<Property[]>>;
  favorites: string[];
  setFavorites: Dispatch<SetStateAction<string[]>>;
  bookings: DemoBooking[];
  setBookings: Dispatch<SetStateAction<DemoBooking[]>>;
  draft: DraftBooking | null;
  setDraft: Dispatch<SetStateAction<DraftBooking | null>>;
  messages: DemoMessage[];
  setMessages: Dispatch<SetStateAction<DemoMessage[]>>;
  notifications: DemoNotification[];
  setNotifications: Dispatch<SetStateAction<DemoNotification[]>>;
  searches: SavedSearch[];
  setSearches: Dispatch<SetStateAction<SavedSearch[]>>;
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
  blockedDates: string[];
  setBlockedDates: Dispatch<SetStateAction<string[]>>;
  reviews: string[];
  setReviews: Dispatch<SetStateAction<string[]>>;
  demoFee: number;
  setDemoFee: Dispatch<SetStateAction<number>>;
  preferences: DemoPreferences;
  setPreferences: Dispatch<SetStateAction<DemoPreferences>>;
  toast: string;
  notify: (message: string) => void;
}

const DemoContext = createContext<DemoState | null>(null);

function useStoredState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const saved = window.localStorage.getItem(`icimo:${key}`);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(`icimo:${key}`, JSON.stringify(state));
    } catch {
      // Local persistence is optional in the demonstration.
    }
  }, [key, state]);

  return [state, setState];
}

export function DemoProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useStoredState<DemoMode>("mode", "client");
  const [properties, setProperties] = useStoredState("properties", seedProperties);
  const [favorites, setFavorites] = useStoredState<string[]>("favorites", ["terrasse-fidjrosse"]);
  const [bookings, setBookings] = useStoredState("bookings", seedBookings);
  const [draft, setDraft] = useStoredState<DraftBooking | null>("draft", null);
  const [messages, setMessages] = useStoredState("messages", seedMessages);
  const [notifications, setNotifications] = useStoredState("notifications", seedNotifications);
  const [searches, setSearches] = useStoredState<SavedSearch[]>("searches", []);
  const [profile, setProfile] = useStoredState("profile", seedProfile);
  const [blockedDates, setBlockedDates] = useStoredState<string[]>("blockedDates", []);
  const [reviews, setReviews] = useStoredState<string[]>("reviews", []);
  const [demoFee, setDemoFee] = useStoredState("demo-fee", 10);
  const [preferences, setPreferences] = useStoredState<DemoPreferences>("preferences", { email: true, sms: true });
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3400);
  };

  const value = useMemo<DemoState>(() => ({
    mode, setMode, properties, setProperties, favorites, setFavorites,
    bookings, setBookings, draft, setDraft, messages, setMessages,
    notifications, setNotifications, searches, setSearches, profile, setProfile,
    blockedDates, setBlockedDates, reviews, setReviews, demoFee, setDemoFee, preferences, setPreferences,
    toast, notify,
  }), [mode, setMode, properties, setProperties, favorites, setFavorites, bookings, setBookings,
    draft, setDraft, messages, setMessages, notifications, setNotifications, searches, setSearches,
    profile, setProfile, blockedDates, setBlockedDates, reviews, setReviews, demoFee, setDemoFee,
    preferences, setPreferences, toast]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoState {
  const value = useContext(DemoContext);
  if (!value) throw new Error("useDemo doit être utilisé dans DemoProvider");
  return value;
}

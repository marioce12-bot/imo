import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { DemoProvider } from "@/components/DemoStore";
import BrandShell from "@/components/BrandShell";
import NotFound from "@/pages/NotFound";

const HomePage = lazy(() => import("@/pages/Discovery").then((module) => ({ default: module.HomePage })));
const SearchPage = lazy(() => import("@/pages/Discovery").then((module) => ({ default: module.SearchPage })));
const PropertyPage = lazy(() => import("@/pages/Discovery").then((module) => ({ default: module.PropertyPage })));
const BookingsPage = lazy(() => import("@/pages/Discovery").then((module) => ({ default: module.BookingsPage })));
const FavoritesPage = lazy(() => import("@/pages/Discovery").then((module) => ({ default: module.FavoritesPage })));
const AuthPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.AuthPage })));
const BookingPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.BookingPage })));
const PaymentPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.PaymentPage })));
const ConfirmationPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.ConfirmationPage })));
const BookingDetailPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.BookingDetailPage })));
const ChatPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.ChatPage })));
const NotificationsPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.NotificationsPage })));
const ProfilePage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.ProfilePage })));
const SettingsPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.SettingsPage })));
const SavedSearchesPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.SavedSearchesPage })));
const ReviewsPage = lazy(() => import("@/pages/Account").then((module) => ({ default: module.ReviewsPage })));
const AdminPage = lazy(() => import("@/pages/Admin"));
const HostDashboardPage = lazy(() => import("@/pages/Host").then((module) => ({ default: module.HostDashboardPage })));
const HostListingsPage = lazy(() => import("@/pages/Host").then((module) => ({ default: module.HostListingsPage })));
const ListingEditorPage = lazy(() => import("@/pages/Host").then((module) => ({ default: module.ListingEditorPage })));
const HostCalendarPage = lazy(() => import("@/pages/Host").then((module) => ({ default: module.HostCalendarPage })));
const HostRequestsPage = lazy(() => import("@/pages/Host").then((module) => ({ default: module.HostRequestsPage })));
const HostRevenuePage = lazy(() => import("@/pages/Host").then((module) => ({ default: module.HostRevenuePage })));
const HostVerificationPage = lazy(() => import("@/pages/Verification").then((module) => ({ default: module.default })));

function AppRoutes() {
  return (
    <BrandShell>
      <Suspense fallback={<main className="content-section" role="status">Ouverture de votre espace…</main>}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/recherche" component={SearchPage} />
        <Route path="/logement/:slug">{(params) => <PropertyPage slug={params.slug ?? ""} />}</Route>
        <Route path="/reserver/:slug">{(params) => <BookingPage slug={params.slug ?? ""} />}</Route>
        <Route path="/paiement/:slug">{(params) => <PaymentPage slug={params.slug ?? ""} />}</Route>
        <Route path="/confirmation/:bookingId">{(params) => <ConfirmationPage bookingId={params.bookingId ?? ""} />}</Route>
        <Route path="/reservation/:bookingId">{(params) => <BookingDetailPage bookingId={params.bookingId ?? ""} />}</Route>
        <Route path="/auth/:mode">{(params) => <AuthPage mode={params.mode ?? "connexion"} />}</Route>
        <Route path="/mes-reservations" component={BookingsPage} />
        <Route path="/favoris" component={FavoritesPage} />
        <Route path="/messages" component={ChatPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/profil" component={ProfilePage} />
        <Route path="/parametres" component={SettingsPage} />
        <Route path="/recherches-sauvegardees" component={SavedSearchesPage} />
        <Route path="/avis" component={ReviewsPage} />
        <Route path="/hote" component={HostDashboardPage} />
        <Route path="/hote/logements" component={HostListingsPage} />
        <Route path="/hote/logement/nouveau" component={() => <ListingEditorPage />} />
        <Route path="/hote/logement/:slug/modifier">{(params) => <ListingEditorPage slug={params.slug} />}</Route>
        <Route path="/hote/calendrier" component={HostCalendarPage} />
        <Route path="/hote/demandes" component={HostRequestsPage} />
        <Route path="/hote/revenus" component={HostRevenuePage} />
        <Route path="/hote/verification" component={HostVerificationPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </BrandShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DemoProvider>
        <TooltipProvider>
          <Toaster />
          <AppRoutes />
        </TooltipProvider>
      </DemoProvider>
    </ErrorBoundary>
  );
}

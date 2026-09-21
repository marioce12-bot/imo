import PlatformNav from "@/components/PlatformNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <main className="dashboard-shell"><PlatformNav /><div className="dashboard-main">{children}</div></main>;
}

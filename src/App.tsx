import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Toaster } from "sonner";
import { Layout, type NavItem } from "./components/layout";
import { DashboardPage } from "./pages/DashboardPage";

const navItems: NavItem[] = [{ id: "dashboard", icon: BarChart3, label: "Dashboard" }];

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");

  return (
    <>
      <Layout navItems={navItems} activeView={activeView} onNavigate={setActiveView}>
        {activeView === "dashboard" && <DashboardPage />}
      </Layout>
      <Toaster theme="light" position="bottom-right" />
    </>
  );
}

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Toaster } from "sonner";
import { Layout, type NavItem } from "./components/layout";
import { SocialDashboardPage } from "./pages/SocialDashboardPage";

const navItems: NavItem[] = [{ id: "social", icon: BarChart3, label: "Social Performance" }];

export default function App() {
  const [activeView, setActiveView] = useState("social");

  return (
    <>
      <Layout navItems={navItems} activeView={activeView} onNavigate={setActiveView}>
        {activeView === "social" && <SocialDashboardPage />}
      </Layout>
      <Toaster theme="light" position="bottom-right" />
    </>
  );
}

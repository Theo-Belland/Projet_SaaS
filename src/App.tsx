import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./Components/Layout";
import Dashboard from "./Components/Dashboard";
import Portfolio from "./Pages/Portfolio";
import Login from "./Pages/Login";
import Projects from "./Pages/Projects";
import Skills from "./Pages/Skills";
import Sites from "./Pages/Sites";
import Analytics from "./Pages/Analytics";
import Contact from "./Pages/Contact";
import Inbox from "./Pages/Inbox";
import Register from "./Pages/Register";

const queryClient = new QueryClient();
const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const dayKey = new Date().toISOString().slice(0, 10);
    const sessionKey = `visit:${dayKey}:${location.pathname}`;

    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    sessionStorage.setItem(sessionKey, "1");

    void fetch(`${apiBase}/api/stats/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: location.pathname,
        referrer: document.referrer || "",
      }),
      keepalive: true,
    }).catch(() => {
      // On ignore l'erreur réseau pour ne pas impacter la navigation utilisateur.
    });
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <VisitTracker />
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/sites" element={<Layout><Sites /></Layout>} />
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/skills" element={<Layout><Skills /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/inbox" element={<Layout><Inbox /></Layout>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

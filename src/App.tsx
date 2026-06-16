import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./Components/Layout";
import Dashboard from "./Components/Dashboard";
import Login from "./Pages/Login";
import Projects from "./Pages/Projects";
import Sites from "./Pages/Sites";
import Analytics from "./Pages/Analytics";
import Contact from "./Pages/Contact";
import Inbox from "./Pages/Inbox";
import Register from "./Pages/Register";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/sites" element={<Layout><Sites /></Layout>} />
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/inbox" element={<Layout><Inbox /></Layout>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

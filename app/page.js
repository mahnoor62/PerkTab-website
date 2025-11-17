"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import { getAuthToken } from "@/lib/api";
import { fetchJson } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const token = getAuthToken();
      
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch admin session
        const sessionResponse = await fetchJson("/api/auth/session");
        if (!sessionResponse.authenticated || !sessionResponse.admin) {
          router.push("/login");
          return;
        }

        setAdmin(sessionResponse.admin);

        // Fetch levels
        const levelsResponse = await fetchJson("/api/levels");
        setLevels(levelsResponse.levels || []);
      } catch (error) {
        console.error("Error loading data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#0a0a0a"
      }}>
        <div style={{ color: "#ffffff" }}>Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <Dashboard initialLevels={levels} adminEmail={admin.email} />
  );
}

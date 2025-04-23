
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState({
    participants: 0,
    messages: 0,
    depenses: 0,
    activites: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!id) return;

      const [{ count: participants }, { count: messages }, { count: depenses }, { count: activites }] = await Promise.all([
        supabase.from("participants").select("*", { count: "exact", head: true }).eq("voyage_id", id),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("voyage_id", id),
        supabase.from("depenses").select("*", { count: "exact", head: true }).eq("voyage_id", id),
        supabase.from("activites").select("*", { count: "exact", head: true }).eq("voyage_id", id),
      ]);

      setStats({
        participants: participants || 0,
        messages: messages || 0,
        depenses: depenses || 0,
        activites: activites || 0,
      });
    };

    fetchStats();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-moovea-dark">
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-sm text-moovea-dark">👥 Participants</p>
        <p className="text-2xl font-extrabold text-accent">{stats.participants}</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-sm text-moovea-dark">💬 Messages</p>
        <p className="text-2xl font-extrabold text-accent">{stats.messages}</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-sm text-moovea-dark">💸 Dépenses</p>
        <p className="text-2xl font-extrabold text-accent">{stats.depenses}</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-sm text-moovea-dark">📆 Activités</p>
        <p className="text-2xl font-extrabold text-accent">{stats.activites}</p>
      </div>
    </div>
  );
}

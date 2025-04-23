
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

type Participant = {
  id: string;
  utilisateur_id: string;
  role: string;
  profiles: {
    prenom: string;
    pseudo: string;
    avatar_url: string | null;
  };
};

export default function Participants() {
  const { id } = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("participants")
        .select("id, utilisateur_id, role, profiles(prenom, pseudo, avatar_url)")
        .eq("voyage_id", id);

      if (error) {
        console.error("Erreur participants:", error.message);
        return;
      }

      setParticipants(data || []);
      setLoading(false);
    };

    fetchParticipants();
  }, [id]);

  if (loading) return <div className="p-4">⏳ Chargement des participants...</div>;
  if (!participants.length) return <div className="p-4 text-gray-500">Aucun participant pour ce voyage.</div>;

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">👥 Participants</h3>
      <ul className="space-y-3">
        {participants.map((p) => (
          <li key={p.id} className="flex items-center gap-4 bg-white shadow p-3 rounded">
            {p.profiles.avatar_url ? (
              <img src={p.profiles.avatar_url} alt="avatar" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                {p.profiles.prenom?.[0] || "?"}
              </div>
            )}
            <div>
              <p className="font-medium">{p.profiles.prenom} <span className="text-gray-500">@{p.profiles.pseudo}</span></p>
              <p className={`text-sm ${p.role === "admin" ? "text-blue-600 font-semibold" : "text-gray-500"}`}>
                {p.role === "admin" ? "👑 Admin" : "Membre"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

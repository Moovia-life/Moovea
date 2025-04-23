
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useSession } from "../hooks/useSession";
import { useNavigate } from "react-router-dom";

type Voyage = {
  id: string;
  titre: string;
  destination: string;
  date_depart: string;
  date_retour: string;
  est_public: boolean;
  createur_id: string;
};

export default function Voyages() {
  const session = useSession();
  const navigate = useNavigate();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoyages = async () => {
      const { data, error } = await supabase
        .from("voyages")
        .select("*")
        .or(`est_public.eq.true,createur_id.eq.${session?.user?.id || ""}`);

      if (error) {
        console.error("Erreur chargement des voyages:", error.message);
        return;
      }

      setVoyages(data || []);
      setLoading(false);
    };

    fetchVoyages();
  }, [session]);

  if (loading) return <div className="p-4 text-offwhite">⏳ Chargement des voyages...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-offwhite">
      <h2 className="text-4xl font-bold mb-8 text-center animate-slideUp">🌍 Explorer les voyages publics</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {voyages.map((v) => (
          <li
            key={v.id}
            className="bg-white text-moovea-dark rounded-xl shadow-lg p-6 transition-all hover:bg-moovea-light hover:shadow-xl cursor-pointer"
            onClick={() => navigate(`/voyage/${v.id}`)}
          >
            <h3 className="text-2xl font-bold mb-1">{v.titre}</h3>
            <p className="text-lg mb-2">📍 {v.destination}</p>
            <p className="text-sm text-gray-600">
              🗓️ {v.date_depart} → {v.date_retour}
            </p>
            <button className="mt-4 inline-block bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-full shadow">
              Voir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

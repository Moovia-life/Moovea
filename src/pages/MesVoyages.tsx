
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useSession } from "../hooks/useSession";
import { Link } from "react-router-dom";

type Voyage = {
  id: string;
  titre: string;
  destination: string;
  description: string;
  date_depart: string;
  date_retour: string;
};

export default function MesVoyages() {
  const session = useSession();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoyages = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("participants")
        .select("voyage_id, voyages(*)")
        .eq("utilisateur_id", session.user.id);

      if (error) {
        console.error("Erreur chargement voyages:", error);
        return;
      }

      const cleanData = data.map((entry) => entry.voyages);
      setVoyages(cleanData);
      setLoading(false);
    };

    fetchVoyages();
  }, [session]);

  if (loading) return <div className="text-offwhite">⏳ Chargement de vos voyages...</div>;
  if (!voyages.length) return <div className="text-offwhite">😢 Aucun voyage trouvé.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-offwhite">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        📋 Mes voyages
      </h2>
      <ul className="space-y-6">
        {voyages.map((voyage) => (
          <li key={voyage.id} className="bg-white p-6 rounded-xl shadow-lg text-moovea-dark">
            <h3 className="text-2xl font-bold mb-2">{voyage.titre}</h3>
            <p className="mb-1">📍 Destination : {voyage.destination}</p>
            <p className="mb-2">🗓️ Du {voyage.date_depart} au {voyage.date_retour}</p>
            <p className="text-sm text-gray-600 mb-4">{voyage.description}</p>
            <div className="text-right">
              <Link
                to={`/voyage/${voyage.id}`}
                className="inline-block bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-full shadow transition-all"
              >
                Voir
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

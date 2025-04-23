import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useSession } from "../hooks/useSession";
import { toast } from "react-toastify";

type Activite = {
  id: string;
  titre: string;
  lieu: string;
  date: string;
  prix: number;
  createur_id: string;
  votes: number;
};

export default function Planning() {
  const { id: voyageId } = useParams<{ id: string }>();
  const session = useSession();
  const [activites, setActivites] = useState<Activite[]>([]);
  const [nouvelleActivite, setNouvelleActivite] = useState({
    titre: "",
    lieu: "",
    date: "",
    prix: ""
  });

  const fetchActivites = async () => {
    const { data, error } = await supabase
      .from("activites")
      .select("*, votes_activites(count)")
      .eq("voyage_id", voyageId)
      .order("date", { ascending: true });

    if (error) {
      toast.error("Erreur chargement activités");
      return;
    }

    const mapped = data.map((a) => ({
      ...a,
      votes: a.votes_activites?.[0]?.count || 0
    }));

    setActivites(mapped);
  };

  useEffect(() => {
    if (voyageId) fetchActivites();
  }, [voyageId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNouvelleActivite((prev) => ({ ...prev, [name]: value }));
  };

  const ajouterActivite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !voyageId) return;

    const { error } = await supabase.from("activites").insert({
      ...nouvelleActivite,
      prix: parseFloat(nouvelleActivite.prix),
      voyage_id: voyageId,
      createur_id: session.user.id
    });

    if (error) {
      toast.error("Erreur ajout activité");
    } else {
      toast.success("✅ Activité ajoutée !");
      setNouvelleActivite({ titre: "", lieu: "", date: "", prix: "" });
      fetchActivites();
    }
  };

  const voterActivite = async (activiteId: string) => {
    if (!session?.user?.id) return;

    const { error } = await supabase.from("votes_activites").insert({
      activite_id: activiteId,
      utilisateur_id: session.user.id
    });

    if (error) {
      toast.error("⚠️ Vote déjà enregistré ou erreur.");
    } else {
      toast.success("🗳️ Vote enregistré !");
      fetchActivites();
    }
  };

  const supprimerActivite = async (activiteId: string) => {
    const activite = activites.find((a) => a.id === activiteId);
    if (!activite || activite.votes > 0) {
      toast.warn("❌ Impossible de supprimer une activité votée.");
      return;
    }

    const { error } = await supabase
      .from("activites")
      .delete()
      .eq("id", activiteId)
      .eq("createur_id", session?.user?.id);

    if (error) {
      toast.error("Erreur suppression");
    } else {
      toast.success("🗑️ Activité supprimée.");
      fetchActivites();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow text-moovea-dark">
      <h2 className="text-3xl font-bold mb-6">🗓️ Planning</h2>

      <form onSubmit={ajouterActivite} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="titre" placeholder="Titre" value={nouvelleActivite.titre} onChange={handleChange} className="p-2 border rounded" required />
          <input type="text" name="lieu" placeholder="Lieu" value={nouvelleActivite.lieu} onChange={handleChange} className="p-2 border rounded" required />
          <input type="date" name="date" value={nouvelleActivite.date} onChange={handleChange} className="p-2 border rounded" required />
          <input type="number" name="prix" placeholder="Prix (€)" value={nouvelleActivite.prix} onChange={handleChange} className="p-2 border rounded" required />
        </div>
        <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-6 py-2 rounded-full shadow">
          ➕ Ajouter l'activité
        </button>
      </form>

      <ul className="space-y-4">
        {activites.map((a) => (
          <li key={a.id} className="p-4 bg-moovea-light rounded-xl shadow-md">
            <h3 className="text-xl font-semibold">{a.titre}</h3>
            <p>📍 {a.lieu}</p>
            <p>📅 {a.date}</p>
            <p>💰 {a.prix} €</p>
            <p>👍 {a.votes} votes</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => voterActivite(a.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-full text-sm">
                Voter
              </button>
              {a.createur_id === session?.user?.id && a.votes === 0 && (
                <button onClick={() => supprimerActivite(a.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-full text-sm">
                  Supprimer
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
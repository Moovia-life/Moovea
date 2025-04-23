import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useSession } from "../hooks/useSession";
import { toast } from "react-toastify";

type Depense = {
  id: string;
  titre: string;
  montant: number;
  payeur_id: string;
  date: string;
};

type Participant = {
  utilisateur_id: string;
  profiles: {
    prenom: string;
    pseudo: string;
  };
};

export default function Budget() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [titre, setTitre] = useState("");
  const [montant, setMontant] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!id) return;

      const [participantsRes, depensesRes] = await Promise.all([
        supabase
          .from("participants")
          .select("utilisateur_id, profiles(prenom, pseudo)")
          .eq("voyage_id", id),
        supabase.from("depenses").select("*").eq("voyage_id", id),
      ]);

      if (!participantsRes.error && participantsRes.data)
        setParticipants(participantsRes.data);
      if (!depensesRes.error && depensesRes.data)
        setDepenses(depensesRes.data);
      setLoading(false);
    };

    fetchAll();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !titre || !montant || selectedIds.length === 0 || !session?.user?.id) return;

    const { data, error } = await supabase
      .from("depenses")
      .insert({
        titre,
        montant: parseFloat(montant),
        voyage_id: id,
        payeur_id: session.user.id,
      })
      .select()
      .single();

    if (error || !data) {
      toast.error("❌ Erreur ajout dépense");
      return;
    }

    const rows = selectedIds.map((utilisateur_id) => ({
      depense_id: data.id,
      utilisateur_id,
    }));

    const { error: errorParticipants } = await supabase
      .from("participants_depenses")
      .insert(rows);

    if (errorParticipants) {
      toast.warn("⚠️ Dépense ajoutée mais erreur participants.");
    } else {
      toast.success("✅ Dépense ajoutée !");
      setDepenses([...depenses, data]);
      setTitre("");
      setMontant("");
      setSelectedIds([]);
    }
  };

  const handleDelete = async (depenseId: string) => {
    if (!confirm("Supprimer cette dépense ?")) return;

    const { error } = await supabase.from("depenses").delete().eq("id", depenseId);
    if (!error) {
      toast.success("🗑 Dépense supprimée");
      setDepenses(depenses.filter((d) => d.id !== depenseId));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-moovea-dark rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6">💸 Budget du voyage</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input type="text" placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        <input type="number" placeholder="Montant (€)" value={montant} onChange={(e) => setMontant(e.target.value)} className="w-full border px-3 py-2 rounded" required />

        <p className="font-semibold mt-4">👥 Participants :</p>
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <button key={p.utilisateur_id} type="button" onClick={() => {
              setSelectedIds((prev) =>
                prev.includes(p.utilisateur_id) ? prev.filter(id => id !== p.utilisateur_id) : [...prev, p.utilisateur_id]
              );
            }}
              className={`px-4 py-1 rounded-full border transition-all duration-300 ${selectedIds.includes(p.utilisateur_id)
                ? "bg-accent text-white"
                : "bg-moovea-light text-moovea-dark"}`}>
              {p.profiles.prenom} @{p.profiles.pseudo}
            </button>
          ))}
        </div>
        <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-full shadow transition-all">➕ Ajouter</button>
      </form>

      <hr className="my-6" />
      <h3 className="text-2xl font-bold mb-3">📜 Dépenses</h3>
      {loading ? <p>Chargement...</p> : (
        <ul className="space-y-4">
          {depenses.map((d) => (
            <li key={d.id} className="p-4 bg-moovea-light border-l-4 border-accent rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold">{d.titre}</p>
                <p className="text-sm text-moovea-dark">{d.montant} €</p>
              </div>
              {session?.user?.id === d.payeur_id && (
                <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">🗑 Supprimer</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

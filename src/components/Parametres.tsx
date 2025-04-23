
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useSession } from "../hooks/useSession";
import { toast } from "react-toastify";

interface Props {
  voyageId: string;
}

export default function Parametres({ voyageId }: Props) {
  const session = useSession();
  const [form, setForm] = useState({
    titre: "",
    destination: "",
    date_depart: "",
    date_retour: "",
    description: "",
    est_public: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoyage = async () => {
      const { data, error } = await supabase
        .from("voyages")
        .select("*")
        .eq("id", voyageId)
        .single();

      if (error || !data) {
        toast.error("Erreur chargement voyage");
        return;
      }

      setForm({
        titre: data.titre || "",
        destination: data.destination || "",
        date_depart: data.date_depart || "",
        date_retour: data.date_retour || "",
        description: data.description || "",
        est_public: data.est_public || false,
      });
      setLoading(false);
    };

    fetchVoyage();
  }, [voyageId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from("voyages")
      .update(form)
      .eq("id", voyageId);

    if (error) {
      toast.error("❌ Erreur mise à jour");
    } else {
      toast.success("✅ Voyage mis à jour !");
    }
  };

  if (loading) return <p className="p-6 text-offwhite">Chargement des paramètres...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow text-moovea-dark">
      <h3 className="text-3xl font-bold mb-6">⚙️ Paramètres du voyage</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="titre"
          value={form.titre}
          onChange={handleChange}
          placeholder="Titre"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          name="destination"
          value={form.destination}
          onChange={handleChange}
          placeholder="Destination"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="date_depart"
          value={form.date_depart}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="date"
          name="date_retour"
          value={form.date_retour}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />
        <label className="flex items-center gap-2 text-moovea-dark">
          <input
            type="checkbox"
            name="est_public"
            checked={form.est_public}
            onChange={handleChange}
          />
          Voyage public ?
        </label>
        <button
          type="submit"
          className="bg-accent hover:bg-accent-dark text-white px-6 py-2 rounded-lg shadow"
        >
          💾 Enregistrer
        </button>
      </form>
    </div>
  );
}

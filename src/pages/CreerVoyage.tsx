
import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreerVoyage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: "",
    destination: "",
    description: "",
    date_depart: "",
    date_retour: "",
    budget_estimatif: "",
    est_public: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user?.id) {
      toast.error("❌ Utilisateur non connecté.");
      return;
    }

    const { data: voyage, error } = await supabase
      .from("voyages")
      .insert({
        ...formData,
        createur_id: user.user.id
      })
      .select()
      .single();

    if (error || !voyage) {
      toast.error("❌ Erreur lors de la création : " + (error?.message || "inconnue"));
      return;
    }

    const { error: participantError } = await supabase.from("participants").insert({
      voyage_id: voyage.id,
      utilisateur_id: user.user.id,
      role: "admin"
    });

    if (participantError) {
      toast.warn("Voyage créé, mais erreur lors de l'ajout du participant.");
    } else {
      toast.success("✅ Voyage créé avec succès !");
    }

    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="min-h-screen px-6 py-12 bg-moovea text-offwhite flex justify-center items-start">
      <div className="bg-white text-moovea-dark p-8 rounded-xl shadow-xl w-full max-w-xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center">🧳 Créer un voyage</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="titre" placeholder="Titre du voyage" value={formData.titre} onChange={handleChange} required className="w-full border rounded px-4 py-2" />
          <input type="text" name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} required className="w-full border rounded px-4 py-2" />
          <textarea name="description" placeholder="Description (facultatif)" value={formData.description} onChange={handleChange} className="w-full border rounded px-4 py-2" />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="date_depart" value={formData.date_depart} onChange={handleChange} required className="w-full border rounded px-4 py-2" />
            <input type="date" name="date_retour" value={formData.date_retour} onChange={handleChange} required className="w-full border rounded px-4 py-2" />
          </div>
          <input type="number" name="budget_estimatif" placeholder="Budget estimé (€)" value={formData.budget_estimatif} onChange={handleChange} className="w-full border rounded px-4 py-2" />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="est_public" checked={formData.est_public} onChange={handleChange} />
            Rendre ce voyage public
          </label>
          <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-6 py-2 rounded-full shadow transition-all w-full">
            🚀 Lancer le voyage
          </button>
        </form>
      </div>
    </div>
  );
}

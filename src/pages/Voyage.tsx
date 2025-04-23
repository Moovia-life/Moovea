
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useSession } from "../hooks/useSession";
import { toast } from "react-toastify";
import Dashboard from "../components/Dashboard";
import Parametres from "../components/Parametres";

type Voyage = {
  id: string;
  titre: string;
  destination: string;
  description: string;
  date_depart: string;
  date_retour: string;
  budget_estimatif: number;
  est_public: boolean;
  createur_id?: string;
};

type Participant = {
  utilisateur_id: string;
  role: string;
  profiles: {
    prenom: string;
    nom: string;
    pseudo: string;
  };
};

export default function Voyage() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadyMember, setAlreadyMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("infos");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    const fetchVoyage = async () => {
      if (!id) return;
      const { data, error } = await supabase.from("voyages").select("*").eq("id", id).single();
      if (error) {
        console.error("❌ Erreur récupération voyage :", error.message);
        return;
      }
      setVoyage(data);
      setLoading(false);
    };

    const checkMembership = async () => {
      if (!id || !session?.user?.id) return;

      const { data } = await supabase
        .from("participants")
        .select("role")
        .eq("voyage_id", id)
        .eq("utilisateur_id", session.user.id)
        .single();

      if (data) {
        setAlreadyMember(true);
        if (data.role === "admin") setIsAdmin(true);
      }
    };

    const fetchParticipants = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("participants")
        .select("utilisateur_id, role, profiles (prenom, nom, pseudo)")
        .eq("voyage_id", id);

      if (!error && data) setParticipants(data);
    };

    fetchVoyage();
    checkMembership();
    fetchParticipants();
  }, [id, session]);

  const handleJoin = async () => {
    if (!session?.user?.id || !voyage) return;

    const { error } = await supabase.from("participants").insert({
      voyage_id: voyage.id,
      utilisateur_id: session.user.id,
      role: "member"
    });

    if (error) {
      toast.error("❌ Impossible de rejoindre : " + error.message);
    } else {
      toast.success("✅ Vous avez rejoint le voyage !");
      setAlreadyMember(true);
    }
  };

  const handleAddParticipant = async () => {
    if (!newEmail.trim()) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", newEmail.trim())
      .single();

    if (!profile) {
      toast.error("❌ Utilisateur introuvable.");
      return;
    }

    const { error } = await supabase.from("participants").insert({
      voyage_id: voyage?.id,
      utilisateur_id: profile.id,
      role: "member"
    });

    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("✅ Participant ajouté !");
      setNewEmail("");
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">⏳ Chargement...</div>;
  if (!voyage) return <div className="p-6 text-center text-red-500">❌ Voyage introuvable.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-blue-700 mb-4">✈️ {voyage.titre}</h2>

      <div className="flex gap-4 mb-6 flex-wrap">
        <button onClick={() => setActiveTab("infos")} className={activeTab === "infos" ? "font-bold" : ""}>ℹ️ Infos</button>
        <button onClick={() => setActiveTab("participants")} className={activeTab === "participants" ? "font-bold" : ""}>👥 Participants</button>
        <button onClick={() => setActiveTab("planning")}>🗓️ Planning</button>
        <button onClick={() => setActiveTab("budget")}>💸 Budget</button>
        <button onClick={() => setActiveTab("discussions")}>💬 Discussions</button>
        <button onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
        {isAdmin && (
          <button onClick={() => setActiveTab("parametres")}>⚙️ Paramètres</button>
        )}
      </div>

      {activeTab === "dashboard" && voyage?.id && <Dashboard voyageId={voyage.id} />}
      {activeTab === "parametres" && voyage?.id && <Parametres voyageId={voyage.id} />}
    </div>
  );
}

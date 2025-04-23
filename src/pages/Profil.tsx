import { useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { toast } from "react-toastify";
import { calculateAndAssignBadges } from "../services/calculateBadges";
import "../styles/animations.css";

export default function Profil() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);

  useEffect(() => {
    const fetchData = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();
      setProfile(profileData);

      const { data: all } = await supabase.from("badges").select("*");
      if (all) setAllBadges(all);

      const { data: earned } = await supabase
        .from("profiles_badges")
        .select("badge_id")
        .eq("profile_id", user.user.id);
      const badgeIds = earned?.map((b) => b.badge_id) || [];
      setBadges(badgeIds);

      setLoading(false);
    };

    fetchData();
  }, []);

  const fetchCityCountryFromPostal = async (codePostal: string) => {
    try {
      const res = await fetch(`https://api.zippopotam.us/fr/${codePostal}`);
      if (!res.ok) return;
      const data = await res.json();
      setProfile((prev: any) => ({
        ...prev,
        ville: data.places[0]["place name"],
        pays: data.country,
      }));
    } catch (e) {
      console.warn("Aucune correspondance de code postal trouvée.");
    }
  };

  const handleUpdate = async () => {
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${profile.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        toast.error("Erreur lors de l'upload de l'avatar.");
        return;
      }

      const { data: signedUrlData } = await supabase.storage
        .from("avatars")
        .createSignedUrl(fileName, 3600);

      if (signedUrlData?.signedUrl) {
        profile.avatar_url = signedUrlData.signedUrl;
      }
    }

    const { error } = await supabase.from("profiles").update(profile).eq("id", profile.id);

    if (error) {
      setMessage("❌ Erreur : " + error.message);
    } else {
      setMessage("✅ Profil mis à jour !");
      await calculateAndAssignBadges(profile.id);
    }
  };

  const groupedBadges = allBadges.reduce(
    (acc: any, badge: any) => {
      const categorie = badge.categorie || "speciaux";
      acc[categorie] = acc[categorie] || [];
      acc[categorie].push(badge);
      return acc;
    },
    { crees: [], rejoints: [], speciaux: [] }
  );

  const categorieLabels: Record<string, string> = {
    crees: "Voyages créés",
    rejoints: "Voyages rejoints",
    speciaux: "Badges spéciaux",
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email);
    if (error) toast.error("Erreur : " + error.message);
    else toast.success("📧 Email de réinitialisation envoyé !");
  };

  const handleDeleteAccount = async () => {
    const confirmation = confirm("⚠️ Supprimer définitivement votre compte ?");
    if (!confirmation) return;

    const { error } = await supabase.rpc("delete_user", { user_id: profile.id });
    if (error) toast.error("Erreur : " + error.message);
    else {
      toast.success("Compte supprimé.");
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  if (loading) return <p className="p-8 text-moovea-light">Chargement du profil...</p>;
  if (!profile) return <p className="text-red-500">❌ Profil introuvable.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg text-moovea grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 flex flex-col items-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full border border-moovea-dark mb-4" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-moovea-light flex items-center justify-center text-xl font-bold text-moovea-dark mb-4">👤</div>
        )}
        <h3 className="text-lg font-semibold mb-2">Badges</h3>

        {Object.entries(groupedBadges).map(([cat, items]) => (
          <div key={cat} className="mb-4 w-full">
            <p className="text-sm font-bold mb-1 text-center text-moovea-dark underline">{categorieLabels[cat]}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {items.map((badge: any) => {
                const isEarned = badges.includes(badge.id);
                const isLast = badge.id === profile.dernier_badge_id;
                return (
                  <div key={badge.id} className={`flex flex-col items-center text-center text-xs ${isEarned ? "text-black" : "text-gray-400 opacity-60"}`}>
                    <div className={`relative ${isLast ? "fade-glow" : ""}`}>
                      <img
                        src={badge.icone_url.includes("goutte") && badge.titre === "Organisateur confirmé" ? "/badges/feu.png" : badge.icone_url}
                        alt={badge.titre}
                        className={`w-10 h-10 ${!isEarned ? "grayscale" : ""}`}
                      />
                      {!isEarned && <span className="absolute -top-1 -right-1 text-sm">🔒</span>}
                    </div>
                    <span>{badge.titre}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="col-span-2">
        <h2 className="text-3xl font-bold mb-4">Données personnelles</h2>
        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Pseudo" value={profile.pseudo} onChange={(e) => setProfile({ ...profile, pseudo: e.target.value })} className="input-moovea" />
          <input type="text" placeholder="Prénom" value={profile.prenom || ""} onChange={(e) => setProfile({ ...profile, prenom: e.target.value })} className="input-moovea" />
          <input type="text" placeholder="Nom" value={profile.nom || ""} onChange={(e) => setProfile({ ...profile, nom: e.target.value })} className="input-moovea" />
          <input type="date" max={maxDate.toISOString().split("T")[0]} value={profile.date_naissance || ""} onChange={(e) => setProfile({ ...profile, date_naissance: e.target.value })} className="input-moovea" />
          <input type="tel" placeholder="Téléphone" value={profile.telephone || ""} onChange={(e) => setProfile({ ...profile, telephone: e.target.value })} className="input-moovea" />
          <input type="text" placeholder="Numéro et rue" value={profile.adresse || ""} onChange={(e) => setProfile({ ...profile, adresse: e.target.value })} className="input-moovea" />
          <input type="text" placeholder="Code postal" value={profile.code_postal || ""} onChange={(e) => {
            const val = e.target.value;
            setProfile({ ...profile, code_postal: val });
            if (val.length >= 4) fetchCityCountryFromPostal(val);
          }} className="input-moovea" />
          <input type="text" placeholder="Ville" value={profile.ville || ""} onChange={(e) => setProfile({ ...profile, ville: e.target.value })} className="input-moovea" />
          <input type="text" placeholder="Pays" value={profile.pays || ""} onChange={(e) => setProfile({ ...profile, pays: e.target.value })} className="input-moovea" />

          <div>
            <label className="block mb-1 font-semibold">Photo de profil</label>
            <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="input-moovea" />
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={handleUpdate} className="btn-moovea">💾 Enregistrer</button>
            <button onClick={handlePasswordReset} className="btn-moovea">Changer mot de passe</button>
            <button onClick={handleDeleteAccount} className="btn-danger">Supprimer mon compte</button>
          </div>

          {message && <p className="mt-4 text-sm font-medium text-green-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}

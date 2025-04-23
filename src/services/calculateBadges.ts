
import { supabase } from "../services/supabaseClient";

export async function calculateAndAssignBadges(userId: string) {
  const badgeMap = [
    // 🧠 Voyages créés
    { condition: async () => await count("voyages", "createur_id", userId) >= 2, titre: "Lanceur d’aventures" },
    { condition: async () => await count("voyages", "createur_id", userId) >= 5, titre: "Organisateur confirmé" },
    { condition: async () => await count("voyages", "createur_id", userId) >= 10, titre: "Ambassadeur Moovea" },

    // 🌍 Voyages rejoints
    { condition: async () => await count("participants", "utilisateur_id", userId) >= 2, titre: "Curieux de nouveaux horizons" },
    { condition: async () => await count("participants", "utilisateur_id", userId) >= 5, titre: "Explorateur actif" },
    { condition: async () => await count("participants", "utilisateur_id", userId) >= 10, titre: "Globetrotter Moovea" },

    // 🎯 Badges spéciaux
    { condition: async () => await count("votes_activites", "utilisateur_id", userId) >= 5, titre: "Voix influente" },
    { condition: async () => await count("messages", "auteur_id", userId) >= 5, titre: "Participant impliqué" },
    { condition: async () => await checkMoyenne(userId), titre: "Prestige Trip Master" },
  ];

  const { data: allBadges } = await supabase.from("badges").select("id, titre");
  const { data: current } = await supabase
    .from("profiles_badges")
    .select("badge_id, badges(titre)")
    .eq("profile_id", userId);

  const currentTitles = (current || []).map((b: any) => b.badges.titre);
  let newBadges: any[] = [];

  for (const b of badgeMap) {
    if (!currentTitles.includes(b.titre) && await b.condition()) {
      const badge = allBadges?.find((x) => x.titre === b.titre);
      if (badge) {
        await supabase.from("profiles_badges").insert({ profile_id: userId, badge_id: badge.id });
        newBadges.push(badge.titre);
        await supabase.from("profiles").update({ dernier_badge_id: badge.id }).eq("id", userId);
      }
    }
  }

  return newBadges;
}

// --- Helpers ---
async function count(table: string, field: string, value: string) {
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true }).eq(field, value);
  return count || 0;
}

async function checkMoyenne(userId: string) {
  const { data } = await supabase
    .from("avis_voyages")
    .select("note")
    .eq("organisateur_id", userId);
  if (!data?.length) return false;
  const moyenne = data.reduce((acc, curr) => acc + curr.note, 0) / data.length;
  return moyenne >= 4.5;
}

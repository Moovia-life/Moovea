import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage("❌ Erreur : " + error.message);
    } else if (data.user) {
      const { error: insertError } = await supabase.from("profiles").insert([
        { id: data.user.id, email, pseudo }
      ]);

      if (insertError) {
        setMessage("⚠️ Inscrit mais profil non créé : " + insertError.message);
      } else {
        setMessage("✅ Inscription réussie ! Redirection...");
        setTimeout(() => navigate("/profil"), 1500);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md text-moovea-dark animate-fadeIn">
      <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-2">
        🧑‍🚀 Créer un compte
      </h2>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="✨ Pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          required
          className="input-moovea"
        />
        <input
          type="email"
          placeholder="📧 Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-moovea"
        />
        <input
          type="password"
          placeholder="🔐 Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-moovea"
        />
        <button type="submit" className="btn-moovea">
          🚀 S’inscrire
        </button>
        {message && <p className="text-green-600 mt-2">{message}</p>}
      </form>
    </div>
  );
}

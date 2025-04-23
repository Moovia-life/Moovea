import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("❌ Erreur : " + error.message);
    } else {
      setMessage("✅ Connexion réussie !");
      setTimeout(() => navigate("/profil"), 1000);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow-md text-moovea">
      <h2 className="text-2xl font-bold mb-4">Connexion</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-moovea" />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-moovea" />
        <button type="submit" className="btn-moovea">Se connecter</button>
        {message && <p className="text-green-600">{message}</p>}
      </form>
    </div>
  );
}

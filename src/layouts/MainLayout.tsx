
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MainLayout() {
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-moovea text-offwhite font-sans">
      <header className="bg-offwhite px-6 py-4 flex justify-between items-center border-b border-moovea-light">
        <h1 className="text-xl font-bold text-moovea">
          <Link to="/">Moovea</Link>
        </h1>
        <nav className="flex gap-4 text-moovea font-semibold">
          <Link to="/">Accueil</Link>
          {!session ? (
            <>
              <Link to="/login">Se connecter</Link>
              <Link to="/signup">Créer un compte</Link>
            </>
          ) : (
            <>
              <Link to="/creer-ou-rejoindre">Créer / Rejoindre</Link>
              <Link to="/creervoyage">Créer un voyage</Link>
              <Link to="/voyages">Explorer</Link>
              <Link to="/mesvoyages">Mes voyages</Link>
              <Link to="/profil">Profil</Link>
              <button onClick={handleLogout}>Déconnexion</button>
            </>
          )}
        </nav>
      </header>

      <main className="p-6">
        <Outlet />
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar
        closeOnClick
      />
    </div>
  );
}

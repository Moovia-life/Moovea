import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  if (!sessionChecked) return <p>Chargement...</p>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

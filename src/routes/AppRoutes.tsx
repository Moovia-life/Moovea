import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import Accueil from "../pages/Accueil";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import CreerVoyage from "../pages/CreerVoyage";
import Profil from "../pages/Profil";
import Voyage from "../pages/Voyage";
import Voyages from "../pages/Voyages";
import MesVoyages from "../pages/MesVoyages"; // ✅ Ajouté

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Accueil />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="creervoyage" element={<CreerVoyage />} />
        <Route path="voyage/:id" element={<Voyage />} />
        <Route path="voyages" element={<Voyages />} />      {/* 🔓 Public + créés par moi */}
        <Route path="mesvoyages" element={<MesVoyages />} /> {/* 🔐 Voyages où je suis membre */}
        <Route path="profil" element={<Profil />} />
      </Route>
    </Routes>
  );
}

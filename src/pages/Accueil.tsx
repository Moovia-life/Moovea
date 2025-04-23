export default function Accueil() {
  return (
    <div className="min-h-screen bg-moovea text-offwhite px-6 py-12 font-sans relative overflow-hidden">
      {/* 🌍 Globe centré en haut */}
      <div className="w-72 h-72 mx-auto mb-8 animate-spin-slow">
        <img
          src="/globe-clean.png"
          alt="Globe Moovea"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {/* Contenu centré */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold mb-4 animate-slideUp tracking-tight">
          Bienvenue sur <span className="text-accent">Moovea</span> 🌍
        </h1>

        <p className="text-xl max-w-2xl mx-auto animate-slideUp animate-delay-200">
          ✈️ Ton copilote pour des aventures humaines et stylées.
        </p>
        <p className="mt-2 text-moovea-light max-w-2xl mx-auto animate-slideUp animate-delay-200">
          Organise, explore, vis des voyages partagés sans prise de tête.
        </p>
      </div>
    </div>
  );
}

export default function Accueil() {
  return (
    <div className="min-h-screen bg-moovea text-moovea-light px-6 py-12 relative overflow-hidden">
      {/* Globe en haut à droite */}
      <img
        src="/globe.png"
        alt="Globe Moovea"
        className="absolute top-6 right-6 w-40 h-40 rounded-full border-4 border-accent shadow-xl z-0"
      />

      {/* Contenu centré */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-20">
        <h1 className="text-5xl font-extrabold mb-6">
          Bienvenue sur <span className="text-accent">Moovea</span> 🌍
        </h1>

        <p className="text-xl max-w-2xl">
          ✈️ Ton copilote pour des aventures humaines et stylées.
        </p>
        <p className="mt-2 max-w-2xl">
          Organise, explore, vis des voyages partagés sans prise de tête.
        </p>
      </div>
    </div>
  );
}

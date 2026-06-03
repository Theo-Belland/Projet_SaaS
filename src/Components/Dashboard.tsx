import Card from "./Card";
import Charts from "./Charts";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card title="Ventes" description="Statistiques de ventes du mois." />
        <Card title="Clients" description="Nouveaux clients et fidélisation." />
        <Card title="Projets" description="Suivi des projets en cours." />
        <Card title="Support" description="Tickets et demandes en attente." />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <Charts />
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
              <p className="text-sm text-gray-500">Mises à jour et actions récentes</p>
            </div>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              24h
            </span>
          </div>
          <ul className="space-y-4">
            <li className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-sm font-medium text-slate-900">Nouveau ticket ouvert</p>
              <p className="text-sm text-slate-500">Support client a créé un ticket pour un bug produit.</p>
            </li>
            <li className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-sm font-medium text-slate-900">Livraison prévue</p>
              <p className="text-sm text-slate-500">Démo produit planifiée pour mardi prochain.</p>
            </li>
            <li className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-sm font-medium text-slate-900">Nouvelle inscription</p>
              <p className="text-sm text-slate-500">Un client premium a rejoint cette semaine.</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5 bg-white p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projet en cours</h3>
          <p className="text-sm text-gray-500 mb-4">Refonte UI / UX du tableau de bord pour la prochaine version.</p>
          <div className="space-y-3">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span>État d'avancement</span>
                <span>65%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-indigo-600" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-sm font-medium text-slate-900">Prochaine étape</p>
              <p className="text-sm text-slate-500">Finaliser le design des cartes et la navigation mobile.</p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 bg-white p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tâches urgentes</h3>
          <ul className="space-y-4">
            <li className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-900">Corriger le bug d’affichage</p>
              <p className="text-sm text-rose-700">Prioritaire : page de connexion bloquée.</p>
            </li>
            <li className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Mettre à jour le planning</p>
              <p className="text-sm text-amber-700">Valider les nouvelles dates de release.</p>
            </li>
          </ul>
        </div>

        <div className="xl:col-span-3 bg-white p-6 rounded-3xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendrier</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
            <div className="rounded-2xl bg-slate-100 py-2">Lun</div>
            <div className="rounded-2xl bg-slate-100 py-2">Mar</div>
            <div className="rounded-2xl bg-slate-100 py-2">Mer</div>
            <div className="rounded-2xl bg-slate-50 py-3 font-semibold text-slate-900">3</div>
            <div className="rounded-2xl bg-slate-50 py-3">4</div>
            <div className="rounded-2xl bg-slate-50 py-3">5</div>
            <div className="rounded-2xl bg-slate-50 py-3">6</div>
            <div className="rounded-2xl bg-slate-50 py-3">7</div>
            <div className="rounded-2xl bg-slate-50 py-3">8</div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            2 réunions prévues aujourd'hui
          </div>
        </div>
      </div>
    </div>
  );
}

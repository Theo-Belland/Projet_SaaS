export default function Projects() {
  const projects = [
    { id: 1, name: "Site vitrine", owner: "Alice", status: "En cours", progress: 65, dueDate: "12/06/2026" },
    { id: 2, name: "App mobile", owner: "Bob", status: "Terminé", progress: 100, dueDate: "01/05/2026" },
    { id: 3, name: "API interne", owner: "Carol", status: "Planifié", progress: 20, dueDate: "30/09/2026" },
  ];

  const totalProgress = Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length);

  const statusClass = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-emerald-100 text-emerald-800";
      case "En cours":
        return "bg-amber-100 text-amber-800";
      case "Planifié":
        return "bg-sky-100 text-sky-800";
      case "En attente":
        return "bg-violet-100 text-violet-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Projets</h2>
          <p className="text-sm text-slate-500">Vue d'ensemble des projets et état d'avancement</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm w-full sm:w-auto">
          <p className="text-sm font-medium text-slate-500">Avancement global</p>
          <div className="mt-3 h-3 w-72 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${totalProgress}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{totalProgress}% terminé</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriétaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.owner}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="w-48">
                    <div className="h-2.5 w-full rounded-full bg-slate-100">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${p.progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{p.progress}%</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <nav aria-label="Pagination" className="flex items-center justify-end p-4">
          <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">Previous</button>
          <span className="mx-2 text-sm text-gray-500">Page 1 of 10</span>
          <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300">Next</button>
        </nav>
      </div>
    </div>
  );
}

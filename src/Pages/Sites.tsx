import { useQuery } from "@tanstack/react-query";

interface Site {
  id: number;
  name: string;
  owner: string;
  status: string;
  url: string;
  progress: number;
}

const staticSites: Site[] = [
  { id: 1, name: "Site vitrine", owner: "Alice", status: "En ligne", url: "site-vitrine.fr", progress: 80 },
  { id: 2, name: "E-commerce", owner: "Bob", status: "Maintenance", url: "boutique.pro", progress: 55 },
  { id: 3, name: "Blog tech", owner: "Carol", status: "Prévu", url: "blog.tech", progress: 10 },
];

const fetchSites = async () => {
  // Remplacer ceci par une requête API réelle lorsque le backend est prêt :
  // const response = await axios.get("/api/sites");
  // return response.data;

  return new Promise<Site[]>((resolve) => {
    setTimeout(() => resolve(staticSites), 300);
  });
};

export default function Sites() {
  const { data: sites, isLoading, isError } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: fetchSites,
  });

  console.log('DEBUG: Sites component rendered', { isLoading, isError, count: sites?.length });

  return (
    <div>
      <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-rose-900 font-medium">DEBUG: Sites component mounted (visible banner)</div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sites</h2>
          <p className="text-sm text-slate-500">Gestion des sites connectés à ton dashboard</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriétaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avancement</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                  Chargement des sites...
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-red-600">
                  Impossible de charger les sites pour le moment.
                </td>
              </tr>
            )}
            {sites?.map((site) => (
              <tr key={site.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.owner}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{site.url}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {site.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="w-48">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${site.progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{site.progress}%</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

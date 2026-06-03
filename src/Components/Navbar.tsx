export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            D
          </span>
          <div>
            <p className="text-sm font-medium text-slate-500">Bonjour,</p>
            <h1 className="text-xl font-semibold text-slate-900">Tableau de bord</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
            Ajouter
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <span className="sr-only">Notifications</span>
            🔔
          </button>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profil"
              className="h-10 w-10 rounded-full"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">Théo</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

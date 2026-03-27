export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to SweetCMS admin panel.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="admin-card p-6">
          <p className="text-sm font-medium text-gray-500">Pages</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">—</p>
        </div>
        <div className="admin-card p-6">
          <p className="text-sm font-medium text-gray-500">Blog Posts</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">—</p>
        </div>
        <div className="admin-card p-6">
          <p className="text-sm font-medium text-gray-500">Categories</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">—</p>
        </div>
      </div>
    </div>
  );
}

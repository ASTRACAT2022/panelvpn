export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">Overview of your Sing-box infrastructure.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Active Nodes</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Traffic</div>
          <div className="text-2xl font-bold">0 GB</div>
        </div>
        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">System Status</div>
          <div className="text-2xl font-bold text-green-500">Healthy</div>
        </div>
      </div>
    </div>
  );
}

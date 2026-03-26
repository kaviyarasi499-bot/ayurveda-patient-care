import { getPatients } from '@/lib/store';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Activity, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';

export default function DashboardPage() {
  const patients = getPatients();
  const recent = [...patients].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const doshaCount = { Vata: 0, Pitta: 0, Kapha: 0 };
  patients.forEach(p => doshaCount[p.dosha]++);

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent" />
            Welcome to your Ayurvedic practice overview
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card flex items-center gap-4 opacity-0 animate-fade-in-up transition-transform duration-200 hover:scale-[1.03] hover:shadow-md" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4 opacity-0 animate-fade-in-up transition-transform duration-200 hover:scale-[1.03] hover:shadow-md" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{recent.length}</p>
              <p className="text-sm text-muted-foreground">Recent Patients</p>
            </div>
          </div>
          <div className="stat-card opacity-0 animate-fade-in-up transition-transform duration-200 hover:scale-[1.03] hover:shadow-md" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm text-muted-foreground mb-2">Dosha Distribution</p>
            <div className="flex gap-2">
              <span className="dosha-badge-vata">Vata: {doshaCount.Vata}</span>
              <span className="dosha-badge-pitta">Pitta: {doshaCount.Pitta}</span>
              <span className="dosha-badge-kapha">Kapha: {doshaCount.Kapha}</span>
            </div>
          </div>
        </div>

        {/* Quick action */}
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <Link to="/patients/add">
            <Button className="gap-2 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97]">
              <UserPlus className="w-4 h-4" />
              Add New Patient
            </Button>
          </Link>
        </div>

        {/* Recent patients */}
        {recent.length > 0 && (
          <div className="bg-card border rounded-xl overflow-hidden opacity-0 animate-fade-in-up shadow-sm" style={{ animationDelay: '0.4s' }}>
            <div className="px-6 py-4 border-b">
              <h2 className="font-display text-lg font-semibold">Recent Patients</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Dosha</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">BMI</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-t opacity-0 animate-slide-in-left transition-colors duration-150 hover:bg-muted/30"
                    style={{ animationDelay: `${0.5 + i * 0.08}s` }}
                  >
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3">
                      <span className={`dosha-badge-${p.dosha.toLowerCase()}`}>{p.dosha}</span>
                    </td>
                    <td className="px-6 py-3">{p.bmi}</td>
                    <td className="px-6 py-3">
                      <Link to={`/patients/${p.id}`} className="text-primary hover:underline text-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

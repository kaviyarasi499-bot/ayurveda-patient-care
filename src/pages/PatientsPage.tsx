import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, Eye, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  return 'Overweight';
}

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  dosha: string;
  bmi: number;
}

export default function PatientsPage() {
  const { isAdmin, loading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);

  const fetchPatients = async () => {
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (error) { toast.error(error.message); return; }
    setPatients(data || []);
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patient and all related records?')) return;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    fetchPatients();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  // Customers see a simplified read-only view
  if (!isAdmin) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">My Patients</h1>
            <p className="text-muted-foreground mt-1">{patients.length} patients</p>
          </div>
          <Link to="/patients/add">
            <Button className="gap-2"><UserPlus className="w-4 h-4" /> Add Patient</Button>
          </Link>
          {patients.length === 0 ? (
            <div className="text-center py-16 bg-card border rounded-xl">
              <p className="text-muted-foreground">No patients yet. Add your first patient to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {patients.map(p => (
                <div key={p.id} className="bg-card border rounded-xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <span className="text-xs font-mono text-muted-foreground">{p.patient_id}</span>
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>Age: {p.age}</span>
                    <span>{p.gender}</span>
                    <span className={`dosha-badge-${p.dosha.toLowerCase()}`}>{p.dosha}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">BMI: {p.bmi} ({getBMICategory(p.bmi)})</div>
                  <div className="flex gap-1 pt-1">
                    <Link to={`/patients/${p.id}/edit`}><Button variant="outline" size="sm" className="gap-1"><Edit className="w-3 h-3" /> Edit</Button></Link>
                    <Button variant="outline" size="sm" className="gap-1 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3" /> Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground mt-1">{patients.length} total patients</p>
          </div>
          <Link to="/patients/add">
            <Button className="gap-2"><UserPlus className="w-4 h-4" /> Add Patient</Button>
          </Link>
        </div>

        {patients.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <p className="text-muted-foreground">No patients yet. Add your first patient to get started.</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Patient ID</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Age</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Gender</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Dosha</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">BMI</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Category</th>
                  <th className="text-left px-6 py-3 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-mono text-sm text-muted-foreground">{p.patient_id}</td>
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3">{p.age}</td>
                    <td className="px-6 py-3">{p.gender}</td>
                    <td className="px-6 py-3"><span className={`dosha-badge-${p.dosha.toLowerCase()}`}>{p.dosha}</span></td>
                    <td className="px-6 py-3">{p.bmi}</td>
                    <td className="px-6 py-3">{getBMICategory(p.bmi)}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        <Link to={`/patients/${p.id}`}><Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button></Link>
                        <Link to={`/patients/${p.id}/edit`}><Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button></Link>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
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

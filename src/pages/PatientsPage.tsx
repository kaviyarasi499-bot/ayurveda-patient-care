import { useState } from 'react';
import { getPatients, deletePatient, getBMICategory } from '@/lib/store';
import { Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, Eye, Edit } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState(getPatients());

  const handleDelete = (id: string) => {
    if (confirm('Delete this patient and all related records?')) {
      deletePatient(id);
      setPatients(getPatients());
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">{patients.length} registered patients</p>
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
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3">{p.age}</td>
                  <td className="px-6 py-3">{p.gender}</td>
                  <td className="px-6 py-3">
                    <span className={`dosha-badge-${p.dosha.toLowerCase()}`}>{p.dosha}</span>
                  </td>
                  <td className="px-6 py-3">{p.bmi}</td>
                  <td className="px-6 py-3">{getBMICategory(p.bmi)}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <Link to={`/patients/${p.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      </Link>
                      <Link to={`/patients/${p.id}/edit`}>
                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

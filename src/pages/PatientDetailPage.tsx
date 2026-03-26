import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getPatient, getBMICategory, getDietPlansForPatient,
  generateDietPlan, getDietRules, getProgressRecords,
  addProgressRecord, DietPlan, ProgressRecord
} from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Utensils, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = getPatient(id!);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(() => getDietPlansForPatient(id!));
  const [progress, setProgress] = useState<ProgressRecord[]>(() => getProgressRecords(id!));
  const [progressForm, setProgressForm] = useState({ weight: '', remarks: '', date: new Date().toISOString().split('T')[0] });

  if (!patient) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Patient not found.</p></div>;
  }

  const rules = getDietRules(patient.dosha);

  const handleGeneratePlan = () => {
    generateDietPlan(patient.id);
    setDietPlans(getDietPlansForPatient(patient.id));
  };

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    addProgressRecord(patient.id, parseFloat(progressForm.weight), progressForm.remarks, progressForm.date);
    setProgress(getProgressRecords(patient.id));
    setProgressForm({ weight: '', remarks: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{patient.name}</h1>
          <p className="text-muted-foreground mt-1">{patient.age} yrs · {patient.gender} · <span className={`dosha-badge-${patient.dosha.toLowerCase()}`}>{patient.dosha}</span></p>
        </div>
        <Link to={`/patients/${patient.id}/edit`}>
          <Button variant="outline" className="gap-2"><Edit className="w-4 h-4" /> Edit</Button>
        </Link>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">BMI</p>
          <p className="text-2xl font-bold text-foreground">{patient.bmi}</p>
          <p className="text-sm text-muted-foreground">{getBMICategory(patient.bmi)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Height / Weight</p>
          <p className="text-2xl font-bold text-foreground">{patient.height}cm / {patient.weight}kg</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Health Issue</p>
          <p className="text-foreground">{patient.healthIssue || 'None specified'}</p>
        </div>
      </div>

      {/* Dosha diet guidelines */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-accent" /> {patient.dosha} Diet Guidelines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-primary flex items-center gap-1 mb-2"><CheckCircle className="w-4 h-4" /> Recommended</h3>
            <ul className="space-y-1 text-sm text-foreground">
              {rules.recommended.map(f => <li key={f}>• {f}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-destructive flex items-center gap-1 mb-2"><XCircle className="w-4 h-4" /> Avoid</h3>
            <ul className="space-y-1 text-sm text-foreground">
              {rules.avoid.map(f => <li key={f}>• {f}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Diet Plans */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Diet Plans</h2>
          <Button onClick={handleGeneratePlan} size="sm" className="gap-2">
            <Utensils className="w-4 h-4" /> Generate Plan
          </Button>
        </div>
        {dietPlans.length === 0 ? (
          <p className="text-muted-foreground text-sm">No diet plans yet. Generate one based on the patient's dosha type.</p>
        ) : (
          <div className="space-y-3">
            {dietPlans.map(plan => (
              <div key={plan.id} className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="text-xs text-muted-foreground mb-2">{plan.date}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><span className="font-medium text-foreground">Breakfast:</span> {plan.breakfast}</div>
                  <div><span className="font-medium text-foreground">Lunch:</span> {plan.lunch}</div>
                  <div><span className="font-medium text-foreground">Dinner:</span> {plan.dinner}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Tracker */}
      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Progress Tracker
        </h2>

        <form onSubmit={handleAddProgress} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
          <div>
            <Label>Date</Label>
            <Input type="date" value={progressForm.date} onChange={e => setProgressForm(f => ({ ...f, date: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" step="0.1" value={progressForm.weight} onChange={e => setProgressForm(f => ({ ...f, weight: e.target.value }))} required className="mt-1" />
          </div>
          <div className="sm:col-span-2 flex gap-2 items-end">
            <div className="flex-1">
              <Label>Remarks</Label>
              <Input value={progressForm.remarks} onChange={e => setProgressForm(f => ({ ...f, remarks: e.target.value }))} className="mt-1" />
            </div>
            <Button type="submit" size="sm">Add</Button>
          </div>
        </form>

        {progress.length === 0 ? (
          <p className="text-muted-foreground text-sm">No progress records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Weight (kg)</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Change</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((rec, i) => {
                  const prev = i > 0 ? progress[i - 1].weight : patient.weight;
                  const diff = rec.weight - prev;
                  return (
                    <tr key={rec.id} className="border-t">
                      <td className="px-4 py-2">{rec.date}</td>
                      <td className="px-4 py-2 font-medium">{rec.weight}</td>
                      <td className="px-4 py-2">
                        <span className={diff < 0 ? 'text-primary' : diff > 0 ? 'text-destructive' : 'text-muted-foreground'}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                        </span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{rec.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addPatient, updatePatient, getPatient, calculateBMI, getBMICategory } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AddPatientPage() {
  const { id } = useParams();
  const existing = id ? getPatient(id) : undefined;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: existing?.name || '',
    age: existing?.age?.toString() || '',
    gender: existing?.gender || 'Male',
    height: existing?.height?.toString() || '',
    weight: existing?.weight?.toString() || '',
    dosha: existing?.dosha || 'Vata' as 'Vata' | 'Pitta' | 'Kapha',
    healthIssue: existing?.healthIssue || '',
  });

  const height = parseFloat(form.height) || 0;
  const weight = parseFloat(form.weight) || 0;
  const bmi = calculateBMI(weight, height);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      height,
      weight,
      dosha: form.dosha as 'Vata' | 'Pitta' | 'Kapha',
      healthIssue: form.healthIssue,
    };

    if (id) {
      updatePatient(id, data);
    } else {
      addPatient(data);
    }
    navigate('/patients');
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-foreground">
        {id ? 'Edit Patient' : 'Add New Patient'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Patient Name</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" value={form.age} onChange={e => update('age', e.target.value)} required min={1} max={150} className="mt-1" />
          </div>
          <div>
            <Label>Gender</Label>
            <select value={form.gender} onChange={e => update('gender', e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <Label>Dosha Type</Label>
            <select value={form.dosha} onChange={e => update('dosha', e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>Vata</option>
              <option>Pitta</option>
              <option>Kapha</option>
            </select>
          </div>
          <div>
            <Label>Height (cm)</Label>
            <Input type="number" value={form.height} onChange={e => update('height', e.target.value)} required min={1} className="mt-1" />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" value={form.weight} onChange={e => update('weight', e.target.value)} required min={1} className="mt-1" />
          </div>
        </div>

        {/* BMI Display */}
        {bmi > 0 && (
          <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Calculated BMI</p>
              <p className="text-2xl font-bold text-foreground">{bmi}</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              bmi < 18.5 ? 'bg-warning/20 text-warning' :
              bmi < 25 ? 'bg-primary/15 text-primary' :
              'bg-destructive/15 text-destructive'
            }`}>
              {getBMICategory(bmi)}
            </span>
          </div>
        )}

        <div>
          <Label>Health Issue / Concern</Label>
          <Textarea value={form.healthIssue} onChange={e => update('healthIssue', e.target.value)} className="mt-1" rows={3} />
        </div>

        <div className="flex gap-3">
          <Button type="submit">{id ? 'Update Patient' : 'Add Patient'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/patients')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

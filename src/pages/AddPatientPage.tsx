import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import PageTransition from '@/components/PageTransition';

function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  return 'Overweight';
}

export default function AddPatientPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', age: '', gender: 'Male', height: '', weight: '',
    dosha: 'Vata' as 'Vata' | 'Pitta' | 'Kapha', healthIssue: '',
  });

  useEffect(() => {
    if (id) {
      supabase.from('patients').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setForm({
            name: data.name, age: data.age.toString(), gender: data.gender,
            height: data.height.toString(), weight: data.weight.toString(),
            dosha: data.dosha as any, healthIssue: data.health_issue || '',
          });
        }
      });
    }
  }, [id]);

  const height = parseFloat(form.height) || 0;
  const weight = parseFloat(form.weight) || 0;
  const bmi = calculateBMI(weight, height);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const patientData = {
      name: form.name,
      age: parseInt(form.age),
      gender: form.gender,
      height, weight,
      dosha: form.dosha,
      health_issue: form.healthIssue,
      bmi,
      user_id: user.id,
    };

    if (id) {
      const { error } = await supabase.from('patients').update(patientData).eq('id', id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from('patients').insert({ ...patientData, patient_id: 'TEMP' });
      if (error) { toast.error(error.message); return; }
    }
    navigate('/patients');
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <PageTransition>
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
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <Label>Dosha Type</Label>
              <select value={form.dosha} onChange={e => update('dosha', e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Vata</option><option>Pitta</option><option>Kapha</option>
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
    </PageTransition>
  );
}

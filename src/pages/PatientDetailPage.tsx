import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Utensils, TrendingUp, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import PageTransition from '@/components/PageTransition';
import ProgressChart from '@/components/ProgressChart';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DIET_RULES: Record<string, { breakfast: string[]; lunch: string[]; dinner: string[]; recommended: string[]; avoid: string[] }> = {
  Vata: {
    breakfast: ['Warm oatmeal with ghee and nuts', 'Hot milk with turmeric and almonds', 'Warm rice porridge with cinnamon'],
    lunch: ['Steamed rice with dal and ghee', 'Warm vegetable soup with whole wheat bread', 'Khichdi with vegetables and clarified butter'],
    dinner: ['Warm milk with nutmeg', 'Light soup with soft vegetables', 'Stewed fruits with warm spices'],
    recommended: ['Warm soups', 'Rice', 'Milk', 'Nuts', 'Ghee', 'Cooked vegetables'],
    avoid: ['Cold foods', 'Dry foods', 'Raw salads', 'Carbonated drinks'],
  },
  Pitta: {
    breakfast: ['Fresh fruit salad with coconut', 'Cool mint smoothie with dates', 'Oats with fresh berries and milk'],
    lunch: ['Cucumber salad with rice and mild dal', 'Fresh vegetable stir-fry with coconut oil', 'Mixed grain bowl with cooling herbs'],
    dinner: ['Steamed vegetables with basmati rice', 'Light salad with olive oil dressing', 'Coconut milk pudding with fruits'],
    recommended: ['Fruits', 'Vegetables', 'Cooling foods', 'Coconut', 'Mint'],
    avoid: ['Spicy foods', 'Fried foods', 'Hot peppers', 'Fermented foods'],
  },
  Kapha: {
    breakfast: ['Light millet porridge with honey', 'Herbal tea with dry toast', 'Warm lemon water with light grain cereal'],
    lunch: ['Steamed vegetables with barley', 'Light dal with minimal oil', 'Spiced vegetable soup with millet'],
    dinner: ['Light vegetable broth', 'Small portion of steamed greens', 'Warm herbal tea with light crackers'],
    recommended: ['Light foods', 'Vegetables', 'Low fat meals', 'Spices', 'Legumes'],
    avoid: ['Oily foods', 'Heavy meals', 'Dairy', 'Sweets', 'Excessive salt'],
  },
};

function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  return 'Overweight';
}

interface Patient {
  id: string; patient_id: string; name: string; age: number; gender: string;
  height: number; weight: number; dosha: string; health_issue: string;
  bmi: number; created_at: string;
}
interface DietPlan { id: string; breakfast: string; lunch: string; dinner: string; date: string; }
interface ProgressRecord { id: string; weight: number; remarks: string; date: string; }

function generatePatientPDF(patient: Patient, dietPlans: DietPlan[], progress: ProgressRecord[]) {
  const doc = new jsPDF();
  const rules = DIET_RULES[patient.dosha] || DIET_RULES.Vata;
  let y = 20;

  doc.setFontSize(20); doc.setTextColor(34, 87, 60);
  doc.text('AyurVeda - Patient Summary', 105, y, { align: 'center' });
  y += 12; doc.setDrawColor(34, 87, 60); doc.setLineWidth(0.5); doc.line(14, y, 196, y); y += 10;

  doc.setFontSize(14); doc.setTextColor(0); doc.text('Patient Information', 14, y); y += 8;
  doc.setFontSize(10);
  const info = [
    ['Patient ID', patient.patient_id], ['Name', patient.name], ['Age', `${patient.age} years`],
    ['Gender', patient.gender], ['Height', `${patient.height} cm`], ['Weight', `${patient.weight} kg`],
    ['BMI', `${patient.bmi} (${getBMICategory(patient.bmi)})`], ['Dosha Type', patient.dosha],
    ['Health Issue', patient.health_issue || 'None'], ['Registered', new Date(patient.created_at).toLocaleDateString()],
  ];
  autoTable(doc, { startY: y, body: info, theme: 'grid', styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, fillColor: [240, 245, 240] }, 1: { cellWidth: 140 } }, margin: { left: 14, right: 14 } });
  y = (doc as any).lastAutoTable.finalY + 12;

  doc.setFontSize(14); doc.text(`${patient.dosha} Diet Guidelines`, 14, y); y += 8;
  doc.setFontSize(10); doc.setTextColor(34, 87, 60); doc.text('Recommended:', 14, y); y += 5;
  doc.setTextColor(0); rules.recommended.forEach(item => { doc.text(`  • ${item}`, 14, y); y += 5; }); y += 3;
  doc.setTextColor(180, 40, 40); doc.text('Avoid:', 14, y); y += 5;
  doc.setTextColor(0); rules.avoid.forEach(item => { doc.text(`  • ${item}`, 14, y); y += 5; }); y += 8;

  if (dietPlans.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14); doc.text('Diet Plans', 14, y); y += 8;
    autoTable(doc, { startY: y, head: [['Date', 'Breakfast', 'Lunch', 'Dinner']],
      body: dietPlans.map(p => [p.date, p.breakfast, p.lunch, p.dinner]), theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: [34, 87, 60] }, margin: { left: 14, right: 14 } });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  if (progress.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14); doc.text('Progress Records', 14, y); y += 8;
    autoTable(doc, { startY: y, head: [['Date', 'Weight (kg)', 'Remarks']],
      body: progress.map(r => [r.date, r.weight.toString(), r.remarks]), theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 }, headStyles: { fillColor: [34, 87, 60] }, margin: { left: 14, right: 14 } });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
    doc.text(`Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  doc.save(`${patient.patient_id}_summary.pdf`);
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [progressForm, setProgressForm] = useState({ weight: '', remarks: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    if (!id) return;
    supabase.from('patients').select('*').eq('id', id).single().then(({ data }) => setPatient(data as any));
    supabase.from('diet_plans').select('*').eq('patient_id', id).order('date', { ascending: false }).then(({ data }) => setDietPlans(data || []));
    supabase.from('progress_records').select('*').eq('patient_id', id).order('date').then(({ data }) => setProgress(data || []));
  }, [id]);

  if (!patient) {
    return <div className="text-center py-16"><p className="text-muted-foreground">Loading...</p></div>;
  }

  const rules = DIET_RULES[patient.dosha] || DIET_RULES.Vata;

  const handleGeneratePlan = async () => {
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const { error } = await supabase.from('diet_plans').insert({
      patient_id: patient.id, breakfast: pick(rules.breakfast), lunch: pick(rules.lunch),
      dinner: pick(rules.dinner), date: new Date().toISOString().split('T')[0],
    });
    if (error) { toast.error(error.message); return; }
    const { data } = await supabase.from('diet_plans').select('*').eq('patient_id', patient.id).order('date', { ascending: false });
    setDietPlans(data || []);
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('progress_records').insert({
      patient_id: patient.id, weight: parseFloat(progressForm.weight),
      remarks: progressForm.remarks, date: progressForm.date,
    });
    if (error) { toast.error(error.message); return; }
    const { data } = await supabase.from('progress_records').select('*').eq('patient_id', patient.id).order('date');
    setProgress(data || []);
    setProgressForm({ weight: '', remarks: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-muted-foreground mb-1">{patient.patient_id}</p>
            <h1 className="font-display text-3xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-muted-foreground mt-1">{patient.age} yrs · {patient.gender} · <span className={`dosha-badge-${patient.dosha.toLowerCase()}`}>{patient.dosha}</span></p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => generatePatientPDF(patient, dietPlans, progress)}>
              <Download className="w-4 h-4" /> PDF
            </Button>
            <Link to={`/patients/${patient.id}/edit`}>
              <Button variant="outline" className="gap-2"><Edit className="w-4 h-4" /> Edit</Button>
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-card border rounded-xl p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Patient Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted-foreground">Patient ID</p><p className="font-mono font-semibold text-foreground">{patient.patient_id}</p></div>
            <div><p className="text-muted-foreground">Registered</p><p className="font-semibold text-foreground">{new Date(patient.created_at).toLocaleDateString()}</p></div>
            <div><p className="text-muted-foreground">Diet Plans</p><p className="font-semibold text-foreground">{dietPlans.length}</p></div>
            <div><p className="text-muted-foreground">Progress Entries</p><p className="font-semibold text-foreground">{progress.length}</p></div>
          </div>
          {progress.length > 0 && (
            <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div><p className="text-muted-foreground">Starting Weight</p><p className="font-semibold text-foreground">{patient.weight} kg</p></div>
              <div><p className="text-muted-foreground">Current Weight</p><p className="font-semibold text-foreground">{progress[progress.length - 1].weight} kg</p></div>
              <div>
                <p className="text-muted-foreground">Weight Change</p>
                {(() => {
                  const diff = progress[progress.length - 1].weight - patient.weight;
                  return <p className={`font-semibold ${diff < 0 ? 'text-primary' : diff > 0 ? 'text-destructive' : 'text-foreground'}`}>{diff > 0 ? '+' : ''}{diff.toFixed(1)} kg</p>;
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'BMI', value: patient.bmi, sub: getBMICategory(patient.bmi) },
            { label: 'Height / Weight', value: `${patient.height}cm / ${patient.weight}kg` },
            { label: 'Health Issue', value: patient.health_issue || 'None specified' },
          ].map((card, i) => (
            <div key={card.label} className="stat-card opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              {card.sub && <p className="text-sm text-muted-foreground">{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* Dosha diet guidelines */}
        <div className="bg-card border rounded-xl p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-accent" /> {patient.dosha} Diet Guidelines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-primary flex items-center gap-1 mb-2"><CheckCircle className="w-4 h-4" /> Recommended</h3>
              <ul className="space-y-1 text-sm text-foreground">{rules.recommended.map(f => <li key={f}>• {f}</li>)}</ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-destructive flex items-center gap-1 mb-2"><XCircle className="w-4 h-4" /> Avoid</h3>
              <ul className="space-y-1 text-sm text-foreground">{rules.avoid.map(f => <li key={f}>• {f}</li>)}</ul>
            </div>
          </div>
        </div>

        {/* Diet Plans */}
        <div className="bg-card border rounded-xl p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Diet Plans</h2>
            <Button onClick={handleGeneratePlan} size="sm" className="gap-2"><Utensils className="w-4 h-4" /> Generate Plan</Button>
          </div>
          {dietPlans.length === 0 ? (
            <p className="text-muted-foreground text-sm">No diet plans yet.</p>
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

        {/* Progress */}
        <div className="bg-card border rounded-xl p-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Progress Tracker
          </h2>
          <ProgressChart records={progress} initialWeight={patient.weight} />
          <form onSubmit={handleAddProgress} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 mt-6">
            <div><Label>Date</Label><Input type="date" value={progressForm.date} onChange={e => setProgressForm(f => ({ ...f, date: e.target.value }))} className="mt-1" /></div>
            <div><Label>Weight (kg)</Label><Input type="number" step="0.1" value={progressForm.weight} onChange={e => setProgressForm(f => ({ ...f, weight: e.target.value }))} required className="mt-1" /></div>
            <div className="sm:col-span-2 flex gap-2 items-end">
              <div className="flex-1"><Label>Remarks</Label><Input value={progressForm.remarks} onChange={e => setProgressForm(f => ({ ...f, remarks: e.target.value }))} className="mt-1" /></div>
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
    </PageTransition>
  );
}

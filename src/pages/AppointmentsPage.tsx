import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CalendarPlus, Trash2, Clock } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { Navigate } from 'react-router-dom';

interface Patient {
  id: string;
  name: string;
  patient_id: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  notes: string | null;
  created_at: string;
  patients?: { name: string; patient_id: string };
}

export default function AppointmentsPage() {
  const { user, isAdmin } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdmin) return <Navigate to="/" replace />;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pRes, aRes] = await Promise.all([
      supabase.from('patients').select('id, name, patient_id').order('name'),
      supabase.from('appointments').select('*, patients(name, patient_id)').order('appointment_date', { ascending: true }),
    ]);
    setPatients(pRes.data || []);
    setAppointments((aRes.data as any[]) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !date || !time) {
      toast.error('Please fill patient, date, and time');
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('appointments').insert({
      patient_id: selectedPatient,
      created_by: user!.id,
      appointment_date: date,
      appointment_time: time,
      notes: notes.trim() || null,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Appointment scheduled');
      setSelectedPatient('');
      setDate('');
      setTime('');
      setNotes('');
      loadData();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Appointment deleted');
      loadData();
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage patient appointments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-primary" /> Schedule New Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Patient</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.patient_id} — {p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={today} className="mt-1" />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions..." className="mt-1" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  <CalendarPlus className="w-4 h-4" /> {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {appointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        {(a as any).patients?.name || 'Unknown'}{' '}
                        <span className="text-xs font-mono text-muted-foreground">({(a as any).patients?.patient_id})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        📅 {new Date(a.appointment_date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        {' · '}🕐 {a.appointment_time}
                      </p>
                      {a.notes && <p className="text-sm text-muted-foreground italic">"{a.notes}"</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {appointments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No appointments scheduled yet.</p>
        )}
      </div>
    </PageTransition>
  );
}

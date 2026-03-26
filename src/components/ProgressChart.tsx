import { ProgressRecord } from '@/lib/store';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';

interface ProgressChartProps {
  records: ProgressRecord[];
  initialWeight: number;
}

export default function ProgressChart({ records, initialWeight }: ProgressChartProps) {
  if (records.length === 0) return null;

  const data = [
    { date: 'Start', weight: initialWeight },
    ...records.map(r => ({ date: r.date, weight: r.weight })),
  ];

  const weights = data.map(d => d.weight);
  const minW = Math.floor(Math.min(...weights) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis domain={[minW, maxW]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <ReferenceLine y={initialWeight} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: 'Start', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
          <Area type="monotone" dataKey="weight" stroke="hsl(var(--primary))" fill="url(#weightGrad)" strokeWidth={2} />
          <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

type Goal = {
  start_weight: number;
  target_weight: number;
  start_date: string;
  target_date: string;
  weekly_rate: number | null;
};
type Log = { logged_at: string; weight: number };

export function WeightChart({ goal, logs }: { goal: Goal; logs: Log[] }) {
  const startMs = new Date(goal.start_date).getTime();
  const targetMs = new Date(goal.target_date).getTime();
  const totalDays = Math.max(1, (targetMs - startMs) / 86400000);

  const width = 800;
  const height = 260;
  const padding = 32;

  const weights = [goal.start_weight, goal.target_weight, ...logs.map((l) => l.weight)];
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;

  function x(dateStr: string) {
    const days = (new Date(dateStr).getTime() - startMs) / 86400000;
    return padding + (Math.max(0, Math.min(days, totalDays)) / totalDays) * (width - padding * 2);
  }

  function y(weight: number) {
    return height - padding - ((weight - minW) / (maxW - minW)) * (height - padding * 2);
  }

  const targetLine = `M ${x(goal.start_date)} ${y(goal.start_weight)} L ${x(goal.target_date)} ${y(goal.target_weight)}`;
  const realLine = logs.length
    ? 'M ' + logs.map((l) => `${x(l.logged_at)} ${y(l.weight)}`).join(' L ')
    : '';

  const lastLog = logs[logs.length - 1];
  const expectedNow = goal.weekly_rate
    ? goal.start_weight + goal.weekly_rate * ((Date.now() - startMs) / 86400000 / 7)
    : null;

  return (
    <div className="rounded-xl2 border border-line bg-panel p-5">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-0.5 w-4 bg-cyan" /> Objetivo
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="h-0.5 w-4 bg-white" /> Real
        </span>
        {lastLog && expectedNow && (
          <span className="text-muted">
            Última pesada: <span className="text-white">{lastLog.weight}kg</span> · Esperado hoy:{' '}
            <span className="text-cyan">{expectedNow.toFixed(1)}kg</span>
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <path d={targetLine} fill="none" stroke="#5ECCFA" strokeWidth={2} strokeDasharray="6 4" />
        {realLine && <path d={realLine} fill="none" stroke="#F2F2F2" strokeWidth={2} />}
        {logs.map((l, i) => (
          <circle key={i} cx={x(l.logged_at)} cy={y(l.weight)} r={3.5} fill="#F2F2F2" />
        ))}
      </svg>
    </div>
  );
}

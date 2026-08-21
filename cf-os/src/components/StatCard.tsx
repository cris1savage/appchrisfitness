export function StatCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'high' | 'mid' | 'ok';
}) {
  const toneClass = {
    default: 'text-white',
    high: 'text-risk-high',
    mid: 'text-risk-mid',
    ok: 'text-risk-ok',
  }[tone];

  return (
    <div className="rounded-xl2 border border-line bg-panel px-5 py-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 font-display text-3xl ${toneClass}`}>{value}</p>
    </div>
  );
}

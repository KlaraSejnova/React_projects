import Icon from "./app-icon";

export default function MetricCard({
  icon,
  label,
  value,
  foot,
}: {
  icon: string;
  label: string;
  value: string;
  foot: string;
}) {
  return (
    <section className="metric-card">
      <div className="metric-card-top">
        {label}
        <span className="metric-icon"><Icon name={icon} size={15} /></span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-foot">{foot}</div>
    </section>
  );
}


import type { Run } from "@/lib/runs";
import { getGpsRoutes, projectGpsRoutes } from "@/lib/gps";
import Icon from "./app-icon";

export default function RoutePreview({ run }: { run: Run }) {
  const route = getGpsRoutes([run])[0];
  const projection = route ? projectGpsRoutes([route])[0] : undefined;
  if (!projection) return null;

  return (
    <section className="route-preview panel">
      <div className="panel-heading">
        <div>
          <h2>GPS trasa · {run.title}</h2>
          <p>Orientanční náhled z GPS bodů, bez mapových podkladů.</p>
        </div>
        <span className="chart-legend"><Icon name="pin" size={13} /> {run.distanceKm.toFixed(2)} km</span>
      </div>
      <svg
        aria-label={`Náhled GPS trasy běhu ${run.title}`}
        className="route-svg"
        role="img"
        viewBox="0 0 1000 500"
      >
        <title>{`GPS trasa běhu ${run.title}`}</title>
        <path className="route-path" d={projection.path} />
        <circle className="route-start" cx={projection.start.x} cy={projection.start.y} r="5" />
        <circle className="route-end" cx={projection.end.x} cy={projection.end.y} r="5" />
      </svg>
    </section>
  );
}

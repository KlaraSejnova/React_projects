import type { Run } from "@/lib/runs";
import { getGpsRoutes } from "@/lib/gps";
import Icon from "./app-icon";

export default function RoutePreview({ run }: { run: Run }) {
  const points = getGpsRoutes([run])[0]?.points;
  if (!points) return null;

  let minLatitude = Infinity;
  let maxLatitude = -Infinity;
  let minLongitude = Infinity;
  let maxLongitude = -Infinity;
  for (const point of points) {
    minLatitude = Math.min(minLatitude, point.latitude);
    maxLatitude = Math.max(maxLatitude, point.latitude);
    minLongitude = Math.min(minLongitude, point.longitude);
    maxLongitude = Math.max(maxLongitude, point.longitude);
  }
  const latitudeSpan = maxLatitude - minLatitude || 1;
  const longitudeSpan = maxLongitude - minLongitude || 1;
  const coordinates = points.map((point) => ({
    x: 20 + ((point.longitude - minLongitude) / longitudeSpan) * 460,
    y: 145 - ((point.latitude - minLatitude) / latitudeSpan) * 120,
  }));
  const path = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");

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
        viewBox="0 0 500 170"
      >
        <title>{`GPS trasa běhu ${run.title}`}</title>
        <path className="route-path" d={path} />
        <circle className="route-start" cx={coordinates[0].x} cy={coordinates[0].y} r="5" />
        <circle className="route-end" cx={coordinates.at(-1)?.x} cy={coordinates.at(-1)?.y} r="5" />
      </svg>
    </section>
  );
}

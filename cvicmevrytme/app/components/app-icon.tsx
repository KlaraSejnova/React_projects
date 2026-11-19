import type { ReactNode } from "react";

export default function Icon({
  name,
  size = 17,
}: {
  name: string;
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    brand: (
      <>
        <path d="M5 15.5 9.2 7l2.4 4.5L14 7l5 8.5" />
        <path d="M4 19h16" />
      </>
    ),
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="4" rx="1.5" /><rect x="13.5" y="11.5" width="7" height="9" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    runs: <><path d="m13.5 5.5 2-2 2 2" /><path d="M15.5 3.5v5a3 3 0 0 1-3 3h-2a3 3 0 0 0-3 3v6" /><circle cx="7.5" cy="5.5" r="2" /><path d="m12 13 3 2 3-1" /></>,
    compare: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    distance: <><path d="M5 18.5 18 5.5" /><path d="M7.5 6H5a2 2 0 0 0-2 2v2.5M16.5 18H19a2 2 0 0 0 2-2v-2.5" /><path d="m8 10 2 2m1-5 2 2m-5 5 2 2" /></>,
    pace: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /><path d="M8 3.8 6.5 2.5M16 3.8l1.5-1.3" /></>,
    heart: <path d="M20.5 8.8c0 4.4-8.5 10-8.5 10s-8.5-5.6-8.5-10a4.3 4.3 0 0 1 8.5-1 4.3 4.3 0 0 1 8.5 1Z" />,
    time: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    trash: <><path d="M4 7h16" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3m-5 4v5m4-5v5" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] ?? paths.overview}
    </svg>
  );
}


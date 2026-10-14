import type { ReactNode } from "react";

export const menuItems = [
  { label: "Úvod", href: "#uvod" },
  { label: "O klubu", href: "#o-klubu" },
  { label: "Fotogalerie", href: "/galerie" },
  { label: "Aktuality", href: "#aktuality" },
  { label: "Přispíváme", href: "#prispivame" },
  { label: "Kontakt", href: "#kontakt" },
];

export const gallerySlides = [
  {
    title: "Soutěž o vánoční strom",
    src: "/photos/gallery/2024-2025_soutez-vanocni-strom/04.jpg",
    pos: "center 45%",
  },
  {
    title: "Vánoční vystoupení",
    src: "/photos/gallery/2023-2024_vanocni-vystoupeni/03.jpg",
    pos: "center 45%",
  },
  {
    title: "Finále dračích lodí",
    src: "/photos/gallery/2023-2024_draci-lode/01.jpg",
    pos: "center 50%",
  },
  {
    title: "Vánoční dílničky",
    src: "/photos/gallery/2023-2024_vanocni-dilnicky/12.jpg",
    pos: "center 45%",
  },
  {
    title: "Soutěž o vánoční strom",
    src: "/photos/gallery/2024-2025_soutez-vanocni-strom/01.jpg",
    pos: "center 55%",
  },
  {
    title: "Vánoční vystoupení",
    src: "/photos/gallery/2023-2024_vanocni-vystoupeni/01.jpg",
    pos: "center 45%",
  },
];

export const newsItems = [
  {
    title: "Sklad + nováčci",
    date: "20. 10. 2026, 17:00 (nováčci 17:45)",
    color: "bg-lime-300 text-indigo-950",
  },
  {
    title: "Velikonoční tvoření",
    date: "24. 3. 2026, 16:00",
    color: "bg-pink-500 text-white",
  },
  {
    title: "Úvodní schůzka",
    date: "13. 10. 2025, 17:30",
    color: "bg-sky-300 text-indigo-950",
  },
  {
    title: "Schůzka + sklad",
    date: "14. 5. 2025, 16:30",
    color: "bg-orange-300 text-indigo-950",
  },
];

export const givingItems: {
  title: string;
  color: string;
  icon?: ReactNode;
  src?: string;
}[] = [
  {
    title: "Kurzy první pomoci",
    color: "bg-pink-500 text-white",
    icon: <path d="M8 3h8v5h5v8h-5v5H8v-5H3V8h5z" />,
  },
  {
    title: "Obnova divadelní opony",
    color: "bg-violet-600 text-white",
    icon: (
      <>
        <path d="M4 4h16v7a8 8 0 0 1-16 0z" />
        <path d="M8.5 9v1.5M15.5 9v1.5M8 14c1.2 2.2 6.8 2.2 8 0" />
      </>
    ),
  },
  {
    title: "Dresy a medicinbaly",
    color: "bg-orange-400 text-indigo-950",
    icon: (
      <>
        <circle cx="12" cy="15" r="6" />
        <path d="M8.5 9.5 6 3h4l2 4 2-4h4l-2.5 6.5" />
      </>
    ),
  },
  {
    title: "Sbor a knihovna 1. stupně",
    color: "bg-sky-500 text-white",
    icon: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
  },
  {
    title: "Finále dračích lodí",
    color: "bg-teal-500 text-white",
    src: "/new_year_element_197_a.svg",
  },
  {
    title: "Reproduktory na akce",
    color: "bg-yellow-300 text-indigo-950",
    icon: (
      <>
        <path d="M11 5 6 9H2v6h4l5 4z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
      </>
    ),
  },
];

export const givingByYear = [
  {
    year: "2024/2025",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2024-2025/",
    projects: [
      "Vítání prvňáčků",
      "Odměny „Vánoční strom“",
      "Nákup reproduktorů",
      "Edison",
      "Startovné na Dračí lodě",
      "Loučení s deváťáky",
    ],
  },
  {
    year: "2023/2024",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2023-2024/",
    projects: [
      "Vítání prvňáčků",
      "Odměny v „Podzimní soutěži“",
      "Knihy pro 1. stupeň",
      "Kostýmy pro školní sbor na vánoční vystoupení",
      "Kurz první pomoci",
      "Cesta na finále závodů dračích lodí",
    ],
  },
  {
    year: "2022/2023",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2022-2023/",
    projects: ["Vítání prvňáčků", "Kurz první pomoci"],
  },
  {
    year: "2021/2022",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2021-2022/",
    projects: [
      "Vítání prvňáčků",
      "Nákup altánů a výzdoby školy",
      "Dárek pro odcházející deváťáky",
      "Loučení se školním rokem",
    ],
  },
  {
    year: "2020/2021",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2020-2021/",
    projects: [
      "Vítání prvňáčků",
      "Projekt Edison",
      "Dárek pro odcházející deváťáky",
    ],
  },
  {
    year: "2019/2020",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2019-2020/",
    projects: [
      "Vítání prvňáčků",
      "Projekt Edison",
      "Dárek pro odcházející deváťáky",
    ],
  },
  {
    year: "2018/2019",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2018-2019/",
    projects: [
      "Vítání prvňáčků",
      "Projekt Edison",
      "Nákup nových dresů a vybavení do tělocvičny",
      "Kurz první pomoci",
      "Příspěvek na obnovu divadelní opony",
      "Doprava",
      "Dárek pro odcházející deváťáky",
    ],
  },
];

export default function ContactFooter() {
  return (
    <footer
      id="kontakt"
      className="bg-indigo-950 px-4 py-16 text-center text-slate-200"
    >
      <h2 className="mb-4 text-5xl font-black text-white sm:text-7xl">
        Kontakt
      </h2>
      <p>Klub rodičů při MZŠ a MŠ Brno, z.s.</p>
      <p>Zemědělská 29, 613 00 Brno</p>
      <p className="mt-2">
        <a
          className="font-bold text-yellow-300 hover:underline"
          href="mailto:maskolaklub@seznam.cz"
        >
          maskolaklub@seznam.cz
        </a>
      </p>
      <p className="mt-2">
        <a
          className="font-bold text-yellow-300 hover:underline"
          href="https://www.facebook.com/groups/2869762866466630"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebooková skupina
        </a>
      </p>
    </footer>
  );
}

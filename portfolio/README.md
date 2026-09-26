# Portfolio Kláry Šejnové

Osobní portfolio postavené v Reactu a TypeScriptu. Slouží jako vizuální rozcestník mezi profilem, výlety a vlastními projekty. Design používá ilustraci krajiny jako hlavní navigaci a obrazovky se přepínají bez routeru pomocí lokálního React stavu.

## Co portfolio umí

- úvodní obrazovku s navigací mezi hlavními částmi,
- stránku **O mně** s kontakty, dovednostmi, zkušenostmi a vzděláním,
- stránku **Projekty** s prezentací Weekdashboardu, popisem a screenshotem,
- stránku **Moje výlety** s veřejným přehledem uložených výletů,
- přidávání, úpravu a mazání výletů po přihlášení přes Supabase Auth,
- datum, popis, volitelnou mapu z Mapy.com a fotografii u každého výletu,
- responzivní rozložení pro desktop i mobil.

## Technologie

- React 18
- TypeScript
- Create React App (`react-scripts`)
- Supabase Auth a PostgreSQL
- Sass/CSS
- Testing Library a Jest

## Spuštění lokálně

```bash
npm install
npm start
```

Vývojový server poběží na [http://localhost:3000](http://localhost:3000).

## Proměnné prostředí

V adresáři `portfolio` vytvoř soubor `.env.local`:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Pokud hodnoty nejsou nastavené, portfolio se spustí, ale Supabase funkce nebudou dostupné.

## Supabase a výlety

Tabulka `public.trips` musí obsahovat sloupce `id`, `title`, `date`, `description`, `map_url` a `created_at`. Pro fotky navíc spusť v Supabase SQL editoru [supabase/trip-photos.sql](supabase/trip-photos.sql); migrace přidá sloupec `photo_url` a vytvoří veřejný bucket `trip-photos` s limitem 5 MB. Základní pravidla pro tabulku výletů jsou v [supabase/policies.sql](supabase/policies.sql).

Aktuální pravidla dovolují veřejné čtení a zápis pouze přihlášeným uživatelům. Pokud má být správa omezená jen na konkrétní účet, je potřeba policy zpřísnit podle `auth.uid()`.

## Struktura

```text
src/
├── App.tsx                 # přepínání hlavních obrazovek
├── App.css                 # úvodní krajina a navigace
├── components/
│   ├── profile.tsx         # profil a životopis
│   ├── trips.tsx           # seznam a správa výletů
│   ├── projects.tsx        # přehled projektů
│   └── *.css               # styly jednotlivých obrazovek
├── function/               # pomocné funkce
└── lib/supabase.ts         # volitelné připojení k Supabase
public/
└── ...                     # favicony, krajina, screenshot Weekdashboardu
supabase/
└── policies.sql            # RLS pravidla pro tabulku trips
```

## Testování a build

```bash
npm test -- --watchAll=false
npm run build
```

Produkční build vznikne ve složce `build`.

## Nasazení na Netlify

Kořenový [netlify.toml](../netlify.toml) nastavuje build v adresáři `portfolio` a publikuje `portfolio/build`. V Netlify je potřeba doplnit stejné `REACT_APP_*` proměnné prostředí jako při lokálním vývoji.

## Známé limity

- Navigace používá lokální stav místo URL rout. Po obnovení stránky se otevře úvodní obrazovka.
- Bez Supabase konfigurace není možné přidávat ani upravovat výlety.
- Lokální fallback neslouží jako plnohodnotná náhrada databáze.

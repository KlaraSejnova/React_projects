# Weekdashboard

Týdenní dashboard pro děti. Aplikace pomáhá sledovat malé každodenní úkoly během týdne a proměňuje jejich odškrtávání v jednoduchý rituál.

## Hlavní funkce

- výběr profilu **Barča**, **Terka** nebo **Tester**,
- přihlášení Barči a Terky přes Supabase Auth,
- testovací profil Tester bez hesla,
- přepínání mezi týdny,
- přehled pěti rutin pro všech sedm dní,
- zaškrtávání běžnými profily pro aktuální den,
- plný přístup k týdnu pro Tester profil,
- procentuální ukazatel dokončení,
- motivační dialog po dosažení 75 %,
- desktopová tabulka i mobilní zobrazení jednoho dne,
- ukládání postupu lokálně i do Supabase,
- PWA metadata pro instalaci do zařízení.

## Technologie

- Next.js 16 s App Routerem
- React 19
- TypeScript
- Supabase Auth a PostgreSQL
- CSS s responzivními breakpointy
- statický export pro Netlify

## Spuštění lokálně

```bash
npm install
npm run dev
```

Vývojový server poběží na [http://localhost:3000](http://localhost:3000).

Pro produkční náhled:

```bash
npm run build
npm start
```

## Proměnné prostředí

V adresáři `weekdashboard` vytvoř `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Používej pouze veřejný Supabase anon key, nikdy service role key.

## Přihlášení profilů

Účty pro Barču a Terku se přihlašují přes Supabase Auth. Aplikace kontroluje metadata uživatele:

```json
{ "profile": "barca" }
```

nebo:

```json
{ "profile": "terka" }
```

Profil musí odpovídat volbě na přihlašovací obrazovce. Tester je veřejný testovací profil a nepoužívá Auth účet.

## Databáze

Aktuální obrazovka používá dvě tabulky:

| Tabulka                    | Použití                                            |
| -------------------------- | -------------------------------------------------- |
| `dashboard_progress`       | postup přihlášených účtů podle účtu, týdne a úkolu |
| `dashboard_guest_progress` | sdílený postup veřejného profilu Tester            |

Kompletní SQL včetně RLS pravidel je v [../supabase/dashboard-schema.sql](../supabase/dashboard-schema.sql). Spusť ho v Supabase SQL editoru před prvním testem synchronizace.

U přihlášených účtů je každý řádek navázaný na `auth.uid()`. Tester používá pevný `profile_key = 'tester'`, protože nemá vlastní Auth session. Tento profil je určený pro demo a jeho data nejsou soukromá.

## Jak funguje ukládání

1. Po načtení se zobrazí lokální záloha z `localStorage`.
2. Pokud existuje Supabase připojení, načte se cloudový stav pro aktuální týden.
3. Kliknutí se ihned projeví v UI a uloží se lokálně.
4. Současně proběhne `upsert` do odpovídající Supabase tabulky.
5. Starší lokální hodnoty se mohou při prvním načtení migrovat do cloudu.

## Struktura

```text
app/
├── page.tsx                 # přihlášení, dashboard a ukládání postupu
├── layout.tsx               # metadata, PWA a globální layout
└── globals.css              # vzhled dashboardu a responzivní režimy
lib/
└── supabase.ts              # volitelné Supabase připojení
public/
└── manifest.webmanifest     # PWA manifest
supabase/
└── dashboard-schema.sql     # tabulky a RLS pravidla
```

## Kontrola kvality

```bash
npm run lint
npm run build
```

Statický build vznikne ve složce `out`.

## Nasazení na Netlify

Soubor [netlify.toml](netlify.toml) nastavuje build příkaz `npm install && npm run build` a publikuje složku `out`. V Netlify doplň `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Důležité limity

- Profily a seznam rutin jsou zatím definované přímo v `app/page.tsx`.
- Tabulky `dashboard_profiles`, `dashboard_routines`, `dashboard_weeks` a `dashboard_completions` jsou připravené pro budoucí rozšíření, ale aktuální UI je nepoužívá.
- Tester je záměrně sdílený veřejný demo profil.
- Aktuální export je statický a nasazuje se jako obsah složky `out`.

## Budoucí rozšíření

- správa rutin z databáze,
- více profilů bez hardcodování,
- historie dokončených týdnů,
- administrace úkolů,
- detailnější statistiky a odměny.

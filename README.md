# Klářiny webové projekty

Repozitář obsahuje pět samostatných aplikací. Každá má vlastní `package.json`, závislosti a případné proměnné prostředí; příkazy spouštěj v adresáři daného projektu.

## Přehled projektů

| Projekt | Technologie | Popis |
| --- | --- | --- |
| [Běžecký deník](./cvicmevrytme/README.md) | Next.js, React, TypeScript, Supabase; doprovodná aplikace pro Android | Import a přehled běhů, porovnávání GPS tras a synchronizace s Health Connectem. |
| [Klub rodičů](./klubrodicu/README.md) | Next.js, React, TypeScript, Supabase | Web klubu s galerií, přehledem akcí a jejich administrací. |
| [Portfolio](./portfolio/README.md) | React, TypeScript, Create React App, Supabase | Osobní portfolio, profil, projekty a správa výletů. |
| [Rybicky](./rybicky/README.md) | Next.js, React, Three.js, React Three Fiber | Interaktivní 3D scéna s rybami a možností je krmit kliknutím. |
| [Weekdashboard](./weekdashboard/README.md) | Next.js, React, TypeScript, Supabase | Týdenní přehled dětských rutin a sledování jejich plnění. |

Portfolio představuje Weekdashboard jako jeden z projektů.

## Spuštění

Nainstaluj závislosti v adresáři aplikace a spusť její vývojový server:

| Projekt | Příkazy |
| --- | --- |
| Běžecký deník | `cd cvicmevrytme && npm install && npm run dev` |
| Klub rodičů | `cd klubrodicu && npm install && npm run dev` |
| Portfolio | `cd portfolio && npm install && npm start` |
| Rybicky | `cd rybicky && npm install && npm run dev` |
| Weekdashboard | `cd weekdashboard && npm install && npm run dev` |

Aplikace používají výchozí port `3000`; pro souběžný běh zvol u vývojového serveru další port. Potřebné proměnné prostředí a databázové nastavení jsou popsané v README jednotlivých projektů.

## Kontrola kvality

Příkazy spouštěj v adresáři příslušného projektu:

| Projekt | Kontrola |
| --- | --- |
| Běžecký deník | `npm run lint`, `npm run build` a testy příkazem `node --test lib/runs.test.mjs lib/chart.test.mjs lib/gps.test.mjs lib/remove-short-runs.test.mjs` |
| Klub rodičů | `npm run lint`, `npm run build` |
| Portfolio | `npm test -- --watchAll=false`, `npm run build` |
| Rybicky | `npm run lint`, `npm run build` |
| Weekdashboard | `npm run lint`, `npm run build` |

## Nasazení a společné zdroje

- Kořenový [`netlify.toml`](./netlify.toml) nastavuje nasazení Portfolia.
- [`netlify-weekdashboard.toml`](./netlify-weekdashboard.toml) nastavuje nasazení Weekdashboardu.
- [`klubrodicu/netlify.toml`](./klubrodicu/netlify.toml) nastavuje nasazení webu Klubu rodičů.
- [`supabase/dashboard-schema.sql`](./supabase/dashboard-schema.sql) obsahuje schéma databáze Weekdashboardu.
- Projektové README popisují příslušné migrace a nastavení Supabase.

Každý projekt používá vlastní konfiguraci Supabase a vlastní proměnné prostředí. Tajné hodnoty nevkládej do zdrojového kódu ani do README; v klientských aplikacích používej pouze veřejné klíče.

Ve složce `weekdashboard/weekdashboard` je starší lokální varianta dashboardu. Není samostatně nasazovanou aplikací a používá pouze `localStorage`.

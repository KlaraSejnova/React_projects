# Klářiny webové projekty

Tento repozitář obsahuje dvě propojené, ale samostatně nasaditelné aplikace:

| Projekt                                  | Technologie                          | Účel                                     |
| ---------------------------------------- | ------------------------------------ | ---------------------------------------- |
| [Portfolio](portfolio/README.md)         | React, TypeScript, Create React App  | Osobní portfolio, profil a správa výletů |
| [Weekdashboard](weekdashboard/README.md) | Next.js, React, TypeScript, Supabase | Týdenní přehled dětských úkolů           |

Portfolio odkazuje na živou aplikaci Weekdashboard jako na jeden z prezentovaných projektů.

## Rychlý start

Každý projekt má vlastní `package.json` a spouští se z vlastního adresáře.

### Portfolio

```bash
cd portfolio
npm install
npm start
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000).

### Weekdashboard

```bash
cd weekdashboard
npm install
npm run dev
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000).

## Kontrola před nasazením

```bash
# Portfolio
cd portfolio
npm test -- --watchAll=false
npm run build

# Weekdashboard
cd ../weekdashboard
npm run lint
npm run build
```

## Důležité poznámky

- Portfolio a Weekdashboard mají oddělené závislosti, konfiguraci i build.
- Oba projekty používají Supabase, ale každý má vlastní sadu proměnných prostředí.
- Tajné hodnoty se nevkládají do zdrojového kódu ani do README.
- Podrobné nastavení, databázové SQL a deployment jsou popsány v README jednotlivých projektů.
- Ve složce `weekdashboard/weekdashboard` je starší lokální varianta aplikace. Není to samostatný projekt pro běžné nasazení a používá pouze `localStorage`.

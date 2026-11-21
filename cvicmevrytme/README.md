# Běžecký deník

Webový dashboard pro přehled a porovnávání běžeckých tréninků. Po přihlášení se běhy ukládají do Supabase pod účtem uživatele a jsou dostupné na dalších přihlášených zařízeních. Přihlašovací obrazovka nabízí také read-only demo bez účtu.

Dashboard spravuje stav a synchronizaci v `app/runs-dashboard.tsx`. Jednotlivé obrazovky a sdílené komponenty jsou oddělené v `app/components/`.

## Spuštění

```bash
npm install
cp .env.example .env.local
npm run dev
```

Do `.env.local` doplň `NEXT_PUBLIC_SUPABASE_URL` a veřejný `NEXT_PUBLIC_SUPABASE_ANON_KEY` z nastavení projektu Supabase. Nepoužívej `service_role` ani secret klíč v klientské aplikaci.

Pro prohlédnutí aplikace bez Supabase klikni na přihlašovací obrazovce na **Vyzkoušet demo**. Demo obsahuje čtyři vybrané skutečné běhy včetně statistik a GPS tras. Je dostupné bez přihlášení všem návštěvníkům a dovoluje pouze prohlížení; nic se neukládá ani neupravuje. Běhy do 3 km nejsou v přehledech zobrazeny.

Před prvním přihlášením spusť SQL migraci [`supabase/migrations/20261119150000_create_runs.sql`](./supabase/migrations/20261119150000_create_runs.sql) v Supabase SQL Editoru. Tabulka používá Row Level Security; přihlášený uživatel může číst a měnit pouze vlastní běhy. Poté otevři [http://localhost:3000](http://localhost:3000) a přihlas se existujícím účtem. Aplikace registraci nových účtů nenabízí.

## Nasazení na Netlify

V Netlify vytvoř web z tohoto repozitáře a jako konfigurační soubor vyber [`../netlify-cvicmevrytme.toml`](../netlify-cvicmevrytme.toml). V nastavení webu doplň proměnné prostředí `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY` s hodnotami z projektu Supabase. Použij pouze veřejný anon/publishable klíč, nikdy `service_role` ani secret klíč.

## Import aktivit

Tlačítkem **Importovat běh** vyber složku s TCX soubory z Google Fit. Importované běhy lze zobrazit v přehledu, porovnat libovolný počet aktivit a odebrat z deníku. Ostatní formáty už nelze v rozhraní vybrat; dříve uložené běhy tím nejsou dotčeny.

Deník zobrazuje a importuje pouze běhy delší než 3 km; hranice se posuzuje bez zaokrouhlení. Dříve uložené kratší běhy a běhy přesně 3 km jsou z přehledů skryté. Po přihlášení je můžeš trvale odstranit tlačítkem **Trvale odstranit krátké běhy** a potvrzením; odstranění se týká pouze přihlášeného účtu. Pokud odstranění části záznamů selže, aplikace nahlásí počet odstraněných a zbylé lze zkusit odstranit znovu.

Grafy pro lepší čitelnost jemně zaoblují spojnice mezi jednotlivými body, aniž by měnily uložené hodnoty. Průběh mezi body je pouze interpolace; pokud je k dispozici jen souhrnná hodnota, graf zůstane rovný.

V přehledu graf týdenních kilometrů odpovídá zvolenému období 30 dní, 90 dní nebo celé historii, zobrazuje jen týdny se zaznamenanými běhy a lze jej posouvat vodorovně. První týden omezeného období může obsahovat jen část týdne; detail uvádí začátek období. Při více než 260 týdnech s běhy lze procházet další části tlačítky. Kliknutím na sloupec se zobrazí vzdálenost a jednotlivé běhy daného týdne. Současný týden je zlatý a vybraný modrý; při výběru současného týdne jej zvýrazní zlatý okraj. Dalším kliknutím na stejný sloupec se detail zavře.

V části **Moje běhy** se kliknutím na běh rozbalí jeho vzdálenost, průměrné tempo, čas a převýšení spolu s grafy tempa a nadmořské výšky podle vzdálenosti. Výškový profil se zobrazí jen při dostatku zaznamenaných výškových bodů; samotné souhrnné převýšení neurčuje průběh výšky.

Ve webovém deníku je tep prozatím skrytý; dříve uložené údaje ani jejich import a synchronizace se nemažou ani nevypínají. V porovnání je u každého vybraného běhu uvedena barva jeho křivky a kliknutím lze rozbalit detail jako v části **Moje běhy**.

V **Porovnání** se zobrazují pouze běhy alespoň se dvěma platnými GPS body. Seskupují se orientačně podle podobné trasy bez ohledu na směr: celkové vzdálenosti se smějí lišit nejvýše o 20 % a alespoň 80 % vzorků z každé trasy musí být do 70 m od druhé trasy. Při seskupování se každý běh porovnává s reprezentativním během skupiny. Skupinu lze rozbalit a vybrat všechny její běhy, nebo vybrat jednotlivé běhy i z různých skupin. Náhled skupiny se řídí vybraným během, pokud je ve skupině zobrazený v detailu; jinak ukazuje reprezentativní běh. Miniatura i detail GPS trasy používají stejnou projekci, takže její tvar odpovídá. Trasy se vykreslují bez mapových podkladů a souřadnice se neposílají mapové službě. Pokud chybí dostatek souvislých GPS dat nebo je trasa pro výpočet příliš dlouhá, běh zůstane v samostatné skupině s upozorněním. Běhy bez GPS zůstávají uložené a viditelné v ostatních částech deníku.

### TCX z Google Fit

Z Google Takeout vyber tlačítkem **Importovat běh** složku s aktivitami. Prohlížeč musí podporovat výběr složek, například Chrome na počítači. Zpracují se pouze soubory TCX a aktivity označené jako běh; ostatní soubory, chůze a další sporty se vynechají. Google Fit může i velmi krátké automaticky rozpoznané úseky ukládat jako samostatné aktivity. Běhy s chybějícími či neplatnými údaji jsou vynechány s upozorněním. Po uložení starších běhů se v přehledu automaticky zobrazí všechna období, aby byly viditelné.

Po výběru složky se běhy automaticky uloží nebo aktualizují bez potvrzovacího náhledu. Dříve potvrzený TCX běh s původním identifikátorem rozpozná import podle přesného času začátku a aktualizuje jej bez vytvoření kopie. Nelze-li možnou shodu se starším záznamem bezpečně určit, nový záznam se vynechá a aplikace zobrazí upozornění; uložený běh nemaže ani nenahrazuje. Duplicity z jiných zdrojů se nemusí rozpoznat.

Průběh tempa se odhaduje z časů a vzdáleností bodů, obvykle po 100 m; při dlouhých mezerách jsou hodnoty mezi body interpolované a nejsou přesným měřením okamžitého tempa. Pokud se vzdálenost aktualizuje skokově, ale GPS body mezi aktualizacemi ukazují pohyb, deník odhadne vzdálenost mezi nimi podle času a tempo zprůměruje přibližně po 500 m. Výškový profil je pak také orientační a grafy na to upozorňují. Pro použití tohoto zpracování je nutné starší běh znovu importovat. Souhrnný čas a vzdálenost pocházejí ze souboru TCX a mohou se lišit od údajů v Google Fit. Když je pohybových bodů málo, graf zobrazí jen souhrnné tempo. GPS se zobrazí pouze tehdy, když je v záznamu. Nové záznamy TCX mají stabilní ID podle času aktivity, takže opakovaný import stejného souboru je aktualizuje; dva různé běhy s úplně stejným časem začátku nelze takto rozlišit. Při ztrátě spojení během ukládání většího importu aplikace nahlásí počet uložených a neuložených běhů; import lze zopakovat.

Testy importu, grafů, ukázkových dat, GPS a odstraňování běhů lze spustit příkazem `node --test lib/runs.test.mjs lib/chart.test.mjs lib/demo-runs.test.mjs lib/gps.test.mjs lib/remove-short-runs.test.mjs` v adresáři projektu s Node.js 24.

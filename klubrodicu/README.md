This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

The Netlify configuration for this app is in `netlify.toml`. When importing this
repository in Netlify, set the base directory to `klubrodicu` and leave the
package directory unset. This app is built as a static Next.js export into
`out`, which Netlify publishes directly.

For more details, see the [Netlify Next.js documentation](https://docs.netlify.com/frameworks/next-js/overview/).

## Správa akcí

Akce se ukládají do Supabase. Veřejná část webu zobrazuje publikované
nadcházející akce v kalendáři a nejbližší z nich v úvodní hero sekci.
Administrace je dostupná na `/administrace-akci`.

1. V Supabase SQL Editoru spusťte `supabase/events.sql`.
2. V Supabase vytvořte uživatelský účet pro správce (bez veřejné registrace).
   Jeho UUID najdete v přehledu uživatelů v Authentication a přidejte ho do
   `event_admins`:

   ```sql
   insert into public.event_admins (user_id)
   values ('UUID_UZIVATELE');
   ```

3. Do `klubrodicu/.env.local` pro lokální vývoj a do proměnných prostředí
   Netlify pro produkci nastavte `NEXT_PUBLIC_SUPABASE_URL` a
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Vzor je v `.env.example`. Po změně
   proměnných je nutné web znovu sestavit.
4. Přihlaste se na `/administrace-akci`, kde lze akce přidávat, upravovat,
   zveřejňovat, skrývat a mazat.

Používá se pouze veřejný anon/publishable klíč; oprávnění ke čtení a změnám
vynucuje Row Level Security v Supabase. Nikdy do webu nevkládejte `service_role`
klíč.

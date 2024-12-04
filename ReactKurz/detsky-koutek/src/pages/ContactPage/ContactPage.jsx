import "./ContactPage.css";

export const ContactPage = () => {
  return (
    <div className="container contact">
      <h1>Kontakt </h1>
      <main>
        <p>
          Pokud máte jakékoliv otázky, nápady nebo nám chcete prostě jen napsat,
          zanechte nám zprávu přes náš kontaktní formulář a my se vám co
          nejdříve ozveme. Pokud preferujete jiný způsob komunikace, můžete nám
          také napsat e-mail na adresu{" "}
          <a className="link-email" href="mailto:info@detskykoutek.cz">
            info@detskykoutek.cz
          </a>{" "}
          nebo nás kontaktovat přes naše sociální sítě. Děkujeme vám za vaši
          zpětnou vazbu a těšíme se na vaše zprávy!
        </p>
      </main>
    </div>
  );
};

import Icon from "./app-icon";

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div>
        <Icon name="pin" size={23} />
        <h2>Zatím tu žádné běhy nejsou</h2>
        <p>Klikni na Importovat běh a vyber složku s TCX soubory z Google Fit.</p>
      </div>
    </div>
  );
}

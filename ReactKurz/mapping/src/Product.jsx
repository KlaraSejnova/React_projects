export const Product = ({ name, amount, done }) => (
  <div className="item">
    <span className="item_name">{name}</span>
    <span>{amount}</span>
    <span className={done ? "item__done--tick" : undefined}></span>
  </div>
);

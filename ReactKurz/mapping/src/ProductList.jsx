import { Product } from "./Product";

export const ProduceList = ({ list }) =>
  list.map((item, id) => (
    <Product
      key={id}
      name={item.product}
      amount={item.amount}
      done={item.done}
    ></Product>
  ));

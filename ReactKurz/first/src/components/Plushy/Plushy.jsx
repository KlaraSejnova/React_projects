const Plushy = (props) => {
  const { image, name, text } = props;
  return (
    <div class="plushy">
      <img class="plushy__image" src={image} />
      <h2 class="plushy__name">{name}</h2>
      <p class="plushy__text">{text}</p>
    </div>
  );
};

export default Plushy;

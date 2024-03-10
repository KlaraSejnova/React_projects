const clickable = (event: any) => {
  const div = event.currentTarget;
  div.classList.add("clickStart");
};
export default clickable;

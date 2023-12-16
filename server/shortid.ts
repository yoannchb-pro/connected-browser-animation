export function shortid(size = 6) {
  const chars = [
    [48, 57],
    [66, 90],
    [97, 122],
  ];
  const rnd = (min: number, max: number) =>
    min + Math.floor(Math.random() * (max + 1 - min));
  let id = "";
  while (id.length < size) {
    const [rangeMin, rangeMax] = chars[rnd(0, chars.length - 1)];
    id += String.fromCharCode(rnd(rangeMin, rangeMax));
  }
  return id;
}

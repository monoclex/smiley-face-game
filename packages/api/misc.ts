// https://stackoverflow.com/a/11683720/3780113
// i know the idea behind bresenham's line, but i don't wanna bother to figure out how this code does it
//
// TODO: it is possible to crash the server with really big numbers for the start/stop of this line. a fix would be to use math to figure
// out where to start the line at to prevent the size of numbers from getting in the way of drawing blocks.
export function bresenhamsLine(x1: number, y1: number, x2: number, y2: number, place: (x: number, y: number) => void) {
  const width = x2 - x1;
  const height = y2 - y1;

  const dirX1 = width < 0 ? -1 : width > 0 ? 1 : 0;
  let dirX2 = dirX1;
  const dirY1 = height < 0 ? -1 : height > 0 ? 1 : 0;
  let dirY2 = dirY1;

  let longest = Math.abs(width);
  let shortest = Math.abs(height);
  if (!(longest > shortest)) {
    const tmp = shortest;
    shortest = longest;
    longest = tmp;

    dirX2 = 0;
  } else {
    dirY2 = 0;
  }

  let numerator = longest / 2;
  let x = x1,
    y = y1;
  for (let i = 0; i <= longest; i++) {
    place(x, y);
    numerator += shortest;

    if (numerator < longest) {
      x += dirX2;
      y += dirY2;
    } else {
      numerator -= longest;
      x += dirX1;
      y += dirY1;
    }
  }
}

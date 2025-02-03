/**
 * UID generator for the spheres
 * @param {number} size
 * @returns
 */
const shortid = (size = 6) => {
  const chars = [
    [48, 57],
    [66, 90],
    [97, 122],
  ];
  const rnd = (min, max) => min + Math.floor(Math.random() * (max + 1 - min));
  let id = "";
  while (id.length < size) {
    const [rangeMin, rangeMax] = chars[rnd(0, chars.length - 1)];
    id += String.fromCharCode(rnd(rangeMin, rangeMax));
  }
  return id;
};

const ID = shortid();
const padding = 300;
let width = 0;
let height = 0;
let otherSpheres = [];
let deltaX =
  Math.floor((window.screen.width - padding) * Math.random()) + padding / 2;
let deltaY =
  Math.floor((window.screen.height - padding) * Math.random()) + padding / 2;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const setupSize = () => {
  canvas.width = width = document.body.offsetWidth;
  canvas.height = height = document.body.offsetHeight;
};

setupSize();
window.addEventListener("resize", setupSize);

/**
 * Broadcast for other spheres
 */
const broadcast = new BroadcastChannel("spheres");

broadcast.addEventListener(
  "message",
  function ({ data: { id, sphereX, sphereY } }) {
    const sphere = otherSpheres.find((sphere) => sphere.id === id);
    if (sphere) {
      sphere.sphereX = sphereX;
      sphere.sphereY = sphereY;
    } else {
      otherSpheres.push({ id, sphereX, sphereY });
    }
  }
);

setInterval(
  () =>
    broadcast.postMessage({
      id: ID,
      sphereX: deltaX,
      sphereY: deltaY,
    }),
  1000
);

/**
 * Canvas
 */
const FPS = 50;
const PARTICLES = [];
const PARTICLES_PER_LAYER = 60;

/**
 * Generate the color based on the point position on the circle
 * @param {number} radius
 * @returns
 */
const generateColorOnRadius = (radius) => {
  const rndDelta = Math.floor(Math.random() * 50);
  return `rgb(${255 - radius - rndDelta}, ${radius + rndDelta}, 0)`;
};

// Generation of the points for the sphere
for (let i = 0; i < 20; ++i) {
  for (let j = 0; j < PARTICLES_PER_LAYER; ++j) {
    const radius = i * 10 + Math.floor(Math.random() * 20);
    PARTICLES.push({
      radius: radius,
      pos: j,
      color: generateColorOnRadius(radius / 1.5),
    });
  }
}

setInterval(() => {
  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  // Particles
  for (const particle of PARTICLES) {
    particle.pos += (1 / particle.radius) * 15;

    const delta = ((Math.PI * 2) / PARTICLES_PER_LAYER) * particle.pos;
    const x = Math.cos(delta) * particle.radius;
    const y = Math.sin(delta) * particle.radius;

    ctx.beginPath();
    ctx.fillStyle = particle.color;
    ctx.arc(
      deltaX - window.screenX + x,
      deltaY - window.screenY + y,
      2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  // Line to other spheres
  for (const sphere of otherSpheres) {
    ctx.beginPath();
    ctx.strokeStyle = "#ff0000";
    ctx.moveTo(deltaX - window.screenX, deltaY - window.screenY);
    ctx.lineTo(
      sphere.sphereX - window.screenX,
      sphere.sphereY - window.screenY
    );
    ctx.stroke();
  }
}, 1000 / FPS);

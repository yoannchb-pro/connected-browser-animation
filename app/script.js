const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let id;
let width = 0;
let height = 0;

const setupSize = () => {
  canvas.width = width = document.body.offsetWidth;
  canvas.height = height = document.body.offsetHeight;
};

const initConnection = async () => {
  const req = await fetch("http://localhost:3000/register", {
    method: "POST",
    body: JSON.stringify({
      sphereX: window.screenX,
      sphereY: window.screenY,
    }),
  });
  const res = await req.json();
  id = res.data.id;
};

const updatePosition = () => {
  fetch("http://localhost:3000/update", {
    method: "POST",
    body: JSON.stringify({
      id,
      sphereX: window.screenX,
      sphereY: window.screenY,
    }),
  });
};

const closeConnection = () => {
  fetch("http://localhost:3000/remove", {
    method: "POST",
    body: JSON.stringify({
      id,
    }),
  });
};

setupSize();
window.addEventListener("resize", setupSize);

/* CANVAS */
const FPS = 50;
const PARTICLES = [];
const PARTICLES_PER_LAYER = 60;

const generateColorOnRadius = (radius) => {
  const rndDelta = Math.floor(Math.random() * 50);
  return `rgb(${255 - radius - rndDelta}, ${radius + rndDelta}, 0)`;
};

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

  for (const particle of PARTICLES) {
    particle.pos += (1 / particle.radius) * 15;

    const delta = ((Math.PI * 2) / PARTICLES_PER_LAYER) * particle.pos;
    const x = Math.cos(delta) * particle.radius;
    const y = Math.sin(delta) * particle.radius;

    ctx.beginPath();
    ctx.fillStyle = particle.color;
    ctx.arc(
      window.screen.width / 2 - window.screenX + x,
      window.screen.height / 2 - window.screenY + y,
      2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}, 1000 / FPS);

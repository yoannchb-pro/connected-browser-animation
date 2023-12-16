(async function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  let id;
  let width = 0;
  let height = 0;

  let otherSpheres = [];

  let deltaX = Math.floor(window.screen.width * Math.random());
  let deltaY = Math.floor(window.screen.height * Math.random());

  const setupSize = () => {
    canvas.width = width = document.body.offsetWidth;
    canvas.height = height = document.body.offsetHeight;
  };

  const getOtherSpheres = async () => {
    const req = await fetch("http://localhost:3000/");
    otherSpheres = (await req.json()).filter((sphere) => sphere.id !== id);
  };

  const initConnection = async () => {
    const req = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sphereX: deltaX,
        sphereY: deltaY,
      }),
    });
    const res = await req.json();
    console.log(res);
    id = res.data.id;
  };

  const updatePosition = () => {
    fetch("http://localhost:3000/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        sphereX: deltaX,
        sphereY: deltaY,
      }),
    });
  };

  const closeConnection = async () => {
    try {
      await fetch("http://localhost:3000/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });
    } catch (e) {
      console.log(e);
    }
    return;
  };

  setupSize();
  window.addEventListener("resize", setupSize);
  window.addEventListener("beforeunload", closeConnection);

  await initConnection();

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
    // Backend call
    getOtherSpheres();
    updatePosition();
  }, 1000);

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
})();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { shortid } from "./shortid";

type Instance = {
  id: string;
  sphereX: number;
  sphereY: number;
};

const app = express();

app.use(cors());
app.use(bodyParser.json());

const INSTANCES: Instance[] = [];

app.get("/", function (req, res) {
  res.json(INSTANCES);
});

app.post("/register", function (req, res) {
  const { sphereX, sphereY } = req.body;
  const parsed = { sphereX: Number(sphereX), sphereY: Number(sphereY) };

  if (Number.isNaN(parsed.sphereX) || Number.isNaN(parsed.sphereY)) {
    return res.json({ error: true, message: "Invalide sphere coordinates" });
  }

  const id = shortid();
  INSTANCES.push({
    id,
    ...parsed,
  });

  res.json({ error: false, data: { id } });
});

app.post("/update", function (req, res) {
  const { id, sphereX, sphereY } = req.body;
  const parsed = { sphereX: Number(sphereX), sphereY: Number(sphereY) };

  const index = INSTANCES.findIndex((ins) => ins.id === id);

  if (!id || index === -1) {
    return res.json({
      error: true,
      message: "Invalide id",
    });
  }

  if (Number.isNaN(parsed.sphereX) || Number.isNaN(parsed.sphereY)) {
    return res.json({
      error: true,
      message: "Invalide sphere coordinates",
    });
  }

  INSTANCES[index].sphereX = parsed.sphereX;
  INSTANCES[index].sphereY = parsed.sphereY;

  res.json({ error: false, data: { id } });
});

app.post("/remove", function (req, res) {
  const id = req.body.id;
  const index = INSTANCES.findIndex((ins) => ins.id === id);
  if (index !== -1) INSTANCES.splice(index, 1);
});

console.log("App listening on http://localhost:3000");
app.listen(3000);

import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL ?? "http://localhost:3000";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const navLinks = page.locator('nav[aria-label="Navegación principal"] a');
  const count = await navLinks.count();
  if (count !== 10) throw new Error(`Se esperaban 10 módulos visibles en el DOM y se encontraron ${count}.`);

  const boxes = await Promise.all(
    Array.from({ length: count }, (_, index) => navLinks.nth(index).boundingBox()),
  );
  if (boxes.some((box) => !box || box.width <= 0 || box.height <= 0)) {
    throw new Error("Al menos uno de los diez módulos no tiene una caja visible.");
  }

  const visibleBoxes = boxes.filter(Boolean);
  for (let index = 1; index < visibleBoxes.length; index += 1) {
    const previous = visibleBoxes[index - 1];
    const current = visibleBoxes[index];
    if (current.x < previous.x + previous.width) {
      throw new Error(`Solapamiento detectado entre los módulos ${index} y ${index + 1}.`);
    }
  }
  if (visibleBoxes.some((box) => box.x < 0 || box.x + box.width > 1280)) {
    throw new Error("Al menos uno de los diez módulos desborda el viewport de escritorio de 1280 px.");
  }

  const emblem = page.getByRole("img", {
    name: /Emblema oficial JAC Bellavista 1991 - Todos Somos Comunidad/i,
  }).first();
  const emblemBox = await emblem.boundingBox();
  if (!emblemBox || emblemBox.width <= 0 || emblemBox.height <= 0) {
    throw new Error("El emblema SVG oficial no está visible en la página principal.");
  }

  console.log(JSON.stringify({
    viewport: "1280x720",
    visibleModules: count,
    noOverlap: true,
    emblemVisible: true,
    moduleBoxes: visibleBoxes.map(({ x, y, width, height }) => ({ x, y, width, height })),
  }));
} finally {
  await browser.close();
}

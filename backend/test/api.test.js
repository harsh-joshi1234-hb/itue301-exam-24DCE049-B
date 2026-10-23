const test = require("node:test");
const assert = require("node:assert");
const app = require("../app");

let server, base;
test.before(async () => {
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => { server.closeAllConnections?.(); server.close(); });

const call = (path, opts = {}) => fetch(base + path, { signal: AbortSignal.timeout(1500), ...opts });
const post = (body) => call("/api/v1/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("GET /api/v1/orders returns 200 and an array", async () => {
  const res = await call("/api/v1/orders");
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(await res.json()));
});

test("GET /api/v1/orders/1 returns that order; unknown id returns 404 JSON", async () => {
  const ok = await call("/api/v1/orders/1");
  assert.strictEqual(ok.status, 200);
  assert.strictEqual((await ok.json()).id, 1);
  const missing = await call("/api/v1/orders/9999");
  assert.strictEqual(missing.status, 404);
  assert.ok((await missing.json()).error);
});

test("POST computes kcal = round(kcal/100g x weightG / 100 x qty)", async () => {
  const res = await post({ itemName: "Samosa", qty: 2, weightG: 60 });
  assert.strictEqual(res.status, 201);
  const body = await res.json();
  assert.strictEqual(body.kcal, 312);
  assert.strictEqual(body.qty, 2);
  assert.strictEqual(body.weightG, 60);
});

test("POST defaults: qty 1 and weightG 100", async () => {
  const res = await post({ itemName: "Masala Chai" });
  assert.strictEqual(res.status, 201);
  const body = await res.json();
  assert.strictEqual(body.qty, 1);
  assert.strictEqual(body.weightG, 100);
  assert.strictEqual(body.kcal, 50);
});

test("POST with an unknown item returns 400 JSON", async () => {
  const res = await post({ itemName: "Pizza" });
  assert.strictEqual(res.status, 400);
  assert.ok((await res.json()).error);
});

test("POST with qty outside 1-10 or not whole returns 400", async () => {
  for (const qty of [0, 11, 2.5]) assert.strictEqual((await post({ itemName: "Samosa", qty })).status, 400, `qty ${qty}`);
});

test("POST with weightG of 0 or less returns 400", async () => {
  for (const weightG of [0, -10]) assert.strictEqual((await post({ itemName: "Samosa", weightG })).status, 400, `weightG ${weightG}`);
});

test("DELETE existing returns 200; unknown returns 404 JSON", async () => {
  const created = await (await post({ itemName: "Veg Thali" })).json();
  assert.strictEqual((await call(`/api/v1/orders/${created.id}`, { method: "DELETE" })).status, 200);
  const res = await call("/api/v1/orders/9999", { method: "DELETE" });
  assert.strictEqual(res.status, 404);
  assert.ok((await res.json()).error);
});

test("Unhandled error returns JSON 500 without a stack trace", async () => {
  const res = await call("/api/v1/boom");
  assert.strictEqual(res.status, 500);
  assert.match(res.headers.get("content-type"), /json/);
  assert.ok(!JSON.stringify(await res.json()).includes(" at "), "stack trace leaked");
});

const test = require("node:test");
const assert = require("node:assert");
const MenuItem = require("../models/MenuItem");
const { formatValidationError } = require("../utils/formatError");

const good = { name: "Samosa", price: 15, caloriesPer100g: 260 };
const errs = (o) => new MenuItem({ ...good, ...o }).validateSync()?.errors || {};

test("a valid item passes; defaults are snack, available true, weightG 100", () => {
  const doc = new MenuItem(good);
  assert.strictEqual(doc.validateSync(), undefined);
  assert.strictEqual(doc.category, "snack");
  assert.strictEqual(doc.available, true);
  assert.strictEqual(doc.weightG, 100);
});

test("name is required, trimmed and at most 50 characters", () => {
  assert.ok(errs({ name: undefined }).name);
  assert.strictEqual(new MenuItem({ ...good, name: "  Tea  " }).name, "Tea");
  assert.ok(errs({ name: "x".repeat(51) }).name);
  assert.ok(!errs({ name: "x".repeat(50) }).name);
});

test("price: 0 allowed, negative rejected", () => {
  assert.ok(!errs({ price: 0 }).price);
  assert.ok(errs({ price: -1 }).price);
});

test("category must be snack, meal or drink", () => {
  assert.ok(errs({ category: "pizza" }).category);
  assert.ok(!errs({ category: "meal" }).category);
});

test("caloriesPer100g is required and must be 0 to 900", () => {
  assert.ok(errs({ caloriesPer100g: undefined }).caloriesPer100g);
  assert.ok(errs({ caloriesPer100g: -1 }).caloriesPer100g);
  assert.ok(errs({ caloriesPer100g: 901 }).caloriesPer100g);
  assert.ok(!errs({ caloriesPer100g: 900 }).caloriesPer100g);
});

test("weightG must be 1 to 2000", () => {
  assert.ok(errs({ weightG: 0 }).weightG);
  assert.ok(errs({ weightG: 2001 }).weightG);
  assert.ok(!errs({ weightG: 400 }).weightG);
});

test("a drink may not weigh more than 500 g (other categories may)", () => {
  assert.ok(!errs({ category: "drink", weightG: 150 }).weightG);
  assert.ok(!errs({ category: "drink", weightG: 500 }).weightG);
  assert.ok(errs({ category: "drink", weightG: 600 }).weightG);
  assert.ok(!errs({ category: "meal", weightG: 600 }).weightG);
});

test("formatValidationError returns a clean, plain object", () => {
  const err = new MenuItem({ price: -1, category: "pizza", caloriesPer100g: 1200 }).validateSync();
  const out = formatValidationError(err);
  assert.strictEqual(out.error, "Validation failed");
  assert.ok(Array.isArray(out.details) && out.details.length === 4);
  assert.ok(out.details.every((d) => d.field && d.message));
  assert.ok(!(out instanceof Error) && !("errors" in out));
});

# FINDINGS - ITUE301 Set A (Campus Canteen Pre-Order)

**Student ID:** 24DCE049  
**Batch:** B  
**Set:** A  

---

## Summary Table

| Task | Where (file / line) | Why it stopped the rules being met | How I fixed it |
|------|---------------------|------------------------------------|----------------|
| T1 | `frontend/src/pages/MenuPage.jsx` | Missing `key` prop and mismatched prop names (`title`, `cost` instead of `name`, `price`). | Added `key={item.id}` and passed correct props `name` and `price`. |
| T1 | `frontend/src/components/MenuCard.jsx` | Did not render portion weight or energy in kcal, missing required props. | Destructured `caloriesPer100g` and `weightG`, calculated kcal via `kcal()` and rendered portion weight and kcal. |
| T1 | `frontend/src/utils/nutrition.js` | `weightOf()` returned `undefined` when `weightG` was missing, producing `NaN` for energy. | Added fallback to 100g (`item?.weightG ?? 100`). |
| T2 | `frontend/src/components/NavBar.jsx` | Used `<a href="...">` anchor tags which caused full-page reloads. | Replaced `<a href>` with `react-router-dom` `<Link to="...">`. |
| T2 | `frontend/src/pages/OrderPage.jsx` | Name input had no `onChange` handler; state mutated directly with `cart.push`; no remove item button; derived totals were incomplete; no 1000 kcal restriction. | Added `onChange` handler, immutable `setCart([...cart, item])`, remove item button, derived cart totals (`totalCount`, `totalPrice`, `totalEnergy`), and 1000 kcal limit validation displaying "Calorie limit of 1000 kcal exceeded". |
| T3 | `frontend/src/pages/SpecialsPage.jsx` | `useEffect` lacked a dependency array causing an infinite loop; HTTP status errors (outside 200-299) were not handled; no retry button; available items were not listed first; missing available counter. | Added dependency array `[]`, verified `res.ok`, added error state with `Retry` button, implemented stable sorting with available specials first, and added `"<n> of <total> available"` counter. |
| T4 | `backend/app.js` (logger & middleware) | Logger middleware did not invoke `next()`, causing all requests to hang; `express.json()` was registered below routes. | Added `next()` in the logger middleware and moved `app.use(express.json())` before routes. |
| T4 | `backend/app.js` (orders & error handling) | Missing `DELETE /api/v1/orders/:id`; `POST` lacked input validation and `kcal` calculation; error handler had only 3 parameters and leaked stack traces. | Added `DELETE` route with 200/404 responses; added validation for `itemName`, `qty` (1-10 whole number), and `weightG` (>0), computing `kcal`; converted error handler to 4-parameter `(err, req, res, next)` returning 500 without stack trace. |
| T5 | `backend/models/MenuItem.js` | `price` used `max: 0` instead of `min: 0`; `category` default was capitalized `"Snack"`; drink weight validator checked `v >= 500` instead of `v <= 500`. | Changed `price` to `min: 0`, `category` default to `"snack"`, and drink validator to `v <= 500`. |
| T5 | `backend/utils/formatError.js` | Returned the raw error instead of the required formatted plain object. | Formatted errors into `{ error: "Validation failed", details: [ { field, message }, ... ] }`. |
| T5 | `backend/seed.js` | Seed logic was incomplete without saving a valid item and reporting formatted error for invalid item. | Implemented database connection, saved one valid menu item, and logged formatted validation error for an invalid item. |

---

## Detailed Task Findings

### T1 — The Menu (Components and Props)
- **What was wrong:**
  1. In `frontend/src/pages/MenuPage.jsx`, `<MenuCard>` elements rendered in a loop without a unique `key` prop, and passed incorrect prop names (`title={item.name}` and `cost={item.price}`) instead of `name` and `price`.
  2. In `frontend/src/components/MenuCard.jsx`, portion weight in grams and energy in kcal were not rendered, and the component did not destructure `caloriesPer100g` or `weightG`.
  3. In `frontend/src/utils/nutrition.js`, `weightOf()` returned `item.weightG` directly, which evaluates to `undefined` when absent and causes `kcal()` to compute `NaN`.
- **Why it mattered:**
  React logged console warnings regarding missing unique keys. The cards displayed missing or inaccurate information without price, portion weight, or energy values. Missing weights resulted in `NaN kcal`.
- **How you fixed it:**
  1. Updated `frontend/src/utils/nutrition.js` to ensure `weightOf` returns `item.weightG ?? 100`, providing a default portion weight of 100g.
  2. Updated `frontend/src/components/MenuCard.jsx` to receive and format portion weight (`${weightG} g`), energy (`${kcal} kcal`), price (`₹${Number(price).toFixed(2)}`), category, and availability label.
  3. Updated `frontend/src/pages/MenuPage.jsx` to pass `key={item.id}`, `name={item.name}`, and `price={item.price}`.

---

### T2 — The Order (Routing and State)
- **What was wrong:**
  1. `frontend/src/components/NavBar.jsx` used native HTML `<a href="...">` links instead of React Router's `<Link>` component.
  2. In `frontend/src/pages/OrderPage.jsx`, the customer name input had a `value` prop without an `onChange` handler, making it read-only.
  3. `addItem` mutated state directly using `cart.push(item)` and called `setCart(cart)`.
  4. There was no mechanism to remove items from the cart.
  5. Totals (count, price, energy) were either missing or not derived dynamically from cart state.
  6. There was no calorie guard preventing the cart from exceeding 1000 kcal, nor any message when the limit was exceeded.
- **Why it mattered:**
  Clicking navigation links reloaded the entire webpage and wiped out component state. Users could not type their names, state updates failed to trigger React re-renders due to direct mutation, items could not be removed, and orders could exceed the safe 1000 kcal limit without feedback.
- **How you fixed it:**
  1. Converted `NavBar.jsx` anchor tags to `<Link to="...">` from `react-router-dom`.
  2. Added `onChange={(e) => setName(e.target.value)}` to make the name input interactive.
  3. Updated `addItem` to immutably append to state: `setCart((prev) => [...prev, item])`, with a check `if (!item.available) return;`.
  4. Implemented `removeItem` with a per-item "Remove" button that filters out the selected item index.
  5. Derived `totalCount`, `totalPrice`, and `totalEnergy` dynamically directly during render from the `cart` array without redundant state variables.
  6. Added a 1000 kcal threshold check inside `addItem`: if `totalEnergy + itemKcal > 1000`, the item is rejected and `"Calorie limit of 1000 kcal exceeded"` is displayed.

---

### T3 — The Specials Board (API Consumption)
- **What was wrong:**
  1. `frontend/src/pages/SpecialsPage.jsx` had a `useEffect` hook without a dependency array (`[]`), causing it to fetch data repeatedly on every render in an infinite loop.
  2. `fetch(URL)` did not check `res.ok`, so HTTP error status codes (e.g. 404, 500) were treated as successful responses.
  3. Network errors and rejected promises did not reset `loading`, causing the component to freeze in an invalid state.
  4. There was no "Retry" button to re-fetch data upon failure without a full-page reload.
  5. Specials were not sorted with available items displayed first.
  6. The required availability counter (`<n> of <total> available`) was missing.
- **Why it mattered:**
  The component triggered thousands of unnecessary network requests, crashed or froze during API failures without a way to recover, and presented unsorted data without availability summaries.
- **How you fixed it:**
  1. Added `[]` dependency array wrapped in a memoized `fetchSpecials` callback to execute the request exactly once on mount.
  2. Added validation `if (!res.ok) throw new Error(...)` to catch HTTP errors outside 200–299.
  3. Added proper error handling that sets `loading: false` and renders an error alert with a working "Retry" button.
  4. Implemented stable sorting separating available specials (`!item.completed`) before sold out ones while preserving their original API order.
  5. Added `<p>{availableCount} of {totalCount} available</p>`.

---

### T4 — The Orders Service (Express and Middleware)
- **What was wrong:**
  1. The request logging middleware `[METHOD] [PATH] [TIMESTAMP]` in `backend/app.js` omitted `next()`, causing all incoming HTTP requests to hang until timeout.
  2. `app.use(express.json())` was mounted below the route handlers, so `req.body` was `undefined` in POST routes.
  3. `POST /api/v1/orders` lacked input validation for `itemName` (must be in canteen menu), `qty` (must be whole number between 1 and 10), and `weightG` (must be > 0), and did not compute the `kcal` field.
  4. `DELETE /api/v1/orders/:id` endpoint was completely missing.
  5. The global error handler had only 3 arguments `(err, req, res)` rather than the 4 required by Express `(err, req, res, next)`, and returned the internal stack trace in the JSON payload.
- **Why it mattered:**
  The server was completely unresponsive. Requests timed out, POST requests could not read payload data or validate orders, orders could not be deleted, and unhandled exceptions leaked sensitive stack traces to clients.
- **How you fixed it:**
  1. Added `next()` to the logging middleware.
  2. Relocated `app.use(express.json())` above all route definitions.
  3. In `POST /api/v1/orders`, validated `itemName` against `MENU`, validated `qty` (whole number 1-10, defaulting to 1), validated `weightG` (number > 0, defaulting to 100), computed `kcal = Math.round(((MENU[itemName] * weightG) / 100) * qty)`, and returned status 201 with `{ id, itemName, qty, weightG, kcal }`. Returned 400 `{ "error": "..." }` on validation failure.
  4. Implemented `DELETE /api/v1/orders/:id`, returning status 200 when found and 404 `{ "error": "Order not found" }` when absent.
  5. Updated the global error handler to standard 4 arguments `(err, req, res, next)` returning status 500 `{ "error": "Something went wrong" }` without stack trace.

---

### T5 — The Menu Data (MongoDB and Mongoose)
- **What was wrong:**
  1. In `backend/models/MenuItem.js`, `price` validation incorrectly specified `max: 0` instead of `min: 0`, rejecting all positive prices.
  2. `category` default was set to capitalized `"Snack"`, violating the lowercase enum `["snack", "meal", "drink"]`.
  3. `weightG` drink validation checked `v >= 500` instead of `v <= 500`, rejecting valid drink portion sizes and allowing drinks over 500g.
  4. In `backend/utils/formatError.js`, `formatValidationError` returned the raw Mongoose error instead of a plain client-safe object.
  5. In `backend/seed.js`, the database seed logic was incomplete and did not save a valid item or log the formatted error for an invalid item.
- **Why it mattered:**
  Creating any valid menu item in MongoDB failed schema validation. Drinks over 500g were permitted while normal drinks were rejected. Validation errors returned internal Mongoose objects instead of the required `{ error: "Validation failed", details: [...] }` structure.
- **How you fixed it:**
  1. Corrected `MenuItem.js` schema: set `price` to `min: [0, ...]`, `category` default to `"snack"`, and the drink validator to `this.category !== "drink" || v <= 500`.
  2. Implemented `formatValidationError(err)` in `backend/utils/formatError.js` to map `err.errors` into an array of `{ field, message }` inside `{ error: "Validation failed", details }`.
  3. Updated `backend/seed.js` to connect to MongoDB, save a valid menu item document, catch validation failure on an invalid item, and display the formatted output using `formatValidationError`.
  4. Executed `npm run seed` against local MongoDB and saved the document screenshot as `evidence/db.png`.

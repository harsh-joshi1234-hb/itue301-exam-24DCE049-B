export function weightOf(item) {
  return item && item.weightG !== undefined && item.weightG !== null ? item.weightG : 100;
}

export function kcal(item) {
  const calories = item && item.caloriesPer100g !== undefined ? item.caloriesPer100g : 0;
  return Math.round((calories * weightOf(item)) / 100);
}

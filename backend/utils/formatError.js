// Formats a Mongoose ValidationError into a clean, client-safe plain object:
// { error: "Validation failed", details: [ { field, message }, ... ] }
function formatValidationError(err) {
  const details = Object.keys(err?.errors || {}).map((field) => ({
    field,
    message: err.errors[field].message,
  }));

  return {
    error: "Validation failed",
    details,
  };
}

module.exports = { formatValidationError };

function removeNullUndefinedKeys(obj) {
  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      removeNullUndefinedKeys(obj[key]);
    }
  }
  return obj;
}

module.exports = { removeNullUndefinedKeys };

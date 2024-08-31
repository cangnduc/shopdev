const updateNestedObject = (obj) => {
  const final = {};
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const nested = updateNestedObject(obj[key]);
      Object.keys(nested).forEach((nestedKey) => {
        final[`${key}.${nestedKey}`] = nested[nestedKey];
      });
    } else {
      final[key] = obj[key];
    }
  });
  console.log(final);
  return final;
};

module.exports = updateNestedObject;

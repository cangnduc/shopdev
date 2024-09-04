// ["a", "b", "c"] => {a: 1, b: 1, c: 1}
const convertArrayToObject = (array) => {
  return array.reduce((acc, cur) => {
    acc[cur] = 1;
    return acc;
  }, {});
};
// ["a", "b", "c"] => {a: 0, b: 0, c: 0}
const convertArrayToObject0 = (array) => {
  return array.reduce((acc, cur) => {
    acc[cur] = 0;
    return acc;
  }, {});
};

module.exports = {
  convertArrayToObject,
  convertArrayToObject0,
};

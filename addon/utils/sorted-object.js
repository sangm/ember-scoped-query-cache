
export default function sortedObject(obj) {
  return Object
    .keys(obj)
    .sort()
    .reduce((reducedObj, key) => {
      reducedObj[key] = obj[key];
      return reducedObj;
    }, {});
}

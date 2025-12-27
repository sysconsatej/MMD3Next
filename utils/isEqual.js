export const objectsEqual = (o1, o2) => {
  const keys1 = Object.keys(o1);
  const keys2 = Object.keys(o2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (typeof o1[key] === 'object' && o1[key] !== null && typeof o2[key] === 'object' && o2[key] !== null) {
        if (!objectsEqual(o1[key], o2[key])) return false;
    } else if (o1[key] !== o2[key]) {
      return false;
    }
  }

  return true;
}
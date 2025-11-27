export const validatePanCard = (val) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (val !== String(val).toUpperCase())
    return { error: "Pan card should be always in caps" };

  if (!panRegex.test(val)) return { error: "Pan Number is invalid " };

  return true;
};

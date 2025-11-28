export const validPinCode = (val) => {
  const regex = /^(\d{4}|\d{6})$/;
  if (!regex.test(val)) {
    return { error: "Inavlid Post code" };
  }

  return true;
};

export const isValidStoreID = (s: string): boolean => {
  return /^(?=.*[0-9])(?=.*[a-zA-Z]).{4}$/.test(s);
};

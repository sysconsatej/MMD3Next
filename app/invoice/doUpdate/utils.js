export const handleChange = ({ setJsonData }) => {
  return {
    hssChangeHandler: async (name, value) => {
      try {
        console.log("name", name);
        console.log("value", value);
      } catch (error) {
        console.log(error);
      }
    },
  };
};

export type ValidationErrors = {
  formErrors: string[];
  fieldErrors: {
    [k: string]: string[];
  };
};

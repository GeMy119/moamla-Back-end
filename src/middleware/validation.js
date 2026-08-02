export const validation = (schema) => {
  return (req, res, next) => {
    const inputs = { ...req.body };
    if (req.file) inputs.image = req.file;

    const { error } = schema.validate(inputs, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      // إرجاع 400 Bad Request بدل ما يضرب 500
      return next(new AppErr(errorMessages.join(', '), 400));
    }

    next();
  };
};
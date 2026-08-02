// ✅ التعديل الصح للـ Validation Middleware:
export const validation = (schema) => {
  return (req, res, next) => {
    // دمج req.file أو req.files مع req.body للتحقق منهم لو Schema فيها صورة
    const filterData = { ...req.body };
    if (req.file) filterData.image = req.file;
    if (req.files) filterData.files = req.files;

    const { error } = schema.validate(filterData, { abortEarly: false });
    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return next(new AppErr(message, 400));
    }
    next();
  };
};
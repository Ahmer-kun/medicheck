import Joi from "joi";

export const batchValidation = {
  createBatch: Joi.object({
    batchNo: Joi.string().required(),
    name: Joi.string().required(),
    medicineName: Joi.string().required(),
    formulation: Joi.string().required(),
    manufactureDate: Joi.date().required(),
    expiryDate: Joi.date().required().greater(Joi.ref("manufactureDate")),
    quantity: Joi.number().required().min(1),
  }),
};

export const authValidation = {
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required().min(6),
  }),
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

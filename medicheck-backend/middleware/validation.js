import Joi from "joi";

// Existing validations
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

// NEW: Viewer registration validation
export const viewerRegistrationValidation = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 20 characters',
      'any.required': 'Username is required'
    }),
    
  password: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase letters and numbers',
      'any.required': 'Password is required'
    }),
    
  name: Joi.string()
    .required()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      'string.pattern.base': 'Name can only contain letters and spaces',
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Full name is required'
    }),
    
  email: Joi.string()
    .required()
    .email()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    
  cnic: Joi.string()
    .required()
    .pattern(/^\d{5}-\d{7}-\d{1}$/)
    .messages({
      'string.pattern.base': 'CNIC must be in format: 12345-1234567-1',
      'any.required': 'CNIC is required'
    }),
    
  phone: Joi.string()
    .required()
    .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
      'any.required': 'Phone number is required'
    }),
    
  address: Joi.string()
    .required()
    .min(10)
    .max(200)
    .messages({
      'string.min': 'Address must be at least 10 characters',
      'string.max': 'Address cannot exceed 200 characters',
      'any.required': 'Address is required'
    })
});

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.details[0].message 
      });
    }
    next();
  };
};
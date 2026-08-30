import { body, ValidationChain } from 'express-validator';

export const registerValidator: ValidationChain[] = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('companyName')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),

  body('phone')
    .optional({ checkFalsy: true }),

  body('subdomain')
    .optional({ checkFalsy: true }),

  body('firstName')
    .optional({ checkFalsy: true }),

  body('lastName')
    .optional({ checkFalsy: true }),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// CommonJS interop for legacy JS callers
module.exports = { registerValidator, loginValidator };
module.exports.registerValidator = registerValidator;
module.exports.loginValidator = loginValidator;

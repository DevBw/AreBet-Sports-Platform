// ===============================================
// COMPREHENSIVE INPUT VALIDATION UTILITIES
// Reusable validation functions for forms and data
// ===============================================

// Basic validation rules
export const VALIDATION_RULES = {
  required: (value) => ({
    isValid: value != null && value !== '',
    message: 'This field is required'
  }),
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: !value || emailRegex.test(value),
      message: 'Please enter a valid email address'
    };
  },
  
  minLength: (min) => (value) => ({
    isValid: !value || value.length >= min,
    message: `Must be at least ${min} characters long`
  }),
  
  maxLength: (max) => (value) => ({
    isValid: !value || value.length <= max,
    message: `Must be no more than ${max} characters long`
  }),
  
  numeric: (value) => ({
    isValid: !value || !isNaN(value),
    message: 'Must be a valid number'
  }),
  
  positive: (value) => ({
    isValid: !value || parseFloat(value) > 0,
    message: 'Must be a positive number'
  }),
  
  url: (value) => {
    try {
      if (!value) return { isValid: true, message: '' };
      new URL(value);
      return { isValid: true, message: '' };
    } catch {
      return { isValid: false, message: 'Please enter a valid URL' };
    }
  }
};

// Validate a single field
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true, message: '' };
};

// Validate entire form
export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, rules] of Object.entries(validationSchema)) {
    const fieldValue = formData[fieldName];
    const validation = validateField(fieldValue, rules);
    
    if (!validation.isValid) {
      errors[fieldName] = validation.message;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

// Common validation schemas
export const VALIDATION_SCHEMAS = {
  login: {
    email: [VALIDATION_RULES.required, VALIDATION_RULES.email],
    password: [VALIDATION_RULES.required, VALIDATION_RULES.minLength(6)]
  },
  
  signup: {
    email: [VALIDATION_RULES.required, VALIDATION_RULES.email],
    password: [VALIDATION_RULES.required, VALIDATION_RULES.minLength(8)],
    fullName: [VALIDATION_RULES.required, VALIDATION_RULES.minLength(2)]
  },
  
  search: {
    query: [VALIDATION_RULES.required, VALIDATION_RULES.minLength(2)]
  },

  profile: {
    fullName: [VALIDATION_RULES.required, VALIDATION_RULES.minLength(2)]
  }
};

export default {
  VALIDATION_RULES,
  validateField,
  validateForm,
  VALIDATION_SCHEMAS
};
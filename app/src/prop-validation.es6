/**
 * Enhanced prop validation utilities for Mailspring React components
 * Provides comprehensive prop type checking with better error messages and debugging
 */

import PropTypes from 'prop-types';

/**
 * Create enhanced prop types with custom validation and error messages
 */
export class PropValidator {
  /**
   * Create a required prop validator with custom error message
   * @param {string} typeName - The type name for error messages
   * @param {function} validator - The prop type validator function
   * @param {string} customMessage - Custom error message
   * @returns {function} Enhanced prop type validator
   */
  static required(typeName, validator = PropTypes.any, customMessage = null) {
    const validatorFunc = function(props, propName, componentName, ...rest) {
      // First check if prop is missing
      if (props[propName] === undefined || props[propName] === null) {
        const message = customMessage || 
          `Required prop '${propName}' of type '${typeName}' was not provided to '${componentName}'`;
        return new Error(message);
      }
      
      // Then run the original validator
      return validator(props, propName, componentName, ...rest);
    };

    // Add a custom name for better debugging
    validatorFunc.isRequired = validatorFunc;
    validatorFunc.__customType = typeName;
    
    return validatorFunc;
  }

  /**
   * Create an optional prop validator with custom validation
   * @param {string} typeName - The type name for error messages
   * @param {function} validator - The prop type validator function
   * @param {string} customMessage - Custom error message
   * @returns {function} Enhanced prop type validator
   */
  static optional(typeName, validator = PropTypes.any, customMessage = null) {
    const validatorFunc = function(props, propName, componentName, ...rest) {
      // Skip validation if prop is not provided
      if (props[propName] === undefined || props[propName] === null) {
        return null;
      }
      
      return validator(props, propName, componentName, ...rest);
    };

    validatorFunc.__customType = typeName;
    return validatorFunc;
  }

  /**
   * Create a prop validator that checks for specific values
   * @param {Array} allowedValues - Array of allowed values
   * @param {string} customMessage - Custom error message
   * @returns {function} Prop type validator
   */
  static oneOf(allowedValues, customMessage = null) {
    return PropTypes.oneOf(allowedValues);
  }

  /**
   * Create a prop validator for objects with specific shape
   * @param {object} shape - Object describing the expected shape
   * @param {string} customMessage - Custom error message
   * @returns {function} Prop type validator
   */
  static shape(shape, customMessage = null) {
    return PropTypes.shape(shape);
  }

  /**
   * Create a prop validator for arrays of specific type
   * @param {function} type - The type validator for array items
   * @param {string} customMessage - Custom error message
   * @returns {function} Prop type validator
   */
  static arrayOf(type, customMessage = null) {
    return PropTypes.arrayOf(type);
  }

  /**
   * Create a prop validator for objects with specific values
   * @param {object} objectShape - Object describing value types
   * @param {string} customMessage - Custom error message
   * @returns {function} Prop type validator
   */
  static exact(objectShape, customMessage = null) {
    return PropTypes.exact(objectShape);
  }
}

/**
 * Common prop type definitions used across the application
 */
export const CommonPropTypes = {
  /**
   * Account ID prop validator
   */
  accountId: PropValidator.required('string', PropTypes.string, 
    'accountId must be a non-empty string'),

  /**
   * Array of account IDs prop validator
   */
  accountIds: PropValidator.required('array', PropTypes.arrayOf(PropTypes.string), 
    'accountIds must be an array of strings'),

  /**
   * Message/Thread ID prop validator
   */
  id: PropValidator.required('string', PropTypes.string, 
    'id must be a non-empty string'),

  /**
   * Header message ID prop validator
   */
  headerMessageId: PropValidator.required('string', PropTypes.string, 
    'headerMessageId must be a non-empty string'),

  /**
   * Draft prop validator
   */
  draft: PropValidator.required('object', PropTypes.object, 
    'draft must be a valid draft object'),

  /**
   * Thread prop validator
   */
  thread: PropValidator.required('object', PropTypes.object, 
    'thread must be a valid thread object'),

  /**
   * Array of threads prop validator
   */
  threads: PropValidator.optional('array', PropTypes.arrayOf(PropTypes.object), 
    'threads must be an array of thread objects'),

  /**
   * Category prop validator
   */
  category: PropValidator.optional('object', PropTypes.object, 
    'category must be a valid category object'),

  /**
   * Array of categories prop validator
   */
  categories: PropValidator.optional('array', PropTypes.arrayOf(PropTypes.object), 
    'categories must be an array of category objects'),

  /**
   * File prop validator
   */
  file: PropValidator.required('object', PropTypes.object, 
    'file must be a valid file object'),

  /**
   * Array of files prop validator
   */
  files: PropValidator.optional('array', PropTypes.arrayOf(PropTypes.object), 
    'files must be an array of file objects'),

  /**
   * String or number prop validator
   */
  stringOrNumber: PropValidator.required('string|number', 
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]), 
    'Prop must be a string or number'),

  /**
   * Date prop validator
   */
  date: PropValidator.optional('date', PropTypes.instanceOf(Date), 
    'date must be a Date object'),

  /**
   * Function prop validator
   */
  function: PropValidator.required('function', PropTypes.func, 
    'Prop must be a function'),

  /**
   * Callback function prop validator
   */
  callback: PropValidator.optional('function', PropTypes.func, 
    'callback must be a function'),

  /**
   * CSS class name prop validator
   */
  className: PropValidator.optional('string', PropTypes.string, 
    'className must be a string'),

  /**
   * Style object prop validator
   */
  style: PropValidator.optional('object', PropTypes.object, 
    'style must be an object'),

  /**
   * Children prop validator
   */
  children: PropValidator.optional('node', PropTypes.node, 
    'children must be a valid React node'),

  /**
   * Boolean prop validator
   */
  boolean: PropValidator.optional('boolean', PropTypes.bool, 
    'Prop must be a boolean'),

  /**
   * Number prop validator
   */
  number: PropValidator.optional('number', PropTypes.number, 
    'Prop must be a number'),
};

/**
 * Higher-order component for adding prop validation to React components
 * @param {function} Component - The component to wrap
 * @param {object} propTypes - The prop types to validate
 * @param {string} componentName - Name of the component for error messages
 * @returns {function} Wrapped component with prop validation
 */
export function withPropValidation(Component, propTypes, componentName = Component.displayName || Component.name) {
  const WrappedComponent = function(props) {
    // Validate props in development
    if (process.env.NODE_ENV !== 'production') {
      const error = PropTypes.checkPropTypes(propTypes, props, 'prop', componentName);
      if (error) {
        console.error(`Prop validation error in ${componentName}:`, error.message);
        console.error('Invalid props:', props);
      }
    }
    
    return <Component {...props} />;
  };

  // Copy static properties
  Object.keys(Component).forEach(key => {
    WrappedComponent[key] = Component[key];
  });

  // Set display name
  WrappedComponent.displayName = `WithPropValidation(${Component.displayName || Component.name})`;
  
  // Set prop types for documentation
  WrappedComponent.propTypes = propTypes;
  
  return WrappedComponent;
}

/**
 * Utility function to create comprehensive prop type definitions
 * @param {object} definitions - Object mapping prop names to their validators
 * @returns {object} Prop types object
 */
export function createPropTypes(definitions) {
  const propTypes = {};
  
  Object.keys(definitions).forEach(propName => {
    const definition = definitions[propName];
    
    if (typeof definition === 'function') {
      propTypes[propName] = definition;
    } else if (definition && definition.type) {
      // Handle definition objects with type and options
      const { type, required = false, ...options } = definition;
      
      if (required) {
        propTypes[propName] = PropValidator.required(type.name, type, options.customMessage);
      } else {
        propTypes[propName] = PropValidator.optional(type.name, type, options.customMessage);
      }
    }
  });
  
  return propTypes;
}

export default {
  PropValidator,
  CommonPropTypes,
  withPropValidation,
  createPropTypes,
};
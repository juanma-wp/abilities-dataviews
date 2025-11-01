/**
 * Validation Utilities
 * 
 * Functions for validating input values against schema definitions.
 */

/**
 * Validates input values against a schema definition
 * 
 * @param {Object} inputValues - The values to validate
 * @param {Object} schema - The schema definition with properties and requirements
 * @returns {Object} Object with field names as keys and error messages as values
 */
export const validateInput = (inputValues, schema) => {
	const errors = {};
	
	if (!schema?.properties) {
		return errors;
	}

	Object.keys(schema.properties).forEach(key => {
		const prop = schema.properties[key];
		const value = inputValues[key];
		const isRequired = schema.required?.includes(key) || !Object.prototype.hasOwnProperty.call(prop, 'default');

		// Check required fields
		if (isRequired && !value) {
			errors[key] = 'This field is required';
			return;
		}

		// Skip validation for empty optional fields
		if (!value && !isRequired) {
			return;
		}

		// Type-specific validation
		if (value) {
			// Array validation
			if (prop.type === 'array') {
				try {
					const parsed = JSON.parse(value);
					if (!Array.isArray(parsed)) {
						errors[key] = 'Must be a valid JSON array';
					} else if (prop.items?.enum) {
						// Validate enum values
						const invalidValues = parsed.filter(v => !prop.items.enum.includes(v));
						if (invalidValues.length > 0) {
							errors[key] = `Invalid values: ${invalidValues.join(', ')}. Allowed: ${prop.items.enum.join(', ')}`;
						}
					}
				} catch {
					errors[key] = 'Must be valid JSON array format';
				}
			}

			// Object validation
			if (prop.type === 'object') {
				try {
					const parsed = JSON.parse(value);
					if (typeof parsed !== 'object' || Array.isArray(parsed)) {
						errors[key] = 'Must be a valid JSON object';
					}
				} catch {
					errors[key] = 'Must be valid JSON object format';
				}
			}

			// Number validation
			if (prop.type === 'number' || prop.type === 'integer') {
				const num = Number(value);
				if (isNaN(num)) {
					errors[key] = `Must be a valid ${prop.type}`;
				} else {
					if (prop.type === 'integer' && !Number.isInteger(num)) {
						errors[key] = 'Must be an integer';
					}
					if (prop.minimum !== undefined && num < prop.minimum) {
						errors[key] = `Must be at least ${prop.minimum}`;
					}
					if (prop.maximum !== undefined && num > prop.maximum) {
						errors[key] = `Must be at most ${prop.maximum}`;
					}
				}
			}

			// String pattern validation
			if (prop.type === 'string' && prop.pattern) {
				try {
					const regex = new RegExp(prop.pattern);
					if (!regex.test(value)) {
						errors[key] = `Must match pattern: ${prop.pattern}`;
					}
				} catch {
					// Invalid regex pattern in schema
				}
			}

			// Enum validation for string/number types
			if (prop.enum && prop.type !== 'array') {
				if (!prop.enum.includes(value)) {
					errors[key] = `Must be one of: ${prop.enum.join(', ')}`;
				}
			}
		}
	});
	
	return errors;
};

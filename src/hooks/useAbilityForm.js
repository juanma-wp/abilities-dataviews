/**
 * Custom Hook: useAbilityForm
 * 
 * Manages form state and validation for ability execution.
 * Handles input values, validation errors, and form submission.
 */
import { useState, useEffect } from '@wordpress/element';
import { validateInput } from '../utils/validation';

/**
 * Custom hook for managing ability execution form state
 * 
 * @param {Object} schema - The input schema for the ability
 * @returns {Object} Form state and handlers
 */
const useAbilityForm = (schema) => {
	const [inputValues, setInputValues] = useState({});
	const [inputErrors, setInputErrors] = useState({});

	// Initialize input values with defaults or empty strings
	useEffect(() => {
		if (!Array.isArray(schema) && schema?.properties) {
			const defaults = {};
			Object.keys(schema.properties).forEach(key => {
				const prop = schema.properties[key];
				defaults[key] = prop.default || '';
			});
			setInputValues(defaults);
		}
	}, [schema]);

	/**
	 * Updates a single input value
	 * 
	 * @param {string} key - The input field key
	 * @param {*} value - The new value
	 */
	const updateValue = (key, value) => {
		setInputValues(prev => ({ ...prev, [key]: value }));
		setInputErrors(prev => ({ ...prev, [key]: '' }));
	};

	/**
	 * Sets multiple values at once (e.g., for example generation)
	 * 
	 * @param {Object} values - Object with field keys and values
	 */
	const setValues = (values) => {
		setInputValues(values);
		setInputErrors({});
	};

	/**
	 * Validates all input values against the schema
	 * 
	 * @returns {boolean} True if validation passes, false otherwise
	 */
	const validate = () => {
		const errors = validateInput(inputValues, schema);
		setInputErrors(errors);
		return Object.keys(errors).length === 0;
	};

	/**
	 * Prepares input data for API submission
	 * Converts JSON strings to objects/arrays and handles empty values
	 * 
	 * @returns {Object|null} Prepared input data or null
	 */
	const prepareInputData = () => {
		if (Array.isArray(schema) || !schema?.properties) {
			return null;
		}

		const inputData = {};
		Object.keys(schema.properties).forEach(key => {
			const prop = schema.properties[key];
			const value = inputValues[key];

			if (value !== '') {
				if (prop.type === 'array') {
					try {
						inputData[key] = JSON.parse(value);
					} catch {
						inputData[key] = [];
					}
				} else {
					inputData[key] = value;
				}
			}
		});

		// If all fields are empty, pass null for abilities that accept no input
		return Object.keys(inputData).length === 0 ? null : inputData;
	};

	return {
		inputValues,
		inputErrors,
		updateValue,
		setValues,
		validate,
		prepareInputData,
	};
};

export default useAbilityForm;

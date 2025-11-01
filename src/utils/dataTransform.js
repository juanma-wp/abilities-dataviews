/**
 * Data Transformation Utilities
 * 
 * Functions for transforming and formatting data structures.
 */

/**
 * Transforms raw abilities data for use in DataViews
 * 
 * @param {Array} abilitiesData - Raw abilities data from API
 * @returns {Array} Transformed abilities with flattened metadata and IDs
 */
export const transformAbilitiesData = (abilitiesData) => {
	return abilitiesData.map((ability, index) => ({
		id: index + 1,
		...ability,
		// Flatten meta annotations for easier display
		readonly: ability.meta?.annotations?.readonly || false,
		destructive: ability.meta?.annotations?.destructive || false,
		idempotent: ability.meta?.annotations?.idempotent || false,
		show_in_rest: ability.meta?.show_in_rest || false,
		// Format input_schema for display
		input_type: Array.isArray(ability.input_schema) ? 'none' :
					(ability.input_schema?.type || 'object'),
		// Format output_schema for display
		output_type: ability.output_schema?.type || 'unknown'
	}));
};

/**
 * Generates example input data based on a schema definition
 * 
 * @param {Object} schema - Schema definition with properties
 * @returns {Object|null} Example input object or null if schema is invalid
 */
export const generateExampleInput = (schema) => {
	if (Array.isArray(schema) || !schema?.properties) {
		return null;
	}

	const example = {};
	Object.keys(schema.properties).forEach(key => {
		const prop = schema.properties[key];

		// Use default if available
		if (prop.hasOwnProperty('default')) {
			example[key] = prop.default;
		} else if (prop.enum) {
			// Use first enum value as example
			example[key] = prop.type === 'array' ? [prop.items?.enum?.[0]] : prop.enum[0];
		} else {
			// Generate based on type
			switch (prop.type) {
				case 'string':
					example[key] = prop.format === 'email' ? 'example@email.com' :
									prop.format === 'url' ? 'https://example.com' :
									'example';
					break;
				case 'number':
				case 'integer':
					example[key] = prop.minimum || 1;
					break;
				case 'boolean':
					example[key] = false;
					break;
				case 'array':
					if (prop.items?.enum) {
						example[key] = [prop.items.enum[0]];
					} else {
						example[key] = [];
					}
					break;
				case 'object':
					example[key] = {};
					break;
				default:
					example[key] = null;
			}
		}
	});

	return example;
};

/**
 * Extract unique categories from abilities data for filtering
 * 
 * @param {Array} abilities - Array of ability objects
 * @returns {Array} Array of category objects with value and label
 */
export const extractCategories = (abilities) => {
	return [...new Set(abilities.map(ability => ability.category))]
		.filter(Boolean)
		.sort()
		.map(cat => ({
			value: cat,
			label: cat.split('-').map(word =>
				word.charAt(0).toUpperCase() + word.slice(1)
			).join(' ')
		}));
};

/**
 * Abilities API Service
 * 
 * Service module for interacting with the WordPress Abilities API.
 * Provides functions to fetch and execute abilities.
 */

/**
 * Fetches all available abilities from the WordPress Abilities API
 * 
 * @returns {Promise<Array>} Array of ability objects
 * @throws {Error} If the Abilities API is not available or request fails
 */
export const getAbilities = async () => {
	if (typeof wp === "undefined" || !wp.abilities) {
		throw new Error("WordPress Abilities API is not available");
	}
	
	const { getAbilities: fetchAbilities } = wp.abilities;
	return await fetchAbilities();
};

/**
 * Executes a specific ability with provided input data
 * 
 * @param {string} abilityName - Name of the ability to execute
 * @param {*} inputData - Input data for the ability (can be null)
 * @returns {Promise<*>} Result from executing the ability
 * @throws {Error} If the Abilities API is not available or execution fails
 */
export const executeAbility = async (abilityName, inputData) => {
	if (typeof wp === "undefined" || !wp.abilities) {
		throw new Error("WordPress Abilities API is not available");
	}
	
	const { executeAbility: execute } = wp.abilities;
	return await execute(abilityName, inputData);
};

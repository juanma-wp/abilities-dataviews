/**
 * Custom Hook: useAbilityExecution
 * 
 * Manages the state and logic for executing abilities.
 * Handles loading states, results, and errors.
 */
import { useState } from '@wordpress/element';
import { executeAbility } from '../services/abilitiesApi';

/**
 * Custom hook for managing ability execution
 * 
 * @returns {Object} Execution state and handlers
 */
const useAbilityExecution = () => {
	const [isExecuting, setIsExecuting] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	/**
	 * Executes an ability with the provided input data
	 * 
	 * @param {string} abilityName - Name of the ability to execute
	 * @param {*} inputData - Input data for the ability
	 */
	const execute = async (abilityName, inputData) => {
		setIsExecuting(true);
		setError(null);
		setResult(null);

		try {
			const executionResult = await executeAbility(abilityName, inputData);
			setResult(executionResult);
			console.log(`Executed ${abilityName}:`, executionResult);
		} catch (err) {
			setError(err.message);
			console.error(`Error executing ${abilityName}:`, err);
		} finally {
			setIsExecuting(false);
		}
	};

	/**
	 * Resets the execution state
	 */
	const reset = () => {
		setIsExecuting(false);
		setResult(null);
		setError(null);
	};

	return {
		isExecuting,
		result,
		error,
		execute,
		reset,
	};
};

export default useAbilityExecution;

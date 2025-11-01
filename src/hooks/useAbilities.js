/**
 * Custom Hook: useAbilities
 * 
 * Manages loading and state of abilities data from the API.
 */
import { useState, useEffect } from '@wordpress/element';
import { getAbilities } from '../services/abilitiesApi';
import { transformAbilitiesData } from '../utils/dataTransform';

/**
 * Custom hook for loading abilities data
 * 
 * @returns {Object} Abilities data and loading state
 */
const useAbilities = () => {
	const [abilities, setAbilities] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadAbilities = async () => {
			try {
				const abilitiesData = await getAbilities();
				const transformedData = transformAbilitiesData(abilitiesData);
				setAbilities(transformedData);
				setIsLoading(false);
			} catch (error) {
				console.error("Error loading abilities:", error);
				setIsLoading(false);
			}
		};

		loadAbilities();
	}, []);

	return {
		abilities,
		isLoading,
	};
};

export default useAbilities;

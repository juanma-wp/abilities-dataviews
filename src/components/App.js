/**
 * App Component
 * 
 * Main application component for the Abilities Dashboard.
 * Displays abilities in a DataViews table with filtering and actions.
 */
import { useState } from '@wordpress/element';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews/wp';
import useAbilities from '../hooks/useAbilities';
import { extractCategories } from '../utils/dataTransform';
import { createFields, createActions, defaultLayouts, initialView } from '../utils/dataViewsConfig';

/**
 * App Component - Main dashboard component
 * 
 * @returns {JSX.Element} Abilities dashboard application
 */
const App = () => {
	const { abilities, isLoading } = useAbilities();
	const [view, setView] = useState(initialView);

	// Extract unique categories from abilities for filtering
	const categoryElements = extractCategories(abilities);

	// Define fields and actions for DataViews
	const fields = createFields(categoryElements);
	const actions = createActions();

	// Use filterSortAndPaginate to process the data based on view configuration
	const { data: processedAbilities, paginationInfo } = filterSortAndPaginate(
		abilities,
		view,
		fields
	);

	if (isLoading) {
		return <p>Loading abilities...</p>;
	}

	if (abilities.length === 0) {
		return <p>No abilities found.</p>;
	}

	return (
		<div style={{ padding: '20px' }}>
			<div style={{ marginBottom: '20px' }}>
				<p>
					This dashboard lets you explore and execute <strong>WordPress Abilities</strong> interactively. 
					Use the table below to browse available abilities, filter and search, view input/output schemas, and run abilities directly from the interface.
				</p>
			</div>
			<DataViews
				data={processedAbilities}
				fields={fields}
				view={view}
				onChangeView={setView}
				actions={actions}
				paginationInfo={paginationInfo}
				supportedLayouts={['table']}
				defaultLayouts={defaultLayouts}
			/>
		</div>
	);
};

export default App;

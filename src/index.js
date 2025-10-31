/**
 * WordPress dependencies
 */
import domReady from "@wordpress/dom-ready";
import { createRoot } from "@wordpress/element";
import { DataViews } from '@wordpress/dataviews/wp';
import { useState, useEffect } from '@wordpress/element';

/**
 * Styles - Import DataViews styles
 */
import './style.scss';

console.log("Test Stream Abilities API JS loaded!");

const App = () => {
	const [abilities, setAbilities] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadAbilities = async () => {
			if (typeof wp !== "undefined" && wp.abilities) {
				const { getAbilities } = wp.abilities;
				try {
					const abilitiesData = await getAbilities();
					// Transform abilities data to include an id field for DataViews
					const transformedData = abilitiesData.map((ability, index) => ({
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
					setAbilities(transformedData);
					setIsLoading(false);
				} catch (error) {
					console.error("Error loading abilities:", error);
					setIsLoading(false);
				}
			} else {
				console.warn("wp.abilities is NOT available!");
				setIsLoading(false);
			}
		};

		loadAbilities();
	}, []);

	// Define fields for DataViews columns
	const fields = [
		{
			id: 'name',
			label: 'Ability Name',
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: 'label',
			label: 'Label',
			enableSorting: true,
			enableHiding: true,
		},
		{
			id: 'category',
			label: 'Category',
			enableSorting: true,
			enableHiding: true,
			elements: [
				{ value: 'site', label: 'Site' },
				{ value: 'data-retrieval', label: 'Data Retrieval' },
				{ value: 'content', label: 'Content' },
			],
		},
		{
			id: 'description',
			label: 'Description',
			enableSorting: false,
			enableHiding: true,
			maxWidth: 400,
		},
		{
			id: 'input_type',
			label: 'Input Type',
			enableSorting: true,
			enableHiding: true,
		},
		{
			id: 'output_type',
			label: 'Output Type',
			enableSorting: true,
			enableHiding: true,
		},
		{
			id: 'readonly',
			label: 'Read Only',
			enableSorting: true,
			enableHiding: true,
			render: ({ item }) => item.readonly ? '✓' : '✗',
		},
		{
			id: 'destructive',
			label: 'Destructive',
			enableSorting: true,
			enableHiding: true,
			render: ({ item }) => item.destructive ? '⚠️' : '✓',
		},
		{
			id: 'show_in_rest',
			label: 'REST API',
			enableSorting: true,
			enableHiding: true,
			render: ({ item }) => item.show_in_rest ? '✓' : '✗',
		},
	];

	// Define the view configuration
	const [view, setView] = useState({
		type: 'table',
		perPage: 10,
		page: 1,
		sort: {
			field: 'name',
			direction: 'asc',
		},
		fields: ['name', 'label', 'category', 'description', 'readonly', 'destructive'],
		filters: [],
		search: '',
		hiddenFields: [],
		layout: {
			primaryField: 'name',
		},
	});

	// Define default layouts for different view types
	const defaultLayouts = {
		table: {
			primaryField: 'name',
		},
		grid: {
			primaryField: 'name',
			mediaField: 'label',
		},
		list: {
			primaryField: 'name',
		},
	};

	// Define available actions for each ability
	const actions = [
		{
			id: 'view-details',
			label: 'View Details',
			isPrimary: true,
			callback: (items) => {
				const ability = items[0];
				console.log('Viewing details for:', ability);
				alert(`Ability: ${ability.name}\n\nInput Schema:\n${JSON.stringify(ability.input_schema, null, 2)}\n\nOutput Schema:\n${JSON.stringify(ability.output_schema, null, 2)}`);
			},
		},
		{
			id: 'execute',
			label: 'Execute',
			callback: async (items) => {
				const ability = items[0];
				if (typeof wp !== "undefined" && wp.abilities) {
					const { executeAbility } = wp.abilities;
					try {
						const result = await executeAbility(ability.name);
						console.log(`Executed ${ability.name}:`, result);
						alert(`Executed ${ability.name} successfully!\n\nResult:\n${JSON.stringify(result, null, 2)}`);
					} catch (error) {
						console.error(`Error executing ${ability.name}:`, error);
						alert(`Error executing ${ability.name}: ${error.message}`);
					}
				}
			},
		},
	];

	if (isLoading) {
		return <p>Loading abilities...</p>;
	}

	if (abilities.length === 0) {
		return <p>No abilities found.</p>;
	}

	return (
		<div style={{ padding: '20px' }}>
			<h2>WordPress Abilities DataViews</h2>
			<DataViews
				data={abilities}
				fields={fields}
				view={view}
				onChangeView={setView}
				actions={actions}
				paginationInfo={{
					totalItems: abilities.length,
					totalPages: Math.ceil(abilities.length / view.perPage),
				}}
				supportedLayouts={['table']}
				defaultLayouts={defaultLayouts}
			/>
		</div>
	);
};

domReady( () => {
	const root = document.getElementById( 'abilities-dataviews-root' );
	if ( root ) {
		createRoot( root ).render( <App /> );
	}
} );

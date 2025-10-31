/**
 * WordPress dependencies
 */
import domReady from "@wordpress/dom-ready";
import { createRoot } from "@wordpress/element";
import { DataViews } from '@wordpress/dataviews/wp';
import { useState, useEffect } from '@wordpress/element';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	TextareaControl,
	Notice
} from '@wordpress/components';

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
			RenderModal: ({ items: [item], closeModal }) => {
				const formatSchema = (schema) => {
					if (Array.isArray(schema)) {
						return 'No input required';
					}
					return JSON.stringify(schema, null, 2);
				};

				return (
					<VStack spacing="4">
							<div style={{ marginBottom: '16px' }}>
								<Text size="large" weight="600">Ability: {item.name}</Text>
							</div>

							<div>
								<Text weight="600">Label:</Text>
								<Text>{item.label}</Text>
							</div>

							<div>
								<Text weight="600">Description:</Text>
								<Text>{item.description}</Text>
							</div>

							<div>
								<Text weight="600">Category:</Text>
								<Text>{item.category}</Text>
							</div>

							<div>
								<Text weight="600">Annotations:</Text>
								<ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
									<li>Read Only: {item.readonly ? '✓' : '✗'}</li>
									<li>Destructive: {item.destructive ? '⚠️ Yes' : '✓ No'}</li>
									<li>Idempotent: {item.idempotent ? '✓' : '✗'}</li>
									<li>Show in REST: {item.show_in_rest ? '✓' : '✗'}</li>
								</ul>
							</div>

							<div>
								<Text weight="600">Input Schema:</Text>
								<TextareaControl
									value={formatSchema(item.input_schema)}
									readOnly
									rows={10}
									style={{ fontFamily: 'monospace', fontSize: '12px' }}
								/>
							</div>

							<div>
								<Text weight="600">Output Schema:</Text>
								<TextareaControl
									value={formatSchema(item.output_schema)}
									readOnly
									rows={10}
									style={{ fontFamily: 'monospace', fontSize: '12px' }}
								/>
							</div>

						</VStack>
				);
			},
		},
		{
			id: 'execute',
			label: 'Execute',
			RenderModal: ({ items: [item], closeModal }) => {
				const [isExecuting, setIsExecuting] = useState(false);
				const [result, setResult] = useState(null);
				const [error, setError] = useState(null);

				const executeAbilityHandler = async () => {
					if (typeof wp !== "undefined" && wp.abilities) {
						const { executeAbility } = wp.abilities;
						setIsExecuting(true);
						setError(null);
						setResult(null);

						try {
							const executionResult = await executeAbility(item.name);
							setResult(executionResult);
							console.log(`Executed ${item.name}:`, executionResult);
						} catch (err) {
							setError(err.message);
							console.error(`Error executing ${item.name}:`, err);
						} finally {
							setIsExecuting(false);
						}
					}
				};

				const hasRequiredInput = !Array.isArray(item.input_schema) &&
					item.input_schema?.properties &&
					Object.keys(item.input_schema.properties).some(key =>
						!item.input_schema.properties[key].hasOwnProperty('default')
					);

				return (
					<VStack spacing="4">
							<div>
								<Text size="large" weight="600">{item.label}</Text>
							</div>
							<Text>{item.description}</Text>

							{hasRequiredInput && (
								<Notice status="warning" isDismissible={false}>
									This ability requires input parameters that cannot be provided through this interface.
								</Notice>
							)}

							{error && (
								<Notice status="error" isDismissible={false}>
									Error: {error}
								</Notice>
							)}

							{result && (
								<div>
									<Text weight="600">Result:</Text>
									<TextareaControl
										value={JSON.stringify(result, null, 2)}
										readOnly
										rows={15}
										style={{ fontFamily: 'monospace', fontSize: '12px' }}
									/>
								</div>
							)}

							<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
								{!result && !hasRequiredInput && (
									<Button
										variant="primary"
										onClick={executeAbilityHandler}
										disabled={isExecuting}
										isBusy={isExecuting}
									>
										{isExecuting ? 'Executing...' : 'Execute'}
									</Button>
								)}
								<Button
									variant={result ? 'primary' : 'secondary'}
									onClick={closeModal}
								>
									{result ? 'Close' : 'Cancel'}
								</Button>
							</div>
						</VStack>
				);
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

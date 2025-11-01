/**
 * WordPress dependencies
 */
import domReady from "@wordpress/dom-ready";
import { createRoot } from "@wordpress/element";
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews/wp';
import { useState, useEffect } from '@wordpress/element';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	TextareaControl,
	Notice,
	Card,
	CardBody,
	__experimentalHStack as HStack
} from '@wordpress/components';
import { useCopyToClipboard } from '@wordpress/compose';

/**
 * Styles - Import DataViews styles
 */
import './style.scss';

console.log("Test Stream Abilities API JS loaded!");

// Copy Button Component using modern hook
const CopyButton = ({ text, label = 'Copy' }) => {
	const ref = useCopyToClipboard(text, () => {
		console.log('Copied to clipboard');
	});

	return (
		<Button ref={ref} variant="secondary" size="small">
			{label}
		</Button>
	);
};

// Fallback to a simple formatted JSON display
const JSONViewer = ({ data, expanded = false }) => {
	return (
		<div style={{
			fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
			fontSize: '13px',
			lineHeight: '1.5',
			backgroundColor: '#f6f7f7',
			padding: '16px',
			borderRadius: '4px',
			border: '1px solid #ddd',
			maxHeight: '400px',
			overflowY: 'auto',
			whiteSpace: 'pre-wrap',
			wordBreak: 'break-word'
		}}>
			{JSON.stringify(data, null, 2)}
		</div>
	);
};

// Generate example input based on schema
const generateExampleInput = (schema) => {
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

const App = () => {
	const [allAbilities, setAllAbilities] = useState([]);
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
					setAllAbilities(transformedData);
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

	// Extract unique categories from abilities for filtering
	const categoryElements = [...new Set(allAbilities.map(ability => ability.category))]
		.filter(Boolean)
		.sort()
		.map(cat => ({
			value: cat,
			label: cat.split('-').map(word =>
				word.charAt(0).toUpperCase() + word.slice(1)
			).join(' ')
		}));


	// Define fields for DataViews columns
	const fields = [
		{
			id: 'name',
			label: 'Ability Name',
			enableHiding: false,
			enableSorting: true,
			enableGlobalSearch: true,
		},
		{
			id: 'label',
			label: 'Label',
			enableSorting: true,
			enableHiding: true,
			enableGlobalSearch: true,
		},
		{
			id: 'category',
			label: 'Category',
			enableSorting: true,
			enableHiding: true,
			elements: categoryElements,
			filterBy: {
				operators: ['is', 'isNot'],
			},
			enableGlobalSearch: true,
		},
		{
			id: 'description',
			label: 'Description',
			enableSorting: false,
			enableHiding: true,
			maxWidth: 400,
			enableGlobalSearch: true,
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

	// Use filterSortAndPaginate to process the data based on view configuration
	const { data: processedAbilities, paginationInfo } = filterSortAndPaginate(
		allAbilities,
		view,
		fields
	);

	// Define default layouts for different view types
	const defaultLayouts = {
		table: {
			primaryField: 'name',
		},
		grid: {
			primaryField: 'name',
			mediaField: 'label',
		}
	};

	// Define available actions for each ability
	const actions = [
		{
			id: 'view-details',
			label: 'View Details',
			isPrimary: true,
			RenderModal: ({ items: [item], closeModal }) => {
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
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
									<Text weight="600">Input Schema:</Text>
									<CopyButton text={JSON.stringify(item.input_schema, null, 2)} />
								</div>
								{Array.isArray(item.input_schema) ? (
									<Text style={{ color: '#666', fontStyle: 'italic' }}>No input required</Text>
								) : (
									<JSONViewer data={item.input_schema} />
								)}
							</div>

							<div>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
									<Text weight="600">Output Schema:</Text>
									<CopyButton text={JSON.stringify(item.output_schema, null, 2)} />
								</div>
								<JSONViewer data={item.output_schema} />
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
				const [inputValues, setInputValues] = useState({});
				const [inputErrors, setInputErrors] = useState({});

				// Initialize input values with defaults or empty strings
				useEffect(() => {
					if (!Array.isArray(item.input_schema) && item.input_schema?.properties) {
						const defaults = {};
						Object.keys(item.input_schema.properties).forEach(key => {
							const prop = item.input_schema.properties[key];
							defaults[key] = prop.default || '';
						});
						setInputValues(defaults);
					}
				}, [item]);

				const validateInput = () => {
					const errors = {};
					if (!Array.isArray(item.input_schema) && item.input_schema?.properties) {
						Object.keys(item.input_schema.properties).forEach(key => {
							const prop = item.input_schema.properties[key];
							const value = inputValues[key];
							const isRequired = item.input_schema.required?.includes(key) || !prop.hasOwnProperty('default');

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

								// Enum validation for non-arrays
								if (prop.enum && !Array.isArray(prop.enum)) {
									if (!prop.enum.includes(value)) {
										errors[key] = `Must be one of: ${prop.enum.join(', ')}`;
									}
								}
							}
						});
					}
					return errors;
				};

				const executeAbilityHandler = async () => {
					if (typeof wp !== "undefined" && wp.abilities) {
						const { executeAbility } = wp.abilities;

						// Validate inputs
						const errors = validateInput();
						if (Object.keys(errors).length > 0) {
							setInputErrors(errors);
							return;
						}

						setIsExecuting(true);
						setError(null);
						setResult(null);
						setInputErrors({});

						try {
							// Prepare the input data
							let inputData = null;
							if (!Array.isArray(item.input_schema) && item.input_schema?.properties) {
								inputData = {};
								Object.keys(item.input_schema.properties).forEach(key => {
									const prop = item.input_schema.properties[key];
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
								if (Object.keys(inputData).length === 0) {
									inputData = null;
								}
							}

							const executionResult = await executeAbility(item.name, inputData);
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

				const hasInput = !Array.isArray(item.input_schema) && item.input_schema?.properties;

				return (
					<VStack spacing="4">
							<div>
								<Text size="large" weight="600">{item.label}</Text>
							</div>
							<Text>{item.description}</Text>

							{hasInput && !result && (
								<div style={{ background: '#f0f0f0', padding: '16px', borderRadius: '4px' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
										<Text weight="600">Input Parameters:</Text>
										<Button
											variant="secondary"
											size="small"
											onClick={() => {
												const example = generateExampleInput(item.input_schema);
												if (example) {
													const newValues = {};
													Object.keys(example).forEach(key => {
														if (Array.isArray(example[key]) || typeof example[key] === 'object') {
															newValues[key] = JSON.stringify(example[key], null, 2);
														} else {
															newValues[key] = String(example[key]);
														}
													});
													setInputValues(newValues);
													setInputErrors({});
												}
											}}
										>
											Generate Example
										</Button>
									</div>
									{Object.keys(item.input_schema.properties).map(key => {
										const prop = item.input_schema.properties[key];
										const isRequired = item.input_schema.required?.includes(key) || !prop.hasOwnProperty('default');

										// Determine the input type based on schema
										const getInputType = () => {
											if (prop.enum && prop.type !== 'array') return 'select';
											if (prop.type === 'boolean') return 'checkbox';
											if (prop.type === 'number' || prop.type === 'integer') return 'number';
											if (prop.type === 'array' && prop.items?.enum) return 'multi-select';
											if (prop.type === 'array') return 'json-array';
											if (prop.type === 'object') return 'json-object';
											return 'text';
										};

										const inputType = getInputType();

										// Format type information for display
										const getTypeInfo = () => {
											let info = prop.type || 'string';
											if (prop.type === 'array' && prop.items) {
												if (prop.items.type) {
													info += ` of ${prop.items.type}s`;
												}
												if (prop.items.enum) {
													info += ` (${prop.items.enum.length} choices)`;
												}
											}
											if (prop.minimum !== undefined || prop.maximum !== undefined) {
												info += ` (${prop.minimum ?? '*'} - ${prop.maximum ?? '*'})`;
											}
											if (prop.pattern) {
												info += ` (pattern: ${prop.pattern})`;
											}
											return info;
										};

										return (
											<div key={key} style={{
												marginBottom: '20px',
												padding: '12px',
												background: '#fff',
												borderRadius: '4px',
												border: '1px solid #ddd'
											}}>
												<div style={{ marginBottom: '8px' }}>
													<label style={{ display: 'block', marginBottom: '4px' }}>
														<Text weight="600" style={{ fontSize: '14px', color: '#1e1e1e' }}>
															{key}
															{isRequired && <span style={{ color: '#d94f4f' }}> *</span>}
															{!isRequired && <span style={{ color: '#666' }}> (optional)</span>}
														</Text>
													</label>
													<Text size="small" style={{ display: 'block', color: '#666' }}>
														Type: <code style={{
															background: '#f0f0f0',
															padding: '2px 4px',
															borderRadius: '2px',
															fontSize: '11px'
														}}>{getTypeInfo()}</code>
														{prop.default !== undefined && (
															<span> • Default: <code style={{
																background: '#f0f0f0',
																padding: '2px 4px',
																borderRadius: '2px',
																fontSize: '11px'
															}}>{JSON.stringify(prop.default)}</code></span>
														)}
													</Text>
													{prop.description && (
														<Text size="small" style={{ display: 'block', marginTop: '4px', color: '#666' }}>
															{prop.description}
														</Text>
													)}
												</div>

												{/* Multi-select for array with enum items */}
												{inputType === 'multi-select' && (
													<div>
														<div style={{
															background: '#f8f8f8',
															padding: '8px',
															borderRadius: '4px',
															marginBottom: '8px',
															maxHeight: '150px',
															overflowY: 'auto'
														}}>
															<Text size="small" weight="500" style={{ display: 'block', marginBottom: '6px' }}>
																Available options (click to select/deselect):
															</Text>
															<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
																{prop.items.enum.map(val => {
																	let isSelected = false;
																	try {
																		const arr = inputValues[key] ? JSON.parse(inputValues[key]) : [];
																		isSelected = Array.isArray(arr) && arr.includes(val);
																	} catch {}

																	return (
																		<Button
																			key={val}
																			variant={isSelected ? 'primary' : 'secondary'}
																			size="small"
																			onClick={() => {
																				let currentArray = [];
																				try {
																					if (inputValues[key]) {
																						currentArray = JSON.parse(inputValues[key]);
																					}
																				} catch {}

																				if (!Array.isArray(currentArray)) currentArray = [];

																				if (currentArray.includes(val)) {
																					currentArray = currentArray.filter(v => v !== val);
																				} else {
																					currentArray.push(val);
																				}

																				const newValue = currentArray.length > 0
																					? JSON.stringify(currentArray, null, 2)
																					: '';
																				setInputValues({...inputValues, [key]: newValue});
																				setInputErrors({...inputErrors, [key]: ''});
																			}}
																		>
																			{val}
																		</Button>
																	);
																})}
															</div>
														</div>
														<TextareaControl
															value={inputValues[key] || ''}
															onChange={(value) => {
																setInputValues({...inputValues, [key]: value});
																setInputErrors({...inputErrors, [key]: ''});
															}}
															placeholder="Selected values will appear here as JSON array"
															rows={3}
															style={{
																fontFamily: 'monospace',
																fontSize: '12px',
																backgroundColor: '#fff'
															}}
														/>
													</div>
												)}

												{/* Regular select dropdown */}
												{inputType === 'select' && (
													<select
														value={inputValues[key] || ''}
														onChange={(e) => {
															setInputValues({...inputValues, [key]: e.target.value});
															setInputErrors({...inputErrors, [key]: ''});
														}}
														style={{
															width: '100%',
															padding: '8px',
															border: inputErrors[key] ? '1px solid #d94f4f' : '1px solid #8c8f94',
															borderRadius: '4px',
															fontSize: '14px'
														}}
													>
														<option value="">-- Select {key} --</option>
														{prop.enum.map(val => (
															<option key={val} value={val}>{val}</option>
														))}
													</select>
												)}

												{/* Boolean checkbox */}
												{inputType === 'checkbox' && (
													<div>
														<label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
															<input
																type="checkbox"
																checked={inputValues[key] === 'true' || inputValues[key] === true}
																onChange={(e) => {
																	setInputValues({...inputValues, [key]: e.target.checked.toString()});
																	setInputErrors({...inputErrors, [key]: ''});
																}}
																style={{ marginRight: '8px' }}
															/>
															<Text>Enable {key}</Text>
														</label>
													</div>
												)}

												{/* Number input */}
												{inputType === 'number' && (
													<input
														type="number"
														value={inputValues[key] || ''}
														onChange={(e) => {
															setInputValues({...inputValues, [key]: e.target.value});
															setInputErrors({...inputErrors, [key]: ''});
														}}
														placeholder={`Enter ${prop.type}`}
														min={prop.minimum}
														max={prop.maximum}
														style={{
															width: '100%',
															padding: '8px',
															border: inputErrors[key] ? '1px solid #d94f4f' : '1px solid #8c8f94',
															borderRadius: '4px',
															fontSize: '14px'
														}}
													/>
												)}

												{/* JSON array/object inputs */}
												{(inputType === 'json-array' || inputType === 'json-object') && (
													<TextareaControl
														value={inputValues[key] || ''}
														onChange={(value) => {
															setInputValues({...inputValues, [key]: value});
															setInputErrors({...inputErrors, [key]: ''});
														}}
														placeholder={
															inputType === 'json-array'
																? `Example: ["item1", "item2", "item3"]`
																: `Example: {"key": "value", "key2": "value2"}`
														}
														rows={4}
														style={{
															fontFamily: 'monospace',
															fontSize: '12px',
															backgroundColor: '#fff'
														}}
														help={`Enter valid JSON ${prop.type} format`}
													/>
												)}

												{/* Default text input */}
												{inputType === 'text' && (
													<input
														type="text"
														value={inputValues[key] || ''}
														onChange={(e) => {
															setInputValues({...inputValues, [key]: e.target.value});
															setInputErrors({...inputErrors, [key]: ''});
														}}
														placeholder={`Enter ${prop.type || 'text'} value`}
														style={{
															width: '100%',
															padding: '8px',
															border: inputErrors[key] ? '1px solid #d94f4f' : '1px solid #8c8f94',
															borderRadius: '4px',
															fontSize: '14px'
														}}
													/>
												)}

												{inputErrors[key] && (
													<Notice status="error" isDismissible={false} style={{ marginTop: '8px' }}>
														{inputErrors[key]}
													</Notice>
												)}
											</div>
										);
									})}
									<Text size="small" style={{ display: 'block', marginTop: '8px', color: '#666', fontStyle: 'italic' }}>
										Tip: Leave optional fields empty to use their default values
									</Text>
								</div>
							)}

							{error && (
								<Notice status="error" isDismissible={false}>
									Error: {error}
								</Notice>
							)}

							{result && (
								<div>
									<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
										<Text weight="600">Result:</Text>
										<CopyButton text={JSON.stringify(result, null, 2)} label="Copy Result" />
									</div>
									<JSONViewer data={result} expanded={true} />
								</div>
							)}

							<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
								{!result && (
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

	if (allAbilities.length === 0) {
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

domReady( () => {
	const root = document.getElementById( 'abilities-dashboard-root' );
	if ( root ) {
		createRoot( root ).render( <App /> );
	}
} );

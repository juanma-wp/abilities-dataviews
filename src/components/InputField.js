/**
 * InputField Component
 * 
 * Renders appropriate input fields based on schema property type.
 * Supports text, number, boolean, select, multi-select, and JSON inputs.
 */
import { TextareaControl, Button, Notice, __experimentalText as Text } from '@wordpress/components';

/**
 * Determines the input type based on schema property
 * 
 * @param {Object} prop - Schema property definition
 * @returns {string} Input type identifier
 */
const getInputType = (prop) => {
	if (prop.enum && prop.type !== 'array') return 'select';
	if (prop.type === 'boolean') return 'checkbox';
	if (prop.type === 'number' || prop.type === 'integer') return 'number';
	if (prop.type === 'array' && prop.items?.enum) return 'multi-select';
	if (prop.type === 'array') return 'json-array';
	if (prop.type === 'object') return 'json-object';
	return 'text';
};

/**
 * Formats type information for display
 * 
 * @param {Object} prop - Schema property definition
 * @returns {string} Formatted type information
 */
const getTypeInfo = (prop) => {
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

/**
 * InputField Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.fieldKey - Field identifier
 * @param {Object} props.property - Schema property definition
 * @param {*} props.value - Current field value
 * @param {string} props.error - Validation error message
 * @param {boolean} props.isRequired - Whether the field is required
 * @param {Function} props.onChange - Change handler function
 * @returns {JSX.Element} Input field component
 */
const InputField = ({ fieldKey, property, value, error, isRequired, onChange }) => {
	const inputType = getInputType(property);

	return (
		<div className="input-param-card">
			<div style={{ marginBottom: '8px' }}>
				<label className="input-param-label">
					<Text weight="600">
						{fieldKey}
						{isRequired && <span className="input-param-required"> *</span>}
						{!isRequired && <span className="input-param-optional"> (optional)</span>}
					</Text>
				</label>
				<Text size="small" className="input-param-type">
					Type: <code>{getTypeInfo(property)}</code>
					{property.default !== undefined && (
						<span> • Default: <code>{JSON.stringify(property.default)}</code></span>
					)}
				</Text>
				{property.description && (
					<Text size="small" className="input-param-description">
						{property.description}
					</Text>
				)}
			</div>

			{/* Multi-select for array with enum items */}
			{inputType === 'multi-select' && (
				<div>
					<div className="multi-select-options">
						<Text size="small" weight="500" className="multi-select-title">
							Available options (click to select/deselect):
						</Text>
						<div className="multi-select-buttons">
							{property.items.enum.map(val => {
								let isSelected = false;
								try {
									const arr = value ? JSON.parse(value) : [];
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
												if (value) {
													currentArray = JSON.parse(value);
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
											onChange(newValue);
										}}
									>
										{val}
									</Button>
								);
							})}
						</div>
					</div>
					<TextareaControl
						value={value || ''}
						onChange={onChange}
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
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					className={`input-field ${error ? 'has-error' : ''}`}
				>
					<option value="">-- Select {fieldKey} --</option>
					{property.enum.map(val => (
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
							checked={value === 'true' || value === true}
							onChange={(e) => onChange(e.target.checked.toString())}
							style={{ marginRight: '8px' }}
						/>
						<Text>Enable {fieldKey}</Text>
					</label>
				</div>
			)}

			{/* Number input */}
			{inputType === 'number' && (
				<input
					type="number"
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					placeholder={`Enter ${property.type}`}
					min={property.minimum}
					max={property.maximum}
					className={`input-field ${error ? 'has-error' : ''}`}
				/>
			)}

			{/* JSON array/object inputs */}
			{(inputType === 'json-array' || inputType === 'json-object') && (
				<TextareaControl
					value={value || ''}
					onChange={onChange}
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
					help={`Enter valid JSON ${property.type} format`}
				/>
			)}

			{/* Default text input */}
			{inputType === 'text' && (
				<input
					type="text"
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					placeholder={`Enter ${property.type || 'text'} value`}
					className={`input-field ${error ? 'has-error' : ''}`}
				/>
			)}

			{error && (
				<Notice status="error" isDismissible={false} style={{ marginTop: '8px' }}>
					{error}
				</Notice>
			)}
		</div>
	);
};

export default InputField;

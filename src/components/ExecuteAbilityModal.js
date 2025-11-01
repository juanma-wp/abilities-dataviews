/**
 * ExecuteAbilityModal Component
 * 
 * Modal component for executing abilities with dynamic form inputs.
 * Handles input collection, validation, execution, and result display.
 */
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Notice
} from '@wordpress/components';
import useAbilityForm from '../hooks/useAbilityForm';
import useAbilityExecution from '../hooks/useAbilityExecution';
import InputField from './InputField';
import CopyButton from './CopyButton';
import JSONViewer from './JSONViewer';
import { generateExampleInput } from '../utils/dataTransform';

/**
 * ExecuteAbilityModal Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array containing the selected ability item
 * @param {Function} props.closeModal - Function to close the modal
 * @returns {JSX.Element} Execute ability modal content
 */
const ExecuteAbilityModal = ({ items: [item], closeModal }) => {
	const {
		inputValues,
		inputErrors,
		updateValue,
		setValues,
		validate,
		prepareInputData
	} = useAbilityForm(item.input_schema);

	const { isExecuting, result, error, execute } = useAbilityExecution();

	/**
	 * Handles the Generate Example button click
	 */
	const handleGenerateExample = () => {
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
			setValues(newValues);
		}
	};

	/**
	 * Handles ability execution
	 */
	const handleExecute = async () => {
		// Validate inputs
		if (!validate()) {
			return;
		}

		// Prepare and execute
		const inputData = prepareInputData();
		await execute(item.name, inputData);
	};

	const hasInput = !Array.isArray(item.input_schema) && item.input_schema?.properties;

	return (
		<VStack spacing="4">
			<div className="modal-header">
				<Text size="large" weight="600">{item.label}</Text>
			</div>
			<Text>{item.description}</Text>

			{hasInput && !result && (
				<div className="input-parameters-container">
					<div className="input-parameters-header">
						<Text weight="600">Input Parameters:</Text>
						<Button
							variant="secondary"
							size="small"
							onClick={handleGenerateExample}
						>
							Generate Example
						</Button>
					</div>
					
					{Object.keys(item.input_schema.properties).map(key => {
						const prop = item.input_schema.properties[key];
						const isRequired = item.input_schema.required?.includes(key) || !prop.hasOwnProperty('default');

						return (
							<InputField
								key={key}
								fieldKey={key}
								property={prop}
								value={inputValues[key]}
								error={inputErrors[key]}
								isRequired={isRequired}
								onChange={(value) => updateValue(key, value)}
							/>
						);
					})}
					
					<Text size="small" className="input-parameters-tip">
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
				<div className="modal-section">
					<div className="modal-section-header">
						<Text weight="600">Result:</Text>
						<CopyButton text={JSON.stringify(result, null, 2)} label="Copy Result" />
					</div>
					<JSONViewer data={result} expanded={true} />
				</div>
			)}

			<div className="modal-footer">
				{!result && (
					<Button
						variant="primary"
						onClick={handleExecute}
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
};

export default ExecuteAbilityModal;

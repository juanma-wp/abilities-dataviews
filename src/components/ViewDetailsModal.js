/**
 * ViewDetailsModal Component
 * 
 * Modal component for displaying detailed information about an ability.
 * Shows name, label, description, category, annotations, and schemas.
 */
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import CopyButton from './CopyButton';
import JSONViewer from './JSONViewer';

/**
 * ViewDetailsModal Component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array containing the selected ability item
 * @param {Function} props.closeModal - Function to close the modal
 * @returns {JSX.Element} View details modal content
 */
const ViewDetailsModal = ({ items: [item], closeModal }) => {
	return (
		<VStack spacing="4">
			<div className="modal-header">
				<Text size="large" weight="600">Ability: {item.name}</Text>
			</div>

			<div className="modal-section">
				<Text weight="600">Label:</Text>
				<Text>{item.label}</Text>
			</div>

			<div className="modal-section">
				<Text weight="600">Description:</Text>
				<Text>{item.description}</Text>
			</div>

			<div className="modal-section">
				<Text weight="600">Category:</Text>
				<Text>{item.category}</Text>
			</div>

			<div className="modal-section">
				<Text weight="600">Annotations:</Text>
				<ul className="annotations-list">
					<li>Read Only: {item.readonly ? '✓' : '✗'}</li>
					<li>Destructive: {item.destructive ? '⚠️ Yes' : '✓ No'}</li>
					<li>Idempotent: {item.idempotent ? '✓' : '✗'}</li>
					<li>Show in REST: {item.show_in_rest ? '✓' : '✗'}</li>
				</ul>
			</div>

			<div className="modal-section">
				<div className="modal-section-header">
					<Text weight="600">Input Schema:</Text>
					<CopyButton text={JSON.stringify(item.input_schema, null, 2)} />
				</div>
				{Array.isArray(item.input_schema) ? (
					<Text style={{ color: '#666', fontStyle: 'italic' }}>No input required</Text>
				) : (
					<JSONViewer data={item.input_schema} />
				)}
			</div>

			<div className="modal-section">
				<div className="modal-section-header">
					<Text weight="600">Output Schema:</Text>
					<CopyButton text={JSON.stringify(item.output_schema, null, 2)} />
				</div>
				<JSONViewer data={item.output_schema} />
			</div>
		</VStack>
	);
};

export default ViewDetailsModal;

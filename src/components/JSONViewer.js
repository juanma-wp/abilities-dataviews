/**
 * JSONViewer Component
 * 
 * A reusable component for displaying formatted JSON data with syntax highlighting
 * and scrollable container.
 * 
 * @param {Object} props - Component props
 * @param {*} props.data - The data to display as JSON
 * @param {boolean} [props.expanded=false] - Whether to expand all nested objects (currently unused)
 * @returns {JSX.Element} JSON viewer component
 */
const JSONViewer = ({ data, expanded = false }) => {
	return (
		<div className="json-viewer">
			{JSON.stringify(data, null, 2)}
		</div>
	);
};

export default JSONViewer;

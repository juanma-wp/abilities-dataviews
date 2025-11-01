/**
 * CopyButton Component
 * 
 * A reusable button component that copies text to clipboard using WordPress hooks.
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - The text to copy to clipboard
 * @param {string} [props.label='Copy'] - Button label text
 * @returns {JSX.Element} Copy button component
 */
import { Button } from '@wordpress/components';
import { useCopyToClipboard } from '@wordpress/compose';

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

export default CopyButton;

/**
 * Main entry point for the Abilities Dashboard
 * 
 * This file initializes the React application and renders it to the DOM.
 */

import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import { App } from './components/App';

// Import styles
import './style.scss';

console.log('Test Stream Abilities API TypeScript loaded!');

/**
 * Initialize the application when DOM is ready
 */
domReady(() => {
	const root = document.getElementById('abilities-dashboard-root');
	if (root) {
		createRoot(root).render(<App />);
	}
});

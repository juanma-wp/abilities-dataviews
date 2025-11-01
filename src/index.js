/**
 * Main Entry Point
 * 
 * Initializes and renders the Abilities Dashboard application.
 */
import domReady from "@wordpress/dom-ready";
import { createRoot } from "@wordpress/element";
import App from './components/App';

/**
 * Import global styles
 */
import './style.scss';

console.log("Test Stream Abilities API JS loaded!");

/**
 * Initialize the application when DOM is ready
 */
domReady(() => {
	const root = document.getElementById('abilities-dashboard-root');
	if (root) {
		createRoot(root).render(<App />);
	}
});

<?php
/**
 * Plugin Name: Abilities Dashboard
 * Plugin URI: https://example.com
 * Description: WordPress Abilities Dashboard using DataViews
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: abilities-dashboard
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Plugin constants
define( 'ABILITIES_DASHBOARD_URL', plugin_dir_url( __FILE__ ) );
define( 'ABILITIES_DASHBOARD_PATH', plugin_dir_path( __FILE__ ) );

// Enqueue scripts
function abilities_dashboard_enqueue_scripts( $hook ) {
	if ( 'toplevel_page_abilities-dashboard' !== $hook ) {
		return;
	}

	$asset_file = include ABILITIES_DASHBOARD_PATH . 'build/index.asset.php';

	wp_enqueue_script(
		'abilities-dashboard-script',
		ABILITIES_DASHBOARD_URL . 'build/index.js',
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);

	// Enqueue the built styles (includes DataViews styles)
	wp_enqueue_style(
		'abilities-dashboard-style',
		ABILITIES_DASHBOARD_URL . 'build/style-index.css',
		array( 'wp-components' ),
		$asset_file['version']
	);
}
add_action( 'admin_enqueue_scripts', 'abilities_dashboard_enqueue_scripts' );

// Add admin menu
function abilities_dashboard_add_menu() {
	add_menu_page(
		'Abilities Dashboard',
		'Abilities Dashboard',
		'manage_options',
		'abilities-dashboard',
		'abilities_dashboard_render_page',
		'dashicons-forms',
		30
	);
}
add_action( 'admin_menu', 'abilities_dashboard_add_menu' );

// Render admin page
function abilities_dashboard_render_page() {
	?>
	<div class="wrap">
		<h1>Abilities Dashboard</h1>
		<div id="abilities-dashboard-root"></div>
	</div>
	<?php
}

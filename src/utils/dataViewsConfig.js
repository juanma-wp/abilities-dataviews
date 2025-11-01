/**
 * DataViews Configuration
 * 
 * Defines field configurations and actions for the abilities DataViews table.
 */
import ViewDetailsModal from '../components/ViewDetailsModal';
import ExecuteAbilityModal from '../components/ExecuteAbilityModal';

/**
 * Creates field configuration for DataViews
 * 
 * @param {Array} categoryElements - Category options for filtering
 * @returns {Array} Field configuration array
 */
export const createFields = (categoryElements) => [
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

/**
 * Creates action configuration for DataViews
 * 
 * @returns {Array} Actions configuration array
 */
export const createActions = () => [
	{
		id: 'view-details',
		label: 'View Details',
		isPrimary: true,
		RenderModal: ViewDetailsModal,
	},
	{
		id: 'execute',
		label: 'Execute',
		RenderModal: ExecuteAbilityModal,
	},
];

/**
 * Default layouts for different view types
 */
export const defaultLayouts = {
	table: {
		primaryField: 'name',
	},
	grid: {
		primaryField: 'name',
		mediaField: 'label',
	}
};

/**
 * Initial view configuration
 */
export const initialView = {
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
};

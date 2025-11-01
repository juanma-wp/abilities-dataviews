# Source Code Structure

This document describes the modular architecture of the Abilities Dashboard codebase.

## Directory Structure

```
src/
├── components/         # React components
├── hooks/             # Custom React hooks
├── services/          # API services
├── utils/             # Utility functions
├── index.js           # Application entry point
└── style.scss         # Global styles
```

## Components

### App.js
Main application component that orchestrates the Abilities Dashboard.
- Manages DataViews state and configuration
- Renders the abilities table with filtering and actions

### CopyButton.js
Reusable button component for copying text to clipboard.
- Uses WordPress `useCopyToClipboard` hook
- Provides visual feedback on copy action

### JSONViewer.js
Component for displaying formatted JSON data.
- Renders JSON with proper formatting
- Includes scrollable container for large data
- Styled using SCSS classes

### ViewDetailsModal.js
Modal component for viewing detailed ability information.
- Displays complete ability specifications
- Shows input/output schemas
- Includes copy functionality for schemas

### ExecuteAbilityModal.js
Modal component for executing abilities.
- Provides dynamic form based on ability schema
- Handles input validation and execution
- Displays execution results

### InputField.js
Dynamic input field component that adapts to schema type.
- Supports multiple input types: text, number, boolean, select, multi-select, JSON
- Provides inline validation feedback
- Handles complex types like arrays and objects

## Hooks

### useAbilities.js
Custom hook for loading and managing abilities data.
- Fetches abilities from API on mount
- Transforms data for DataViews
- Manages loading state

### useAbilityForm.js
Custom hook for managing ability execution form state.
- Initializes form values from schema defaults
- Handles input value updates
- Validates inputs against schema
- Prepares data for API submission

### useAbilityExecution.js
Custom hook for managing ability execution.
- Handles execution state (loading, result, error)
- Executes abilities via API service
- Provides reset functionality

## Services

### abilitiesApi.js
Service module for WordPress Abilities API interactions.
- `getAbilities()` - Fetches all available abilities
- `executeAbility(name, input)` - Executes a specific ability
- Provides error handling for API unavailability

## Utils

### validation.js
Input validation utilities.
- `validateInput(values, schema)` - Validates form inputs against schema
- Supports type-specific validation (string, number, array, object, etc.)
- Validates required fields, patterns, ranges, and enums

### dataTransform.js
Data transformation utilities.
- `transformAbilitiesData(data)` - Transforms API data for DataViews
- `generateExampleInput(schema)` - Generates example input from schema
- `extractCategories(abilities)` - Extracts unique categories for filtering

### dataViewsConfig.js
DataViews configuration.
- `createFields(categories)` - Creates field configuration
- `createActions()` - Creates action configuration
- Exports default layouts and initial view configuration

## Styles (style.scss)

All component styles are centralized in `style.scss`:
- Global DataViews styles
- Component-specific classes
- Input field styles
- Modal layout styles
- Responsive styles

## Benefits of This Architecture

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Reusability**: Components and hooks can be easily reused
3. **Testability**: Individual modules can be tested in isolation
4. **Maintainability**: Easy to locate and update specific functionality
5. **Scalability**: New features can be added without modifying existing code
6. **Documentation**: Each module is self-documenting with JSDoc comments

## Usage Example

```javascript
// Import components
import App from './components/App';

// Import hooks
import useAbilities from './hooks/useAbilities';

// Import services
import { getAbilities, executeAbility } from './services/abilitiesApi';

// Import utilities
import { validateInput } from './utils/validation';
import { generateExampleInput } from './utils/dataTransform';
```

## Adding New Features

### Adding a New Component
1. Create file in `src/components/`
2. Add JSDoc documentation
3. Export component as default
4. Import and use in parent component

### Adding a New Hook
1. Create file in `src/hooks/`
2. Add JSDoc documentation
3. Export hook as default
4. Import and use in components

### Adding a New Utility
1. Create file in `src/utils/`
2. Add JSDoc documentation
3. Export functions as named exports
4. Import where needed

### Adding a New Service
1. Add functions to `src/services/abilitiesApi.js`
2. Add JSDoc documentation
3. Export as named exports
4. Import in hooks or components

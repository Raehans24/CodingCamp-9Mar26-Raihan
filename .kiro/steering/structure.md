# Project Structure

## Directory Layout

```
.
├── css/
│   └── styles.css          # All application styles with CSS custom properties
├── js/
│   └── app.js              # Main application file with all component classes
├── .kiro/
│   ├── specs/              # Spec-driven development documents
│   ├── steering/           # AI assistant guidance documents
│   └── hooks/              # Agent automation hooks
├── index.html              # Single-page application entry point
├── package.json            # Project metadata and dependencies
├── vitest.config.js        # Test configuration
└── README.md               # Project documentation
```

## File Organization

### HTML Structure (`index.html`)
- Single HTML file with semantic sections for each component
- Component containers identified by IDs: `greeting-container`, `timer-container`, `tasks-container`, `links-container`
- Theme toggle button in header
- Script loaded at end of body

### JavaScript Architecture (`js/app.js`)
- **Monolithic file structure**: All classes in a single file with clear section separators
- **Component classes**: Self-contained ES6 classes for each feature
  - `StorageManager`: Local Storage abstraction layer
  - `GreetingComponent`: Time/date/greeting display
  - `FocusTimer`: Pomodoro timer functionality
  - `TaskList`: Task management with persistence
  - `QuickLinks`: Link management with persistence
  - `ThemeManager`: Theme switching logic
  - `DashboardController`: Application initialization and coordination
- **Entry point**: DOMContentLoaded event listener at bottom of file
- **Documentation**: JSDoc comments for all public methods

### CSS Architecture (`css/styles.css`)
- **Section-based organization** with clear comment separators
- **CSS Custom Properties** (variables) defined in `:root` for light theme
- **Dark theme** overrides in `body.dark-theme` selector
- **Mobile-first approach** (when responsive styles are added)
- **Component styles** added as components are implemented

## Naming Conventions

### CSS
- **Classes**: kebab-case (e.g., `dashboard-container`, `focus-timer`)
- **Custom properties**: kebab-case with semantic names (e.g., `--bg-primary`, `--spacing-md`)
- **BEM methodology**: Not strictly enforced, but component-scoped class names preferred

### JavaScript
- **Classes**: PascalCase (e.g., `StorageManager`, `GreetingComponent`)
- **Methods/variables**: camelCase (e.g., `formatTime`, `intervalId`)
- **Constants**: UPPER_SNAKE_CASE for true constants (when needed)
- **Private-intent fields**: Prefix with underscore (e.g., `_privateMethod`) - convention only, not enforced

### HTML
- **IDs**: kebab-case with `-container` suffix for component roots (e.g., `timer-container`)
- **Classes**: kebab-case matching CSS conventions

## Component Lifecycle Pattern

Each component class follows this pattern:
1. **Constructor**: Accept container element and dependencies (e.g., `storageManager`)
2. **init()**: Initialize component, create DOM structure, load data, set up event listeners
3. **Public methods**: Component-specific functionality
4. **destroy()**: Clean up intervals, event listeners, and DOM elements

## Data Persistence

- All persistent data stored in Local Storage via `StorageManager`
- Storage keys should be descriptive (e.g., `tasks`, `quickLinks`, `theme`)
- Data serialized as JSON
- Error handling for quota exceeded and unavailable storage

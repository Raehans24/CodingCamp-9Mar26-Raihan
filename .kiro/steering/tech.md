# Technology Stack

## Core Technologies

- **HTML5**: Semantic markup structure
- **CSS3**: Custom properties (CSS variables) for theming
- **Vanilla JavaScript (ES6+)**: No framework dependencies, class-based architecture
- **Local Storage API**: Client-side data persistence

## Build System

- **Package Manager**: npm
- **Module System**: ES modules (`"type": "module"` in package.json)
- **No build step required**: Direct browser execution of source files

## Testing

- **Test Runner**: Vitest (v1.0.0+)
- **Test Environment**: jsdom for DOM simulation
- **Property-Based Testing**: fast-check (v3.15.0+) for correctness properties
- **Configuration**: `vitest.config.js` with globals enabled

## Common Commands

```bash
# Run tests once (for CI/validation)
npm test

# Run tests in watch mode (for development)
npm run test:watch
```

## Browser Compatibility

- Modern browsers with ES6+ support
- Local Storage API required
- No polyfills or transpilation

## Development Approach

- No bundler or transpiler needed
- Direct file serving (can use any static file server)
- Component-based architecture using ES6 classes
- Strict mode enabled in JavaScript files

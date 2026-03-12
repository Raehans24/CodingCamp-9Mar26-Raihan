# Design Document: Productivity Dashboard

## Overview

The Productivity Dashboard is a single-page web application built with vanilla JavaScript, HTML, and CSS. It provides a unified interface for personal productivity tools including time awareness, focus management (Pomodoro timer), task tracking, and quick website access. The application runs entirely client-side with no backend dependencies, using the browser's Local Storage API for data persistence.

### Key Design Principles

- **Simplicity**: Single-file architecture for HTML, CSS, and JavaScript
- **Performance**: Minimal DOM manipulation, efficient event handling, and optimized rendering
- **Persistence**: Automatic local storage synchronization for all user data
- **Responsiveness**: Sub-100ms interaction response times
- **Browser Compatibility**: Standards-based implementation supporting modern browsers

### Technology Stack

- **HTML5**: Semantic markup for structure
- **CSS3**: Modern styling with flexbox/grid layouts
- **Vanilla JavaScript (ES6+)**: No frameworks or external dependencies
- **Local Storage API**: Client-side data persistence
- **Web APIs**: setInterval for timers, Date for time management

## Architecture

### Component-Based Structure

The application follows a modular component architecture where each feature is encapsulated in its own module with clear responsibilities:

```
┌─────────────────────────────────────────┐
│         Dashboard Controller            │
│  (Initialization & Coordination)        │
└─────────────────────────────────────────┘
           │
           ├──────────────┬──────────────┬──────────────┬──────────────┐
           │              │              │              │              │
           ▼              ▼              ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Greeting │   │  Focus   │   │   Task   │   │  Quick   │   │  Theme   │
    │Component │   │  Timer   │   │   List   │   │  Links   │   │ Manager  │
    └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
           │              │              │              │              │
           └──────────────┴──────────────┴──────────────┴──────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ Storage Manager  │
                          │ (Local Storage)  │
                          └──────────────────┘
```

### Module Responsibilities

1. **Dashboard Controller**: Initializes all components, coordinates startup sequence
2. **Greeting Component**: Manages time display and time-based greetings
3. **Focus Timer**: Implements Pomodoro timer with start/stop/reset controls
4. **Task List**: Manages task CRUD operations and rendering
5. **Quick Links**: Manages link CRUD operations and navigation
6. **Theme Manager**: Handles light/dark mode toggle and persistence
7. **Storage Manager**: Abstracts Local Storage operations with error handling

### Data Flow

```
User Action → Component Event Handler → Update State → Update Storage → Update DOM
```

All state changes follow this unidirectional flow to maintain consistency between memory, storage, and UI.

## Components and Interfaces

### 1. Greeting Component

**Purpose**: Display current time, date, and contextual greeting

**Public Interface**:
```javascript
class GreetingComponent {
  constructor(containerElement)
  init()
  destroy()
}
```

**Behavior**:
- Updates time display every second using setInterval
- Calculates greeting based on current hour (5-11: Morning, 12-16: Afternoon, 17-20: Evening, 21-4: Night)
- Formats time in 24-hour format (HH:MM)
- Formats date in readable format (e.g., "Monday, January 15, 2024")

**DOM Structure**:
```html
<div class="greeting-component">
  <div class="time">14:34</div>
  <div class="date">Monday, January 15, 2024</div>
  <div class="greeting">Good Afternoon</div>
</div>
```

### 2. Focus Timer Component

**Purpose**: Implement 25-minute Pomodoro timer with controls

**Public Interface**:
```javascript
class FocusTimer {
  constructor(containerElement)
  init()
  start()
  stop()
  reset()
  destroy()
}
```

**State Management**:
```javascript
{
  duration: 1500,        // Total duration in seconds (25 minutes)
  remaining: 1500,       // Remaining time in seconds
  state: 'idle',         // 'idle' | 'running' | 'paused'
  intervalId: null       // setInterval reference
}
```

**Behavior**:
- Initializes with 1500 seconds (25 minutes)
- Decrements remaining time every second when running
- Disables start button when running, enables when paused/idle
- Shows notification when timer reaches zero
- Formats display as MM:SS (e.g., "25:00", "04:32")

**DOM Structure**:
```html
<div class="focus-timer">
  <div class="timer-display">25:00</div>
  <div class="timer-controls">
    <button class="btn-start">Start</button>
    <button class="btn-stop" disabled>Stop</button>
    <button class="btn-reset">Reset</button>
  </div>
</div>
```

### 3. Task List Component

**Purpose**: Manage to-do list with CRUD operations

**Public Interface**:
```javascript
class TaskList {
  constructor(containerElement, storageManager)
  init()
  addTask(text)
  editTask(id, newText)
  toggleTask(id)
  deleteTask(id)
  render()
}
```

**State Management**:
```javascript
{
  tasks: [
    {
      id: 'uuid-string',
      text: 'Task description',
      completed: false,
      createdAt: timestamp
    }
  ]
}
```

**Behavior**:
- Generates unique IDs for each task (timestamp-based or UUID)
- Maintains tasks in creation order
- Syncs to Local Storage on every modification
- Validates task text is non-empty before creation
- Shows empty state message when no tasks exist
- Applies completion styling (strikethrough, opacity) to completed tasks

**DOM Structure**:
```html
<div class="task-list">
  <form class="task-form">
    <input type="text" placeholder="Add a new task..." />
    <button type="submit">Add</button>
  </form>
  <ul class="tasks">
    <li class="task" data-id="uuid">
      <input type="checkbox" class="task-checkbox" />
      <span class="task-text">Task description</span>
      <button class="btn-edit">Edit</button>
      <button class="btn-delete">Delete</button>
    </li>
  </ul>
  <div class="empty-state">No tasks yet. Add one above!</div>
</div>
```

### 4. Quick Links Component

**Purpose**: Manage website shortcuts with CRUD operations

**Public Interface**:
```javascript
class QuickLinks {
  constructor(containerElement, storageManager)
  init()
  addLink(label, url)
  deleteLink(id)
  render()
}
```

**State Management**:
```javascript
{
  links: [
    {
      id: 'uuid-string',
      label: 'Link label',
      url: 'https://example.com',
      createdAt: timestamp
    }
  ]
}
```

**Behavior**:
- Validates URL format before creation
- Opens links in new tab (target="_blank" with rel="noopener noreferrer")
- Maintains links in creation order
- Syncs to Local Storage on every modification
- Shows empty state message when no links exist

**DOM Structure**:
```html
<div class="quick-links">
  <form class="link-form">
    <input type="text" name="label" placeholder="Label" />
    <input type="url" name="url" placeholder="https://example.com" />
    <button type="submit">Add</button>
  </form>
  <div class="links-grid">
    <div class="link-item" data-id="uuid">
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        Link Label
      </a>
      <button class="btn-delete">×</button>
    </div>
  </div>
  <div class="empty-state">No quick links yet. Add one above!</div>
</div>
```

### 5. Theme Manager Component

**Purpose**: Handle light/dark mode toggle and persistence

**Public Interface**:
```javascript
class ThemeManager {
  constructor(storageManager)
  init()
  toggle()
  getCurrentTheme()
}
```

**Behavior**:
- Reads initial theme from Local Storage or defaults to 'light'
- Applies theme by adding/removing 'dark-theme' class on document.body
- Persists theme preference to Local Storage on change
- Provides smooth transition between themes

### 6. Storage Manager

**Purpose**: Abstract Local Storage operations with error handling

**Public Interface**:
```javascript
class StorageManager {
  get(key)
  set(key, value)
  remove(key)
  clear()
  isAvailable()
}
```

**Behavior**:
- Serializes objects to JSON before storing
- Deserializes JSON when retrieving
- Returns null for missing keys
- Handles storage quota exceeded errors
- Detects if Local Storage is available/enabled
- Provides fallback behavior when storage is disabled

**Storage Keys**:
- `dashboard_tasks`: Array of task objects
- `dashboard_links`: Array of quick link objects
- `dashboard_theme`: String ('light' or 'dark')

## Data Models

### Task Model

```javascript
{
  id: String,           // Unique identifier (timestamp-based or UUID)
  text: String,         // Task description (non-empty, trimmed)
  completed: Boolean,   // Completion status
  createdAt: Number     // Unix timestamp of creation
}
```

**Validation Rules**:
- `text`: Must be non-empty after trimming whitespace
- `id`: Must be unique within the task list
- `completed`: Defaults to false for new tasks

### Quick Link Model

```javascript
{
  id: String,           // Unique identifier (timestamp-based or UUID)
  label: String,        // Display label (non-empty, trimmed)
  url: String,          // Valid URL (must include protocol)
  createdAt: Number     // Unix timestamp of creation
}
```

**Validation Rules**:
- `label`: Must be non-empty after trimming whitespace
- `url`: Must be valid URL format (checked with URL constructor or regex)
- `url`: Must include protocol (http:// or https://)
- `id`: Must be unique within the links list

### Timer State Model

```javascript
{
  duration: Number,     // Total duration in seconds (always 1500)
  remaining: Number,    // Remaining time in seconds (0-1500)
  state: String,        // 'idle' | 'running' | 'paused'
  intervalId: Number    // setInterval ID or null
}
```

**State Transitions**:
- `idle` → `running`: User clicks start
- `running` → `paused`: User clicks stop
- `paused` → `running`: User clicks start
- `running` → `idle`: Timer reaches zero
- Any state → `idle`: User clicks reset

### Theme Model

```javascript
{
  current: String       // 'light' | 'dark'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Time Format Consistency

*For any* valid Date object, the time formatting function should produce a string matching the 24-hour format pattern (HH:MM) where HH is zero-padded hours (00-23) and MM is zero-padded minutes (00-59).

**Validates: Requirements 1.1**

### Property 2: Date Format Readability

*For any* valid Date object, the date formatting function should produce a human-readable string containing the day of week, month name, day, and year.

**Validates: Requirements 1.2**

### Property 3: Greeting Time Mapping

*For any* hour value (0-23), the greeting function should return exactly one of "Good Morning" (5-11), "Good Afternoon" (12-16), "Good Evening" (17-20), or "Good Night" (21-4), with no gaps or overlaps in coverage.

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

### Property 4: Timer Display Format

*For any* remaining time value in seconds (0-1500), the timer formatting function should produce a string in MM:SS format where MM is zero-padded minutes and SS is zero-padded seconds.

**Validates: Requirements 2.7**

### Property 5: Timer State Button Consistency

*For any* timer state (idle, running, paused), the button enabled/disabled states should match the timer state: start button enabled when idle or paused, stop button enabled when running.

**Validates: Requirements 2.8, 2.9**

### Property 6: Timer Stop Preserves Time

*For any* timer with remaining time, stopping the timer should preserve the exact remaining time value without modification.

**Validates: Requirements 2.4**

### Property 7: Timer Reset Restores Initial State

*For any* timer state (idle, running, paused) with any remaining time, resetting should restore duration to 1500 seconds and state to idle.

**Validates: Requirements 2.5**

### Property 8: Task Toggle Idempotence

*For any* task, toggling completion status twice should return the task to its original completion state.

**Validates: Requirements 3.4**

### Property 9: Task List Addition

*For any* non-empty task text, adding it to the task list should increase the list length by exactly one and the new task should appear in the list.

**Validates: Requirements 3.1, 3.2**

### Property 10: Task Edit Preservation

*For any* task and any new non-empty text, editing the task should change only the text field while preserving the task's id, completion status, and creation timestamp.

**Validates: Requirements 3.3**

### Property 11: Task Deletion Removal

*For any* task in the list, deleting it should decrease the list length by exactly one and the task should no longer appear in the list.

**Validates: Requirements 3.6**

### Property 12: Task Creation Order Preservation

*For any* sequence of task additions, the displayed task list should maintain the exact order in which tasks were created.

**Validates: Requirements 3.7**

### Property 13: Completed Task Styling

*For any* task marked as completed, the rendered DOM element should include visual styling indicators (such as specific CSS classes or inline styles) that differentiate it from incomplete tasks.

**Validates: Requirements 3.5**

### Property 14: Task Storage Serialization Round Trip

*For any* valid task list, serializing to JSON and then deserializing should produce an equivalent task list with all tasks having identical id, text, completed status, and createdAt values.

**Validates: Requirements 4.7, 4.8**

### Property 15: Task Storage Synchronization

*For any* task operation (create, edit, delete, toggle), the task list in Local Storage should be updated to match the in-memory task list state.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 16: Task Storage Load

*For any* task list saved in Local Storage, loading the dashboard should restore all tasks with their exact id, text, completed status, and createdAt values.

**Validates: Requirements 4.5**

### Property 17: Quick Link Addition

*For any* non-empty label and valid URL, adding a quick link should increase the panel size by exactly one and the new link should appear in the panel.

**Validates: Requirements 5.1, 5.2**

### Property 18: Quick Link Deletion Removal

*For any* quick link in the panel, deleting it should decrease the panel size by exactly one and the link should no longer appear in the panel.

**Validates: Requirements 5.4**

### Property 19: Quick Link Creation Order Preservation

*For any* sequence of link additions, the displayed links panel should maintain the exact order in which links were created.

**Validates: Requirements 5.5**

### Property 20: Quick Link Storage Serialization Round Trip

*For any* valid quick links list, serializing to JSON and then deserializing should produce an equivalent links list with all links having identical id, label, url, and createdAt values.

**Validates: Requirements 6.5, 6.6**

### Property 21: Quick Link Storage Synchronization

*For any* quick link operation (create, delete), the links list in Local Storage should be updated to match the in-memory links list state.

**Validates: Requirements 6.1, 6.2**

### Property 22: Quick Link Storage Load

*For any* quick links list saved in Local Storage, loading the dashboard should restore all links with their exact id, label, url, and createdAt values.

**Validates: Requirements 6.3**

### Property 23: Invalid URL Rejection

*For any* string that is not a valid URL format (missing protocol, malformed structure), attempting to create a quick link should fail with an error message and the link should not be added to the panel.

**Validates: Requirements 6.7**


## Error Handling

### Local Storage Errors

**Scenario**: Local Storage is disabled or unavailable

**Handling**:
- Detect availability on initialization using `StorageManager.isAvailable()`
- Display prominent error message to user: "Local Storage is required for this application. Please enable it in your browser settings."
- Disable all data persistence features
- Allow read-only usage of components that don't require persistence (Greeting, Timer)

**Scenario**: Storage quota exceeded

**Handling**:
- Catch `QuotaExceededError` in `StorageManager.set()`
- Display user-friendly error: "Storage limit reached. Please delete some tasks or links."
- Prevent new item creation until space is available
- Log error to console for debugging

### Input Validation Errors

**Scenario**: Empty task text submission

**Handling**:
- Validate input on form submission
- Prevent task creation
- Display inline validation message: "Task description cannot be empty"
- Keep focus on input field

**Scenario**: Invalid URL format for quick link

**Handling**:
- Validate URL using URL constructor or regex pattern
- Prevent link creation
- Display inline validation message: "Please enter a valid URL (e.g., https://example.com)"
- Highlight invalid field
- Keep focus on URL input field

**Scenario**: Missing protocol in URL

**Handling**:
- Check for http:// or https:// prefix
- Display helpful error: "URL must include http:// or https://"
- Optionally auto-prepend https:// if user preference

### Timer Errors

**Scenario**: Timer interval fails to start

**Handling**:
- Catch errors in setInterval initialization
- Display error message: "Timer failed to start. Please refresh the page."
- Reset timer to idle state
- Log error to console

**Scenario**: Timer reaches negative values (edge case)

**Handling**:
- Add guard condition: `if (remaining <= 0)`
- Stop timer immediately
- Set remaining to 0
- Trigger completion notification

### Data Corruption Errors

**Scenario**: Invalid JSON in Local Storage

**Handling**:
- Wrap JSON.parse() in try-catch
- Log parsing error to console
- Clear corrupted data from storage
- Initialize with empty state
- Display warning: "Saved data was corrupted and has been reset"

**Scenario**: Missing required fields in loaded data

**Handling**:
- Validate data structure after parsing
- Filter out invalid items
- Log validation errors
- Continue with valid items only
- Display warning if items were skipped

### General Error Handling Strategy

1. **Graceful Degradation**: Application should remain functional even when features fail
2. **User Communication**: All errors should have clear, actionable messages
3. **Console Logging**: Technical details logged for debugging
4. **State Recovery**: Attempt to recover to a valid state when errors occur
5. **No Silent Failures**: All errors should be surfaced appropriately

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for comprehensive validation of universal properties. This ensures both concrete correctness and general robustness across all possible inputs.

### Testing Framework Selection

**Unit Testing**: Jest (or Vitest for faster execution)
- Widely adopted JavaScript testing framework
- Built-in mocking capabilities for DOM and Local Storage
- Excellent assertion library
- Fast test execution

**Property-Based Testing**: fast-check
- Mature property-based testing library for JavaScript
- Generates random test data automatically
- Configurable iteration counts and shrinking
- Integrates seamlessly with Jest/Vitest

### Unit Testing Approach

Unit tests focus on:
- **Specific examples**: Concrete scenarios that demonstrate correct behavior
- **Edge cases**: Boundary conditions and special cases
- **Error conditions**: Invalid inputs and failure scenarios
- **Integration points**: Component interactions and data flow

**Example Unit Tests**:
- Timer initializes with exactly 1500 seconds
- Empty task list displays "No tasks yet" message
- Empty quick links panel displays "No links yet" message
- Timer completion triggers notification
- Storage unavailable displays error message
- Invalid URL shows validation error
- Empty task submission is rejected

**Unit Test Organization**:
```
tests/
  greeting.test.js
  timer.test.js
  task-list.test.js
  quick-links.test.js
  storage-manager.test.js
  theme-manager.test.js
```

### Property-Based Testing Approach

Property tests validate universal properties across randomly generated inputs. Each property test:
- Runs minimum 100 iterations (configurable higher for critical properties)
- References its corresponding design document property
- Uses fast-check generators for test data
- Includes shrinking to find minimal failing cases

**Property Test Configuration**:
```javascript
import fc from 'fast-check';

// Example property test structure
test('Feature: productivity-dashboard, Property 1: Time Format Consistency', () => {
  fc.assert(
    fc.property(
      fc.date(), // Generate random dates
      (date) => {
        const formatted = formatTime(date);
        // Verify 24-hour format (HH:MM)
        expect(formatted).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Custom Generators**:
- Task generator: random id, text (1-200 chars), completed boolean, timestamp
- Quick link generator: random id, label (1-50 chars), valid URL, timestamp
- Timer state generator: random remaining time (0-1500), state (idle/running/paused)
- Hour generator: integers 0-23 for greeting tests

**Property Test Coverage**:
All 23 correctness properties from the design document will have corresponding property-based tests:
- Properties 1-3: Greeting component formatting and logic
- Properties 4-7: Timer behavior and state management
- Properties 8-16: Task list operations and persistence
- Properties 17-23: Quick links operations and persistence

### Test Data Management

**Mocking Local Storage**:
```javascript
const mockStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

beforeEach(() => {
  global.localStorage = mockStorage;
  mockStorage.clear();
});
```

**Mocking Timers**:
- Use Jest's fake timers for testing setInterval behavior
- Advance time programmatically with `jest.advanceTimersByTime()`
- Verify timer callbacks execute at correct intervals

**Mocking DOM**:
- Use jsdom for DOM manipulation testing
- Create container elements for component mounting
- Verify DOM structure and content after operations

### Test Execution

**Development Workflow**:
```bash
npm test              # Run all tests once
npm test -- --watch   # Run tests in watch mode
npm test -- --coverage # Generate coverage report
```

**Coverage Goals**:
- Line coverage: >90%
- Branch coverage: >85%
- Function coverage: >95%
- Property test iterations: 100+ per property

**CI/CD Integration**:
- Run full test suite on every commit
- Block merges if tests fail
- Generate and publish coverage reports
- Run property tests with higher iteration counts (500+) in CI

### Testing Balance

**Unit Tests**: Focus on specific examples and edge cases
- Avoid writing too many similar unit tests
- Property tests handle comprehensive input coverage
- Unit tests validate concrete scenarios and integration

**Property Tests**: Focus on universal properties
- Each correctness property gets exactly one property test
- High iteration counts ensure thorough coverage
- Generators create diverse test data automatically

This dual approach ensures both concrete correctness (unit tests) and general robustness (property tests), providing comprehensive validation without redundant test code.

### Test Maintenance

- Update tests when requirements change
- Add new properties when new features are added
- Review and refine generators as data models evolve
- Monitor test execution time and optimize slow tests
- Keep test code as clean and maintainable as production code

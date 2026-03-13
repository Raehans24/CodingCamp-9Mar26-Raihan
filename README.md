# 🚀 Productivity Dashboard (Revo-U)

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-semantic-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-custom%20properties-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Local Storage](https://img.shields.io/badge/Storage-Local%20Storage-green.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![No Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen.svg)](#)

A lightweight, browser-based productivity dashboard designed to help you stay focused and organized. Built with vanilla JavaScript and no external dependencies, this single-page application provides essential productivity tools in a clean, distraction-free interface.

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [File Structure](#-file-structure)
- [Browser Compatibility](#-browser-compatibility)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## ✨ Features

- ⏰ **Time-Aware Greeting**: Real-time clock with contextual greetings based on time of day
- 🍅 **Pomodoro Focus Timer**: 25-minute focus sessions with start, stop, and reset controls
- ✅ **Task Management**: Create, edit, complete, and delete tasks with persistent storage
- 🔗 **Quick Links**: Save and organize shortcuts to your favorite websites
- 🌙 **Theme Toggle**: Switch between light and dark modes with preference persistence
- 💾 **Local Storage**: All data persists locally in your browser - no server required
- 📱 **Responsive Design**: Works seamlessly across desktop and mobile devices
- ⚡ **Lightning Fast**: Sub-100ms interaction response times

## 🎬 Demo

<!-- Placeholder for demo content -->
*Demo screenshot or GIF will be added here once the application is fully implemented.*

To see the dashboard in action, simply open `index.html` in your browser after following the installation instructions below.

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: Browser Local Storage API
- **Testing**: Vitest with jsdom and fast-check for property-based testing
- **Module System**: ES Modules
- **Build System**: None required - runs directly in the browser

### Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| HTML5 | Semantic markup structure | Latest |
| CSS3 | Styling with custom properties | Latest |
| JavaScript | Application logic (ES6+) | Latest |
| Local Storage | Data persistence | Native API |
| Vitest | Test runner | ^1.0.0 |
| fast-check | Property-based testing | ^3.15.0 |

## 🚀 Installation

### Prerequisites

- Modern web browser with ES6+ support
- Local Storage enabled in browser settings

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd productivity-dashboard
   ```

2. **Install development dependencies** (optional, for testing)
   ```bash
   npm install
   ```

3. **Open the application**
   ```bash
   # Option 1: Open directly in browser
   open index.html
   
   # Option 2: Use a local server (recommended)
   npx serve .
   # or
   python -m http.server 8000
   ```

4. **Access the dashboard**
   - Direct file: `file:///path/to/index.html`
   - Local server: `http://localhost:8000`

### Development Setup

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📖 Usage

### Getting Started

1. **Time Awareness**: The dashboard automatically displays the current time and a contextual greeting
2. **Focus Sessions**: Click "Start" on the timer to begin a 25-minute Pomodoro session
3. **Task Management**: Add tasks using the input field, check them off when complete
4. **Quick Access**: Add frequently visited websites for one-click access
5. **Theme Preference**: Toggle between light and dark modes using the theme button

### Features Guide

#### 🍅 Focus Timer
- **Start**: Begin a 25-minute countdown
- **Stop**: Pause the timer (preserves remaining time)
- **Reset**: Restore timer to 25 minutes
- **Completion**: Automatic notification when timer reaches zero

#### ✅ Task List
- **Add Task**: Type description and press Enter or click "Add"
- **Complete Task**: Click the checkbox to mark as done
- **Edit Task**: Click "Edit" to modify task text
- **Delete Task**: Click "Delete" to remove task permanently

#### 🔗 Quick Links
- **Add Link**: Enter label and URL, then click "Add"
- **Open Link**: Click any link to open in a new tab
- **Delete Link**: Click "×" to remove link permanently

#### 🌙 Theme Toggle
- **Switch Themes**: Click the theme button to toggle between light and dark modes
- **Persistence**: Your theme preference is automatically saved

### Data Persistence

All your data is stored locally in your browser:
- **Tasks**: Automatically saved when created, edited, or deleted
- **Quick Links**: Automatically saved when added or removed
- **Theme Preference**: Automatically saved when changed
- **Privacy**: No data is sent to external servers

## 📁 File Structure

```
productivity-dashboard/
├── css/
│   └── styles.css          # All application styles with CSS custom properties
├── js/
│   └── app.js              # Main application file with all component classes
├── .kiro/                  # Development and specification files
│   ├── specs/              # Spec-driven development documents
│   ├── steering/           # AI assistant guidance documents
│   └── hooks/              # Agent automation hooks
├── index.html              # Single-page application entry point
├── package.json            # Project metadata and dependencies
├── vitest.config.js        # Test configuration
└── README.md               # This file
```

### Component Architecture

The application follows a modular component-based architecture:

- **StorageManager**: Local Storage abstraction layer
- **GreetingComponent**: Time/date/greeting display
- **FocusTimer**: Pomodoro timer functionality
- **TaskList**: Task management with persistence
- **QuickLinks**: Link management with persistence
- **ThemeManager**: Theme switching logic
- **DashboardController**: Application initialization and coordination

## 🌐 Browser Compatibility

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 61+ | Full support |
| Firefox | 60+ | Full support |
| Safari | 12+ | Full support |
| Edge | 79+ | Full support |

### Required Features

- ES6+ JavaScript support
- Local Storage API
- CSS Custom Properties (CSS Variables)
- ES Modules support

### Graceful Degradation

- Displays error message if Local Storage is unavailable
- Components fail gracefully with user-friendly error messages
- No external dependencies to minimize compatibility issues

## 🤝 Contributing

We welcome contributions to improve the Productivity Dashboard! Here's how you can help:

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Coding Standards

- Use vanilla JavaScript (ES6+) - no frameworks
- Follow existing code style and naming conventions
- Add JSDoc comments for public methods
- Ensure all tests pass before submitting
- Maintain the single-file architecture for simplicity

### Testing

- Write unit tests for specific scenarios
- Add property-based tests for universal properties
- Ensure >90% code coverage
- Test in multiple browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Project Maintainer**: Raihan
- Email: raihansar025@gmail.com
- GitHub: https://github.com/Raehans24

**Project Repository**: https://github.com/Raehans24/CodingCamp-9Mar26-Raihan 

---

### 🙏 Acknowledgments

- Built with modern web standards and best practices
- Inspired by the Pomodoro Technique for productivity
- Designed for privacy-first, local-only data storage

### 🔄 Version History

- **See Releases**: https://github.com/Raehans24/CodingCamp-9Mar26-Raihan/releases 

---

*Made with ❤️ for productivity enthusiasts*
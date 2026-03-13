/**
 * Productivity Dashboard - Main Application File
 * 
 * This file contains all application logic organized into modular components:
 * - StorageManager: Local Storage abstraction
 * - GreetingComponent: Time, date, and greeting display
 * - FocusTimer: 25-minute Pomodoro timer
 * - TaskList: To-do list with CRUD operations
 * - QuickLinks: Website shortcuts manager
 * - ThemeManager: Light/dark mode toggle
 * - DashboardController: Application initialization and coordination
 */

'use strict';

// ===================================
// Storage Manager
// ===================================

class StorageManager {
  constructor() {
    this.storage = window.localStorage;
  }

  /**
   * Check if Local Storage is available and enabled
   * @returns {boolean} True if storage is available, false otherwise
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('Local Storage is not available:', e);
      return false;
    }
  }

  /**
   * Get a value from Local Storage
   * @param {string} key - The storage key
   * @returns {*} The deserialized value, or null if not found or error occurs
   */
  get(key) {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item);
    } catch (e) {
      console.error(`Error reading from storage (key: ${key}):`, e);
      return null;
    }
  }

  /**
   * Set a value in Local Storage
   * @param {string} key - The storage key
   * @param {*} value - The value to store (will be JSON serialized)
   * @returns {boolean} True if successful, false if error occurs
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Please delete some data.');
      } else {
        console.error(`Error writing to storage (key: ${key}):`, e);
      }
      return false;
    }
  }

  /**
   * Remove a value from Local Storage
   * @param {string} key - The storage key to remove
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
    } catch (e) {
      console.error(`Error removing from storage (key: ${key}):`, e);
    }
  }

  /**
   * Clear all values from Local Storage
   */
  clear() {
    try {
      this.storage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }
}

// ===================================
// Greeting Component
// ===================================

class GreetingComponent {
  constructor(containerElement) {
    this.container = containerElement;
    this.intervalId = null;
    this.timeElement = null;
    this.dateElement = null;
    this.greetingElement = null;
  }

  /**
   * Initialize the greeting component
   * Creates DOM structure and starts the update interval
   */
  init() {
    // Create DOM structure
    this.timeElement = document.createElement('div');
    this.timeElement.className = 'time';

    this.dateElement = document.createElement('div');
    this.dateElement.className = 'date';

    this.greetingElement = document.createElement('div');
    this.greetingElement.className = 'greeting';

    // Append elements to container
    this.container.appendChild(this.timeElement);
    this.container.appendChild(this.dateElement);
    this.container.appendChild(this.greetingElement);

    // Initial update
    this.update();

    // Set up interval to update every second
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  /**
   * Update time, date, and greeting display
   */
  update() {
    const now = new Date();

    this.timeElement.textContent = this.formatTime(now);
    this.dateElement.textContent = this.formatDate(now);
    this.greetingElement.textContent = this.getGreeting(now);
  }

  /**
   * Format time in 12-hour format with AM/PM
   * @param {Date} date - The date object to format
   * @returns {string} Formatted time string (e.g., "2:34 PM")
   */
  formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    // Zero-pad minutes
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${hours}:${minutesStr} ${ampm}`;
  }

  /**
   * Format date in readable format
   * @param {Date} date - The date object to format
   * @returns {string} Formatted date string (e.g., "Monday, January 15, 2024")
   */
  formatDate(date) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Get greeting based on current hour
   * @param {Date} date - The date object to get hour from
   * @returns {string} Greeting message
   */
  getGreeting(date) {
    const hour = date.getHours();

    if (hour >= 5 && hour <= 11) {
      return 'Good Morning';
    } else if (hour >= 12 && hour <= 16) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour <= 20) {
      return 'Good Evening';
    } else {
      // hour >= 21 or hour <= 4
      return 'Good Night';
    }
  }

  /**
   * Clean up the component
   * Clears the update interval and removes DOM elements
   */
  destroy() {
    // Clear the interval
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Remove DOM elements
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear references
    this.timeElement = null;
    this.dateElement = null;
    this.greetingElement = null;
  }
}


// ===================================
// Focus Timer Component
// ===================================

class FocusTimer {
  constructor(containerElement) {
    this.container = containerElement;
    this.state = {
      duration: 1500,      // 25 minutes in seconds
      remaining: 1500,     // Remaining time in seconds
      state: 'idle',       // 'idle' | 'running' | 'paused'
      intervalId: null     // setInterval reference
    };
    this.displayElement = null;
    this.startButton = null;
    this.stopButton = null;
    this.resetButton = null;
  }

  /**
   * Initialize the focus timer component
   * Creates DOM structure and sets up event listeners
   */
  init() {
    // Create timer display
    this.displayElement = document.createElement('div');
    this.displayElement.className = 'timer-display';
    this.displayElement.textContent = this.formatTime(this.state.remaining);

    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'timer-controls';

    // Create start button
    this.startButton = document.createElement('button');
    this.startButton.className = 'btn-start';
    this.startButton.textContent = 'Start';
    this.startButton.addEventListener('click', () => this.start());

    // Create stop button
    this.stopButton = document.createElement('button');
    this.stopButton.className = 'btn-stop';
    this.stopButton.textContent = 'Stop';
    this.stopButton.disabled = true;
    this.stopButton.addEventListener('click', () => this.stop());

    // Create reset button
    this.resetButton = document.createElement('button');
    this.resetButton.className = 'btn-reset';
    this.resetButton.textContent = 'Reset';
    this.resetButton.addEventListener('click', () => this.reset());

    // Append buttons to controls
    controlsContainer.appendChild(this.startButton);
    controlsContainer.appendChild(this.stopButton);
    controlsContainer.appendChild(this.resetButton);

    // Append elements to container
    this.container.appendChild(this.displayElement);
    this.container.appendChild(controlsContainer);
  }

  /**
   * Format seconds into MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string (e.g., "25:00", "04:32")
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Start the timer countdown
   */
  start() {
    if (this.state.state === 'running') {
      return; // Already running
    }

    this.state.state = 'running';
    this.updateButtonStates();

    // Start countdown interval
    this.state.intervalId = setInterval(() => {
      this.state.remaining--;

      // Update display
      this.displayElement.textContent = this.formatTime(this.state.remaining);

      // Check if timer reached zero
      if (this.state.remaining <= 0) {
        this.complete();
      }
    }, 1000);
  }

  /**
   * Stop/pause the timer countdown
   * Preserves the remaining time
   */
  stop() {
    if (this.state.state !== 'running') {
      return; // Not running
    }

    // Clear the interval
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }

    this.state.state = 'paused';
    this.updateButtonStates();
  }

  /**
   * Reset the timer to initial state
   */
  reset() {
    // Clear any running interval
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }

    // Reset state
    this.state.remaining = this.state.duration;
    this.state.state = 'idle';

    // Update display
    this.displayElement.textContent = this.formatTime(this.state.remaining);
    this.updateButtonStates();
  }

  /**
   * Handle timer completion
   */
  complete() {
    // Clear the interval
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }

    // Set state to idle
    this.state.state = 'idle';
    this.state.remaining = 0;

    // Update display
    this.displayElement.textContent = this.formatTime(this.state.remaining);
    this.updateButtonStates();

    // Show completion notification
    this.showNotification('Focus session complete! Time for a break.');
  }

  /**
   * Show a notification message
   * @param {string} message - The notification message
   */
  showNotification(message) {
    // Use browser notification API if available and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Timer', { body: message });
    } else {
      // Fallback to alert
      alert(message);
    }
  }

  /**
   * Update button enabled/disabled states based on timer state
   */
  updateButtonStates() {
    if (this.state.state === 'running') {
      this.startButton.disabled = true;
      this.stopButton.disabled = false;
    } else {
      // idle or paused
      this.startButton.disabled = false;
      this.stopButton.disabled = true;
    }
  }

  /**
   * Clean up the component
   * Clears the interval and removes DOM elements
   */
  destroy() {
    // Clear any running interval
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }

    // Remove event listeners by removing elements
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear references
    this.displayElement = null;
    this.startButton = null;
    this.stopButton = null;
    this.resetButton = null;
  }
}

// ===================================
// Task List Component
// ===================================

class TaskList {
  constructor(containerElement, storageManager) {
    // Task list implementation will be added in task 6
  }

  init() {
    // TODO: Initialize task list
  }

  addTask(text) {
    // TODO: Add new task
  }

  editTask(id, newText) {
    // TODO: Edit existing task
  }

  toggleTask(id) {
    // TODO: Toggle task completion status
  }

  deleteTask(id) {
    // TODO: Delete task
  }

  render() {
    // TODO: Render task list to DOM
  }
}

// ===================================
// Quick Links Component
// ===================================

class QuickLinks {
  constructor(containerElement, storageManager) {
    // Quick links implementation will be added in task 7
  }

  init() {
    // TODO: Initialize quick links
  }

  addLink(label, url) {
    // TODO: Add new quick link
  }

  deleteLink(id) {
    // TODO: Delete quick link
  }

  render() {
    // TODO: Render quick links to DOM
  }
}

// ===================================
// Theme Manager Component
// ===================================

class ThemeManager {
  constructor(storageManager) {
    // Theme manager implementation will be added in task 9
  }

  init() {
    // TODO: Initialize theme manager
  }

  toggle() {
    // TODO: Toggle between light and dark themes
  }

  getCurrentTheme() {
    // TODO: Get current theme
  }
}

// ===================================
// Dashboard Controller
// ===================================

class DashboardController {
  constructor() {
    // Dashboard controller implementation will be added in task 10
  }

  init() {
    // TODO: Initialize all components and coordinate startup
  }
}

// ===================================
// Application Entry Point
// ===================================

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize storage manager
  const storageManager = new StorageManager();

  // Check if storage is available
  if (!storageManager.isAvailable()) {
    alert('Local Storage is required for this application. Please enable it in your browser settings.');
    return;
  }

  // Initialize greeting component
  const greetingContainer = document.getElementById('greeting-container');
  if (greetingContainer) {
    const greeting = new GreetingComponent(greetingContainer);
    greeting.init();
  }

  // Initialize focus timer component
  const timerContainer = document.getElementById('timer-container');
  if (timerContainer) {
    const timer = new FocusTimer(timerContainer);
    timer.init();
  }

  console.log('Productivity Dashboard initialized');
});

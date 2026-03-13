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

/**
 * Storage Manager
 * Provides abstraction layer for Local Storage operations with error handling
 */
class StorageManager {
  /**
   * Initialize the storage manager
   */
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
      
      // Parse JSON
      const parsed = JSON.parse(item);
      
      // Validate data structure based on key
      if (key === 'quickLinks' || key === 'tasks') {
        if (!Array.isArray(parsed)) {
          console.warn(`Invalid data structure for ${key}: expected array, got ${typeof parsed}`);
          return null;
        }
        
        // Validate each item has required fields
        const validItems = parsed.filter(item => {
          if (!item || typeof item !== 'object') return false;
          
          // Check for required fields
          if (!item.id || !item.createdAt) {
            console.warn(`Invalid item in ${key}: missing required fields`, item);
            return false;
          }
          
          // Key-specific validation
          if (key === 'quickLinks') {
            if (!item.label || !item.url) {
              console.warn(`Invalid quick link: missing label or url`, item);
              return false;
            }
          } else if (key === 'tasks') {
            if (!item.text || typeof item.completed !== 'boolean') {
              console.warn(`Invalid task: missing text or completed status`, item);
              return false;
            }
          }
          
          return true;
        });
        
        // Return validated items (may be fewer than original if some were invalid)
        return validItems;
      }
      
      return parsed;
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error(`Corrupted data in storage (key: ${key}). Clearing corrupted data.`, e);
        // Clear corrupted data
        this.remove(key);
        return null;
      }
      console.error(`Error reading from storage (key: ${key}):`, e);
      return null;
    }
  }

  /**
   * Set a value in Local Storage
   * @param {string} key - The storage key
   * @param {*} value - The value to store (will be JSON serialized)
   * @returns {object} Result object with success status and optional error message
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(key, serialized);
      return { success: true };
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded. Please delete some data.');
        return { 
          success: false, 
          error: 'Storage limit reached. Please delete some tasks or links to free up space.',
          errorType: 'quota'
        };
      } else {
        console.error(`Error writing to storage (key: ${key}):`, e);
        return { 
          success: false, 
          error: 'Failed to save data. Please try again.',
          errorType: 'unknown'
        };
      }
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

/**
 * Greeting Component
 * Displays current time, date, and time-based greeting with automatic updates
 */
class GreetingComponent {
  /**
   * Initialize the greeting component
   * @param {HTMLElement} containerElement - The DOM element to render the greeting in
   */
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
    try {
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
      this.intervalId = setInterval(() => {
        try {
          this.update();
        } catch (error) {
          console.error('Error updating greeting:', error);
          // Continue running despite errors
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize greeting component:', error);
      this.displayError('Failed to load greeting component');
    }
  }

  /**
   * Display error message in the component container
   * @param {string} message - The error message to display
   */
  displayError(message) {
    if (this.container) {
      this.container.innerHTML = `<div class="component-error">${message}</div>`;
    }
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
   * Format time in 24-hour format
   * @param {Date} date - The date object to format
   * @returns {string} Formatted time string (e.g., "14:34")
   */
  formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Zero-pad hours and minutes
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${hoursStr}:${minutesStr}`;
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

/**
 * Focus Timer Component
 * Implements a 25-minute Pomodoro timer with start/stop/reset controls
 */
class FocusTimer {
  /**
   * Initialize the focus timer component
   * @param {HTMLElement} containerElement - The DOM element to render the timer in
   */
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

    try {
      // Start countdown interval
      this.state.intervalId = setInterval(() => {
        try {
          this.state.remaining--;

          // Update display
          this.displayElement.textContent = this.formatTime(this.state.remaining);

          // Check if timer reached zero
          if (this.state.remaining <= 0) {
            this.complete();
          }
        } catch (error) {
          console.error('Error in timer countdown:', error);
          // Stop timer on error to prevent further issues
          this.stop();
          this.displayTimerError('Timer encountered an error and was stopped');
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to start timer:', error);
      this.state.state = 'idle';
      this.updateButtonStates();
      this.displayTimerError('Failed to start timer. Please try again.');
    }
  }

  /**
   * Display timer error message
   * @param {string} message - The error message to display
   */
  displayTimerError(message) {
    // Create or update error message element
    let errorElement = this.container.querySelector('.timer-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'timer-error error-message';
      this.container.insertBefore(errorElement, this.displayElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }, 5000);
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

/**
 * Task List Component
 * Manages to-do list with CRUD operations and Local Storage persistence
 */
class TaskList {
  /**
   * Initialize the task list component
   * @param {HTMLElement} containerElement - The DOM element to render the task list in
   * @param {StorageManager} storageManager - The storage manager instance for data persistence
   */
  constructor(containerElement, storageManager) {
    this.container = containerElement;
    this.storage = storageManager;
    this.storageKey = 'tasks';
    this.tasks = [];
    this.formElement = null;
    this.inputElement = null;
    this.tasksListElement = null;
    this.emptyStateElement = null;
    this.errorMessageElement = null;
  }

  /**
   * Initialize the task list component
   * Creates DOM structure, loads tasks from storage, and sets up event listeners
   */
  init() {
    try {
      // Load tasks from storage or initialize empty array
      const savedTasks = this.storage.get(this.storageKey);
      this.tasks = Array.isArray(savedTasks) ? savedTasks : [];

      // Create form for adding tasks
      this.formElement = document.createElement('form');
      this.formElement.className = 'task-form';

      this.inputElement = document.createElement('input');
      this.inputElement.type = 'text';
      this.inputElement.placeholder = 'Add a new task...';
      this.inputElement.className = 'task-input';

      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.textContent = 'Add';
      submitButton.className = 'btn-add-task';

      this.formElement.appendChild(this.inputElement);
      this.formElement.appendChild(submitButton);

      // Create error message element
      this.errorMessageElement = document.createElement('div');
      this.errorMessageElement.className = 'error-message';
      this.errorMessageElement.style.display = 'none';

      // Create tasks list container
      this.tasksListElement = document.createElement('ul');
      this.tasksListElement.className = 'tasks';

      // Create empty state message
      this.emptyStateElement = document.createElement('div');
      this.emptyStateElement.className = 'empty-state';
      this.emptyStateElement.textContent = 'No tasks yet. Add one above!';

      // Append elements to container
      this.container.appendChild(this.formElement);
      this.container.appendChild(this.errorMessageElement);
      this.container.appendChild(this.tasksListElement);
      this.container.appendChild(this.emptyStateElement);

      // Set up form submission event listener
      this.formElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.inputElement.value.trim();
        if (text) {
          const result = this.addTask(text);
          if (result.success) {
            this.inputElement.value = '';
            this.hideError();
          } else {
            this.showError(result.error);
          }
        } else {
          this.showError('Task description cannot be empty');
        }
      });

      // Initial render
      this.render();
    } catch (error) {
      console.error('Failed to initialize task list:', error);
      this.displayError('Failed to load task list');
    }
  }

  /**
   * Generate a unique ID for a task
   * Uses timestamp-based approach for simplicity
   * @returns {string} Unique task ID
   */
  generateId() {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Add a new task to the list
   * @param {string} text - The task description
   * @returns {object} Result object with success status and optional error message
   */
  addTask(text) {
    try {
      // Validate input
      const trimmedText = text.trim();
      if (!trimmedText) {
        return { success: false, error: 'Task description cannot be empty' };
      }

      // Create task object
      const task = {
        id: this.generateId(),
        text: trimmedText,
        completed: false,
        createdAt: Date.now()
      };

      // Add to tasks array
      this.tasks.push(task);

      // Sync to storage
      const saveResult = this.storage.set(this.storageKey, this.tasks);
      
      if (!saveResult.success) {
        // Rollback the addition if storage fails
        this.tasks.pop();
        
        // Return appropriate error message
        if (saveResult.errorType === 'quota') {
          return { success: false, error: saveResult.error };
        }
        return { success: false, error: 'Failed to save task. Please try again.' };
      }

      // Re-render
      this.render();

      return { success: true };
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error: 'Failed to add task. Please try again.' };
    }
  }

  /**
   * Edit an existing task's text
   * @param {string} id - The task ID
   * @param {string} newText - The new task text
   * @returns {object} Result object with success status and optional error message
   */
  editTask(id, newText) {
    try {
      // Validate input
      const trimmedText = newText.trim();
      if (!trimmedText) {
        return { success: false, error: 'Task description cannot be empty' };
      }

      // Find task by ID
      const task = this.tasks.find(t => t.id === id);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }

      // Store original text for rollback
      const originalText = task.text;

      // Update task text
      task.text = trimmedText;

      // Sync to storage
      const saveResult = this.storage.set(this.storageKey, this.tasks);
      
      if (!saveResult.success) {
        // Rollback the edit if storage fails
        task.text = originalText;
        
        // Return appropriate error message
        if (saveResult.errorType === 'quota') {
          return { success: false, error: saveResult.error };
        }
        return { success: false, error: 'Failed to save changes. Please try again.' };
      }

      // Re-render
      this.render();

      return { success: true };
    } catch (error) {
      console.error('Error editing task:', error);
      return { success: false, error: 'Failed to edit task. Please try again.' };
    }
  }

  /**
   * Toggle a task's completion status
   * @param {string} id - The task ID
   */
  toggleTask(id) {
    try {
      // Find task by ID
      const task = this.tasks.find(t => t.id === id);
      if (!task) {
        return;
      }

      // Flip completed status
      task.completed = !task.completed;

      // Sync to storage
      const saveResult = this.storage.set(this.storageKey, this.tasks);
      
      if (!saveResult.success) {
        // Rollback the toggle if storage fails
        task.completed = !task.completed;
        this.showError('Failed to update task. Please try again.');
        this.render();
        return;
      }

      // Re-render
      this.render();
    } catch (error) {
      console.error('Error toggling task:', error);
      this.showError('Failed to update task. Please try again.');
    }
  }

  /**
   * Delete a task from the list
   * @param {string} id - The task ID
   */
  deleteTask(id) {
    try {
      // Find the task to delete (for potential rollback)
      const taskIndex = this.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        return;
      }
      
      const deletedTask = this.tasks[taskIndex];

      // Remove task from array
      this.tasks = this.tasks.filter(t => t.id !== id);

      // Sync to storage
      const saveResult = this.storage.set(this.storageKey, this.tasks);
      
      if (!saveResult.success) {
        // Rollback the deletion if storage fails
        this.tasks.splice(taskIndex, 0, deletedTask);
        this.showError('Failed to delete task. Please try again.');
        this.render();
        return;
      }

      // Re-render
      this.render();
    } catch (error) {
      console.error('Error deleting task:', error);
      this.showError('Failed to delete task. Please try again.');
    }
  }

  /**
   * Show error message
   * @param {string} message - The error message to display
   */
  showError(message) {
    if (this.errorMessageElement) {
      this.errorMessageElement.textContent = message;
      this.errorMessageElement.style.display = 'block';
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    if (this.errorMessageElement) {
      this.errorMessageElement.style.display = 'none';
      this.errorMessageElement.textContent = '';
    }
  }

  /**
   * Display error message in the component
   * @param {string} message - The error message to display
   */
  displayError(message) {
    this.container.innerHTML = `
      <div class="component-error">
        <p>${message}</p>
      </div>
    `;
  }

  /**
   * Render the task list to the DOM
   * Generates DOM elements for all tasks and shows/hides empty state
   */
  render() {
    try {
      // Clear existing tasks
      this.tasksListElement.innerHTML = '';

      // Show/hide empty state
      if (this.tasks.length === 0) {
        this.emptyStateElement.style.display = 'block';
        this.tasksListElement.style.display = 'none';
        return;
      } else {
        this.emptyStateElement.style.display = 'none';
        this.tasksListElement.style.display = 'block';
      }

      // Render each task
      this.tasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        taskItem.dataset.id = task.id;

        // Apply completion styling
        if (task.completed) {
          taskItem.classList.add('completed');
        }

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
          this.toggleTask(task.id);
        });

        // Create task text span
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'btn-edit';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
          const newText = prompt('Edit task:', task.text);
          if (newText !== null && newText.trim()) {
            const result = this.editTask(task.id, newText);
            if (!result.success) {
              this.showError(result.error);
            } else {
              this.hideError();
            }
          }
        });

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-delete';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
          this.deleteTask(task.id);
        });

        // Append elements to task item
        taskItem.appendChild(checkbox);
        taskItem.appendChild(textSpan);
        taskItem.appendChild(editButton);
        taskItem.appendChild(deleteButton);

        // Append task item to list
        this.tasksListElement.appendChild(taskItem);
      });
    } catch (error) {
      console.error('Error rendering tasks:', error);
      this.displayError('Failed to display tasks');
    }
  }

  /**
   * Clean up the component
   * Removes DOM elements and clears references
   */
  destroy() {
    // Remove DOM elements
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear references
    this.formElement = null;
    this.inputElement = null;
    this.tasksListElement = null;
    this.emptyStateElement = null;
    this.errorMessageElement = null;
    this.tasks = [];
  }
}

// ===================================
// Quick Links Component
// ===================================

/**
 * Quick Links Component
 * Manages website shortcuts with CRUD operations and Local Storage persistence
 */
class QuickLinks {
  /**
   * Initialize the quick links component
   * @param {HTMLElement} containerElement - The DOM element to render the quick links in
   * @param {StorageManager} storageManager - The storage manager instance for data persistence
   */
  constructor(containerElement, storageManager) {
    this.container = containerElement;
    this.storage = storageManager;
    this.storageKey = 'quickLinks';
    this.links = [];
    this.formElement = null;
    this.labelInputElement = null;
    this.urlInputElement = null;
    this.linksGridElement = null;
    this.emptyStateElement = null;
    this.errorMessageElement = null;
  }

  /**
   * Initialize the quick links component
   * Creates DOM structure, loads links from storage, and sets up event listeners
   */
  init() {
    // Load links from storage or initialize empty array
    const savedLinks = this.storage.get(this.storageKey);
    this.links = Array.isArray(savedLinks) ? savedLinks : [];

    // Create form for adding links
    this.formElement = document.createElement('form');
    this.formElement.className = 'link-form';

    this.labelInputElement = document.createElement('input');
    this.labelInputElement.type = 'text';
    this.labelInputElement.name = 'label';
    this.labelInputElement.placeholder = 'Label';
    this.labelInputElement.className = 'link-label-input';

    this.urlInputElement = document.createElement('input');
    this.urlInputElement.type = 'url';
    this.urlInputElement.name = 'url';
    this.urlInputElement.placeholder = 'https://example.com';
    this.urlInputElement.className = 'link-url-input';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Add';
    submitButton.className = 'btn-add-link';

    this.formElement.appendChild(this.labelInputElement);
    this.formElement.appendChild(this.urlInputElement);
    this.formElement.appendChild(submitButton);

    // Create error message element
    this.errorMessageElement = document.createElement('div');
    this.errorMessageElement.className = 'error-message';
    this.errorMessageElement.style.display = 'none';

    // Create links grid container
    this.linksGridElement = document.createElement('div');
    this.linksGridElement.className = 'links-grid';

    // Create empty state message
    this.emptyStateElement = document.createElement('div');
    this.emptyStateElement.className = 'empty-state';
    this.emptyStateElement.textContent = 'No quick links yet. Add one above!';

    // Append elements to container
    this.container.appendChild(this.formElement);
    this.container.appendChild(this.errorMessageElement);
    this.container.appendChild(this.linksGridElement);
    this.container.appendChild(this.emptyStateElement);

    // Set up form submission event listener
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      const label = this.labelInputElement.value.trim();
      const url = this.urlInputElement.value.trim();
      
      if (label && url) {
        const result = this.addLink(label, url);
        if (result.success) {
          this.labelInputElement.value = '';
          this.urlInputElement.value = '';
          this.hideError();
        } else {
          this.showError(result.error);
        }
      } else {
        this.showError('Both label and URL are required');
      }
    });

    // Initial render
    this.render();
  }

  /**
   * Generate a unique ID for a link
   * Uses timestamp-based approach for simplicity
   * @returns {string} Unique link ID
   */
  generateId() {
    return `link-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Validate URL format
   * @param {string} url - The URL to validate
   * @returns {boolean} True if valid, false otherwise
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      // Ensure protocol is http or https
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  /**
   * Add a new quick link to the panel
   * @param {string} label - The link label
   * @param {string} url - The link URL
   * @returns {object} Result object with success status and optional error message
   */
  addLink(label, url) {
    // Validate inputs
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();

    if (!trimmedLabel) {
      return { success: false, error: 'Label cannot be empty' };
    }

    if (!trimmedUrl) {
      return { success: false, error: 'URL cannot be empty' };
    }

    // Validate URL format
    if (!this.isValidUrl(trimmedUrl)) {
      return { success: false, error: 'Please enter a valid URL (e.g., https://example.com)' };
    }

    // Create link object
    const link = {
      id: this.generateId(),
      label: trimmedLabel,
      url: trimmedUrl,
      createdAt: Date.now()
    };

    // Add to links array
    this.links.push(link);

    // Sync to storage
    const saveResult = this.storage.set(this.storageKey, this.links);
    
    if (!saveResult.success) {
      // Rollback the addition if storage fails
      this.links.pop();
      
      // Return appropriate error message
      if (saveResult.errorType === 'quota') {
        return { success: false, error: saveResult.error };
      }
      return { success: false, error: 'Failed to save link. Please try again.' };
    }

    // Re-render
    this.render();

    return { success: true };
  }

  /**
   * Delete a quick link from the panel
   * @param {string} id - The link ID
   */
  deleteLink(id) {
    // Remove link from array
    this.links = this.links.filter(l => l.id !== id);

    // Sync to storage
    this.storage.set(this.storageKey, this.links);

    // Re-render
    this.render();
  }

  /**
   * Show error message
   * @param {string} message - The error message to display
   */
  showError(message) {
    this.errorMessageElement.textContent = message;
    this.errorMessageElement.style.display = 'block';
  }

  /**
   * Hide error message
   */
  hideError() {
    this.errorMessageElement.style.display = 'none';
    this.errorMessageElement.textContent = '';
  }

  /**
   * Render the quick links to the DOM
   * Generates DOM elements for all links and shows/hides empty state
   */
  render() {
    // Clear existing links
    this.linksGridElement.innerHTML = '';

    // Show/hide empty state
    if (this.links.length === 0) {
      this.emptyStateElement.style.display = 'block';
      this.linksGridElement.style.display = 'none';
      return;
    } else {
      this.emptyStateElement.style.display = 'none';
      this.linksGridElement.style.display = 'grid';
    }

    // Render each link
    this.links.forEach(link => {
      const linkItem = document.createElement('div');
      linkItem.className = 'link-item';
      linkItem.dataset.id = link.id;

      // Create anchor element
      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = link.label;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.className = 'link-anchor';

      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-delete-link';
      deleteButton.textContent = '×';
      deleteButton.setAttribute('aria-label', `Delete ${link.label}`);
      deleteButton.addEventListener('click', () => {
        this.deleteLink(link.id);
      });

      // Append elements to link item
      linkItem.appendChild(anchor);
      linkItem.appendChild(deleteButton);

      // Append link item to grid
      this.linksGridElement.appendChild(linkItem);
    });
  }

  /**
   * Clean up the component
   * Removes DOM elements and clears references
   */
  destroy() {
    // Remove DOM elements
    if (this.container) {
      this.container.innerHTML = '';
    }

    // Clear references
    this.formElement = null;
    this.labelInputElement = null;
    this.urlInputElement = null;
    this.linksGridElement = null;
    this.emptyStateElement = null;
    this.errorMessageElement = null;
    this.links = [];
  }
}

// ===================================
// Theme Manager Component
// ===================================

/**
 * Theme Manager Component
 * Handles light/dark mode toggle and persistence
 */
class ThemeManager {
  /**
   * Initialize the theme manager
   * @param {StorageManager} storageManager - The storage manager instance for theme persistence
   */
  constructor(storageManager) {
    this.storage = storageManager;
    this.storageKey = 'dashboard_theme';
    this.currentTheme = null;
    this.toggleButton = null;
  }

  /**
   * Initialize the theme manager
   * Loads theme from storage, applies it, and sets up event listener
   */
  init() {
    // Load theme from storage or default to 'light'
    const savedTheme = this.storage.get(this.storageKey);
    this.currentTheme = savedTheme === 'dark' ? 'dark' : 'light';

    // Apply the theme
    this.applyTheme(this.currentTheme);

    // Set up event listener for theme toggle button
    this.toggleButton = document.querySelector('.theme-toggle');
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggle());
      this.updateToggleIcon();
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggle() {
    // Switch theme
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';

    // Apply the new theme
    this.applyTheme(this.currentTheme);

    // Sync to storage
    this.storage.set(this.storageKey, this.currentTheme);

    // Update toggle button icon
    this.updateToggleIcon();
  }

  /**
   * Apply theme by adding/removing dark-theme class on document.body
   * @param {string} theme - The theme to apply ('light' or 'dark')
   */
  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  /**
   * Update the theme toggle button icon based on current theme
   */
  updateToggleIcon() {
    if (this.toggleButton) {
      const iconElement = this.toggleButton.querySelector('.theme-icon');
      if (iconElement) {
        // Show moon icon for light mode (clicking will switch to dark)
        // Show sun icon for dark mode (clicking will switch to light)
        iconElement.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
      }
    }
  }

  /**
   * Get the current theme
   * @returns {string} Current theme ('light' or 'dark')
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
}

// ===================================
// Dashboard Controller
// ===================================

/**
 * Dashboard Controller
 * Coordinates initialization and management of all dashboard components
 */
class DashboardController {
  /**
   * Initialize the dashboard controller
   */
  constructor() {
    this.storageManager = null;
    this.components = {
      greeting: null,
      timer: null,
      taskList: null,
      quickLinks: null,
      themeManager: null
    };
  }

  /**
   * Initialize the dashboard and all components
   * Coordinates component startup in the correct order with error handling
   */
  init() {
    try {
      // Step 1: Initialize storage manager
      try {
        this.storageManager = new StorageManager();
      } catch (storageError) {
        // If StorageManager construction fails, it's a storage availability issue
        console.error('Failed to initialize dashboard:', storageError);
        this.displayStorageError();
        return;
      }

      // Step 2: Check storage availability
      if (!this.storageManager.isAvailable()) {
        this.displayStorageError();
        return;
      }

      // Step 3: Initialize all components in correct order
      this.initializeComponents();
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.displayInitializationError(error);
    }
  }

  /**
   * Initialize all dashboard components
   * Components are initialized in dependency order
   */
  initializeComponents() {
    try {
      // Initialize greeting component (no dependencies)
      const greetingContainer = document.getElementById('greeting-container');
      if (greetingContainer) {
        this.components.greeting = new GreetingComponent(greetingContainer);
        this.components.greeting.init();
      }

      // Initialize focus timer component (no dependencies)
      const timerContainer = document.getElementById('timer-container');
      if (timerContainer) {
        this.components.timer = new FocusTimer(timerContainer);
        this.components.timer.init();
      }

      // Initialize task list component (depends on storage)
      const tasksContainer = document.getElementById('tasks-container');
      if (tasksContainer) {
        this.components.taskList = new TaskList(tasksContainer, this.storageManager);
        this.components.taskList.init();
      }

      // Initialize quick links component (depends on storage)
      const linksContainer = document.getElementById('links-container');
      if (linksContainer) {
        this.components.quickLinks = new QuickLinks(linksContainer, this.storageManager);
        this.components.quickLinks.init();
      }

      // Initialize theme manager (depends on storage)
      this.components.themeManager = new ThemeManager(this.storageManager);
      this.components.themeManager.init();
    } catch (error) {
      console.error('Error initializing components:', error);
      throw new Error(`Component initialization failed: ${error.message}`);
    }
  }

  /**
   * Display error message when Local Storage is unavailable
   */
  displayStorageError() {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-banner';
    errorMessage.innerHTML = `
      <strong>Storage Unavailable</strong>
      <p>Local Storage is required for this application. Please enable it in your browser settings.</p>
    `;
    errorMessage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #f44336;
      color: white;
      padding: 20px;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

    document.body.insertBefore(errorMessage, document.body.firstChild);
    console.error('Local Storage is not available');
  }

  /**
   * Display error message when component initialization fails
   * @param {Error} error - The error that occurred
   */
  displayInitializationError(error) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-banner';
    errorMessage.innerHTML = `
      <strong>Initialization Error</strong>
      <p>Failed to initialize the dashboard. Please refresh the page.</p>
      <small>${error.message}</small>
    `;
    errorMessage.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #f44336;
      color: white;
      padding: 20px;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

    document.body.insertBefore(errorMessage, document.body.firstChild);
  }

  /**
   * Clean up all components and resources
   * Useful for testing or if dashboard needs to be reinitialized
   */
  destroy() {
    // Destroy all components
    if (this.components.greeting) {
      this.components.greeting.destroy();
    }
    if (this.components.timer) {
      this.components.timer.destroy();
    }
    if (this.components.taskList) {
      this.components.taskList.destroy();
    }
    if (this.components.quickLinks) {
      this.components.quickLinks.destroy();
    }

    // Clear component references
    this.components = {
      greeting: null,
      timer: null,
      taskList: null,
      quickLinks: null,
      themeManager: null
    };
    this.storageManager = null;
  }
}

// ===================================
// Application Entry Point
// ===================================

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new DashboardController();
  dashboard.init();
});

// Export classes for testing
export {
  StorageManager,
  GreetingComponent,
  FocusTimer,
  TaskList,
  QuickLinks,
  ThemeManager,
  DashboardController
};

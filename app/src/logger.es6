/* eslint global-require: 0 */

/**
 * Centralized logging utility for Mailspring
 * Provides consistent logging with different levels and environment awareness
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

const DEFAULT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

class Logger {
  constructor(moduleName = 'Mailspring') {
    this.moduleName = moduleName;
    this.logLevel = DEFAULT_LOG_LEVEL;
    this._loggers = new Map();
  }

  /**
   * Set the global log level
   * @param {number} level - Log level from LOG_LEVELS
   */
  static setLogLevel(level) {
    if (level >= 0 && level <= 4) {
      DEFAULT_LOG_LEVEL = level;
    }
  }

  /**
   * Get a logger instance for a specific module
   * @param {string} moduleName - Name of the module using the logger
   * @returns {Logger} Logger instance
   */
  static forModule(moduleName) {
    if (!this._loggers.has(moduleName)) {
      this._loggers.set(moduleName, new Logger(moduleName));
    }
    return this._loggers.get(moduleName);
  }

  /**
   * Check if a log level should be displayed
   * @private
   */
  _shouldLog(level) {
    return level <= this.logLevel;
  }

  /**
   * Format log message with timestamp and module name
   * @private
   */
  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level);
    const prefix = `[${timestamp}] [${levelName}] [${this.moduleName}]`;
    
    let formattedMessage = `${prefix} ${message}`;
    
    if (data !== null) {
      if (typeof data === 'object') {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` ${data}`;
      }
    }
    
    return formattedMessage;
  }

  /**
   * Log an error message
   */
  error(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this._formatMessage(LOG_LEVELS.ERROR, message, data));
    }
  }

  /**
   * Log a warning message
   */
  warn(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this._formatMessage(LOG_LEVELS.WARN, message, data));
    }
  }

  /**
   * Log an info message
   */
  info(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.info(this._formatMessage(LOG_LEVELS.INFO, message, data));
    }
  }

  /**
   * Log a debug message
   */
  debug(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this._formatMessage(LOG_LEVELS.DEBUG, message, data));
    }
  }

  /**
   * Log a trace message (development only)
   */
  trace(message, data = null) {
    if (this._shouldLog(LOG_LEVELS.TRACE)) {
      console.log(this._formatMessage(LOG_LEVELS.TRACE, message, data));
    }
  }

  /**
   * Create a performance timer
   */
  time(label) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.time(`[${this.moduleName}] ${label}`);
    }
  }

  /**
   * End a performance timer
   */
  timeEnd(label) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.timeEnd(`[${this.moduleName}] ${label}`);
    }
  }
}

// Export singleton instance for general use
export default Logger.forModule('Mailspring');

// Export class for module-specific loggers
export { Logger, LOG_LEVELS };
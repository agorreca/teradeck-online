// Silent console during tests
if (process.env.NODE_ENV === 'test') {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  // Only show warnings and errors during tests
  console.log = () => {};

  // Keep warnings and errors visible
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;

  // Add global flag to restore console if needed
  global.restoreConsole = () => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  };
}

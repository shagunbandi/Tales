// Import commands.js using ES6 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from the command log to reduce noise
Cypress.on("window:before:load", (win) => {
  cy.stub(win.console, "error").callThrough();
  cy.stub(win.console, "warn").callThrough();
});

// Prevent uncaught exceptions from failing tests
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
  if (err.message.includes("Non-Error promise rejection captured")) {
    return false;
  }
  return true;
});

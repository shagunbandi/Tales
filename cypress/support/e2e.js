// Custom Cypress commands
Cypress.Commands.add("getByTestId", (testId, ...args) => {
  return cy.get(`[data-testid="${testId}"]`, ...args);
});

// Ensure fixtures are available
// No additional setup needed

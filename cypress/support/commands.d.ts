/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(
        testId: string,
        ...args: ReadonlyArray<unknown>
      ): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};

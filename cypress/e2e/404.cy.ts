/// <reference types="cypress" />

export {};

describe("FourOhFourPage", () => {
  it("displays the error message", () => {
    cy.viewport("macbook-13");

    cy.visit("/abc", { failOnStatusCode: false });
    cy.contains("404 - Page Not Found").should("be.visible");
  });

  it("contains a link to go back home", () => {
    cy.viewport("macbook-13");

    cy.visit("/abc", { failOnStatusCode: false });
    cy.contains("Go back home").should("be.visible");
    cy.contains("Go back home").should("have.attr", "href", "/");
  });
});

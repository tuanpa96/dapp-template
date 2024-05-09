/// <reference types="cypress" />

export {};

describe("FourOhFourPage", () => {
  it("displays the error message", () => {
    cy.viewport("macbook-13");

    cy.visit("/500", { failOnStatusCode: false });
    cy.contains("500 - Server-side error occurred").should("be.visible");
  });

  it("contains a link to go back home", () => {
    cy.viewport("macbook-13");

    cy.visit("/500", { failOnStatusCode: false });
    cy.contains("Go back home").should("be.visible");
    cy.contains("Go back home").should("have.attr", "href", "/");
  });
});

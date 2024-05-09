/// <reference types="cypress" />

export {};

describe("When visit home page of wrap token", () => {
  it("I will see the data dashboard", () => {
    cy.viewport("macbook-13");
    cy.visit("/");

    cy.connectWallet();

    cy.contains("Safes").should("exist");
  });
});

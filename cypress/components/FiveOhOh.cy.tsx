/// <reference types="cypress" />

import FiveOhOhPage from "@/components/500";
import MockRouter from "../utils/router";

describe("FiveOhOhPage", () => {
  it("displays the error message", () => {
    cy.viewport("macbook-13");

    cy.mount(
      <MockRouter asPath="/">
        <FiveOhOhPage />
      </MockRouter>
    );
    cy.contains("500 - Server-side error occurred").should("be.visible");
  });

  it("contains a link to go back home", () => {
    cy.viewport("macbook-13");

    cy.mount(
      <MockRouter asPath="/">
        <FiveOhOhPage />
      </MockRouter>
    );
    cy.contains("Go back home").should("be.visible");
    cy.contains("Go back home").should("have.attr", "href", "/");
  });
});

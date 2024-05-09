/// <reference types="cypress" />

import FourOhFourPage from "@/components/404";
import MockRouter from "../utils/router";

describe("FourOhFourPage", () => {
  it("displays the error message", () => {
    cy.viewport("macbook-13");

    cy.mount(
      <MockRouter asPath="/">
        <FourOhFourPage />
      </MockRouter>
    );
    cy.contains("404 - Page Not Found").should("be.visible");
  });

  it("contains a link to go back home", () => {
    cy.viewport("macbook-13");

    cy.mount(
      <MockRouter asPath="/">
        <FourOhFourPage />
      </MockRouter>
    );
    cy.contains("Go back home").should("be.visible");
    cy.contains("Go back home").should("have.attr", "href", "/");
  });
});

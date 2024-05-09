/// <reference types="cypress" />

import AddExitsSafe from "../../src/components/addExitsSafe";

describe("AddExitsSafe", () => {
  beforeEach(() => {
    cy.viewport("macbook-13");

    cy.mount(
      <AddExitsSafe
        openModalAddSafe={true}
        handleCloseModal={() => {}}
        handleAddonSafeExits={() => {}}
      />
    );
  });

  // it("displays the modal when opened", () => {
  //   cy.get("[data-test-id='modal']").should("be.visible");
  // });

  // it("allows entering a safe name", () => {
  //   const safeName = "Test Safe";
  //   cy.get("[data-test-id='step-info-input-name']")
  //     .type(safeName)
  //     .should("have.value", safeName);
  // });

  // it("displays an error message if safe name is empty", () => {
  //   cy.get("[data-test-id='step-info-input-name']").focus().blur();
  //   cy.contains("Safe name is required.").should("be.visible");
  // });

  // it("allows entering a safe address", () => {
  //   const safeAddress = "0x123456789";
  //   cy.get("[data-test-id='step-info-input-address']")
  //     .type(safeAddress)
  //     .should("have.value", safeAddress);
  // });

  // it("displays an error message if safe address is invalid", () => {
  //   const invalidAddress = "invalid-address";
  //   cy.get("[data-test-id='step-info-input-address']")
  //     .type(invalidAddress)
  //     .blur();
  //   cy.contains("Safe address invalid").should("be.visible");
  // });

  // it("displays an error message if safe address does not exist", () => {
  //   const nonExistentAddress = "0x987654321";
  //   cy.get("[data-test-id='step-info-input-address']")
  //     .type(nonExistentAddress)
  //     .blur();
  //   cy.contains("Safe address not exists").should("be.visible");
  // });

  // it("calls the handleAddExitsSafe function when Add button is clicked", () => {
  //   cy.stub(Cypress.env(), "safeClient").resolves({
  //     fetcher: {
  //       findSafe: () => {},
  //     },
  //   });
  //   cy.get("[data-test-id='step-info-input-name']").type("Test Safe");
  //   cy.get("[data-test-id='step-info-input-address']").type("0x123456789");
  //   cy.get("[data-test-id='add-button']").click();
  //   // Assert the behavior after adding a safe
  // });
});

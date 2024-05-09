/// <reference types="cypress" />

import AddressBook from "@/components/addressBook";

describe("AddressBook", () => {
  beforeEach(() => {
    const cacheListContactSafe = {
      address1: "John Doe",
      address2: "Jane Smith",
    };

    cy.stub(window.localStorage, "getItem").returns(
      JSON.stringify(cacheListContactSafe)
    ); // Stub window.localStorage.getItem
  });

  it("renders the address book table with the correct data", () => {
    cy.viewport("macbook-13");

    cy.mount(<AddressBook />).then(() => {
      cy.get("p").should("contain", "Address Book");

      cy.get("tbody > tr").should("have.length", 2);
      cy.get("tbody > tr")
        .eq(0)
        .within(() => {
          cy.get("td").eq(1).should("contain", "John Doe");
          cy.get("td").eq(3).should("contain", "address1");
        });
      cy.get("tbody > tr")
        .eq(1)
        .within(() => {
          cy.get("td").eq(1).should("contain", "Jane Smith");
          cy.get("td").eq(3).should("contain", "address2");
        });
    });
  });
});

// FIXME a better way to wait instead of time?
/* Now that we are using the jsonld.js lib, network calls for compaction/expansion take some time to complete
 * So we need to wait before testing. */
Cypress.Commands.add('generateCodemetaAndWait', (label) => {
    cy.get('#generateCodemeta').click();
    cy.wait(500); // Arbitrary amount of time
});

beforeEach(function() {
    /* Clear the session storage, as it is used to restore field data;
     * and we don't want a test to load data from the previous test. */
    cy.window().then((win) => {
        win.sessionStorage.clear()
    })
    cy.visit('./index.html');
});

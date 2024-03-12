beforeEach(function() {
    /* Clear the session storage, as it is used to restore field data;
     * and we don't want a test to load data from the previous test. */
    cy.window().then((win) => {
        win.sessionStorage.clear()
    })
    cy.visit('./index.html');
});

/**
 * Copyright (C) 2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Tests the author/contributor dynamic fieldsets
 */

"use strict";

describe('Persons', function() {
    beforeEach(function() {
        /* Clear the session storage, as it is used to restore field data;
         * and we don't want a test to load data from the previous test. */
        cy.window().then((win) => {
            win.sessionStorage.clear()
        })
        cy.visit('./index.html');
    });

    // No author:

    it('exports when there are no author', function() {
        cy.get('#name').type('My Test Software');
        cy.get('#generateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
        });
    });

    it('imports missing author', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#author_nb').should('have.value', '0');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('not.exist');
    });

    it('imports empty author list', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [],
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#author_nb').should('have.value', '0');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('not.exist');
    });

    // Single author:

    it('exports single full author', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_nb').should('have.value', '0');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('not.exist');
        cy.get('#author_1_givenName').should('not.exist');

        cy.get('#author_add').click();
        cy.get('#author_nb').should('have.value', '1');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('exist');
        cy.get('#author_2').should('not.exist');

        cy.get('#author_1_givenName').should('have.value', '');
        cy.get('#author_1_familyName').should('have.value', '');
        cy.get('#author_1_email').should('have.value', '');
        cy.get('#author_1_id').should('have.value', '');
        cy.get('#author_1_affiliation').should('have.value', '');

        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_familyName').type('Doe');
        cy.get('#author_1_email').type('jdoe@example.org');
        cy.get('#author_1_id').type('http://example.org/~jdoe');
        cy.get('#author_1_affiliation').type('http://example.org/');

        cy.get('#generateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jdoe",
                        "givenName": "Jane",
                        "familyName": "Doe",
                        "email": "jdoe@example.org",
                        "affiliation": {
                            "@type": "Organization",
                            "@id": "http://example.org/",
                        }
                    }
                ],
        });
    });

    it('imports single full author', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jdoe",
                        "givenName": "Jane",
                        "familyName": "Doe",
                        "email": "jdoe@example.org",
                        "affiliation": {
                            "@type": "Organization",
                            "@id": "http://example.org/",
                        }
                    }
                ],
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#author_nb').should('have.value', '1');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('exist');
        cy.get('#author_2').should('not.exist');
        cy.get('#author_1_givenName').should('have.value', 'Jane');
        cy.get('#author_1_familyName').should('have.value', 'Doe');
        cy.get('#author_1_email').should('have.value', 'jdoe@example.org');
        cy.get('#author_1_id').should('have.value', 'http://example.org/~jdoe');
        cy.get('#author_1_affiliation').should('have.value', 'http://example.org/');
    });
});

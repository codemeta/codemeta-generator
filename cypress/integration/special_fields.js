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
describe('Funder id', function() {
    it('can be exported', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#funder').type('http://example.org/');

        cy.get('#generateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "funder": {
                    "@type": "Organization",
                    "@id": "http://example.org/",
                },
            });
    });

    it('can be imported', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "funder": {
                    "@type": "Organization",
                    "@id": "http://example.org/",
                },
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#funder').should('have.value', 'http://example.org/');
    });
});

describe('Funder name', function() {
    it('can be exported', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#funder').type('Example Org');

        cy.get('#generateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "funder": {
                    "@type": "Organization",
                    "name": "Example Org",
                }
        });
    });

    it('can be imported', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "funder": {
                    "@type": "Organization",
                    "name": "Example Org",
                }
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#funder').should('have.value', 'Example Org');
    });
});


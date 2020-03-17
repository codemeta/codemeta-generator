/**
 * Copyright (C) 2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Tests the basic features of the application.
 */

"use strict";

describe('Validation', function() {
    it('accepts empty document', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#name').should('have.value', '');
        cy.get('#errorMessage').should('have.text', '');
    });

    it('works just from all main fields', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "license": "https://spdx.org/licenses/AGPL-3.0",
                "dateCreated": "2019-10-02",
                "datePublished": "2020-01-01",
                "name": "My Test Software",
                "description": "This is a\ngreat piece of software",
            }))
        );
        cy.get('#validateCodemeta').click();


        cy.get('#name').should('have.value', '');
        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on invalid type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "foo",
                "name": "My Test Software",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#name').should('have.value', '');

        // But must display an error
        cy.get('#errorMessage').should('have.text', 'Wrong document type: must be SoftwareSourceCode or SoftwareApplication, not "foo"');
    });
});


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

    it('accepts all main fields', function() {
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

describe('URL validation', function() {
    it('accepts empty list of URLs', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": ["http://example.org/", "http://example.com/"],
            }))
        );
        cy.get('#validateCodemeta').click();

        // But must display an error
        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts valid URL', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": "http://example.org/",
            }))
        );
        cy.get('#validateCodemeta').click();

        // But must display an error
        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on invalid URL', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": "foo",
            }))
        );
        cy.get('#validateCodemeta').click();

        // But must display an error
        cy.get('#errorMessage').should('have.text', 'Invalid URL in field "codeRepository": "foo"');
    });

    it('errors on non-string instead of URL', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": {},
            }))
        );
        cy.get('#validateCodemeta').click();

        // But must display an error
        cy.get('#errorMessage').should('have.text', '"codeRepository" must be an URL (or a list of URLs), not: {}');
    });

    it('accepts list of URLs', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": ["http://example.org/", "http://example.com/"],
            }))
        );
        cy.get('#validateCodemeta').click();

        // But must display an error
        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on list with an invalid URL at the end', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": ["http://example.org/", "foo"],
            }))
        );
        cy.get('#validateCodemeta').click();

        // But must display an error
        cy.get('#errorMessage').should('have.text', 'Invalid URL in field "codeRepository": "foo"');
    });

    it('errors on list with an invalid URL at the beginning', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": ["http://example.org/", "foo"],
            }))
        );
        cy.get('#validateCodemeta').click();

        // But must display an error
        cy.get('#errorMessage').should('have.text', 'Invalid URL in field "codeRepository": "foo"');
    });

    it('errors on non-string in URL list', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": ["http://example.org/", {}],
            }))
        );
        cy.get('#validateCodemeta').click();

        // But must display an error
        cy.get('#errorMessage').should('have.text', '"codeRepository" must be a list of URLs (or a single URL), but it contains: {}');
    });
});


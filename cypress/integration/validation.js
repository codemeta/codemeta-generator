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

describe('Document validation', function() {
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

    it('accepts anything in non-validated fields', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "programmingLanguage": "foo",
            }))
        );
        cy.get('#validateCodemeta').click();
        cy.get('#errorMessage').should('have.text', '');

        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "programmingLanguage": 21,
            }))
        );
        cy.get('#validateCodemeta').click();
        cy.get('#errorMessage').should('have.text', '');

        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "programmingLanguage": {},
            }))
        );
        cy.get('#validateCodemeta').click();
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

        cy.get('#errorMessage').should('have.text', 'Wrong document type: must be SoftwareSourceCode or SoftwareApplication, not "foo"');
    });
});

describe('URLs validation', function() {
    it('accepts valid URL', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": "http://example.org/",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts empty list of URLs', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": [],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts list of valid URLs', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "codeRepository": ["http://example.org/", "http://example.com/"],
            }))
        );
        cy.get('#validateCodemeta').click();

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

        cy.get('#errorMessage').should('have.text', '"codeRepository" must be an URL (or a list of URLs), not: {}');
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

        cy.get('#errorMessage').should('have.text', '"codeRepository" must be a list of URLs (or a single URL), but it contains: {}');
    });
});

describe('Texts or URLs validation', function() {
    it('accepts valid Text', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "applicationCategory": "foo",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts valid URL', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "applicationCategory": "http://example.org/",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts empty list of Texts', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "applicationCategory": [],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts list of Texts', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "applicationCategory": ["foo", "bar"],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on non-string instead of Text', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "applicationCategory": {},
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"applicationCategory" must be a text/URL (or a list of texts/URLs), not: {}');
    });

    it('errors on list with an invalid Text at the beginning', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "applicationCategory": [{}, "foo"],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"applicationCategory" must be a list of texts/URLs (or a single text/URL), but it contains: {}');
    });

    it('errors on list with an invalid Text at the end', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "applicationCategory": ["foo", {}],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"applicationCategory" must be a list of texts/URLs (or a single text/URL), but it contains: {}');
    });
});

describe('Text validation', function() {
    it('accepts valid Text', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "description": "foo",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on empty list of Texts', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "description": [],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"description" must be text, not []');
    });

    it('errors on list of Texts', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "description": ["foo", "bar"],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"description" must be text, not ["foo","bar"]');
    });

    it('errors on non-string instead of Text', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "description": {},
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"description" must be text, not {}');
    });
});

describe('Date validation', function() {
    it('accepts valid Date', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "dateCreated": "2020-03-18",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on empty list of Dates', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "dateCreated": [],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"dateCreated" must be a date, not []');
    });

    it('errors on list of Dates', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "dateCreated": ["2020-03-18", "2020-03-19"],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"dateCreated" must be a date, not ["2020-03-18","2020-03-19"]');
    });

    it('errors on non-string instead of Date', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "dateCreated": {},
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"dateCreated" must be a date, not {}');
    });

    it('errors on non-Date string', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "dateCreated": "foo",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"dateCreated" must be a date in the format YYYY-MM-DD, not "foo"');
    });
});

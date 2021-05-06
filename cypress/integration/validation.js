/**
 * Copyright (C) 2020-2021  The Software Heritage developers
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

        cy.get('#errorMessage').should('have.text', 'Wrong document type: must be "SoftwareSourceCode"/"SoftwareApplication", not "foo"');
    });

    it('errors on invalid field name', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "foobar": "baz",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#name').should('have.value', '');

        cy.get('#errorMessage').should('have.text', 'Unknown field "foobar".');
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

describe('Things or URLs validation', function() {
    it('accepts valid Thing', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": {
                    "@type": "SoftwareApplication",
                    "name": "Example Soft",
                }
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
                "isPartOf": "http://example.org/",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts empty list of Things', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": [],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts list of Things', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": [
                    {
                        "@type": "SoftwareApplication",
                        "name": "Example Soft",
                    },
                    {
                        "@type": "SoftwareApplication",
                        "name": "Test Soft",
                    }
                ]
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on non-URL string', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "license": "Copyright 2021 Myself",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"license" must be an URL or a CreativeWork/SoftwareSourceCode/SoftwareApplication object, not: "Copyright 2021 Myself"');
    });

    it('errors on wrong type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": 42,
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"isPartOf" must be a CreativeWork/SoftwareSourceCode/SoftwareApplication object or URI, not 42');
    });

    it('errors on non-Thing object', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": {},
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"isPartOf" must be a (list of) CreativeWork/SoftwareSourceCode/SoftwareApplication object(s) or an URI, but is missing a type/@type.');
    });

    it('errors on list with an invalid Thing at the beginning', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": [
                    {},
                    {
                        "@type": "SoftwareApplication",
                        "name": "Example Soft",
                    }
                ],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"isPartOf" must be a (list of) CreativeWork/SoftwareSourceCode/SoftwareApplication object(s) or an URI, but is missing a type/@type.');
    });

    it('errors on list with an invalid Thing at the end', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": [
                    {
                        "@type": "SoftwareApplication",
                        "name": "Example Soft",
                    },
                    {}
                ],
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"isPartOf" must be a (list of) CreativeWork/SoftwareSourceCode/SoftwareApplication object(s) or an URI, but is missing a type/@type.');
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

describe('Person validation', function() {
    it('accepts URI', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": "http://example.org/~jdoe",
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts valid complete Person', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                    "@type": "Person",
                    "@id": "http://example.org/~jdoe",
                    "url": "http://example.org/~jdoe",
                    "name": "Jane Doe",
                    "givenName": "Jane",
                    "familyName": "Doe",
                    "email": "jdoe@example.org",
                    "affiliation": {
                        "@type": "Organization",
                        "@id": "http://example.org/",
                    }
                }
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on Person with missing type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"author" must be a (list of) Person/Organization object(s) or an URI, but is missing a type/@type.');
    });

    it('errors on Person with wrong type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                    "type": "SoftwareSourceCode",
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"author" type must be a (list of) Person/Organization object(s), not "SoftwareSourceCode"');
    });

    it('errors on Person with unknown field', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                    "type": "Person",
                    "foo": "bar",
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', 'Unknown field "foo" in "author".');
    });

    it('errors on Person with invalid field', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                    "type": "Person",
                    "email": 32,
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"email" must be text, not 32');
    });

    it('accepts URI in list', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": [
                    "http://example.org/~jadoe",
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jodoe",
                        "givenName": "John",
                        "familyName": "Doe",
                    },
                ]
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('accepts list of valid Person', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": [
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jadoe",
                        "givenName": "Jane",
                        "familyName": "Doe",
                    },
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jodoe",
                        "givenName": "John",
                        "familyName": "Doe",
                    },
                ]
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on list with invalid Person at the beginning', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": [
                    {
                        "givenName": "Jane",
                        "familyName": "Doe",
                    },
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jodoe",
                        "name": "John Doe",
                        "givenName": "John",
                        "familyName": "Doe",
                    },
                ]
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"author" must be a (list of) Person/Organization object(s) or an URI, but is missing a type/@type.');
    });

    it('errors on list with invalid Person at the end', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": [
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jadoe",
                        "givenName": "Jane",
                        "familyName": "Doe",
                    },
                    {
                        "givenName": "John",
                        "familyName": "Doe",
                    },
                ]
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"author" must be a (list of) Person/Organization object(s) or an URI, but is missing a type/@type.');
    });
});

describe('Organization validation', function() {
    it('accepts valid complete Organization', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                    "@type": "Organization",
                    "@id": "http://example.org/",
                    "url": "https://example.org/",
                    "name": "Example Org",
                    "identifier": "http://example.org/",
                    "address": "Nowhere",
                }
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on Organization with missing type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"author" must be a (list of) Person/Organization object(s) or an URI, but is missing a type/@type.');
    });

    it('errors on Organization with wrong type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                    "type": "SoftwareSourceCode",
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"author" type must be a (list of) Person/Organization object(s), not "SoftwareSourceCode"');
    });

    it('errors on Organization with unknown field', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                    "type": "Organization",
                    "foo": "bar",
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', 'Unknown field "foo" in "author".');
    });

    it('errors on Organization with invalid field', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": {
                    "type": "Organization",
                    "email": 32,
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"email" must be text, not 32');
    });

    it('accepts list of valid Organization', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": [
                    {
                        "@type": "Organization",
                        "@id": "http://example.org/",
                        "name": "Example Org",
                    },
                    {
                        "@type": "Organization",
                        "@id": "http://example.org/~jodoe",
                        "name": "Example Org",
                    },
                ]
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on list with invalid Organization at the beginning', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": [
                    {
                        "name": "Example Org",
                    },
                    {
                        "@type": "Organization",
                        "name": "Example Org",
                    },
                ]
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"author" must be a (list of) Person/Organization object(s) or an URI, but is missing a type/@type.');
    });

    it('errors on list with invalid Organization at the end', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "author": [
                    {
                        "@type": "Organization",
                        "name": "Example Org",
                    },
                    {
                        "name": "Example Org",
                    },
                ]
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"author" must be a (list of) Person/Organization object(s) or an URI, but is missing a type/@type.');
    });
});

describe('CreativeWork validation', function() {
    it('accepts valid CreativeWork', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "Small Software",
                "isPartOf": {
                    "type": "CreativeWork",
                    "name": "Big Creative Work",
                    "author": "http://example.org/~jdoe",
                    "keywords": ["foo", "bar"],
                }
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
    });

    it('errors on CreativeWork with missing type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": {
                }
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"isPartOf" must be a (list of) CreativeWork/SoftwareSourceCode/SoftwareApplication object(s) or an URI, but is missing a type/@type.');
    });

    it('errors on CreativeWork with wrong type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": {
                    "type": "Person",
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"isPartOf" type must be a (list of) CreativeWork/SoftwareSourceCode/SoftwareApplication object(s), not "Person"');
    });

    it('errors on CreativeWork with unknown field', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": {
                    "type": "CreativeWork",
                    "foo": "bar",
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', 'Unknown field "foo" in "isPartOf".');
    });

    it('errors on CreativeWork with invalid field', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "isPartOf": {
                    "type": "CreativeWork",
                    "url": 32,
                },
            }))
        );
        cy.get('#validateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '"url" must be an URL (or a list of URLs), not: 32');
    });
});

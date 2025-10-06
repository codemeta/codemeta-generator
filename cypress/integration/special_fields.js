/**
 * Copyright (C) 2020-2024  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Tests fields that need special treatment.
 * For example, URLs and newlines handling.
 */

"use strict";

describe('Funder id', function() {
    it('can be exported', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#funder').type('http://example.org/');

        cy.get('#generateCodemetaV2').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "type": "SoftwareSourceCode",
                "name": "My Test Software",
                "funder": {
                    "type": "Organization",
                    "id": "http://example.org/",
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

        cy.get('#generateCodemetaV2').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "type": "SoftwareSourceCode",
                "name": "My Test Software",
                "funder": {
                    "type": "Organization",
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

describe('Software requirements', function() {
    it('can be exported as multiple values', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#softwareRequirements').type('https://www.gtk.org\nhttps://github.com/anholt/libepoxy\nhttps://github.com/GNOME/libxml2');

        cy.get('#generateCodemetaV2').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "type": "SoftwareSourceCode",
                "name": "My Test Software",
                "softwareRequirements": [
                    "https://www.gtk.org",
                    "https://github.com/anholt/libepoxy",
                    "https://github.com/GNOME/libxml2",
                ]
            });
    });

    it('can be imported from multiple values', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "softwareRequirements": [
                    "https://www.gtk.org",
                    "https://github.com/anholt/libepoxy",
                    "https://github.com/GNOME/libxml2",
                ]
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#softwareRequirements').should('have.value', 'https://www.gtk.org\nhttps://github.com/anholt/libepoxy\nhttps://github.com/GNOME/libxml2');
    });

    it('can be exported to a single URI', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#softwareRequirements').type('https://github.com/GNOME/libxml2');

        cy.get('#generateCodemetaV2').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "type": "SoftwareSourceCode",
                "name": "My Test Software",
                "softwareRequirements": "https://github.com/GNOME/libxml2",
            });
    });

    it('can be exported despite a trailing newline', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#softwareRequirements').type('https://github.com/GNOME/libxml2\n');

        cy.get('#generateCodemetaV2').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "type": "SoftwareSourceCode",
                "name": "My Test Software",
                "softwareRequirements": "https://github.com/GNOME/libxml2",
            });
    });

    it('can be imported from a single URI', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "softwareRequirements": "https://github.com/GNOME/libxml2",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#softwareRequirements').should('have.value', 'https://github.com/GNOME/libxml2');
    });

    it('cannot be exported as text', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#softwareRequirements').type('libxml2');

        cy.get('#generateCodemetaV2').click();

        cy.get('#errorMessage').should('have.text', 'Invalid URL in field "softwareRequirements": "libxml2"');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "type": "SoftwareSourceCode",
                "name": "My Test Software",
                "softwareRequirements": [],
            });
    });
});

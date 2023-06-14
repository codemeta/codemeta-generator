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

describe('JSON Generation', function() {
    beforeEach(function() {
        /* Clear the session storage, as it is used to restore field data;
         * and we don't want a test to load data from the previous test. */
        cy.window().then((win) => {
            win.sessionStorage.clear()
        })
        cy.visit('./index.html');
    });

    it('works just from the software name', function() {
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

    it('works just from all main fields when using only one license', function() {
        cy.get('#name').type('My Test Software');
        cy.get('#description').type('This is a\ngreat piece of software');
        cy.get('#dateCreated').type('2019-10-02');
        cy.get('#datePublished').type('2020-01-01');
        cy.get('#license').type('AGPL-3.0');
        cy.get("#license").type('{enter}');
        cy.get('#generateCodemeta').click();

        cy.get("#license").should('have.value', '');
        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "license": "https://spdx.org/licenses/AGPL-3.0",
                "dateCreated": "2019-10-02",
                "datePublished": "2020-01-01",
                "name": "My Test Software",
                "description": "This is a\ngreat piece of software",
        });
    });

    it('works just from all main fields when using multiple licenses', function() {
        cy.get('#name').type('My Test Software');
        cy.get('#description').type('This is a\ngreat piece of software');
        cy.get('#dateCreated').type('2019-10-02');
        cy.get('#datePublished').type('2020-01-01');
        cy.get('#license').type('AGPL-3.0');
        cy.get("#license").type('{enter}');
        cy.get('#license').type('MIT');
        cy.get("#license").type('{enter}');

        cy.get('#generateCodemeta').click();

        cy.get("#license").should('have.value', '');
        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "license": ["https://spdx.org/licenses/AGPL-3.0", "https://spdx.org/licenses/MIT"],
                "dateCreated": "2019-10-02",
                "datePublished": "2020-01-01",
                "name": "My Test Software",
                "description": "This is a\ngreat piece of software",
        });
    });

    it('works when choosing licenses without the keyboard', function() {
        cy.get('#name').type('My Test Software');
        cy.get('#description').type('This is a\ngreat piece of software');
        cy.get('#dateCreated').type('2019-10-02');
        cy.get('#datePublished').type('2020-01-01');
        cy.get('#license').type('AGPL-3.0');
        // no cy.get("#license").type('{enter}'); here
        cy.get('#generateCodemeta').click();

        cy.get("#license").should('have.value', '');
        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "license": "https://spdx.org/licenses/AGPL-3.0",
                "dateCreated": "2019-10-02",
                "datePublished": "2020-01-01",
                "name": "My Test Software",
                "description": "This is a\ngreat piece of software",
        });
    });
});

describe('JSON Import', function() {
    it('works just from the software name', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#name').should('have.value', 'My Test Software');
    });

    it('works just from all main fields when using license as string', function() {
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
        cy.get('#importCodemeta').click();

        cy.get('#name').should('have.value', 'My Test Software');
        cy.get('#description').should('have.value', 'This is a\ngreat piece of software');
        cy.get('#dateCreated').should('have.value', '2019-10-02');
        cy.get('#datePublished').should('have.value', '2020-01-01');
        cy.get('#license').should('have.value', '');
        cy.get("#selected-licenses").children().should('have.length', 1);
        cy.get("#selected-licenses").children().first().children().first().should('have.text', 'AGPL-3.0');
    });

    it('works just from all main fields when using license as array', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "license": ["https://spdx.org/licenses/AGPL-3.0", "https://spdx.org/licenses/MIT"],
                "dateCreated": "2019-10-02",
                "datePublished": "2020-01-01",
                "name": "My Test Software",
                "description": "This is a\ngreat piece of software",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#name').should('have.value', 'My Test Software');
        cy.get('#description').should('have.value', 'This is a\ngreat piece of software');
        cy.get('#dateCreated').should('have.value', '2019-10-02');
        cy.get('#datePublished').should('have.value', '2020-01-01');
        cy.get('#license').should('have.value', '');
        cy.get("#selected-licenses").children().should('have.length', 2);
        cy.get("#selected-licenses").children().eq(0).children().first().should('have.text', 'AGPL-3.0');
        cy.get("#selected-licenses").children().eq(1).children().first().should('have.text', 'MIT');
    });

    it('errors on invalid type', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "foo",
                "name": "My Test Software",
            }))
        );
        cy.get('#importCodemeta').click();

        // Should still be imported as much as possible
        cy.get('#name').should('have.value', 'My Test Software');

        // But must display an error
        cy.get('#errorMessage').should('have.text', 'Wrong document type: must be "SoftwareSourceCode"/"SoftwareApplication", not "foo"');
    });

    it('allows singleton array as context', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": ["https://doi.org/10.5063/schema/codemeta-2.0"],
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#name').should('have.value', 'My Test Software');
    });

    it('errors on invalid context URL', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-100000",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#errorMessage').should('have.text', '@context must be "https://doi.org/10.5063/schema/codemeta-2.0", not "https://doi.org/10.5063/schema/codemeta-100000"');
    });

    it('errors on invalid context URL in array', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": ["https://doi.org/10.5063/schema/codemeta-100000"],
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#errorMessage').should('have.text', '@context must be "https://doi.org/10.5063/schema/codemeta-2.0", not ["https://doi.org/10.5063/schema/codemeta-100000"]');
    });

    it('errors nicely when there are other contexts', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": [
                    "https://doi.org/10.5063/schema/codemeta-2.0",
                    "https://schema.org/",
                ],
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#errorMessage').should('have.text', 'Multiple values in @context are not supported (@context should be "https://doi.org/10.5063/schema/codemeta-2.0", not ["https://doi.org/10.5063/schema/codemeta-2.0","https://schema.org/"])');
    });

});

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
    it('works just from the software name', function() {
        cy.visit('./index.html');
        cy.get('#name').type('My Test Software');
        cy.get('#generateCodemeta').click();

        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "license": "https://spdx.org/licenses/undefined",
                "name": "My Test Software",
                "author": [],
                "contributor": []
        })
    })
})

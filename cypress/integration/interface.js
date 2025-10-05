/**
 * Copyright (C) 2020-2025  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Tests the user interface.
 */

"use strict";

describe('License input field', function () {
    beforeEach(function () {
        cy.visit('/');
        cy.get('#license').should('exist');
        cy.get('#selected-licenses').should('exist');
    });

    it('can add a license by typing', function () {
        cy.get('#license').type('MIT{enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });

    it('can add a license by typing non-strictly with spaces', function () {
        // "  MIT  " -> "MIT"
        cy.get('#license').type('  MIT{enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });

    it('can add a license by typing non-strictly to original casing', function () {
        // "mit" -> "MIT"
        cy.get('#license').type('mit{enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });

    it('can add a license by typing and it does not hijacked by a shorter license with same prefix', function () {
        // "MIT-0" vs "MIT"
        cy.get('#license').type('MIT-0{enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT-0');
        cy.get('#license').should('have.value', '');
    });

    it('should not insert a duplicated license', function () {
        cy.get('#license').type('MIT{enter}');
        cy.get('#selected-licenses .license-id').should('have.length', 1);
        cy.get('#license').type('MIT{enter}');
        cy.get('#selected-licenses .license-id').should('have.length', 1);
        cy.get('#license').should('have.value', '');
    });

    it('should not insert an invalid license', function () {
        cy.get('#license').type('INVALID_LICENSE00{enter}');
        cy.get('#selected-licenses .license-id').should('not.exist');
        cy.get('#license:invalid').should('exist');
    });

    it('should not insert until user confirms with Enter', function () {
        // Type "MIT" but do not confirm with Enter yet
        cy.get('#license').type('MIT');
        cy.get('#selected-licenses .license-id').should('not.exist');
        // Move caret right (ArrowRight)
        cy.get('#license').trigger('keydown', { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39 });
        cy.get('#selected-licenses .license-id').should('not.exist');
    });

    it('should insert when user confirms with Enter', function () {
        // Type "MIT" but do not confirm with Enter yet
        cy.get('#license').type('MIT');
        cy.get('#selected-licenses .license-id').should('not.exist');
        // Simulate Enter keydown to confirm
        cy.get('#license').trigger('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 });
        cy.get('#selected-licenses .license-id').should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });

    it('should insert when user press Tab', function () {
        // Type "MIT" but do not press Tab yet
        cy.get('#license').type('MIT');
        cy.get('#selected-licenses .license-id').should('not.exist');
        // Simulate Tab keydown to confirm
        cy.get('#license').trigger('keydown', { key: 'Tab', code: 'Tab', keyCode: 9, which: 9 });
        cy.get('#selected-licenses .license-id').should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });
});

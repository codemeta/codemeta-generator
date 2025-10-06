/**
 * Copyright (C) 2025  Arthit Suriyawongkul
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
        cy.window().then((win) => {
            win.sessionStorage.clear();
            win.document.getElementById('selected-licenses').innerHTML = '';
        })
        cy.visit('./index.html');
        // Wait for the license list to be loaded asynchronously before running
        // license field-related tests. This prevents races where tests trigger
        // input/change events before SPDX_LICENSE_IDS is available.
        cy.window().its('SPDX_LICENSE_IDS.length').should('be.gt', 0);
        cy.get('#license').should('exist');
        cy.get('#selected-licenses').should('exist');
        cy.get('#selected-licenses').children().should('have.length', 0);
    });

    it('can add a license by typing', function () {
        cy.get('#license').type('MIT{enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });

    it('can add a license by typing non-strictly with spaces', function () {
        // "  MIT " -> "MIT"
        cy.get('#license').type('  MIT {enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });

    it('can add a license by typing non-strictly to original casing', function () {
        // "mit" -> "MIT"
        cy.get('#license').type('mit{enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });

    it('can add a license by clicking on the pop-up list', function () {
        // inputType "insertReplacementText" typically appears when the browser
        // inserts/replaces the input value as a single operation
        // (for example when the user picks an item from a datalist with the
        // mouse or when autocompletion replaces the current text)
        cy.get('#license')
            .invoke('val', 'MIT')
            .trigger('input', { inputType: 'insertReplacementText' });
        cy.get('#selected-licenses .license-id', { timeout: 5000 })
            .should('contain', 'MIT');
        cy.get('#license').should('have.value', '');
    });

    it('can add a license on "change" event (e.g., selecting via keyboard)', function () {
        cy.get('#license').invoke('val', 'MIT').trigger('change');
        cy.get('#selected-licenses .license-id', { timeout: 5000 })
            .should('contain', 'MIT');
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

    it('should not insert a shorter match while typing a longer id with same prefix', function () {
        // "MIT-0" vs "MIT"
        cy.get('#license').type('MIT-0{enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT-0');
        cy.get('#license').should('have.value', '');
    });

    it('should not insert until user confirms with Enter', function () {
        // Type "MIT" but do not confirm with Enter yet
        cy.get('#license').type('MIT');
        cy.get('#selected-licenses .license-id').should('not.exist');
        // Press ArrowRight - which is not a confirmation
        cy.get('#license').trigger('keydown', { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39 });
        cy.get('#selected-licenses .license-id').should('not.exist');
    });

    it('should not insert when edits produce a matching ID', function () {
        // Note the space after "MIT"
        cy.get('#license').type('MIT -0');
        cy.get('#selected-licenses .license-id').should('not.exist');
        // Remove the space, to produce "MIT-0"
        cy.get('#license').type('{leftarrow}{leftarrow}{backspace}');
        cy.get('#selected-licenses .license-id').should('not.exist');
        // Confirm with Enter
        cy.get('#license').type('{enter}');
        cy.get('#selected-licenses .license-id').should('contain', 'MIT-0');
        cy.get('#license').should('have.value', '');
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

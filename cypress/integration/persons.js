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

describe('Zero author', function() {
    it('can be exported', function() {
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

    it('can be imported from no list', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#author_nb').should('have.value', '0');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('not.exist');
    });

    it('can be imported from empty list', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [],
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#author_nb').should('have.value', '0');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('not.exist');
    });
});

describe('One full author', function() {
    it('can be exported', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_nb').should('have.value', '0');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('not.exist');
        cy.get('#author_1_givenName').should('not.exist');

        cy.get('#author_add').click();
        cy.get('#author_nb').should('have.value', '1');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('exist');
        cy.get('#author_2').should('not.exist');

        cy.get('#author_1_givenName').should('have.value', '');
        cy.get('#author_1_familyName').should('have.value', '');
        cy.get('#author_1_email').should('have.value', '');
        cy.get('#author_1_id').should('have.value', '');
        cy.get('#author_1_affiliation').should('have.value', '');

        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_familyName').type('Doe');
        cy.get('#author_1_email').type('jdoe@example.org');
        cy.get('#author_1_id').type('http://example.org/~jdoe');
        cy.get('#author_1_affiliation').type('http://example.org/');

        cy.get('#generateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jdoe",
                        "givenName": "Jane",
                        "familyName": "Doe",
                        "email": "jdoe@example.org",
                        "affiliation": {
                            "@type": "Organization",
                            "@id": "http://example.org/",
                        }
                    }
                ],
        });
    });

    it('can be imported', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jdoe",
                        "givenName": "Jane",
                        "familyName": "Doe",
                        "email": "jdoe@example.org",
                        "affiliation": {
                            "@type": "Organization",
                            "@id": "http://example.org/",
                        }
                    }
                ],
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#author_nb').should('have.value', '1');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('exist');
        cy.get('#author_2').should('not.exist');
        cy.get('#author_1_givenName').should('have.value', 'Jane');
        cy.get('#author_1_familyName').should('have.value', 'Doe');
        cy.get('#author_1_email').should('have.value', 'jdoe@example.org');
        cy.get('#author_1_id').should('have.value', 'http://example.org/~jdoe');
        cy.get('#author_1_affiliation').should('have.value', 'http://example.org/');
    });
});

describe('Affiliation id', function() {
    it('can be exported', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_add').click();
        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_affiliation').type('http://example.org/');

        cy.get('#generateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "givenName": "Jane",
                        "affiliation": {
                            "@type": "Organization",
                            "@id": "http://example.org/",
                        }
                    }
                ],
        });
    });

    it('can be imported', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jdoe",
                        "givenName": "Jane",
                        "familyName": "Doe",
                        "email": "jdoe@example.org",
                        "affiliation": {
                            "@type": "Organization",
                            "@id": "http://example.org/",
                        }
                    }
                ],
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#author_nb').should('have.value', '1');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('exist');
        cy.get('#author_2').should('not.exist');
        cy.get('#author_1_affiliation').should('have.value', 'http://example.org/');
    });
});

describe('Affiliation name', function() {
    it('can be exported', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_add').click();
        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_affiliation').type('Example Org');

        cy.get('#generateCodemeta').click();

        cy.get('#errorMessage').should('have.text', '');
        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "givenName": "Jane",
                        "affiliation": {
                            "@type": "Organization",
                            "name": "Example Org",
                        }
                    }
                ],
        });
    });

    it('can be imported', function() {
        cy.get('#codemetaText').then((elem) =>
            elem.text(JSON.stringify({
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "@id": "http://example.org/~jdoe",
                        "givenName": "Jane",
                        "familyName": "Doe",
                        "email": "jdoe@example.org",
                        "affiliation": {
                            "@type": "Organization",
                            "name": "Example Org",
                        }
                    }
                ],
            }))
        );
        cy.get('#importCodemeta').click();

        cy.get('#author_nb').should('have.value', '1');
        cy.get('#author_0').should('not.exist');
        cy.get('#author_1').should('exist');
        cy.get('#author_2').should('not.exist');
        cy.get('#author_1_affiliation').should('have.value', 'Example Org');
    });
});

describe('Author order change', function() {
    it('is a noop with a single author', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_add').click();
        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_affiliation').type('Example Org');

        cy.get('#author_1_moveToRight').click()

        cy.get('#author_1_givenName').should('have.value', 'Jane');
        cy.get('#author_1_affiliation').should('have.value', 'Example Org');

        cy.get('#author_1_moveToLeft').click()

        cy.get('#author_1_givenName').should('have.value', 'Jane');
        cy.get('#author_1_affiliation').should('have.value', 'Example Org');
    });

    it('flips two authors', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_add').click();
        cy.get('#author_add').click();
        cy.get('#author_add').click();
        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_affiliation').type('Example Org');
        cy.get('#author_2_givenName').type('John');
        cy.get('#author_2_familyName').type('Doe');
        cy.get('#author_3_givenName').type('Alex');

        cy.get('#author_1_moveToRight').click()

        cy.get('#author_1_givenName').should('have.value', 'John');
        cy.get('#author_1_familyName').should('have.value', 'Doe');
        cy.get('#author_1_affiliation').should('have.value', '');

        cy.get('#author_2_givenName').should('have.value', 'Jane');
        cy.get('#author_2_familyName').should('have.value', '');
        cy.get('#author_2_affiliation').should('have.value', 'Example Org');

        cy.get('#author_3_givenName').should('have.value', 'Alex');
        cy.get('#author_3_familyName').should('have.value', '');
        cy.get('#author_3_affiliation').should('have.value', '');
    });

    it('updates generated Codemeta', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_add').click();
        cy.get('#author_add').click();
        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_affiliation').type('Example Org');
        cy.get('#author_2_givenName').type('John');
        cy.get('#author_2_familyName').type('Doe');

        cy.get('#generateCodemeta').click();

        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "givenName": "Jane",
                        "affiliation": {
                            "@type": "Organization",
                            "name": "Example Org",
                        }
                    },
                    {
                        "@type": "Person",
                        "givenName": "John",
                        "familyName": "Doe",
                    },
                ],
        });

        cy.get('#author_1_moveToRight').click();

        cy.get('#codemetaText').then((elem) => JSON.parse(elem.text()))
            .should('deep.equal', {
                "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
                "@type": "SoftwareSourceCode",
                "name": "My Test Software",
                "author": [
                    {
                        "@type": "Person",
                        "givenName": "John",
                        "familyName": "Doe",
                    },
                    {
                        "@type": "Person",
                        "givenName": "Jane",
                        "affiliation": {
                            "@type": "Organization",
                            "name": "Example Org",
                        }
                    },
                ],
        });
    });

    it('wraps around to the right', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_add').click();
        cy.get('#author_add').click();
        cy.get('#author_add').click();
        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_affiliation').type('Example Org');
        cy.get('#author_2_givenName').type('John');
        cy.get('#author_2_familyName').type('Doe');
        cy.get('#author_3_givenName').type('Alex');

        cy.get('#author_1_moveToLeft').click()

        cy.get('#author_1_givenName').should('have.value', 'Alex');
        cy.get('#author_1_familyName').should('have.value', '');
        cy.get('#author_1_affiliation').should('have.value', '');

        cy.get('#author_2_givenName').should('have.value', 'John');
        cy.get('#author_2_familyName').should('have.value', 'Doe');
        cy.get('#author_2_affiliation').should('have.value', '');

        cy.get('#author_3_givenName').should('have.value', 'Jane');
        cy.get('#author_3_familyName').should('have.value', '');
        cy.get('#author_3_affiliation').should('have.value', 'Example Org');
    });

    it('wraps around to the left', function() {
        cy.get('#name').type('My Test Software');

        cy.get('#author_add').click();
        cy.get('#author_add').click();
        cy.get('#author_add').click();
        cy.get('#author_1_givenName').type('Jane');
        cy.get('#author_1_affiliation').type('Example Org');
        cy.get('#author_2_givenName').type('John');
        cy.get('#author_2_familyName').type('Doe');
        cy.get('#author_3_givenName').type('Alex');

        cy.get('#author_3_moveToRight').click()

        cy.get('#author_1_givenName').should('have.value', 'Alex');
        cy.get('#author_1_familyName').should('have.value', '');
        cy.get('#author_1_affiliation').should('have.value', '');

        cy.get('#author_2_givenName').should('have.value', 'John');
        cy.get('#author_2_familyName').should('have.value', 'Doe');
        cy.get('#author_2_affiliation').should('have.value', '');

        cy.get('#author_3_givenName').should('have.value', 'Jane');
        cy.get('#author_3_familyName').should('have.value', '');
        cy.get('#author_3_affiliation').should('have.value', 'Example Org');
    });
})

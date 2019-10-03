/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

function createPersonFieldset(personPrefix, legend) {
    // Creates a fieldset containing inputs for informations about a person
    var fieldset = document.createElement("fieldset")
    fieldset.classList.add("person");
    fieldset.id = personPrefix;
    
    fieldset.innerHTML = `
        <legend>${legend}</legend>
        <p>
            <label for="${personPrefix}_givenName">Given name</label>
            <input type="text" id="${personPrefix}_givenName" name="${personPrefix}_givenName"
                placeholder="Jane" required="true" />
        </p>
        <p>
            <label for="${personPrefix}_familyName">Family name</label>
            <input type="text" id="${personPrefix}_familyName" name="${personPrefix}_familyName"
                placeholder="Doe" />
        </p>
        <p>
            <label for="${personPrefix}_email">E-mail address</label>
            <input type="email" id="${personPrefix}_email" name="${personPrefix}_email"
                placeholder="jane.doe@example.org" />
        </p>
        <p>
            <label for="${personPrefix}_id">URI</label>
            <input type="url" id="${personPrefix}_id" name="${personPrefix}_id"
                placeholder="http://orcid.org/0000-0002-1825-0097" />
        </p>
    `;

    return fieldset;
}

function addPersonWithId(container, legend, prefix, id) {
    var fieldset = createPersonFieldset(`${prefix}_${id}`, `${legend} #${id}`);

    container.appendChild(fieldset);
}

function addPerson(legend, prefix) {
    var container = document.querySelector(`#${prefix}_container`);
    var personId = getNbPersons(prefix) + 1;

    addPersonWithId(container, legend, prefix, personId);

    var nbPersonsField = container.querySelector(`#${prefix}_nb`);
    nbPersonsField.value = personId;
}

function removePerson(prefix) {
    var personId = getNbPersons(prefix);

    document.querySelector(`#${prefix}_${personId}`).remove();

    var nbPersonsField = document.querySelector(`#${prefix}_nb`);
    nbPersonsField.value = personId-1;
}

// Initialize a group of persons (authors, contributors) on page load.
// Useful if the page is reloaded.
function initPersons(prefix, legend) {
    var nbAuthors = getNbPersons(prefix);
    var personContainer = document.querySelector(`#${prefix}_container`)

    for (let personId = 1; personId <= nbAuthors; personId++) {
        addPersonWithId(personContainer, legend, prefix, personId);
    }
}

function initCallbacks() {
    document.querySelector('#generateCodemeta')
        .addEventListener('click', generateCodemeta);

    document.querySelector('#inputForm')
        .addEventListener('change', generateCodemeta);

    initPersons('author', 'Author');
    initPersons('contributor', 'Contributor');
}

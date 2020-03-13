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
    fieldset.classList.add("leafFieldset");
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
        <p>
        <label for="${personPrefix}_affiliation">Affiliation</label>
            <input type="text" id="${personPrefix}_affiliation" name="${personPrefix}_affiliation"
                placeholder="Department of Computer Science, University of Pisa" />
        </p>
    `;

    return fieldset;
}

function addPersonWithId(container, prefix, legend, id) {
    var fieldset = createPersonFieldset(`${prefix}_${id}`, `${legend} #${id}`);

    container.appendChild(fieldset);
}

function addPerson(prefix, legend) {
    var container = document.querySelector(`#${prefix}_container`);
    var personId = getNbPersons(prefix) + 1;

    addPersonWithId(container, prefix, legend, personId);

    setNbPersons(prefix, personId);

    return personId;
}

function removePerson(prefix) {
    var personId = getNbPersons(prefix);

    document.querySelector(`#${prefix}_${personId}`).remove();

    setNbPersons(prefix, personId-1);
}

// Initialize a group of persons (authors, contributors) on page load.
// Useful if the page is reloaded.
function initPersons(prefix, legend) {
    var nbPersons = getNbPersons(prefix);
    var personContainer = document.querySelector(`#${prefix}_container`)

    for (let personId = 1; personId <= nbPersons; personId++) {
        addPersonWithId(personContainer, prefix, legend, personId);
    }
}

function removePersons(prefix) {
    var nbPersons = getNbPersons(prefix);
    var personContainer = document.querySelector(`#${prefix}_container`)

    for (let personId = 1; personId <= nbPersons; personId++) {
        removePerson(prefix)
    }
}

function resetForm() {
    removePersons('author');
    removePersons('contributor');

    // Reset the form after deleting elements, so nbPersons doesn't get
    // reset before it's read.
    document.querySelector('#inputForm').reset();
}

function fieldToLower(event) {
    event.target.value = event.target.value.toLowerCase();
}

function initCallbacks() {
    document.querySelector('#license')
        .addEventListener('change', validateLicense);

    document.querySelector('#generateCodemeta')
        .addEventListener('click', generateCodemeta);

    document.querySelector('#resetForm')
        .addEventListener('click', resetForm);

    document.querySelector('#validateCodemeta')
        .addEventListener('click', () => parseAndValidateCodemeta(true));

    document.querySelector('#importCodemeta')
        .addEventListener('click', importCodemeta);

    document.querySelector('#inputForm')
        .addEventListener('change', generateCodemeta);

    document.querySelector('#developmentStatus')
        .addEventListener('change', fieldToLower);

    initPersons('author', 'Author');
    initPersons('contributor', 'Contributor');
}

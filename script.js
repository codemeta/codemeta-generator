/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

function emptyToUndefined(v) {
    if (v == null || v == "")
        return undefined;
    else
        return v;
}

function getIfSet(query) {
    return emptyToUndefined(document.querySelector(query).value);
}

function getNbPersons(prefix) {
    var nbField = document.querySelector(`#${prefix}_nb`);
    return parseInt(nbField.value, 10);
}

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

// Names of codemeta properties with a matching HTML field name
const directCodemetaFields = [
    'codeRepository',
    'contIntegration',
    'dateCreated',
    'datePublished',
    'dateModified',
    'issueTracker',
    'name',
    'version',
];

function generatePerson(idPrefix) {
    return {
        "@type": "Person",
        "givenName": getIfSet(`#${idPrefix}_givenName`),
        "familyName": getIfSet(`#${idPrefix}_familyName`),
        "email": getIfSet(`#${idPrefix}_email`),
        "@id": getIfSet(`#${idPrefix}_id`),
    }
}

function generatePersons(prefix) {
    var persons = [];
    var nbPersons = getNbPersons(prefix);

    for (let personId = 1; personId <= nbPersons; personId++) {
        persons.push(generatePerson(`${prefix}_${personId}`));
    }

    return persons;
}

function generateCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var codemetaText;
    if (inputForm.checkValidity()) {
        var doc = {
            "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
            "@type": "SoftwareSourceCode",
            "license": "https://spdx.org/licenses/" + getIfSet('#license'),
        };

        directCodemetaFields.forEach(function (item, index) {
            doc[item] = getIfSet('#' + item)
        });

        doc = Object.assign(doc, {
            "author": generatePersons('author'),
            "contributor": generatePersons('contributor'),
        });

        codemetaText = JSON.stringify(doc, null, 4);
    }
    else {
        codemetaText = "invalid input (see error above)";
        inputForm.reportValidity();
    }

    document.querySelector('#codemetaText').textContent = codemetaText;
}

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

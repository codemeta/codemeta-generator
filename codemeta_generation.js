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

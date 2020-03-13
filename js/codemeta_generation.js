/**
 * Copyright (C) 2019-2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

const SPDX_PREFIX = 'https://spdx.org/licenses/';

function emptyToUndefined(v) {
    if (v == null || v == "")
        return undefined;
    else
        return v;
}

function getIfSet(query) {
    return emptyToUndefined(document.querySelector(query).value);
}

function setIfDefined(query, value) {
    if (value !== undefined) {
        document.querySelector(query).value = value;
    }
}

// Names of codemeta properties with a matching HTML field name
const directCodemetaFields = [
    'codeRepository',
    'contIntegration',
    'dateCreated',
    'datePublished',
    'dateModified',
    'downloadUrl',
    'issueTracker',
    'name',
    'version',
    'identifier',
    'description',
    'applicationCategory',
    'releaseNotes',
    'funding',
    'developmentStatus',
    'isPartOf',
    'referencePublication'
];

const splittedCodemetaFields = [
    ['keywords', ','],
    ['programmingLanguage', ','],
    ['runtimePlatform', ','],
    ['operatingSystem', ','],
    ['softwareRequirements', '\n'],
    ['relatedLink', '\n'],
]

// Names of codemeta properties with a matching HTML field name,
// in a Person object
const directPersonCodemetaFields = [
    'givenName',
    'familyName',
    'email',
    'affiliation'   
];

function generateShortOrg(fieldName) {
    var affiliation = getIfSet(fieldName);
    if (affiliation !== undefined) {
        if (isUrl(affiliation)) {
            return {
                "@type": "Organization",
                "@id": affiliation,
            };
        }
        else {
            return {
                "@type": "Organization",
                "name": affiliation,
            };
        }
    }
    else {
        return undefined;
    }
}

function generatePerson(idPrefix) {
    var doc = {
        "@type": "Person",
        "@id": getIfSet(`#${idPrefix}_id`),
    }
    directPersonCodemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${idPrefix}_${item}`);
    });
    doc["affiliation"] = generateShortOrg(`#${idPrefix}_affiliation`)

    return doc;
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
    var codemetaText, errorHTML;

    if (inputForm.checkValidity()) {
        var doc = {
            "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
            "@type": "SoftwareSourceCode",
        };

        var license = getIfSet('#license')
        if (license !== undefined) {
            doc["license"] = SPDX_PREFIX + getIfSet('#license');
        }

        // Generate most fields
        directCodemetaFields.forEach(function (item, index) {
            doc[item] = getIfSet('#' + item)
        });

        doc["funder"] = generateShortOrg('#funder', doc["affiliation"]);

        // Generate simple fields parsed simply by splitting
        splittedCodemetaFields.forEach(function (item, index) {
            const id = item[0];
            const separator = item[1];
            const value = getIfSet('#' + id);
            if (value !== undefined) {
                doc[id] = value.split(separator).map(trimSpaces);
            }
        });

        // Generate dynamic fields
        var authors = generatePersons('author');
        if (authors.length > 0) {
            doc["author"] = authors;
        }
        var contributors = generatePersons('contributor');
        if (contributors.length > 0) {
            doc["contributors"] = contributors;
        }

        codemetaText = JSON.stringify(doc, null, 4);
        errorHTML = "";
    }
    else {
        codemetaText = "";
        errorHTML = "invalid input (see error above)";
        inputForm.reportValidity();
    }

    document.querySelector('#codemetaText').innerText = codemetaText;
    setError(errorHTML);

    if (codemetaText) {
        // For restoring the form state on page reload
        sessionStorage.setItem('codemetaText', codemetaText);
    }
}

// Imports a single field (name or @id) from an Organization.
function importShortOrg(fieldName, doc) {
    if (doc !== undefined) {
        // Use @id if set, else use name
        setIfDefined(fieldName, doc["name"]);
        setIfDefined(fieldName, doc["@id"]);
    }
}

function importPersons(prefix, legend, docs) {
    if (docs === undefined) {
        return;
    }

    docs.forEach(function (doc, index) {
        var personId = addPerson(prefix, legend);

        setIfDefined(`#${prefix}_${personId}_id`, doc['@id']);
        directPersonCodemetaFields.forEach(function (item, index) {
            setIfDefined(`#${prefix}_${personId}_${item}`, doc[item]);
        });

        importShortOrg(`#${prefix}_${personId}_affiliation`, doc['affiliation'])
    })
}

function importCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var doc = parseAndValidateCodemeta(false);
    resetForm();

    if (doc['license'] !== undefined && doc['license'].indexOf(SPDX_PREFIX) == 0) {
        var license = doc['license'].substring(SPDX_PREFIX.length);
        document.querySelector('#license').value = license;
    }

    directCodemetaFields.forEach(function (item, index) {
        setIfDefined('#' + item, doc[item]);
    });
    importShortOrg('#funder', doc["funder"]);

    // Import simple fields by joining on their separator
    splittedCodemetaFields.forEach(function (item, index) {
        const id = item[0];
        const separator = item[1];
        let value = doc[id];
        if (value !== undefined) {
            if (Array.isArray(value)) {
                value = value.join(separator);
            }
            setIfDefined('#' + id, value);
        }
    });

    importPersons('author', 'Author', doc['author'])
    importPersons('contributor', 'Contributor', doc['contributor'])
}

function loadStateFromStorage() {
    var codemetaText = sessionStorage.getItem('codemetaText')
    if (codemetaText) {
        document.querySelector('#codemetaText').innerText = codemetaText;
        importCodemeta();
    }
}

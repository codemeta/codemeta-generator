/**
 * Copyright (C) 2019-2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

const CODEMETA_CONTEXT_URL = 'https://doi.org/10.5063/schema/codemeta-2.0';
const SPDX_PREFIX = 'https://spdx.org/licenses/';

const loadContextData = async () => {
    const contextResponse = await fetch("./data/contexts/codemeta-2.0.jsonld");
    const context = await contextResponse.json();
    return {
        [CODEMETA_CONTEXT_URL]: context
    }
}

const getJsonldCustomLoader = contexts => {
    return url => {
        const xhrDocumentLoader = jsonld.documentLoaders.xhr();
        if (url in contexts) {
            return {
                contextUrl: null,
                document: contexts[url],
                documentUrl: url
            };
        }
        return xhrDocumentLoader(url);
    }
};

const initJsonldLoader = contexts => {
    jsonld.documentLoader = getJsonldCustomLoader(contexts);
};

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

function getLicenses() {
    let selectedLicenses = Array.from(document.getElementById("selected-licenses").children);
    return selectedLicenses.map(licenseDiv => SPDX_PREFIX + licenseDiv.children[0].innerText);
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
    'affiliation',
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
    }
    var id = getIfSet(`#${idPrefix}_id`);
    if (id !== undefined) {
        doc["@id"] = id;
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


function buildDoc() {
    var doc = {
        "@context": CODEMETA_CONTEXT_URL,
        "@type": "SoftwareSourceCode",
    };

    let licenses = getLicenses();
    if (licenses.length > 0) {
        doc["license"] = licenses;
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
        doc["contributor"] = contributors;
    }
    return doc;
}

async function generateCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var codemetaText, errorHTML;

    if (inputForm.checkValidity()) {
        var doc = buildDoc();
        const expanded = await jsonld.expand(doc);
        const compacted = await jsonld.compact(expanded, CODEMETA_CONTEXT_URL);
        codemetaText = JSON.stringify(compacted, null, 4);
        errorHTML = "";
    }
    else {
        codemetaText = "";
        errorHTML = "invalid input (see error above)";
        inputForm.reportValidity();
    }

    document.querySelector('#codemetaText').innerText = codemetaText;
    setError(errorHTML);


    // Run validator on the exported value, for extra validation.
    // If this finds a validation, it means there is a bug in our code (either
    // generation or validation), and the generation MUST NOT generate an
    // invalid codemeta file, regardless of user input.
    if (codemetaText && !validateDocument(JSON.parse(codemetaText))) {
        alert('Bug detected! The data you wrote is correct; but for some reason, it seems we generated an invalid codemeta.json. Please report this bug at https://github.com/codemeta/codemeta-generator/issues/new and copy-paste the generated codemeta.json file. Thanks!');
    }

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
        setIfDefined(fieldName, getDocumentId(doc));
    }
}

function importPersons(prefix, legend, docs) {
    if (docs === undefined) {
        return;
    }

    docs.forEach(function (doc, index) {
        var personId = addPerson(prefix, legend);

        setIfDefined(`#${prefix}_${personId}_id`, getDocumentId(doc));
        directPersonCodemetaFields.forEach(function (item, index) {
            setIfDefined(`#${prefix}_${personId}_${item}`, doc[item]);
        });

        importShortOrg(`#${prefix}_${personId}_affiliation`, doc['affiliation'])
    })
}

async function importCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var doc = await parseAndValidateCodemeta(false);
    resetForm();

    if (doc['license'] !== undefined) {
        if (typeof doc['license'] === 'string') {
            doc['license'] = [doc['license']];
        }

        doc['license'].forEach(l => {
            if (l.indexOf(SPDX_PREFIX) !== 0) { return; }
            let licenseId = l.substring(SPDX_PREFIX.length);
            insertLicenseElement(licenseId);
        });
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

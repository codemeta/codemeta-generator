/**
 * Copyright (C) 2019  The Software Heritage developers
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
    'issueTracker',
    'name',
    'version',
    'identifier',
    'description',
    'applicationCategory',
    //keywords TODO:keywords array 
    'releaseNotes',
    'funding',
    'runtimePlatform',
    //softwareRequiremnts
    'developmentStatus',
    //relatedLink
    'programmingLanguage',
    'isPartOf',
    //'referencePublication'
    //      "@type": "ScholarlyArticle",
    //      "idendifier": "https://doi.org/xx.xxxx/xxxx.xxxx.xxxx",
    //      "name": "title of publication"
    
];

// Names of codemeta properties with a matching HTML field name,
// in a Person object
const directPersonCodemetaFields = [
    'givenName',
    'familyName',
    'email',
    'affiliation'   
];

function generatePerson(idPrefix) {
    var doc = {
        "@type": "Person",
        "@id": getIfSet(`#${idPrefix}_id`),
    }
    directPersonCodemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${idPrefix}_${item}`);
    });

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
            "license": SPDX_PREFIX + getIfSet('#license'),
        };

        // Generate most fields
        directCodemetaFields.forEach(function (item, index) {
            doc[item] = getIfSet('#' + item)
        });

        // Generate dynamic fields
        doc = Object.assign(doc, {
            "author": generatePersons('author'),
            "contributor": generatePersons('contributor'),
        });

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

function importPersons(prefix, legend, docs) {
    if (docs === 'undefined') {
        return;
    }

    docs.forEach(function (doc, index) {
        var personId = addPerson(prefix, legend);

        setIfDefined(`#${personId}_id`, doc['@id']);
        directPersonCodemetaFields.forEach(function (item, index) {
            setIfDefined(`#${prefix}_${personId}_${item}`, doc[item]);
        });
    })
}

function importCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var codemetaText = document.querySelector('#codemetaText').innerText;
    var doc;

    try {
        doc = JSON.parse(codemetaText);
    }
    catch (e) {
        setError(`Could not read codemeta document because it is not valid JSON (${e})`);
        return;
    }
    resetForm();

    if (doc['license'] !== undefined && doc['license'].indexOf(SPDX_PREFIX) == 0) {
        var license = doc['license'].substring(SPDX_PREFIX.length);
        document.querySelector('#license').value = license;
    }

    directCodemetaFields.forEach(function (item, index) {
        setIfDefined('#' + item, doc[item]);
    });

    importPersons('author', 'Author', doc['author'])
    importPersons('contributor', 'Contributor', doc['contributor'])

    setError("");
}

function loadStateFromStorage() {
    codemetaText = sessionStorage.getItem('codemetaText')
    if (codemetaText) {
        document.querySelector('#codemetaText').innerText = codemetaText;
        importCodemeta();
    }
}

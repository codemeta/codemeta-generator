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

function getLicenses() {
    let selectedLicenses = Array.from(document.getElementById("selected-licenses").children);
    return selectedLicenses.map(licenseDiv => SPDX_PREFIX + licenseDiv.children[0].innerText);
}

// Names of codemeta properties with a matching HTML field name
const directCodemetaFieldsV2 = {
    'codeRepository': '#codeRepository',
    'contIntegration': '#contIntegration',
    'dateCreated': '#dateCreated',
    'datePublished': '#datePublished',
    'dateModified': '#dateModified',
    'downloadUrl': '#downloadUrl',
    'issueTracker': '#issueTracker',
    'name': '#name',
    'version': '#version',
    'identifier': '#identifier',
    'description': '#description',
    'applicationCategory': '#applicationCategory',
    'releaseNotes': '#releaseNotes',
    'funding': '#funding',
    'developmentStatus': '#funding',
    'isPartOf': '#isPartOf',
    'referencePublication': '#referencePublication'
};

const directCodemetaFieldsV3 = {
    ...directCodemetaFieldsV2,
    // 'hasSourceCode': '#hasSourceCode', -> Generator is for SoftwareSource code not SoftwareApplication
    'isSourceCodeOf': '#isSourceCodeOf',
    'continuousIntegration': '#contIntegration',
    // 'embargoEndDate': '#embargoDate' -> Not in use for v2. Not required for v3 either.
};


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
        "@id": getIfSet(`#${idPrefix}_id`) || `_:${idPrefix}`,
    }
    directPersonCodemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${idPrefix}_${item}`);
    });
    doc["affiliation"] = generateShortOrg(`#${idPrefix}_affiliation`);

    return doc;
}

function generatePersons(prefix) {
    var persons = [];
    var nbPersons = getNbPersons(prefix);

    for (let personId = 1; personId <= nbPersons; personId++) {
        const personIdPrefix = `${prefix}_${personId}`;
        persons.push(generatePerson(personIdPrefix));

        const roles = getIfSet(`#${personIdPrefix}_roles`);
        if (roles) {
            for (let role of roles.split(",")) {
                const [roleName, startDate, endDate] = role.split(":");
                persons.push({
                    "@type": "Role",
                    "roleName": roleName,
                    "startDate": startDate,
                    "endDate": endDate,
                    "author": {
                        "@id": getIfSet(`#${personIdPrefix}_id`) || `_:${personIdPrefix}`,
                    }
                });
            }
        }
    }

    return persons;
}

function generateCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var codemetaText, errorHTML;

    if (inputForm.checkValidity()) {
        const isCodemetaV3 = inputForm.querySelector("#codemetaVersion").value === '3';

        var doc = {
            "@context": `https://doi.org/10.5063/schema/codemeta-${isCodemetaV3 ? '3' : '2'}.0`,
            "@type": "SoftwareSourceCode",
        };

        let licenses = getLicenses();
        if (licenses.length > 0) {
            doc["license"] = (licenses.length === 1) ? licenses[0] : licenses;
        }

        // Generate most fields
        const directFields = isCodemetaV3 ? directCodemetaFieldsV3 : directCodemetaFieldsV2;
        for (const key in directFields) {
            doc[key] = getIfSet(directFields[key]);
        }

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
        setIfDefined(fieldName, doc["@id"]);
    }
}

function importPersons(prefix, legend, docs) {
    if (docs === undefined) {
        return;
    }

    const roles = {};
    for (const doc of docs) {
        if (doc['@type'] === 'Role') {
            let authorId = doc['author']['@id'];
            authorId = isBlankNodeId(authorId) ? authorId.substring(2) : authorId;
            if (!!authorId && roles[authorId] === undefined) {
                roles[authorId] = [];
            }
            roles[authorId].push(`${doc['roleName']}:${doc['startDate']}:${doc['endDate']}`);
        }
    }

    console.log('Roles are', roles);

    docs.forEach(function (doc, index) {
        if (doc['@type'] === 'Role') {
            return;
        }

        const personId = addPerson(prefix, legend);
        const personDocId = isBlankNodeId(doc['@id']) ? '' : doc['@id'];

        setIfDefined(`#${prefix}_${personId}_id`, personDocId);
        directPersonCodemetaFields.forEach(function (item, index) {
            setIfDefined(`#${prefix}_${personId}_${item}`, doc[item]);
        });

        importShortOrg(`#${prefix}_${personId}_affiliation`, doc['affiliation'])
    })

    for (const authorId in roles) {
        setIfDefined(`#${authorId}_roles`, roles[authorId].join(', '));
    }
}

function importCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var doc = parseAndValidateCodemeta(false);
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

    const isCodemetaV3 = doc['@context'] === 'https://doi.org/10.5063/schema/codemeta-3.0';

    const directCodemetaField = (isCodemetaV3 ? directCodemetaFieldsV3 : directCodemetaFieldsV2);
    for (const key in directCodemetaField) {
        setIfDefined(directCodemetaField[key], doc[key]);
    }

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

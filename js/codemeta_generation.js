/**
 * Copyright (C) 2019-2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

const CODEMETA_CONTEXTS = {
    "2.0": {
        path: "./data/contexts/codemeta-2.0.jsonld",
        url: "https://doi.org/10.5063/schema/codemeta-2.0"
    },
    "3.0": {
        path: "./data/contexts/codemeta-3.0.jsonld",
        url: "https://w3id.org/codemeta/3.0"
    }
}

const SPDX_PREFIX = 'https://spdx.org/licenses/';

const loadContextData = async () => {
    const [contextV2, contextV3] =
        await Promise.all([
            fetch(CODEMETA_CONTEXTS["2.0"].path).then(response => response.json()),
            fetch(CODEMETA_CONTEXTS["3.0"].path).then(response => response.json())
        ]);
    return {
        [CODEMETA_CONTEXTS["2.0"].url]: contextV2,
        [CODEMETA_CONTEXTS["3.0"].url]: contextV3
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

const getAllCodemetaContextUrls= () => {
    return Object.values(CODEMETA_CONTEXTS).map(context => context.url);
}

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
    'isSourceCodeOf',
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

const directRoleCodemetaFields = [
    'roleName',
    'startDate',
    'endDate',
];

const directReviewCodemetaFields = [
    'reviewAspect',
    'reviewBody'
];

const crossCodemetaFields = {
    "contIntegration": ["contIntegration", "continuousIntegration"],
    // "embargoDate": ["embargoDate", "embargoEndDate"], Not present in the form yet TODO ?
};

function generateBlankNodeId(customId) {
    return `_:${customId}`;
}

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
    const id = getIfSet(`#${idPrefix}_id`);
    doc["@id"] = id? id : generateBlankNodeId(idPrefix);
    directPersonCodemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${idPrefix}_${item}`);
    });
    doc["affiliation"] = generateShortOrg(`#${idPrefix}_affiliation`);

    return doc;
}

function generateRole(id) {
    const doc = {
        "@type": "Role"
    };
    directRoleCodemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${id} .${item}`);
    });
    return doc;
}

function generateRoles(idPrefix, person) {
    const roles = [];
    const roleNodes = document.querySelectorAll(`ul[id^=${idPrefix}_role_`);
    roleNodes.forEach(roleNode => {
        const role = generateRole(roleNode.id);
        role["schema:author"] = getDocumentId(person); // Prefix with "schema:" to prevent it from expanding into a list
        roles.push(role);
    });
    return roles;
}

function generatePersons(prefix) {
    var persons = [];
    var nbPersons = getNbPersons(prefix);

    for (let personId = 1; personId <= nbPersons; personId++) {
        const idPrefix = `${prefix}_${personId}`;
        const person = generatePerson(idPrefix);
        persons.push(person);
        const roles = generateRoles(idPrefix, person);
        if (roles.length > 0) {
            persons = persons.concat(roles);
        }
    }

    return persons;
}

function generateReview() {
    const doc = {
        "@type": "Review"
    };
    directReviewCodemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${item}`);
    });
    return doc;
}

async function buildExpandedDocWithAllContexts() {
    var doc = {
        "@context": getAllCodemetaContextUrls(),
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

    const review = generateReview();
    if (review["reviewAspect"] || review["reviewBody"]) {
        doc["review"] = generateReview();
    }

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

    for (const [key, items] of Object.entries(crossCodemetaFields)) {
        items.forEach(item => {
           doc[item] = doc[key];
        });
    }
    return await jsonld.expand(doc);
}

// v2.0 is still default version for generation, for now
async function generateCodemeta(codemetaVersion = "2.0") {
    var inputForm = document.querySelector('#inputForm');
    var codemetaText, errorHTML;

    if (inputForm.checkValidity()) {
        // Expand document with all contexts before compacting
        // to allow generating property from any context
        const expanded = await buildExpandedDocWithAllContexts();
        const compacted = await jsonld.compact(expanded, CODEMETA_CONTEXTS[codemetaVersion].url);
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

function importReview(doc) {
    if (doc !== undefined) {
        directReviewCodemetaFields.forEach(item => {
            setIfDefined('#' + item, doc[item]);
        });
    }
}

function authorsEqual(author1, author2) {
    const id1 = typeof author1 === "string"? author1 : getDocumentId(author1);
    const id2 = typeof author2 === "string"? author2 : getDocumentId(author2);
    if (id1 || id2) {
        // Use their id if both authors have one
        return id1 === id2;
    }
    // Fall back to comparing values otherwise
    return author1.givenName === author2.givenName
        && author1.familyName === author2.familyName
        && author1.email === author2.email;
}

function getSingleAuthorsFromRoles(docs) {
    return docs.filter(doc => getDocumentType(doc) === "Role")
        .map(doc => doc["schema:author"])
        .reduce((authorSet, currentAuthor) => {
            const foundAuthor = authorSet.find(author => authorsEqual(author, currentAuthor));
            if (!foundAuthor) {
                return authorSet.concat([currentAuthor]);
            } else {
                return authorSet;
            }
        }, []);
}

function importRoles(personPrefix, roles) {
    roles.forEach(role => {
        const roleId = addRole(`${personPrefix}`);
        directRoleCodemetaFields.forEach(item => {
            setIfDefined(`#${personPrefix}_${item}_${roleId}`, role[item]);
        });
    });
}

function importPersons(prefix, legend, docs) {
    if (docs === undefined) {
        return;
    }

    const authors = docs.filter(doc => getDocumentType(doc) === "Person");
    const authorsFromRoles = getSingleAuthorsFromRoles(docs);
    const allAuthorDocs = authors.concat(authorsFromRoles)
        .reduce((authors, currentAuthor) => {
            if (!authors.find(author => authorsEqual(author, currentAuthor))) {
                authors.push(currentAuthor);
            }
            return authors;
        }, []);

    allAuthorDocs.forEach(function (doc, index) {
        var personId = addPerson(prefix, legend);

        if (!isBlankNodeId(getDocumentId(doc))) {
            setIfDefined(`#${prefix}_${personId}_id`, getDocumentId(doc));
        }
        directPersonCodemetaFields.forEach(function (item, index) {
            setIfDefined(`#${prefix}_${personId}_${item}`, doc[item]);
        });

        importShortOrg(`#${prefix}_${personId}_affiliation`, doc['affiliation']);

        const roles = docs.filter(currentDoc => getDocumentType(currentDoc) === "Role")
            .filter(currentDoc => authorsEqual(currentDoc["schema:author"], doc));
        importRoles(`${prefix}_${personId}`, roles);
    });
}

async function recompactDocWithAllContexts(doc) {
    const allContexts = getAllCodemetaContextUrls();
    const newDoc = structuredClone(doc);
    newDoc["@context"] = allContexts;
    const expanded = await jsonld.expand(newDoc);
    const compacted = await jsonld.compact(expanded, allContexts);
    return compacted;
}

async function importCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var doc = parseAndValidateCodemeta(false);

    // Re-compact document with all contexts
    // to allow importing property from any context
    doc = await recompactDocWithAllContexts(doc);

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
    importReview(doc["review"]);

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

    for (const [key, items] of Object.entries(crossCodemetaFields)) {
        let value = "";
        items.forEach(item => {
           value = doc[item] || value;
        });
        setIfDefined(`#${key}`, value);
    }

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

function downloadCodemeta() {
    const codemetaText = document.querySelector('#codemetaText').innerText;
    const blob = new Blob([codemetaText], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    document.querySelector('#downloadCodemeta').href = url;
    document.querySelector('#downloadCodemeta').download = "codemeta.json";
    URL.revokeObjectURL(url);
}

/**
 * Copyright (C) 2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Validators for codemeta objects derived from http://schema.org/Thing.
 */

function getDocumentType(doc) {
    // TODO: check there is at most one.
    // FIXME: is the last variant allowed?
    return doc["type"] || doc["@type"] || doc["codemeta:type"]
}

function isCompactTypeEqual(type, compactedType) {
    // FIXME: are all variants allowed?
    return (type == `${compactedType}`
        || type == `schema:${compactedType}`
        || type == `codemeta:${compactedType}`
        || type == `http://schema.org/${compactedType}`
    );
}

function noValidation(fieldName, doc) {
    return true;
}


// Helper function to validate a field is either X or a list of X.
function validateListOrSingle(fieldName, doc, validator) {
    if (Array.isArray(doc)) {
        return doc.every((subdoc) => validator(subdoc, true));
    }
    else {
        return validator(doc, false);
    }
}

// Validates a CreativeWork or an array of CreativeWork
function validateCreativeWorks(fieldName, doc) {
    return validateListOrSingle(fieldName, doc, (subdoc, inList) => {
        return validateCreativeWork(fieldName, subdoc);
    });
}

// Validates a single CreativeWork
function validateCreativeWork(fieldName, doc) {
    if (!Array.isArray(doc) && typeof doc == 'object') {
        var id = doc["id"] || doc["@id"];
        if (id !== undefined && !isUrl(id)) {
            setError(`"${fieldName}" has an invalid URI as id: ${JSON.stringify(id)}"`);
            return false;
        }

        var type = getDocumentType(doc);
        if (type === undefined) {
            if (id === undefined) {
                setError(`"${fieldName}" must be a (list of) CreativeWork object, but it is missing a type/@type.`);
                return false;
            }
            else {
                // FIXME: we have an @id but no @type, what should we do?
                return true;
            }
        }
        else if (isCompactTypeEqual(type, "CreativeWork")) {
            setError(`"${fieldName}" must be a (list of) CreativeWork object, not ${JSON.stringify(doc)}`);
            return false;
        }
        else {
            return true;
        }

        // TODO: check other fields
    }
    else if (typeof doc == 'string') {
        if (!isUrl(doc)) {
            setError(`"${fieldName}" must be an URI or CreativeWork object, not: ${JSON.stringify(id)}"`);
            return false;
        }
        else {
            return true;
        }
    }
    else {
        setError(`"${fieldName}" must be a CreativeWork object or URI, not ${JSON.stringify(doc)}`);
        return false;
    }
}

// Validates a Person, Organization or an array of these
function validateActors(fieldName, doc) {
    return validateListOrSingle(fieldName, doc, (subdoc, inList) => {
        return validateActor(fieldName, subdoc);
    });
}

// Validates a Person or an array of Person
function validatePersons(fieldName, doc) {
    return validateListOrSingle(fieldName, doc, (subdoc, inList) => {
        return validatePerson(fieldName, subdoc);
    });
}

// Validates an Organization or an array of Organization
function validateOrganizations(fieldName, doc) {
    return validateListOrSingle(fieldName, doc, (subdoc, inList) => {
        return validateOrganization(fieldName, doc);
    });
}

// Validates a single Person or Organization
function validateActor(fieldName, doc) {
    if (!Array.isArray(doc) && typeof doc == 'object') {
        var id = doc["id"] || doc["@id"];
        if (id !== undefined && !isUrl(id)) {
            setError(`"${fieldName}" has an invalid URI as id: ${JSON.stringify(id)}"`);
            return false;
        }

        var type = getDocumentType(doc);
        if (type === undefined) {
            if (id === undefined) {
                setError(`"${fieldName}" must be a (list of) Person or Organization object(s) or an URI, but is missing a type/@type.`);
                return false;
            }
            else {
                // FIXME: we have an @id but no @type, what should we do?
                return true;
            }
        }
        else if (isCompactTypeEqual(type, "Person")) {
            return validatePerson(fieldName, doc);
        }
        else if (isCompactTypeEqual(type, "Organization")) {
            return validateOrganization(fieldName, doc);
        }
        else {
            setError(`"${fieldName}" type must be "Person" or "Organization", not ${JSON.stringify(type)}`);
            return false;
        }
    }
    else if (typeof doc == 'string') {
        if (!isUrl(doc)) {
            setError(`"${fieldName}" must be an URI or a Person or Organization object, not: ${JSON.stringify(id)}"`);
            return false;
        }
        else {
            return true;
        }
    }
    else {
        setError(`"${fieldName}" must be a Person or Organization object or an URI, not ${JSON.stringify(doc)}.`);
        return false;
    }
}

// Validates a single Person object
function validatePerson(parentFieldName, doc) {
    // TODO: validate id/@id
    if (!isCompactTypeEqual(getDocumentType(doc), "Person")) {
        setError(`"${fieldName}" type must be a (list of) Person object(s), not ${JSON.stringify(type)}`);
        return false;
    }
    else {
        return Object.entries(doc).every((entry) => {
            var fieldName = entry[0];
            var subdoc = entry[1];
            if (fieldName == "type" || fieldName == "@type") {
                // Was checked before
                return true;
            }
            else {
                var validator = personFieldValidators[fieldName];
                if (validator === undefined) {
                    // TODO: find if it's a field that belongs to another type,
                    // and suggest that to the user
                    setError(`Unknown field "${fieldName}" in "${parentFieldName}".`)
                    return false;
                }
                else {
                    return validator(fieldName, subdoc);
                }
            }
        });
    }
}

// Validates a single Organization object
function validateOrganization(fieldName, doc) {
    // TODO: validate id/@id
    if (!isCompactTypeEqual(getDocumentType(doc), "Organization")) {
        setError(`"${fieldName}" type must be a (list of) Organization object(s), not ${type}`);
        return false;
    }
    return true;
}


var softwareFieldValidators = {
    "@id": validateUrl,
    "id": validateUrl,

    "codeRepository": validateUrls,
    "programmingLanguage": noValidation,
    "runtimePlatform": validateTexts,
    "targetProduct": noValidation, // TODO: validate SoftwareApplication
    "applicationCategory": validateTextsOrUrls,
    "applicationSubCategory": validateTextsOrUrls,
    "downloadUrl": validateUrls,
    "fileSize": validateText,  // TODO
    "installUrl": validateUrls,
    "memoryRequirements": validateTextsOrUrls,
    "operatingSystem": validateTexts,
    "permissions": validateTexts,
    "processorRequirements": validateTexts,
    "releaseNotes": validateTextsOrUrls,
    "softwareHelp": validateCreativeWorks,
    "softwareRequirements": noValidation, // TODO: validate SoftwareSourceCode
    "softwareVersion": validateText, // TODO?
    "storageRequirements": validateTextsOrUrls,
    "supportingData": noValidation, // TODO
    "author": validateActors,
    "citation": validateCreativeWorks, // TODO
    "contributor": validateActors,
    "copyrightHolder": validateActors,
    "copyrightYear": validateNumbers,
    "creator": validateActors, // TODO: still in codemeta 2.0, but removed from master
    "dateCreated": validateDate,
    "dateModified": validateDate,
    "datePublished": validateDate,
    "editor": validatePersons,
    "encoding": noValidation,
    "fileFormat": validateTextsOrUrls,
    "funder": validateActors,
    "keywords": validateTexts,
    "license": validateCreativeWorks, // TODO
    "producer": validateActors,
    "provider": validateActors,
    "publisher": validateActors,
    "sponsor": validateActors,
    "version": validateNumberOrText,
    "isAccessibleForFree": validateBoolean,
    "isPartOf": validateCreativeWorks,
    "hasPart": validateCreativeWorks,
    "position": noValidation,
    "identifier": noValidation, // TODO
    "description": validateText,
    "name": validateText,
    "sameAs": validateUrls,
    "url": validateUrls,
    "relatedLink": validateUrls,

    "softwareSuggestions": noValidation, // TODO: validate SoftwareSourceCode
    "maintainer": validateActors,
    "contIntegration": validateUrls,
    "buildInstructions": validateUrls,
    "developmentStatus": validateText, // TODO: use only repostatus strings?
    "embargoDate": validateDate,
    "funding": validateText,
    "issueTracker": validateUrls,
    "referencePublication": noValidation, // TODO?
    "readme": validateUrls,
};

var personFieldValidators = {
    "@id": validateUrl,
    "id": validateUrl,

    "givenName": validateText,
    "familyName": validateText,
    "email": validateText,
    "affiliation": validateOrganizations,
    "identifier": validateUrls,
    "name": validateText,  // TODO: this is technically valid, but should be allowed here?
};


/**
 * Copyright (C) 2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Reads a Codemeta file and shows human-friendly errors on it.
 *
 * This validator intentionaly does not use a schema, in order to show errors
 * that are easy to understand for users with no understanding of JSON-LD.
 */


function noValidation(fieldName, doc) {
}

// Validates an URL or an array of URLs
function validateUrls(fieldName, doc) {
    if (Array.isArray(doc)) {
        return doc.every((url) => {
            if (typeof url != 'string') {
                setError(`"${fieldName}" must be a list of URLs (or an URL), but it contains: ${JSON.stringify(url)}`);
                return false;
            }
            else {
                return validateUrl(fieldName, url);
            }
        })
    }
    else if (typeof doc == 'string') {
        return validateUrl(fieldName, doc);
    }
    else {
        setError(`"${fieldName}" must be an URL (or a list of URLs), not: ${JSON.stringify(url)}`);
        return false;
    }
}

// Validates a single URL
function validateUrl(fieldName, doc) {
    if (!isUrl(doc)) {
        setError(`Invalid URL in field "${fieldName}": ${JSON.stringify(doc)}`)
        return false;
    }
    else {
        return true;
    }
}

// Validates a single Text
function validateText(fieldName, doc) {
    if (typeof doc != 'string') {
        setError(`"${fieldName}" must be text, not ${JSON.stringify(doc)}`);
        return false;
    }
    else {
        return true;
    }
}

// Validates a Number or list of Number
function validateNumbers(fieldName, doc) {
    if (Array.isArray(doc)) {
        return doc.every((subdoc) => {
            if (typeof subdoc != 'number') {
                setError(`"${fieldName}" must be an array of numbers (or a single number), but contains: ${JSON.stringify(subdoc)}`);
                return false;
            }
            else {
                return true;
            }
        })
    }
    else if (typeof doc != 'number') {
        setError(`"${fieldName}" must be a number or an array of numbers, not: ${JSON.stringify(subdoc)}`);
        return false;
    }
    else {
        return true;
    }
}

// Validates a single Boolean
function validateBoolean(fieldName, doc) {
    if (typeof doc != 'boolean') {
        setError(`"${fieldName}" must be a boolean (ie. "true" or "false"), not: ${JSON.stringify(subdoc)}`);
        return false;
    }
    else {
        return true;
    }
}

// Validates a single Date
function validateDate(fieldName, doc) {
    let re = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof doc != 'string') {
        setError(`"${fieldName}" must be a string representing a date, not: ${JSON.stringify(subdoc)}`);
        return false;
    }
    else if (!doc.match(re)) {
        setError(`"${fieldName}" must be date in the format YYYY-MM-DD, not: ${JSON.stringify(subdoc)}`);
        return false;
    }
    else {
        return true;
    }
}

// Validates a CreativeWork or an array of CreativeWork
function validateCreativeWorks(fieldName, doc) {
    if (Array.isArray(doc)) {
        return doc.every((subdoc) => validateCreativeWork(fieldName, subdoc));
    }
    else {
        return validateCreativeWork(fieldName, doc);
    }
}

// Validates a single CreativeWork
function validateCreativeWork(fieldName, doc) {
    if (!Array.isArray(doc) && typeof doc == 'object') {
        var id = doc["id"] || doc["@id"];
        if (id !== undefined && !isUrl(id)) {
            setError(`"${fieldName}" has an invalid URI as id: ${JSON.stringify(id)}"`);
            return false;
        }

        var type = doc["type"] || doc["@type"];
        if (type === undefined) {
            if (id === undefined) {
                setError(`"${fieldName}" must be a (list of) CreativeWork object, but it is missing a type/@type.`);
                return false
            }
            else {
                // FIXME: we have an @id but no @type, what should we do?
                return true;
            }
        }
        else if (type != "CreativeWork" || type != "schema:CreativeWork" || type != "http://schema.org/CreativeWork") {
            // FIXME: is the first variant allowed?
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
    if (Array.isArray(doc)) {
        return doc.every((subdoc) => validateActor(fieldName, subdoc));
    }
    else {
        return validateActor(fieldName, doc);
    }
}

// Validates a Person or an array of Person
function validatePersons(fieldName, doc) {
    if (Array.isArray(doc)) {
        return doc.every((subdoc) => validatePerson(fieldName, subdoc));
    }
    else {
        return validatePerson(fieldName, doc);
    }
}

// Validates an Organization or an array of Organization
function validateOrganizations(fieldName, doc) {
    if (Array.isArray(doc)) {
        return doc.forEach((subdoc) => validateOrganization(fieldName, subdoc));
    }
    else {
        return validateOrganization(fieldName, doc);
    }
}

// Validates a single Person or Organization
function validateActor(fieldName, doc) {
    if (!Array.isArray(doc) && typeof doc == 'object') {
        var id = doc["id"] || doc["@id"];
        if (id !== undefined && !isUrl(id)) {
            setError(`"${fieldName}" has an invalid URI as id: ${JSON.stringify(id)}"`);
            return false
        }

        var type = doc["type"] || doc["@type"];
        if (type === undefined) {
            if (id === undefined) {
                setError(`"${fieldName}" must be a (list of) Person or Organization object(s), but it is missing a type/@type.`);
                return false
            }
            else {
                // FIXME: we have an @id but no @type, what should we do?
                return true;
            }
        }
        else if (type == "Person" || type == "schema:Person" || type == "codemeta:Person" || type == "http://schema.org/Person") {
            // FIXME: is the first variant allowed?
            return validatePerson(fieldName, doc);
        }
        else if (type == "Organization" || type == "schema:Organization" || type == "codemeta:Organization" || type == "http://schema.org/Organization") {
            // FIXME: is the first variant allowed?
            return validateOrganization(fieldName, doc);
        }
        else {
            setError(`"${fieldName}" type must be a (list of) Person or Organization object(s), not ${type}`);
            return false
        }
    }
    else if (typeof doc == 'string') {
        if (!isUrl(doc)) {
            setError(`"${fieldName}" must be an URI or a Person or Organization object, not: ${JSON.stringify(id)}"`);
            return false
        }
        else {
            return true;
        }
    }
    else {
        setError(`"${fieldName}" must be a Person or Organization object or an URI, not ${JSON.stringify(doc)}`);
        return false;
    }
}

// Validates a single Person object (assumes type/@type was already validated)
function validatePerson(fieldName, doc) {
    // TODO
    return true;
}

// Validates a single Organization object (assumes type/@type was already validated)
function validateOrganization(fieldName, doc) {
    // TODO
    return true;
}


var softwareFieldValidators = {
    "codeRepository": validateUrls,
    "programmingLanguage": noValidation,
    "runtimePlatform": noValidation,
    "targetProduct": noValidation, // TODO: validate SoftwareApplication
    "applicationCategory": noValidation,
    "applicationSubCategory": noValidation,
    "downloadUrl": validateUrls,
    "fileSize": noValidation, // TODO
    "installUrl": validateUrls,
    "memoryRequirements": noValidation,
    "operatingSystem": noValidation,
    "permissions": noValidation,
    "processorRequirements": noValidation,
    "releaseNotes": noValidation,
    "softwareHelp": validateCreativeWorks,
    "softwareRequirements": noValidation, // TODO: validate SoftwareSourceCode
    "softwareVersion": noValidation, // TODO?
    "storageRequirements": noValidation,
    "supportingData": noValidation, // TODO
    "author": validateActors,
    "citation": validateCreativeWorks, // TODO
    "contributor": validateActors,
    "copyrightHolder": validateActors,
    "copyrightYear": validateNumbers,
    "creator": validateActors,
    "dateCreated": validateDate,
    "dateModified": validateDate,
    "datePublished": validateDate,
    "editor": validatePersons,
    "encoding": noValidation,
    "fileFormat": noValidation,
    "funder": validateActors,
    "keywords": noValidation,
    "license": validateCreativeWorks, // TODO
    "producer": validateActors,
    "provider": validateActors,
    "publisher": validateActors,
    "sponsor": validateActors,
    "version": noValidation,
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
    "givenName": validateText,
    "familyName": validateText,
    "email": validateText,
    "affiliation": validateOrganizations,
    "identifier": validateUrls,
    "name": validateText,
};


function validateDocument(doc) {
    if (!Array.isArray(doc) && typeof doc != 'object') {
        setError("Document must be an object (starting and ending with { and }), not ${typeof doc}.")
        return false;
    }
    var type = doc["type"] || doc["@type"];
    if (type === undefined) {
        setError("Missing type (must be SoftwareSourceCode or SoftwareApplication).")
        return false
    }
    else {
        return Object.entries(doc).every((entry) => {
            var fieldName = entry[0];
            var subdoc = entry[1];
            if (fieldName == "@context") {
                if (subdoc == "https://doi.org/10.5063/schema/codemeta-2.0") {
                    return true;
                }
                else {
                    setError(`@context must be "https://doi.org/10.5063/schema/codemeta-2.0", not ${JSON.stringify(subdoc)}`);
                    return false;
                }
            }
            else if (fieldName == "type" || fieldName == "@type") {
                if (subdoc != "SoftwareSourceCode" && subdoc != "SoftwareApplication") {
                    setError(`Wrong type (must be SoftwareSourceCode or SoftwareApplication), not ${JSON.stringify(subdoc)}`)
                    return false
                }
                else {
                    return true;
                }
            }
            else {
                var validator = softwareFieldValidators[fieldName];
                if (validator === undefined) {
                    setError(`Invalid field "${fieldName}".`)
                    return false;
                }
                else {
                    return validator(fieldName, subdoc);
                }
            }
        });
    }
}


function parseAndValidateCodemeta(showPopup) {
    var codemetaText = document.querySelector('#codemetaText').innerText;
    var doc;

    try {
        doc = JSON.parse(codemetaText);
    }
    catch (e) {
        setError(`Could not read codemeta document because it is not valid JSON (${e}). Check for missing or extra quote, colon, or bracket characters.`);
        return;
    }

    setError("");

    var isValid = validateDocument(doc);
    if (showPopup) {
        if (isValid) {
            alert('Document is valid!')
        }
        else {
            alert('Document is invalid.');
        }
    }

    return doc;
}

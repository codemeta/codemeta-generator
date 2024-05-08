/**
 * Copyright (C) 2020-2021  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Validators for codemeta objects derived from http://schema.org/Thing.
 */

// Validates subtypes of Thing, or URIs
//
// typeFieldValidators is a map: {type => {fieldName => fieldValidator}}
function validateThingOrId(parentFieldName, typeFieldValidators, doc) {
    var acceptedTypesString = Object.keys(typeFieldValidators).join('/');

    if (typeof doc == 'string') {
        if (!isUrl(doc)) {
            setError(`"${parentFieldName}" must be an URL or a ${acceptedTypesString} object, not: ${JSON.stringify(doc)}`);
            return false;
        }
        else {
            return true;
        }
    }
    else if (!Array.isArray(doc) && typeof doc == 'object') {
        return validateThing(parentFieldName, typeFieldValidators, doc);
    }
    else {
        setError(`"${parentFieldName}" must be a ${acceptedTypesString} object or URI, not ${JSON.stringify(doc)}`);
        return false;
    }
}

// Validates subtypes of Thing
//
// typeFieldValidators is a map: {type => {fieldName => fieldValidator}}
function validateThing(parentFieldName, typeFieldValidators, doc) {
    // TODO: check there is either id or @id but not both
    // TODO: check there is either type or @type but not both

    var acceptedTypesString = Object.keys(typeFieldValidators).join('/');

    var documentType = getDocumentType(doc);

    var id = getDocumentId(doc);
    if (id !== undefined && !isUrl(id)) {
        setError(`"${fieldName}" has an invalid URI as id: ${JSON.stringify(id)}"`);
        return false;
    }

    if (documentType === undefined) {
        if (id === undefined) {
            setError(`"${parentFieldName}" must be a (list of) ${acceptedTypesString} object(s) or an URI, but is missing a type/@type.`);
            return false;
        }
        else {
            // FIXME: we have an @id but no @type, what should we do?
            return true;
        }
    }

    for (expectedType in typeFieldValidators) {
        if (isCompactTypeEqual(documentType, expectedType)) {
            var fieldValidators = typeFieldValidators[expectedType];

            return Object.entries(doc)
                .filter(([fieldName]) => !isKeyword(fieldName))
                .every(([fieldName, subdoc]) => {
                    const compactedFieldName = getCompactType(fieldName);
                    var validator = fieldValidators[compactedFieldName];
                    if (validator === undefined) {
                        // TODO: find if it's a field that belongs to another type,
                        // and suggest that to the user
                        setError(`Unknown field "${compactedFieldName}".`)
                        return false;
                    } else {
                        return validator(compactedFieldName, subdoc);
                    }
                });
        }
    }

    setError(`"${parentFieldName}" type must be a (list of) ${acceptedTypesString} object(s), not ${JSON.stringify(documentType)}`);
    return false;
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
    return validateThingOrId(fieldName, {
        "CreativeWork": creativeWorkFieldValidators,
        "SoftwareSourceCode": softwareFieldValidators,
        "SoftwareApplication": softwareFieldValidators,
    }, doc);
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
        return validateOrganization(fieldName, subdoc);
    });
}

// Validates a single Person or Organization
function validateActor(fieldName, doc) {
    return validateThingOrId(fieldName, {
        "Role": roleFieldValidators,
        "Person": personFieldValidators,
        "Organization": organizationFieldValidators,
    }, doc);
}

// Validates a single Person object
function validatePerson(fieldName, doc) {
    return validateThingOrId(fieldName, {"Person": personFieldValidators}, doc);
}

// Validates a single Organization object
function validateOrganization(fieldName, doc) {
    return validateThingOrId(fieldName, {"Organization": organizationFieldValidators}, doc);
}

function validateReview(fieldName, doc) {
    return validateThingOrId(fieldName, {"Review": reviewFieldValidators}, doc);
}

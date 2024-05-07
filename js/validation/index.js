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

const softwareFieldValidators = {
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
    "funder": validateActors, // TODO: may be other types
    "keywords": validateTexts,
    "license": validateCreativeWorks,
    "producer": validateActors,
    "provider": validateActors,
    "publisher": validateActors,
    "sponsor": validateActors,
    "version": validateNumberOrText,
    "isAccessibleForFree": validateBoolean,
    "isSourceCodeOf": validateTextsOrUrls,
    "isPartOf": validateCreativeWorks,
    "hasPart": validateCreativeWorks,
    "position": noValidation,
    "identifier": noValidation, // TODO
    "description": validateText,
    "name": validateText,
    "sameAs": validateUrls,
    "url": validateUrls,
    "relatedLink": validateUrls,
    "review": validateReview,

    "softwareSuggestions": noValidation, // TODO: validate SoftwareSourceCode
    "maintainer": validateActors,
    "contIntegration": validateUrls,
    "continuousIntegration": validateUrls,
    "buildInstructions": validateUrls,
    "developmentStatus": validateText, // TODO: use only repostatus strings?
    "embargoDate": validateDate,
    "embargoEndDate": validateDate,
    "funding": validateText,
    "issueTracker": validateUrls,
    "referencePublication": noValidation, // TODO?
    "readme": validateUrls,
};

const creativeWorkFieldValidators = {
    "@id": validateUrl,
    "id": validateUrl,

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
    "funder": validateActors, // TODO: may be other types
    "keywords": validateTexts,
    "license": validateCreativeWorks,
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
};

const roleFieldValidators = {
    "roleName": validateText,
    "startDate": validateDate,
    "endDate": validateDate,

    "schema:author": validateActor
};

const personFieldValidators = {
    "@id": validateUrl,
    "id": validateUrl,

    "givenName": validateText,
    "familyName": validateText,
    "email": validateText,
    "affiliation": validateOrganizations,
    "identifier": validateUrls,
    "name": validateText,  // TODO: this is technically valid, but should be allowed here?
    "url": validateUrls,
};

const organizationFieldValidators = {
    "@id": validateUrl,
    "id": validateUrl,

    "email": validateText,
    "identifier": validateUrls,
    "name": validateText,
    "address": validateText,
    "sponsor": validateActors,
    "funder": validateActors, // TODO: may be other types
    "isPartOf": validateOrganizations,
    "url": validateUrls,

    // TODO: add more?
};

const reviewFieldValidators = {
    "reviewAspect": validateText,
    "reviewBody": validateText,
}

function switchCodemetaContext(codemetaJSON, contextUrl) {
    const previousCodemetaContext = codemetaJSON["@context"];
    codemetaJSON["@context"] = contextUrl;
    return previousCodemetaContext;
}

async function validateTerms(codemetaJSON) {
    try {
        await jsonld.expand(codemetaJSON, { safe: true });
    } catch (validationError) {
        if (validationError.details.event.code === "invalid property") {
            setError(`Unknown field "${validationError.details.event.details.property}".`);
            return false;
        }
    }
    return true;
}

function validateCodemetaJSON(codemetaJSON) {
    if (!Array.isArray(codemetaJSON) && typeof codemetaJSON != 'object') {
        setError("Document must be an object (starting and ending with { and }), not ${typeof doc}.")
        return false;
    }
    // TODO: validate id/@id

    // TODO: check there is either type or @type but not both
    var type = getDocumentType(codemetaJSON);
    if (type === undefined) {
        setError("Missing type (must be SoftwareSourceCode or SoftwareApplication).")
        return false;
    }
    else if (!isCompactTypeEqual(type, "SoftwareSourceCode") && !isCompactTypeEqual(type, "SoftwareApplication")) {
        // Check this before other fields, as a wrong type error is more
        // understandable than "invalid field".
        setError(`Wrong document type: must be "SoftwareSourceCode"/"SoftwareApplication", not ${JSON.stringify(type)}`)
        return false;
    }
    return true;
}

function validateDocument(doc) {
    return Object.entries(doc)
        .filter(([fieldName]) => !isKeyword(fieldName))
        .every(([fieldName, subdoc]) => {
            const compactedFieldName = getCompactType(fieldName);
            var validator = softwareFieldValidators[compactedFieldName];
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

async function parseAndValidateCodemeta(showPopup) {
    var codemetaText = document.querySelector('#codemetaText').innerText;
    let parsed;

    try {
        parsed = JSON.parse(codemetaText);
    }
    catch (e) {
        setError(`Could not read codemeta document because it is not valid JSON (${e}). Check for missing or extra quote, colon, or bracket characters.`);
        return;
    }

    setError("");

    let isJSONValid = validateCodemetaJSON(parsed);

    const previousCodemetaContext = switchCodemetaContext(parsed, INTERNAL_CONTEXT_URL);

    let areTermsValid = await validateTerms(parsed);

    const expanded = await jsonld.expand(parsed);
    const doc = await jsonld.compact(expanded, INTERNAL_CONTEXT_URL);

    switchCodemetaContext(parsed, previousCodemetaContext)

    let isDocumentValid = validateDocument(doc);
    if (showPopup) {
        if (isJSONValid && areTermsValid && isDocumentValid) {
            alert('Document is valid!')
        }
        else {
            alert('Document is invalid.');
        }
    }

    return doc;
}

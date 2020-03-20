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


function validateDocument(doc) {
    if (!Array.isArray(doc) && typeof doc != 'object') {
        setError("Document must be an object (starting and ending with { and }), not ${typeof doc}.")
        return false;
    }
    // TODO: validate id/@id

    // TODO: check there is either type or @type but not both
    var type = getDocumentType(doc);
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
                // Was checked before
                return true;
            }
            else {
                var validator = softwareFieldValidators[fieldName];
                if (validator === undefined) {
                    // TODO: find if it's a field that belongs to another type,
                    // and suggest that to the user
                    setError(`Unknown field "${fieldName}".`)
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

/**
 * Copyright (C) 2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Validators for native schema.org data types.
 */

// Validates an URL or an array of URLs
function validateUrls(fieldName, doc) {
    return validateListOrSingle(fieldName, doc, (subdoc, inList) => {
        if (typeof subdoc != 'string') {
            if (inList) {
                setError(`"${fieldName}" must be a list of URLs (or a single URL), but it contains: ${JSON.stringify(subdoc)}`);
            }
            else {
                setError(`"${fieldName}" must be an URL (or a list of URLs), not: ${JSON.stringify(subdoc)}`);
            }
            return false;
        }
        else {
            return validateUrl(fieldName, subdoc);
        }
    });
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

// Validates a Text/URL or an array of Texts/URLs
function validateTextsOrUrls(fieldName, doc) {
    return validateListOrSingle(fieldName, doc, (subdoc, inList) => {
        if (typeof subdoc != 'string') {
            if (inList) {
                setError(`"${fieldName}" must be a list of texts/URLs (or a single text/URL), but it contains: ${JSON.stringify(subdoc)}`);
            }
            else {
                setError(`"${fieldName}" must be a text/URL (or a list of texts/URLs), not: ${JSON.stringify(subdoc)}`);
            }
            return false;
        }
        else {
            return true;
        }
    });
}

// Validates a Text or an array of Texts
function validateTexts(fieldName, doc) {
    return validateListOrSingle(fieldName, doc, (subdoc, inList) => {
        if (typeof subdoc != 'string') {
            if (inList) {
                setError(`"${fieldName}" must be a list of texts (or a single text), but it contains: ${JSON.stringify(subdoc)}`);
            }
            else {
                setError(`"${fieldName}" must be a text (or a list of texts), not: ${JSON.stringify(subdoc)}`);
            }
            return false;
        }
        else {
            return true;
        }
    });
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
    return validateListOrSingle(fieldName, doc, (subdoc, inList) => {
        if (typeof subdoc != 'number') {
            if (inList) {
                setError(`"${fieldName}" must be an array of numbers (or a single number), but contains: ${JSON.stringify(subdoc)}`);
            }
            else {
                setError(`"${fieldName}" must be a number or an array of numbers, not: ${JSON.stringify(subdoc)}`);
            }
            return false;
        }
        else {
            return true;
        }
    });
}

// Validates a single Text or Number
function validateNumberOrText(fieldName, doc) {
    if (typeof doc == 'string') {
        return true;
    }
    else if (typeof doc == 'number') {
        return true;
    }
    else {
        setError(`"${fieldName}" must be text or a number, not ${JSON.stringify(doc)}`);
        return false;
    }
}

// Validates a single Boolean
function validateBoolean(fieldName, doc) {
    if (typeof doc != 'boolean') {
        setError(`"${fieldName}" must be a boolean (ie. "true" or "false"), not ${JSON.stringify(subdoc)}`);
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
        setError(`"${fieldName}" must be a date, not ${JSON.stringify(doc)}`);
        return false;
    }
    else if (!doc.match(re)) {
        setError(`"${fieldName}" must be a date in the format YYYY-MM-DD, not ${JSON.stringify(doc)}`);
        return false;
    }
    else {
        return true;
    }
}


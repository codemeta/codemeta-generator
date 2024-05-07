/**
 * Copyright (C) 2020-2021  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

function getDocumentType(doc) {
    // TODO: check there is at most one.
    // FIXME: is the last variant allowed?
    return doc["type"] || doc["@type"] || doc["codemeta:type"]
}

function getDocumentId(doc) {
    return doc["id"] || doc["@id"];
}

function getCompactType(type) {
    return type
        .replace("schema:", "")
        .replace("codemeta:", "");
}

function isCompactTypeEqual(type, compactedType) {
    // FIXME: are all variants allowed?
    return (type == `${compactedType}`
        || type == `schema:${compactedType}`
        || type == `codemeta:${compactedType}`
        || type == `http://schema.org/${compactedType}`
    );
}

function isKeyword(term) {
    return ["@context", "type"].includes(term);
}

/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

function emptyToUndefined(v) {
    if (v == null || v == "")
        return undefined;
    else
        return v;
}

function getIfSet(query) {
    return emptyToUndefined(document.querySelector(query).value);
}

function getNbAuthors() {
    var nbAuthorsField = document.querySelector('#nbAuthors');
    return parseInt(nbAuthorsField.value, 10);
}

function addAuthorWithId(authorId) {
    var fieldset = document.createElement("fieldset")
    fieldset.classList.add("author");
    fieldset.id = `author_${authorId}`
    
    fieldset.innerHTML = `
        <legend>Author #${authorId}</legend>
        <p>
            <label for="author_givenName_${authorId}">Given name</label>
            <input type="text" id="author_givenName_${authorId}" name="author_givenName_${authorId}" required="true" />
        </p>
        <p>
            <label for="author_familyName_${authorId}">Family name</label>
            <input type="text" id="author_familyName_${authorId}" name="author_familyName_${authorId}" />
        </p>
        <p>
            <label for="author_email_${authorId}">E-mail address</label>
            <input type="email" id="author_email_${authorId}" name="author_email_${authorId}" />
        </p>
        <p>
            <label for="author_id_${authorId}">URI</label>
            <input type="url" id="author_id_${authorId}" name="author_id_${authorId}" />
        </p>
    `;

    var authorsFieldset = document.querySelector('#authors');
    authorsFieldset.appendChild(fieldset);
}

function addAuthor() {
    var authorId = getNbAuthors() + 1;

    addAuthorWithId(authorId);

    var nbAuthorsField = document.querySelector('#nbAuthors');
    nbAuthorsField.value = authorId;
}

function removeAuthor() {
    var authorId = getNbAuthors();

    document.querySelector(`#author_${authorId}`).remove();

    var nbAuthorsField = document.querySelector('#nbAuthors');
    nbAuthorsField.value = authorId-1;
}

function generateCodemeta() {
    var inputForm = document.querySelector('#inputForm');
    var codemetaText;
    if (inputForm.checkValidity()) {
        authors = [];

        var nbAuthors = getNbAuthors();

        for (let authorId = 1; authorId <= nbAuthors; authorId++) {
            authors.push({
                "@type": "Person",
                "givenName": getIfSet(`#author_givenName_${authorId}`),
                "familyName": getIfSet(`#author_familyName_${authorId}`),
                "email": getIfSet(`#author_email_${authorId}`),
                "@id": getIfSet(`#author_id_${authorId}`),
            })
        }

        var doc = {
            "@context": "https://doi.org/10.5063/schema/codemeta-2.0",
            "@type": "SoftwareSourceCode",
            "name": getIfSet('#name'),
            "codeRepository": getIfSet('#codeRepository'),
            "dateCreated": getIfSet('#dateCreated'),
            "license": "https://spdx.org/licenses/" + getIfSet('#license'),
            "author": authors,
        };

        codemetaText = JSON.stringify(doc, null, 4);
    }
    else {
        codemetaText = "invalid input (see error above)";
        inputForm.reportValidity();
    }

    document.querySelector('#codemetaText').textContent = codemetaText;
}

function initAuthors() {
    var nbAuthors = getNbAuthors();

    for (let authorId = 1; authorId <= nbAuthors; authorId++) {
        addAuthorWithId(authorId);
    }
}

function initCallbacks() {
    document.querySelector('#addAuthor')
        .addEventListener('click', addAuthor);
    document.querySelector('#removeAuthor')
        .addEventListener('click', removeAuthor);
    document.querySelector('#generateCodemeta')
        .addEventListener('click', generateCodemeta);

    document.querySelector('#inputForm')
        .addEventListener('change', generateCodemeta);

    initAuthors()
}

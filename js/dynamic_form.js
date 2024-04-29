/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

// List of all HTML fields in a Person fieldset.
const personFields = [
    'givenName',
    'familyName',
    'email',
    'id',
    'affiliation',
];

function createPersonFieldset(personPrefix, legend) {
    // Creates a fieldset containing inputs for informations about a person
    var fieldset = document.createElement("fieldset")
    var moveButtons;
    fieldset.classList.add("person");
    fieldset.classList.add("leafFieldset");
    fieldset.id = personPrefix;

    fieldset.innerHTML = `
        <legend>${legend}</legend>
        <div class="moveButtons">
            <input type="button" id="${personPrefix}_moveToLeft" value="<" class="moveToLeft"
                title="Moves this person to the left." />
            <input type="button" id="${personPrefix}_moveToRight" value=">" class="moveToRight"
                title="Moves this person to the right." />
        </div>
        <p>
            <label for="${personPrefix}_givenName">Given name</label>
            <input type="text" id="${personPrefix}_givenName" name="${personPrefix}_givenName"
                placeholder="Jane" required="true" />
        </p>
        <p>
            <label for="${personPrefix}_familyName">Family name</label>
            <input type="text" id="${personPrefix}_familyName" name="${personPrefix}_familyName"
                placeholder="Doe" />
        </p>
        <p>
            <label for="${personPrefix}_email">E-mail address</label>
            <input type="email" id="${personPrefix}_email" name="${personPrefix}_email"
                placeholder="jane.doe@example.org" />
        </p>
        <p>
            <label for="${personPrefix}_id">URI</label>
            <input type="url" id="${personPrefix}_id" name="${personPrefix}_id"
                placeholder="http://orcid.org/0000-0002-1825-0097" />
        </p>
        <p>
        <label for="${personPrefix}_affiliation">Affiliation</label>
            <input type="text" id="${personPrefix}_affiliation" name="${personPrefix}_affiliation"
                placeholder="Department of Computer Science, University of Pisa" />
        </p>
        <input type="hidden" id="${personPrefix}_role_index" value="0" />
        <input type="button" id="${personPrefix}_role_add" value="Add one role" />
    `;

    return fieldset;
}

function addPersonWithId(container, prefix, legend, id) {
    var personPrefix = `${prefix}_${id}`;
    var fieldset = createPersonFieldset(personPrefix, `${legend} #${id}`);

    container.appendChild(fieldset);

    document.querySelector(`#${personPrefix}_moveToLeft`)
        .addEventListener('click', () => movePerson(prefix, id, "left"));
    document.querySelector(`#${personPrefix}_moveToRight`)
        .addEventListener('click', () => movePerson(prefix, id, "right"));
    document.querySelector(`#${personPrefix}_role_add`)
        .addEventListener('click', () => addRole(personPrefix));
}

function movePerson(prefix, id1, direction) {
    var nbPersons = getNbPersons(prefix);
    var id2;

    // Computer id2, the id of the person to flip id1 with (wraps around the
    // end of the list of persons)
    if (direction == "left") {
        id2 = id1 - 1;
        if (id2 <= 0) {
            id2 = nbPersons;
        }
    }
    else {
        id2 = id1 + 1;
        if (id2 > nbPersons) {
            id2 = 1;
        }
    }

    // Flip the field values, one by one
    personFields.forEach((fieldName) => {
        var field1 = document.querySelector(`#${prefix}_${id1}_${fieldName}`);
        var field2 = document.querySelector(`#${prefix}_${id2}_${fieldName}`);
        var value1 = field1.value;
        var value2 = field2.value;
        field2.value = value1;
        field1.value = value2;
    });

    // Form was changed; regenerate
    generateCodemeta();
}

function addPerson(prefix, legend) {
    var container = document.querySelector(`#${prefix}_container`);
    var personId = getNbPersons(prefix) + 1;

    addPersonWithId(container, prefix, legend, personId);

    setNbPersons(prefix, personId);

    return personId;
}

function removePerson(prefix) {
    var personId = getNbPersons(prefix);

    document.querySelector(`#${prefix}_${personId}`).remove();

    setNbPersons(prefix, personId - 1);
}

// Initialize a group of persons (authors, contributors) on page load.
// Useful if the page is reloaded.
function initPersons(prefix, legend) {
    var nbPersons = getNbPersons(prefix);
    var personContainer = document.querySelector(`#${prefix}_container`)

    for (let personId = 1; personId <= nbPersons; personId++) {
        addPersonWithId(personContainer, prefix, legend, personId);
    }
}

function removePersons(prefix) {
    var nbPersons = getNbPersons(prefix);
    var personContainer = document.querySelector(`#${prefix}_container`)

    for (let personId = 1; personId <= nbPersons; personId++) {
        removePerson(prefix)
    }
}

function addRole(personPrefix) {
    const roleButtonGroup = document.querySelector(`#${personPrefix}_role_add`);
    const roleIndexNode = document.querySelector(`#${personPrefix}_role_index`);
    const roleIndex = parseInt(roleIndexNode.value, 10);

    const ul = document.createElement("ul")
    ul.classList.add("role");
    ul.id = `${personPrefix}_role_${roleIndex}`;

    ul.innerHTML = `
        <li><label for="${personPrefix}_roleName_${roleIndex}">Role</label>
            <input type="text" class="roleName" id="${personPrefix}_roleName_${roleIndex}" name="${personPrefix}_roleName_${roleIndex}"
                placeholder="Developer" size="10" /></li>
        <li><label for="${personPrefix}_startDate_${roleIndex}">Start date:</label>
            <input type="date" class="startDate" id="${personPrefix}_startDate_${roleIndex}" name="${personPrefix}_startDate_${roleIndex}" /></li>
        <li><label for="${personPrefix}_endDate_${roleIndex}">End date:</label>
            <input type="date" class="endDate" id="${personPrefix}_endDate_${roleIndex}" name="${personPrefix}_endDate_${roleIndex}" /></li>
        <li><input type="button" id="${personPrefix}_role_remove_${roleIndex}" value="X" title="Remove role" /></li>
    `;
    roleButtonGroup.after(ul);

    document.querySelector(`#${personPrefix}_role_remove_${roleIndex}`)
        .addEventListener('click', () => removeRole(personPrefix, roleIndex));

    roleIndexNode.value = roleIndex + 1;
}

function removeRole(personPrefix, roleIndex) {
    document.querySelector(`#${personPrefix}_role_${roleIndex}`).remove();
}

function resetForm() {
    removePersons('author');
    removePersons('contributor');
    // Reset the list of selected licenses
    document.getElementById("selected-licenses").innerHTML = '';

    // Reset the form after deleting elements, so nbPersons doesn't get
    // reset before it's read.
    document.querySelector('#inputForm').reset();
}

function fieldToLower(event) {
    event.target.value = event.target.value.toLowerCase();
}

function initCallbacks() {
    document.querySelector('#license')
        .addEventListener('change', validateLicense);

    document.querySelector('#generateCodemetaV2').disabled = false;
    document.querySelector('#generateCodemetaV2')
        .addEventListener('click', () => generateCodemeta("2.0"));

    document.querySelector('#generateCodemetaV3').disabled = false;
    document.querySelector('#generateCodemetaV3')
        .addEventListener('click', () => generateCodemeta("3.0"));

    document.querySelector('#resetForm')
        .addEventListener('click', resetForm);

    document.querySelector('#validateCodemeta').disabled = false;
    document.querySelector('#validateCodemeta')
        .addEventListener('click', () => parseAndValidateCodemeta(true));

    document.querySelector('#importCodemeta').disabled = false;
    document.querySelector('#importCodemeta')
        .addEventListener('click', importCodemeta);

    document.querySelector('#inputForm')
        .addEventListener('change', () => generateCodemeta());

    document.querySelector('#developmentStatus')
        .addEventListener('change', fieldToLower);

    initPersons('author', 'Author');
    initPersons('contributor', 'Contributor');
}

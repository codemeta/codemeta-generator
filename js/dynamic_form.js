/**
 * Copyright (C) 2019-2025  The Software Heritage developers
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
    const fieldset = document.createElement("fieldset")
    fieldset.classList.add("person");
    fieldset.classList.add("leafFieldset");
    fieldset.id = personPrefix;

    fieldset.innerHTML = `
        <legend>${legend}</legend>
        <div class="moveButtons">
            <input type="button" id="${personPrefix}_moveToLeft" value="<" class="moveToLeft"
                title="Moves this person to the left." />
            <input type="button" id="${personPrefix}_remove" value="X" class="removePerson"
                title="Removes this person." />
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
    const personPrefix = `${prefix}_${id}`;
    const fieldset = createPersonFieldset(personPrefix, legend);

    container.appendChild(fieldset);

    // Use ID selector to attach handlers that compute the current fieldset
    // ID at click time, so renaming the IDs (when renumbering persons)
    // won't break the handlers.
    fieldset.querySelector('[id$="_moveToLeft"]')
        .addEventListener('click', () => movePerson(prefix, fieldset.id, 'left'));
    fieldset.querySelector('[id$="_moveToRight"]')
        .addEventListener('click', () => movePerson(prefix, fieldset.id, 'right'));
    fieldset.querySelector('[id$="_remove"]')
        .addEventListener('click', () => removePerson(prefix, fieldset.id));
    fieldset.querySelector('[id$="_role_add"]')
        .addEventListener('click', () => addRole(fieldset.id));
}

function movePerson(prefix, personPrefix, direction) {
    const container = document.querySelector(`#${prefix}_container`);
    if (!container) return;

    const persons = Array.from(container.querySelectorAll('.person'));
    const len = persons.length;
    const currentIndex = persons.findIndex(function (p) { return p.id === personPrefix; });
    if (currentIndex === -1 || len <= 1) return;

    const targetIndex = (direction === 'left') ? ((currentIndex - 1 + len) % len) : ((currentIndex + 1) % len);
    if (targetIndex === currentIndex) return;

    const swapped = persons.slice();
    const tmp = swapped[targetIndex];
    swapped[targetIndex] = swapped[currentIndex];
    swapped[currentIndex] = tmp;

    // Re-append nodes in new order
    const frag = document.createDocumentFragment();
    swapped.forEach(function (p) { frag.appendChild(p); });
    container.appendChild(frag);

    renumberPersons(prefix);
    generateCodemeta();
}

function addPerson(prefix, legend) {
    const container = document.querySelector(`#${prefix}_container`);
    const personId = getNbPersons(prefix) + 1;

    addPersonWithId(container, prefix, legend, personId);
    renumberPersons(prefix);
    return personId;
}

function removePerson(prefix, personPrefix) {
    const container = document.querySelector(`#${prefix}_container`);
    if (!container) return;

    if (personPrefix) {
        const fs = document.querySelector(`#${personPrefix}`);
        if (!fs) return;
        fs.remove();
    } else {
        // If no personPrefix is provided, remove the last person
        const persons = Array.from(container.querySelectorAll('.person'));
        if (persons.length === 0) return;
        const last = persons[persons.length - 1];
        last.remove();
    }

    renumberPersons(prefix);
    generateCodemeta();
}

function renumberPersons(prefix) {
    // Assume id pattern of "prefix_index_suffix"
    function idSuffix(id) {
        if (!id) return '';
        const parts = id.split('_');
        if (parts.length <= 1) return id;
        return parts.slice(2).join('_');
    }

    const container = document.querySelector(`#${prefix}_container`);
    if (!container) return;

    const persons = Array.from(container.querySelectorAll('.person'));
    for (let i = 0; i < persons.length; i++) {
        const fs = persons[i];
        const n = i + 1;
        const newPersonPrefix = `${prefix}_${n}`;

        fs.id = newPersonPrefix;

        const legend = fs.querySelector('legend');
        if (legend) {
            let base = legend.textContent.split('#')[0].trim();
            if (base === '') base = legend.textContent;
            legend.textContent = base + ' #' + n;
        }

        // Update descendant ids and names
        Array.from(fs.querySelectorAll('[id]')).forEach(function (el) {
            const oldId = el.id;
            const suffix = idSuffix(oldId);

            el.id = `${newPersonPrefix}_${suffix}`;

            if (el.name) {
                const nameSuffix = idSuffix(el.name);
                el.name = `${newPersonPrefix}_${nameSuffix}`;
            }
        });

        // Update label 'for' attributes
        Array.from(fs.querySelectorAll('label[for]')).forEach(function (label) {
            if (!label.htmlFor) return;
            const forSuffix = idSuffix(label.htmlFor);
            label.htmlFor = `${newPersonPrefix}_${forSuffix}`;
        });
    }

    setNbPersons(prefix, persons.length);
}

// Initialize a group of persons (authors, contributors) on page load.
// Useful if the page is reloaded.
function initPersons(prefix, legend) {
    const container = document.querySelector(`#${prefix}_container`);
    if (!container) return;

    const existing = Array.from(container.querySelectorAll('.person'));
    if (existing.length > 0) {
        renumberPersons(prefix);
        return;
    }

    const nbPersons = getNbPersons(prefix);
    for (let i = 0; i < nbPersons; i++) {
        addPerson(prefix, legend);
    }
}

function removePersons(prefix) {
    const nbPersons = getNbPersons(prefix);

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

    ul.querySelector(`[id$="_role_remove_${roleIndex}"]`)
        .addEventListener('click', (e) => {
            const pid = e.currentTarget.closest?.('.person')?.id;
            removeRole(pid, roleIndex);
        });

    roleIndexNode.value = roleIndex + 1;

    return roleIndex;
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
    // To make sure the selection of a license from the datalist
    // works more predictably across browsers, we listen to
    // 'input', 'change', and 'keydown' events for the license field.
    // This should work with Firefox, Safari, and Chrome-based browsers.

    // In Firefox datalist selection without Enter press does not trigger
    // 'change' event, so we need to listen to 'input' event to catch
    // a selection with mouse click.
    document.querySelector('#license')
        .addEventListener('input', validateLicense);
    document.querySelector('#license')
        .addEventListener('change', validateLicense);
    // Safari needs 'keydown' to catch Enter press when datalist is shown
    document.querySelector('#license')
        .addEventListener('keydown', validateLicense);

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

    document.querySelector('#downloadCodemeta input').disabled = false;
    document.querySelector('#downloadCodemeta input')
        .addEventListener('click', downloadCodemeta);

    document.querySelector('#inputForm')
        .addEventListener('change', () => generateCodemeta());

    document.querySelector('#developmentStatus')
        .addEventListener('change', fieldToLower);

    initPersons('author', 'Author');
    initPersons('contributor', 'Contributor');
}

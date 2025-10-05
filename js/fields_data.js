/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

var SPDX_LICENSES = null;
var SPDX_LICENSE_IDS = null;

const loadSpdxData = async () => {
    const licensesResponse = await fetch("./data/spdx/licenses.json");
    const licenseList = await licensesResponse.json();
    return licenseList.licenses;
}

function initSpdx() {
    var datalist = document.getElementById('licenses');

    SPDX_LICENSES.forEach(function (license) {
        var option = document.createElement('option');
        option.value = license['licenseId'];
        option.label = `${license['licenseId']}: ${license['name']}`;
        datalist.appendChild(option);
    });

}

function insertLicenseElement(licenseId) {
    let selectedLicenses = document.getElementById("selected-licenses");
    let newLicense = document.createElement("div");
    newLicense.className = "selected-license";
    newLicense.innerHTML = `
        <span class="license-id">${licenseId}</span>
        <button type="button" class="remove-license" onclick="removeLicense(this)">Remove</button>
        `;

    selectedLicenses.appendChild(newLicense);
    return newLicense;
}

function validateLicense(e) {
    var licenseField = document.getElementById('license');
    licenseField.setCustomValidity('');

    var license = licenseField.value.trim();
    if (!license || !SPDX_LICENSE_IDS) {
        return;
    }

    // Datalist can show case-insensitive matches during typing,
    // but to insert we need the value with correct casing.
    // Do casing correction here to allow user to type in any casing
    // and hit Enter once to insert the license immediately.    
    // Do this only on 'change' event (change is committed) or on 'keydown'
    // event of Enter/Tab key to avoid interfering while user is still typing.
    if ((e.type === "change") ||
        (e.type === "keydown" && (e.key === "Enter" || e.key === "Tab"))) {
        const match = SPDX_LICENSE_IDS.find(id =>
            id.toLowerCase() === license.toLowerCase());
        if (match) {
            license = match;
            licenseField.value = match;
        }
    }
    // Avoid premature validation/insertion
    // (e.g., immediately insert "MIT" when user in between typing "MIT-0")
    else if (e.key || (e.inputType && e.inputType.startsWith("insertText"))) {
        return;
    }

    if (SPDX_LICENSE_IDS.indexOf(license) == -1) {
        licenseField.setCustomValidity('Unknown license id');
    }
    else {
        licenseField.value = "";
        const selectedLicenses = document.getElementById("selected-licenses");
        const duplicated = Array.from(selectedLicenses.getElementsByClassName("license-id"))
            .some(el => el.textContent === license);
        if (!duplicated) {
            insertLicenseElement(license);
            generateCodemeta();
        }
        // Chrome: Detaching and reattaching the datalist of license field,
        // to hide the datalist popup after insertion.
        licenseField.removeAttribute('list');
        setTimeout(() => {
            licenseField.setAttribute('list', 'licenses');
        }, 0);
    }
}

function removeLicense(btn) {
    btn.parentElement.remove();
    generateCodemeta();
}

function initFields() {
    initSpdx();
}

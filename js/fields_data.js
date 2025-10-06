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
    licenseField.setCustomValidity(''); // Reset previous message

    var license = licenseField.value.trim();
    if (!license || !SPDX_LICENSE_IDS) {
        return;
    }

    // Only perform insertion/validation when the user explicitly confirms
    // their choice (change event, or keydown Enter/Tab).
    // Some browsers/selection actions can trigger an 'input' event that is
    // not a simple text insertion (e.g. a datalist selection via mouse); we
    // treat those as confirmation too (inputType !== 'insertText').
    var confirmed = false;
    if (e.type === "change") {
        confirmed = true;
    } else if (e.type === "keydown" && (e.key === "Enter" || e.key === "Tab")) {
        confirmed = true;
    } else if (e.type === "input") {
        // inputType may be undefined in some browsers; only treat as
        // confirmation when it's present and not a plain text insertion.
        if (e.inputType && e.inputType !== 'insertText') {
            confirmed = true;
        } else {
            // Plain character typing (insertText) — do not validate/insert yet
            return;
        }
    } else {
        // Other events (compositionupdate, etc.) — don't proceed
        return;
    }

    // If confirmed, correct casing to the canonical SPDX license ID when
    // possible. This will allow user to type in any casing and hit Enter once
    // to insert the license immediately.    
    if (confirmed) {
        const match = SPDX_LICENSE_IDS.find(id =>
            id.toLowerCase() === license.toLowerCase());
        if (match) {
            license = match;
            licenseField.value = match;
        }
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

        // Chrome: Detach/re-attach the datalist to hide the popup after insertion.
        var ua = (navigator.userAgent || '');
        var isChrome = /Chrome/.test(ua) && !/Edg|OPR|Brave|CriOS/.test(ua);
        if (isChrome) {
            licenseField.removeAttribute('list');
            setTimeout(() => {
               licenseField.setAttribute('list', 'licenses');
            }, 0);
        }
    }
}

function removeLicense(btn) {
    btn.parentElement.remove();
    generateCodemeta();
}

function initFields() {
    initSpdx();
}

/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

var SPDX_LICENSES = null;
var SPDX_LICENSE_IDS = null;


function initSpdx() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './data/spdx/licenses.json', true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            SPDX_LICENSES = JSON.parse(xhr.response)['licenses'];

            var datalist = document.getElementById('licenses');

            SPDX_LICENSES.forEach(function (license) {
                var option = document.createElement('option');
                option.value = license['licenseId'];
                option.label = `${license['licenseId']}: ${license['name']}`;
                datalist.appendChild(option);
            });
            SPDX_LICENSE_IDS = SPDX_LICENSES.map(function (license) {
                return license['licenseId'];
            })
        }
    }
    xhr.send();
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
    // continue only if Enter/Tab key is pressed
    if (e.keyCode && e.keyCode !== 13 && e.keyCode !== 9) {
        return;
    }
    // Note: For some reason e.keyCode is undefined when Enter/Tab key is pressed.
    // Maybe it's because of the datalist. But the above condition should
    // work in either case.

    var licenseField = document.getElementById('license');
    var license = licenseField.value;
    if (SPDX_LICENSE_IDS !== null && SPDX_LICENSE_IDS.indexOf(license) == -1) {
        licenseField.setCustomValidity('Unknown license id');
    }
    else {
        insertLicenseElement(license);

        licenseField.value = "";
        licenseField.setCustomValidity('');
        generateCodemeta();
    }
}

function removeLicense(btn) {
    btn.parentElement.remove();
    generateCodemeta();
}

function initFieldsData() {
    initSpdx();
}

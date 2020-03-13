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

function validateLicense() {
    var licenseField = document.getElementById('license');
    var license = licenseField.value;
    if (SPDX_LICENSE_IDS !== null && SPDX_LICENSE_IDS.indexOf(license) == -1) {
        licenseField.setCustomValidity('Unknown license id');
    }
    else {
        licenseField.setCustomValidity('');
    }

}

function initFieldsData() {
    initSpdx();
}

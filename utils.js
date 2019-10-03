/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

function getNbPersons(prefix) {
    var nbField = document.querySelector(`#${prefix}_nb`);
    return parseInt(nbField.value, 10);
}

/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assetTransfer = require('./lib/sensorDataContract');

module.exports.AssetTransfer = assetTransfer;
module.exports.contracts = [assetTransfer];

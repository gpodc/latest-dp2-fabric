/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');

class SensorDataContract extends Contract {

    // Initialize some example data in the ledger
    async InitLedger(ctx) {
        const sensors = [
            {
                ID: 'sensor1',
                sensorID: 101,
                meterReading: 25.5,
                timestamp: new Date().toISOString(),
            },
            {
                ID: 'sensor2',
                sensorID: 102,
                meterReading: 30.2,
                timestamp: new Date().toISOString(),
            },
        ];

        for (const sensor of sensors) {
            sensor.docType = 'sensor';
            await ctx.stub.putState(sensor.ID, Buffer.from(stringify(sortKeysRecursive(sensor))));
        }
    }

    // CreateSensorData creates a new sensor data entry
    async CreateSensorData(ctx, id, sensorID, meterReading, timestamp) {
        const exists = await this.SensorDataExists(ctx, id);
        if (exists) {
            throw new Error(`The sensor data ${id} already exists`);
        }

        const sensorData = {
            ID: id,
            sensorID: parseInt(sensorID),
            meterReading: parseFloat(meterReading),
            timestamp,
            docType: 'sensor',
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(sensorData))));
        return JSON.stringify(sensorData);
    }

    // ReadSensorData returns the sensor data stored in the world state with given id.
    async ReadSensorData(ctx, id) {
        const sensorDataJSON = await ctx.stub.getState(id); // get the sensor data from chaincode state
        if (!sensorDataJSON || sensorDataJSON.length === 0) {
            throw new Error(`The sensor data ${id} does not exist`);
        }
        return sensorDataJSON.toString();
    }

    // UpdateSensorData updates an existing sensor data in the world state with provided parameters.
    async UpdateSensorData(ctx, id, sensorID, meterReading, timestamp) {
        const exists = await this.SensorDataExists(ctx, id);
        if (!exists) {
            throw new Error(`The sensor data ${id} does not exist`);
        }

        const updatedSensorData = {
            ID: id,
            sensorID: parseInt(sensorID),
            meterReading: parseFloat(meterReading),
            timestamp,
            docType: 'sensor',
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedSensorData))));
        return JSON.stringify(updatedSensorData);
    }

    // DeleteSensorData deletes an given sensor data from the world state.
    async DeleteSensorData(ctx, id) {
        const exists = await this.SensorDataExists(ctx, id);
        if (!exists) {
            throw new Error(`The sensor data ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
    }

    // SensorDataExists returns true when sensor data with given ID exists in world state.
    async SensorDataExists(ctx, id) {
        const sensorDataJSON = await ctx.stub.getState(id);
        return sensorDataJSON && sensorDataJSON.length > 0;
    }

    // GetAllSensorData returns all sensor data found in the world state.
    async GetAllSensorData(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                if (record.docType === 'sensor') {
                    allResults.push({ Key: result.value.key, Record: record });
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
    
    async GetLatestSensorReadings(ctx) {
        const allResults = [];
        const uniqueSensorIDs = new Set();
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                if (record.docType === 'sensor' && !uniqueSensorIDs.has(record.sensorID)) {
                    allResults.push(record);
                    uniqueSensorIDs.add(record.sensorID);
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    }
}

module.exports = SensorDataContract;

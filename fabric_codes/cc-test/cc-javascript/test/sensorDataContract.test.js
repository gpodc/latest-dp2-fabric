/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const chai = require('chai');
const expect = chai.expect;
const { ChaincodeMockStub, Transform } = require('fabric-shim-test-utils');
const SensorDataContract = require('./SensorDataContract');

describe('SensorDataContract Tests', () => {
    let mockStub;
    let contract;

    beforeEach(async () => {
        contract = new SensorDataContract();
        mockStub = new ChaincodeMockStub('SensorDataMockStub', contract);
        await mockStub.mockInit('tx1', []);
        await contract.InitLedger(mockStub);
    });

    describe('Test CreateSensorData', () => {
        it('should create a sensor data entry', async () => {
            const createResponse = await mockStub.mockInvoke('tx2', ['CreateSensorData', 'sensor3', '103', '28.4', new Date().toISOString()]);
            expect(createResponse.status).to.equal(200);
            expect(JSON.parse(createResponse.payload.toString())).to.deep.include({
                ID: 'sensor3',
                sensorID: 103,
                meterReading: 28.4
            });
        });

        it('should fail to create a sensor data entry with an existing ID', async () => {
            await mockStub.mockInvoke('tx2', ['CreateSensorData', 'sensor1', '101', '29.5', new Date().toISOString()]);
            const createResponse = await mockStub.mockInvoke('tx3', ['CreateSensorData', 'sensor1', '101', '29.5', new Date().toISOString()]);
            expect(createResponse.status).to.equal(500);
        });
    });

    describe('Test ReadSensorData', () => {
        it('should read a sensor data entry', async () => {
            const readResponse = await mockStub.mockInvoke('tx4', ['ReadSensorData', 'sensor1']);
            expect(readResponse.status).to.equal(200);
            expect(JSON.parse(readResponse.payload.toString())).to.deep.include({
                sensorID: 101,
                meterReading: 25.5
            });
        });

        it('should fail to read a non-existing sensor data', async () => {
            const readResponse = await mockStub.mockInvoke('tx5', ['ReadSensorData', 'sensor100']);
            expect(readResponse.status).to.equal(500);
        });
    });
});

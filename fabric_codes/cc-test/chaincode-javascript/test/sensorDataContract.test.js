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
            const createResponse = await mockStub.mockInvoke('tx2', ['CreateSensorData', 'data_3', '103', '28.4', new Date().toISOString()]);
            expect(createResponse.status).to.equal(200);
            expect(JSON.parse(createResponse.payload.toString())).to.deep.include({
                ID: 'data_3',
                sensorID: 103,
                meterReading: 28.4
            });
        });

        it('should fail to create a sensor data entry with an existing ID', async () => {
            await mockStub.mockInvoke('tx2', ['CreateSensorData', 'data_1', '101', '29.5', new Date().toISOString()]);
            const createResponse = await mockStub.mockInvoke('tx3', ['CreateSensorData', 'data_1', '101', '29.5', new Date().toISOString()]);
            expect(createResponse.status).to.equal(500);
        });
    });

    describe('Test ReadSensorData', () => {
        it('should read a sensor data entry', async () => {
            const readResponse = await mockStub.mockInvoke('tx4', ['ReadSensorData', 'data_1']);
            expect(readResponse.status).to.equal(200);
            expect(JSON.parse(readResponse.payload.toString())).to.deep.include({
                ID: 'data_1',
                sensorID: 101,
                meterReading: 25.5
            });
        });

        it('should fail to read a non-existing sensor data', async () => {
            const readResponse = await mockStub.mockInvoke('tx5', ['ReadSensorData', 'sensor100']);
            expect(readResponse.status).to.equal(500);
        });
    });

    describe('Test UpdateSensorData', () => {
        it('should update a sensor data entry', async () => {
            const updateResponse = await mockStub.mockInvoke('tx6', ['UpdateSensorData', 'data_1', '101', '32.0', new Date().toISOString()]);
            expect(updateResponse.status).to.equal(200);
            expect(JSON.parse(updateResponse.payload.toString())).to.deep.include({
                ID: 'data_1',
                sensorID: 101,
                meterReading: 32.0
            });
        });

        it('should fail to update a non-existing sensor data', async () => {
            const updateResponse = await mockStub.mockInvoke('tx7', ['UpdateSensorData', 'sensor100', '101', '32.0', new Date().toISOString()]);
            expect(updateResponse.status).to.equal(500);
        });
    });

    describe('Test DeleteSensorData', () => {
        it('should delete a sensor data entry', async () => {
            const deleteResponse = await mockStub.mockInvoke('tx8', ['DeleteSensorData', 'data_1']);
            expect(deleteResponse.status).to.equal(200);
            const readResponse = await mockStub.mockInvoke('tx9', ['ReadSensorData', 'data_1']);
            expect(readResponse.status).to.equal(500);
        });

        it('should fail to delete a non-existing sensor data', async () => {
            const deleteResponse = await mockStub.mockInvoke('tx10', ['DeleteSensorData', 'sensor100']);
            expect(deleteResponse.status).to.equal(500);
        });
    });

    describe('Test GetAllSensorData', () => {
        it('should return all sensor data entries', async () => {
            const allSensorData = await mockStub.mockInvoke('tx11', ['GetAllSensorData']);
            expect(allSensorData.status).to.equal(200);
            const result = JSON.parse(allSensorData.payload.toString());
            expect(result).to.be.an('array').that.is.not.empty;
            expect(result[0]).to.deep.include({
                ID: 'data_1',
                sensorID: 101,
                meterReading: 25.5
            });
        });
    });

    describe('Test GetLatestSensorReadings', () => {
        it('should return the latest readings for each sensor', async () => {
            await mockStub.mockInvoke('tx12', ['CreateSensorData', 'data_3', '101', '27.0', new Date().toISOString()]);
            const latestReadings = await mockStub.mockInvoke('tx13', ['GetLatestSensorReadings']);
            expect(latestReadings.status).to.equal(200);
            const result = JSON.parse(latestReadings.payload.toString());
            expect(result).to.be.an('array').that.is.not.empty;
            // Assuming data_3 was the latest reading for sensorID 101
            expect(result.find(r => r.sensorID === 101)).to.deep.include({
                ID: 'data_3',
                sensorID: 101,
                meterReading: 27.0
            });
        });
    });
});

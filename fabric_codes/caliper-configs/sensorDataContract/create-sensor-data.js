'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class CreateSensorDataWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 6000;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    async submitTransaction() {
        // Unique sensor ID for each transaction
        this.txIndex++;
        let ID = 'data_' + this.txIndex.toString() + '_' + this.workerIndex;
        let sensorID = '104';
        let kwhReading = (Math.random() * 100).toFixed(2); // Generate a kwh meter reading
        let ampReading = (Math.random() * 100).toFixed(2); // Generate a amp meter reading
        let timestamp = new Date().toISOString();

        let args = {
            contractId: 'sensorDataContract',
            contractFunction: 'CreateSensorData',
            contractVersion: 'v1',
            // invokerIdentity: 'User1',
            contractArguments: [ID, sensorID, kwhReading, ampReading,timestamp],
            timeout: 30
        };

        await this.sutAdapter.sendRequests(args);
    }
    
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new CreateSensorDataWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

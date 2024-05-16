'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class ReadSensorDataWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 6000;
        this.limitIndex = 0;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        this.limitIndex = this.roundArguments.assets;

    }

    async submitTransaction() {
        this.txIndex++;
        let ID = 'data_' + this.txIndex.toString() + '_' + this.workerIndex;

        let args = {
            contractId: 'sensorDataContract',
            contractFunction: 'ReadSensorData',
            contractVersion: 'v1',
            // invokerIdentity: 'User1',
            contractArguments: [ID],
            readOnly: true,
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
    return new ReadSensorDataWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;

/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';
const express = require('express');
const app = express();
const port = 3001;

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const { buildCCPOrg1, buildWallet } = require('./AppUtil.js');
// const channelName = process.env.CHANNEL_NAME || 'mychannel';
// const chaincodeName = process.env.CHAINCODE_NAME || 'basic';
// const SensorDataContract = require('../fabric_codes/cc-test/chaincode-javascript/lib/sensorDataContract.js');
const channelName = 'c1';
const chaincodeName = 'sensorDataContract1';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'node-app-user1';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function latestReading() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath, org1UserId);

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: false } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);

			// Let's try a query type operation (function).
			// This will be sent to just one peer and the results will be shown.
			console.log('\n--> Evaluate Transaction: GetLatestSensorReadings, function returns all the current sensor readings based on sensorID on the ledger');
			let result = await contract.evaluateTransaction('GetLatestSensorReadings');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            const data = JSON.parse(result.toString())
            
            // Disconnect from the gateway when the application is closing
            await gateway.disconnect();

			return data;
        } catch (error) {
            console.error(`******** FAILED to query data: ${error}`);
            process.exit(1);
        }
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
		process.exit(1);
	}
}

async function allData() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPOrg1();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		// const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath, org1UserId);

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: false } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);

			// Let's try a query type operation (function).
			// This will be sent to just one peer and the results will be shown.
			console.log('\n--> Evaluate Transaction: GetAllSensorData, function returns all sensor readings on the ledger');
			let result = await contract.evaluateTransaction('GetAllSensorData');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

            const data = JSON.parse(result.toString())
            
            // Disconnect from the gateway when the application is closing
            await gateway.disconnect();

			return data;
        } catch (error) {
            console.error(`******** FAILED to query data: ${error}`);
            process.exit(1);
        }
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
		process.exit(1);
	}
}

app.get('/data', async (req, res) => {
	  const data = await latestReading();
	res.json(data);
	});
	
app.get('/alldata', async (req, res) => {
	  const data = await allData();
	res.json(data);
	});
	
app.listen(port, () => {
	console.log(`Middleware service listening at http://node-app-service1:${port}`);
	console.log(`Data query can now be accessed at http://node-app-service1:${port}/data`);
	// console.log(`Middleware service listening at http://localhost:${port}`);
	// console.log(`Data query can now be accessed at http://localhost:${port}/data`);
});

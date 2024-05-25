/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');

exports.buildCCPOrg1 = () => {
	// load the common connection configuration file
	// const ccpPath = path.resolve(__dirname, '..', 'fabric_codes', 'test-net', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
	const ccpPath = path.resolve(__dirname,'/tmp', 'connection-app-org1.json');
	const fileExists = fs.existsSync(ccpPath);
	if (!fileExists) {
		throw new Error(`no such file or directory: ${ccpPath}`);
	}
	const contents = fs.readFileSync(ccpPath, 'utf8');

	// build a JSON object from the file contents
	const ccp = JSON.parse(contents);

	console.log(`Loaded the network configuration located at ${ccpPath}`);
	return ccp;
};

exports.buildWallet = async (Wallets, walletPath, userName) => {
	// Create a new  wallet : Note that wallet is for managing identities.
	let wallet;
	if (walletPath) {
		wallet = await Wallets.newFileSystemWallet(walletPath);
		console.log(`Built a file system wallet at ${walletPath}`);
	} else {
		wallet = await Wallets.newInMemoryWallet();
		console.log('Built an in memory wallet');
	}

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get(userName);
    if (!identity) {
      console.log('An identity for the user', userName, 'does not exist in the wallet');
    //   return wallet;
    }
	try {
		// // Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), 'wallet');
		// const wallet = await Wallets.newFileSystemWallet(walletPath);
		// console.log(`Wallet path: ${walletPath}`);
	
		// Check to see if we've already imported the user.
		const userExists = await wallet.get(userName);
		if (userExists) {
		  console.log('An identity for the user', userName, 'already exists in the wallet');
		  return wallet;
		}
	
		// Path to the user's certificate and private key
		const certPath = path.resolve(__dirname, './organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem');
		const keyPath = path.resolve(__dirname, './organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/priv_sk');
	
		// Read the certificate and private key files
		const cert = fs.readFileSync(certPath).toString();
		const key = fs.readFileSync(keyPath).toString();
	
		// Create the identity object
		const x509Identity = {
		  credentials: {
			certificate: cert,
			privateKey: key,
		  },
		  mspId: 'Org1MSP',
		  type: 'X.509',
		};
	
		// Import the identity into the wallet
		await wallet.put(userName, x509Identity);
		console.log('Successfully imported', userName, 'into the wallet');
	
	  } catch (error) {
		console.error(`Failed to import identity: ${error}`);
		process.exit(1);
	  }
	return wallet;
};

exports.prettyJSONString = (inputString) => {
	if (inputString) {
		 return JSON.stringify(JSON.parse(inputString), null, 2);
	}
	else {
		 return inputString;
	}
}


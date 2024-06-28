# fabric_codes

Before running scripts

Change path to bin in network.sh

    export PATH=$PATH:path/to/your/directory/bin

Before deploying nodejs chaincode

    cd ../cc-test/chaincode-javascript
    npm install
    
Before invoking chaincode

    export FABRIC_CFG_PATH=$PWD/../config/ (path containing core, orderer, configtx.yaml)

set env variables to Org

# config
*scripts are for creating only one organization per channel
*double check paths

# Folder Structure
    explorer
        ├── currentFlowNodeRed.json
        │   ├── fabric_test.json
        │   ├── org1.json
        │   ├── org2.json
        │   └── org3.json
        ├── config-test.json
        ├── config.json
        └── docker-compose.yaml
            
    project2
        ├── currentFlowNodeRed.json
        └── fabric_codes
            ├── asset-transfer-basic (fabric-samples)
            ├── bin (fabric-samples)
            ├── caliper-benchmarks (git clone)
            ├── cc-test (fabric-samples-based chaincode)
            │   └── chaincode-javascript
            │   │   ├── index.js
            │   │   ├── lib
            │   │   │   └── sensorDataContract.js
            │   │   ├── package.json
            │   │   └── test
            │   │   │   └── sensorDataContract.test.js
            ├── config
            │   ├── configtx.yaml
            │   ├── core.yaml
            │   └── orderer.yaml
            └── test-net
                ├── configtx
                │   ├── configtx.yaml
                │   ├── core.yaml
                │   └── orderer.yaml
                ├── docker
                │   └── docker-compose-test-net.yaml
                ├── network.sh
                ├── organizations
                │   └── cryptogen
                │       └── crypto-config.yaml
                └── scripts
                    ├── ccutils.sh
                    ├── createChannel.sh
                    ├── deployCC.sh
                    ├── envVar.sh
                    ├── packageCC.sh
                    ├── setAnchorPeer.sh
                    └── utils.sh


# COMMANDS

compose containers for the network and generate crypto materials

    ./network.sh up
    
removes all used containers and brings down the network

    ./network.sh down

creates channel for peers, joins peers - $CHANNEL_NAME accepts string

    ./network.sh createChannel -c channel_name -asOrg org_number
    
# Chaincode sensorDataContract commands

Package and install chaincode 'sensorDataContract' in channel 'c1'. as org1

    ./network.sh deployCC -c c1 -ccn sensorDataContract1 -ccp ../cc-test/chaincode-javascript -ccl javascript -asOrg 1

Initialize chaincode 'sensorDataContract' on channel 'c1' (asOrg 1) *must set env org.

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.iot-fabric.com --tls --cafile "${PWD}/organizations/ordererOrganizations/iot-fabric.com/orderers/orderer.iot-fabric.com/msp/tlscacerts/tlsca.iot-fabric.com-cert.pem" -C c1 -n sensorDataContract1 --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/peers/peer0.org1.iot-fabric.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

To verify if chaincode 'sensorDataContract' is installed on the Fabric network

    peer lifecycle chaincode querycommitted --channelID c1 --name sensorDataContract1 --output json

Peer chaincode query function 'GetAllSensorData' in chaincode sensorDataContract 

    peer chaincode query -C c1 -n sensorDataContract1 -c '{"Args":["GetAllSensorData"]}'

Peer chaincode query function 'GetLatestSensorReadings' in chaincode sensorDataContract

    peer chaincode query -C c1 -n sensorDataContract1 -c '{"Args":["GetLatestSensorReadings"]}'

Peer chaincode invoke function 'ReadSensorData' in chaincode 'sensorDataContract' in channel 'c1' (asOrg 1)

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.iot-fabric.com --tls --cafile "${PWD}/organizations/ordererOrganizations/iot-fabric.com/orderers/orderer.iot-fabric.com/msp/tlscacerts/tlsca.iot-fabric.com-cert.pem" -C c1 -n sensorDataContract1 --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/peers/peer0.org1.iot-fabric.com/tls/ca.crt" -c '{"function":"ReadSensorData","Args":["data_1"]}'

Peer chaincode invoke function 'CreateSensorData' in chaincode 'sensorDataContract' in channel 'c1' (asOrg 1)

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.iot-fabric.com --tls --cafile "${PWD}/organizations/ordererOrganizations/iot-fabric.com/orderers/orderer.iot-fabric.com/msp/tlscacerts/tlsca.iot-fabric.com-cert.pem" -C c1 -n sensorDataContract1 --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/peers/peer0.org1.iot-fabric.com/tls/ca.crt" -c '{"function":"CreateSensorData","Args":["data_3","103","62.1","2024-05-14T02:02:00Z"]}'

    


# Chaincode basic commands (asset-transfer-basic)
    
Package and install chaincode 'basic' in channel 'c1' as org1.

    ./network.sh deployCC -c c1 -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go -asOrg 1

#To initialize chaincode 'basic' on channel 'c1' (OLD setup).

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.iot-fabric.com --tls --cafile "${PWD}/organizations/ordererOrganizations/iot-fabric.com/orderers/orderer.iot-fabric.com/msp/tlscacerts/tlsca.iot-fabric.com-cert.pem" -C c1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/peers/peer0.org1.iot-fabric.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.iot-fabric.com/peers/peer0.org2.iot-fabric.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

#UPDATE to initialize chaincode 'basic' on channel 'c1' (asOrg 1) *must set env org.

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.iot-fabric.com --tls --cafile "${PWD}/organizations/ordererOrganizations/iot-fabric.com/orderers/orderer.iot-fabric.com/msp/tlscacerts/tlsca.iot-fabric.com-cert.pem" -C c1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/peers/peer0.org1.iot-fabric.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'


#Peer chaincode query function 'GetAllAssets' in chaincode 'basic' in channel 'c1' *must set env org1

    peer chaincode query -C c1 -n basic -c '{"Args":["GetAllAssets"]}'

#Peer chaincode invoke function 'TransferAsset' in chaincode 'basic' in channel 'c1' as org1 (OLD setup)

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.iot-fabric.com --tls --cafile "${PWD}/organizations/ordererOrganizations/iot-fabric.com/orderers/orderer.iot-fabric.com/msp/tlscacerts/tlsca.iot-fabric.com-cert.pem" -C c1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/peers/peer0.org1.iot-fabric.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.iot-fabric.com/peers/peer0.org2.iot-fabric.com/tls/ca.crt" -c '{"function":"TransferAsset","Args":["asset6","Christopher"]}'

#UPDATE Peer chaincode invoke function 'TransferAsset' in chaincode 'basic' in channel 'c1' (asOrg 1)

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.iot-fabric.com --tls --cafile "${PWD}/organizations/ordererOrganizations/iot-fabric.com/orderers/orderer.iot-fabric.com/msp/tlscacerts/tlsca.iot-fabric.com-cert.pem" -C c1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/peers/peer0.org1.iot-fabric.com/tls/ca.crt" -c '{"function":"TransferAsset","Args":["asset6","Christopher"]}'

# Env Variables
    
#Env variables to access cli as Org1

    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/peers/peer0.org1.iot-fabric.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.iot-fabric.com/users/Admin@org1.iot-fabric.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
#Env Org2

    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.iot-fabric.com/peers/peer0.org2.iot-fabric.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.iot-fabric.com/users/Admin@org2.iot-fabric.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
#ENV Org3

    export CORE_PEER_LOCALMSPID=Org3MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.iot-fabric.com/users/Admin@org3.iot-fabric.com/msp
    export CORE_PEER_ADDRESS=localhost:11051

#org3 update:

    compose file
    configtx
    crypto-config
    createChannel
    deployCC
    --COMPLETED--


# NODERED

-Gateway -> Peer -> TLS
base64 project2/fabric_codes/test-net/organizations/peerOrganizations/org1.iot-fabric.com/users/Admin@org1.iot-fabric.com/msp/tlscacerts/tlsca.org1.iot-fabric.com-cert.pem

-Identity -> Cert
base64 project2/fabric_codes/test-net/organizations/peerOrganizations/org1.iot-fabric.com/users/Admin@org1.iot-fabric.com/msp/signcerts/Admin@org1.iot-fabric.com-cert.pem

-Identity -> Private Key
base64 project2/fabric_codes/test-net/organizations/peerOrganizations/org1.iot-fabric.com/users/Admin@org1.iot-fabric.com/msp/keystore/priv_sk

# Caliper

HYPERLEDGER CALIPER
For setup: https://hyperledger.github.io/caliper/v0.6.0/installing-caliper/ 

(same directory as fabric-samples )

    git clone https://github.com/hyperledger/caliper-benchmarks.git
    cd caliper-benchmarks

INSTALL CALIPER-CLI [local npm install] [user@ubuntu:~/caliper-benchmarks$ ]

    npm install --only=prod @hyperledger/caliper-cli@0.6.0
    npx caliper bind --caliper-bind-sut fabric:2.5

(more info at caliper-benchmarks/networks/fabric/README.md)

Deploy chaincode for benchmark
fabric-samples 'fabcar'

    ./network.sh deployCC -ccn fabcar -ccp ../../caliper-benchmarks/src/fabric/samples/fabcar/go -ccl go

cc-test/chaincode-javascript 'sensorDataContract'

    ./network.sh deployCC -c c1 -ccn sensorDataContract -ccp ../cc-test/chaincode-javascript -ccl javascript -asOrg 1

Execute Benchmark (in caliper-benchmarks directory)

fabric-samples 'fabcar'

    npx caliper launch manager --caliper-workspace ./ --caliper-networkconfig networks/fabric/test-network.yaml --caliper-benchconfig benchmarks/samples/fabric/fabcar/config.yaml --caliper-flow-only-test --caliper-fabric-gateway-enabled

Chaincode ‘sensorDataContract’

    npx caliper launch manager --caliper-workspace ./ --caliper-networkconfig networks/fabric/fabric-net-c1.yaml --caliper-benchconfig benchmarks/samples/fabric/sensorDataContract/config.yaml --caliper-flow-only-test --caliper-fabric-gateway-enabled


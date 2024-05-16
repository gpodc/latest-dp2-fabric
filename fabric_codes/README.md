# fabric_codes

#Telusko Hindi: Building Fabric network from Scratch part 1
#https://www.youtube.com/watch?v=tfaj_JHbTwM

#Telusko Hindi: Fabric Create and Join Channel
#https://www.youtube.com/watch?v=HIBZeoiD7_k

**Change path to bin in network.sh
*export PATH=$PATH:path/to/your/directory/bin

export PATH=/home/goerge/project2/fabric_codes/bin:$PATH

#Before invoking chaincode
*export FABRIC_CFG_PATH=$PWD/../config/ (path containing core, orderer, configtx.yaml)
*set env variables to Org

    project2
        └── fabric_codes
            ├── asset-transfer-basic (fabric-samples)
            ├── bin (fabric-samples)
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


./network.sh commands

up                              	   compose containers for the network and generate crypto materials
down                            	    removes all used containers and brings down the network
createChannel -c $CHANNEL_NAME(string) -asOrg (int)    creates channel for peers, joins peers - $CHANNEL_NAME accepts strig

#Package and install chaincode 'basic' in channel 'c1'.
./network.sh deployCC -c c1 -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go -asOrg 1

#Package and install chaincode 'sensorDataContract' in channel 'c1'. as org1
./network.sh deployCC -c c1 -ccn sensorDataContract -ccp ../cc-test/chaincode-javascript -ccl javascript -asOrg 1


<!-- #To initialize chaincode 'basic' on channel 'c1' (asOrg 1).
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C c1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}' -->

#UPDATE to initialize chaincode 'basic' on channel 'c1' (asOrg 1) *must set env org.
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C c1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

#UPDATE to initialize chaincode 'sensorDataContract' on channel 'c1' (asOrg 1) *must set env org.
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C c1 -n sensorDataContract --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'


#Peer chaincode query function 'GetAllAssets' in chaincode 'basic' in channel 'c1' *must set env org1
peer chaincode query -C c1 -n basic -c '{"Args":["GetAllAssets"]}'

#Peer chaincode query function 'GetAllSensorData' in chaincode sensorDataContract 
peer chaincode query -C c1 -n sensorDataContract -c '{"Args":["GetAllSensorData"]}'

#Peer chaincode query function 'GetLatestSensorReadings' in chaincode sensorDataContract 
peer chaincode query -C c1 -n sensorDataContract2 -c '{"Args":["GetLatestSensorReadings"]}'


<!-- #Peer chaincode invoke function 'TransferAsset' in chaincode 'basic' in channel 'c1' (asOrg 1)
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C c1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"TransferAsset","Args":["asset6","Christopher"]}' -->

#UPDATE Peer chaincode invoke function 'TransferAsset' in chaincode 'basic' in channel 'c1' (asOrg 1)
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C c1 -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -c '{"function":"TransferAsset","Args":["asset6","Christopher"]}'

#UPDATE Peer chaincode invoke function 'ReadSensorData' in chaincode 'sensorDataContract' in channel 'c1' (asOrg 1)
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C c1 -n sensorDataContract2 --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -c '{"function":"ReadSensorData","Args":["data_1"]}'

#UPDATE Peer chaincode invoke function 'CreateSensorData' in chaincode 'sensorDataContract' in channel 'c1' (asOrg 1)
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C c1 -n sensorDataContract --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" -c '{"function":"CreateSensorData","Args":["sensor3","103","62.1","2024-05-14T02:02:00Z"]}'


#Env variables to access cli as Org1
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
#Env Org2
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
#ENV Org3
    export CORE_PEER_LOCALMSPID=Org3MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
    export CORE_PEER_ADDRESS=localhost:11051

#org3 update:
    compose file
    configtx
    crypto-config
    createChannel
    deployCC

#NODERED

-Gateway -> Peer -> TLS
base64 project2/fabric_codes/test-net/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/tlscacerts/tlsca.org1.example.com-cert.pem

-Identity -> Cert
base64 project2/fabric_codes/test-net/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem

-Identity -> Private Key
base64 project2/fabric_codes/test-net/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk


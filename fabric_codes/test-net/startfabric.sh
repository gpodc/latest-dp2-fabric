#!/bin/bash

chmod 755 ./network.sh
export PATH=/home/cpeadmin/dp2/bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/


function startOrg(){
    ORG=$1

    #Create channel c1 for org 1
    ./network.sh createChannel -c c${ORG} -asOrg ${ORG}

    #deploy sensorDataContract on c1
    ./network.sh deployCC -c c${ORG} -ccn sensorDataContract${ORG} -ccp ../cc-test/chaincode-javascript -ccl javascript -asOrg ${ORG}
}


#Create org certificates and up all docker containers
./network.sh up -s couchdb

#Create channels for each org and deploy sensorDataContract on channels
startOrg 1
startOrg 2
startOrg 3

#Up hyperledger explorer
cd ~/explorer
docker-compose up -d

#Up all node-app-service
cd ../dp2/node-app
docker-compose up -d

#go back to fabric directory
cd ../test-net




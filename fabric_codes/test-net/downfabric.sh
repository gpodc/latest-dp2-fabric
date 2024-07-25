#!/bin/bash

chmod 755 ./network.sh

#Stop hyperledger explorer
cd ~/explorer
docker-compose down
docker volume rm explorer_pgdata
docker volume rm explorer_walletstore

#Stop node-app-services
cd ../dp2/node-app
docker-compose down

#Bring down fabric network
cd ../test-net
./network.sh down
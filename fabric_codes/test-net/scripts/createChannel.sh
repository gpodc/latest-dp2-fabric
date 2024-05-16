#!/bin/bash

. scripts/envVar.sh

CHANNEL_NAME=$1
AS_ORG=$2
DELAY="3"
MAX_RETRY="5"

if [ ! -d "channel-artifacts" ]; then
    mkdir channel-artifacts
fi

createGenesisBlock(){  
    # configtxgen -profile ChannelUsingRaft -outputBlock ./channel-artifacts/${CHANNEL_NAME}_genesis.pb -channelID $CHANNEL_NAME -asOrg Org1MSP **-tlsca ../organizations/peerOrganizations/msp/tlscacerts/tlsca.org1.example.com-cert.pem
    configtxgen -profile Org${AS_ORG}Channel -outputBlock ./channel-artifacts/${CHANNEL_NAME}_genesis.block -channelID $CHANNEL_NAME -configPath $FABRIC_CFG_PATH

}


createChannel(){
    setGlobals $AS_ORG

    local rc=1
    local COUNTER=1
    while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
        sleep $DELAY
        
        osnadmin channel join --channelID $CHANNEL_NAME --config-block ./channel-artifacts/${CHANNEL_NAME}_genesis.block -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" >&log.txt
        res=$?
        let rc=$res
        COUNTER=$(expr $COUNTER + 1)

        # infoln "Channel list"
        # osnadmin channel list -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" >&log.txt
    done
    cat log.txt
}

joinChannel(){
    ORG=$AS_ORG
    setGlobals $ORG
    env | grep CORE

    # FABRIC_CFG_PATH=${PWD}/configtx
    # BLOCKFILE="./channel-artifacts/${CHANNEL_NAME}_genesis.block"

    local rc=1
    local COUNTER=1
    ## Sometimes it does not join on one go, hence retry
    while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
        sleep $DELAY

        set -x
        peer channel join -b $BLOCKFILE >&log.txt
        res=$?
        { set +x; } 2>/dev/null
        let rc=$res
        COUNTER=$(expr $COUNTER + 1)

    done
    cat log.txt
    verifyResult $res "After $MAX_RETRY attempts, peer0.org${ORG} has failed to join channel '$CHANNEL_NAME' "
    
}

# setAnchorPeer(){
#     ORG=$AS_ORG

#     docker exec cli ./scripts/setAnchorPeer.sh $ORG $CHANNEL_NAME
# }

displayChannelList(){
    ORG=$AS_ORG
    setGlobals $ORG

    # infoln "Here is the channel list for Org$ORG"
    peer channel list
}


FABRIC_CFG_PATH=${PWD}/configtx
BLOCKFILE="./channel-artifacts/${CHANNEL_NAME}_genesis.block"

#Generate genesis block
createGenesisBlock

#Create channel
infoln "Creating channel ${CHANNEL_NAME}"
createChannel
successln "Channel '$CHANNEL_NAME' created."

sleep 2

#Join peer to channel
infoln "Joining Org${AS_ORG} peer to the channel..."
joinChannel
sleep 2
displayChannelList 
successln "Org${AS_ORG} has successfully joined channel '${CHANNEL_NAME}'."
successln "Anchor peer set for peer0 in Org${AS_ORG}."

# sleep 2
# infoln "Joining Org2 peer to the channel..."
# joinChannel 2
# sleep 2
# displayChannelList 2
# successln "Org2 has successfully joined channel '${CHANNEL_NAME}'."
# successln "Anchor peer set for peer0 in Org2."


# infoln "Setting Anchor peer for Org1..."
# setAnchorPeer 1
# successln "Anchor peer set for peer0 in Org1."

# infoln "Setting Anchor peer for Org2..."
# setAnchorPeer 2
# successln "Anchor peer set for peer0 in Org2."


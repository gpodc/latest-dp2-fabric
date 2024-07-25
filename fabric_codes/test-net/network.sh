#!/bin/bash

#export path to fabric binaries
export PATH=/home/cpeadmin/dp2/bin:$PATH
export FABRIC_CFG_PATH=${PWD}/configtx
export VERBOSE=false

. scripts/utils.sh

: ${CONTAINER_CLI:="docker"}
if command -v ${CONTAINER_CLI}-compose > /dev/null 2>&1; then
    : ${CONTAINER_CLI_COMPOSE:="${CONTAINER_CLI}-compose"}
else
    : ${CONTAINER_CLI_COMPOSE:="${CONTAINER_CLI} compose"}
fi
infoln "Using ${CONTAINER_CLI} and ${CONTAINER_CLI_COMPOSE}"

function startFresh(){
  docker rm -f $(docker ps -aq --filter label=service=hyperledger-fabric) 2>/dev/null || true
  docker rm -f $(docker ps -aq --filter name='dev-peer*') 2>/dev/null || true
  docker image rm -f $(docker images -aq --filter reference='dev-peer*') 2>/dev/null || true
}

function createOrgs() {
  if [ -d "organizations/peerOrganizations" ]; then
    rm -Rf organizations/peerOrganizations && rm -Rf organizations/ordererOrganizations
  fi
  #Create crypto materials using cryptogen
  cryptogen generate --config=./organizations/cryptogen/crypto-config.yaml --output="organizations"
  successln "Crypto Materials generated"

  #Create connection profiles for each organization
  ./organizations/ccp-generate.sh
}

function networkUp() {
  if [ ! -d "organizations/peerOrganizations" ]; then
    createOrgs
  fi

  COMPOSE_FILES="-f ${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_BASE}"
  
  #if couchdb is used
  if [ "${DATABASE}" == "couchdb" ]; then
    COMPOSE_FILES="${COMPOSE_FILES} -f ${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_COUCH}"  
  
  fi
  DOCKER_SOCK="${DOCKER_SOCK}" ${CONTAINER_CLI_COMPOSE} ${COMPOSE_FILES} up -d 2>&1

  docker ps -a
}

function createChannel() {
  if [ -z "$CHANNEL_NAME" ]; then
    CHANNEL_NAME="mychannel"
  fi
  scripts/createChannel.sh $CHANNEL_NAME $AS_ORG
}

function networkDown() {

  COMPOSE_BASE_FILES="-f ${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_BASE}"
  COMPOSE_COUCH_FILES="-f ${CONTAINER_CLI}/${CONTAINER_CLI}-${COMPOSE_FILE_COUCH}"
  COMPOSE_FILES="${COMPOSE_BASE_FILES} ${COMPOSE_COUCH_FILES}"

  if [ "${CONTAINER_CLI}" == "docker" ]; then
    DOCKER_SOCK=$DOCKER_SOCK ${CONTAINER_CLI_COMPOSE} ${COMPOSE_FILES} down --volumes --remove-orphans  2>&1
  fi

  startFresh
  docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf system-genesis-block/*.block organizations/peerOrganizations organizations/ordererOrganizations'
  docker run --rm -v "$(pwd):/data" busybox sh -c 'cd /data && rm -rf channel-artifacts log.txt *.tar.gz'

}

function genesisInfo(){
  $ORG=$1
  #To check genesis block contents of channel
  infoln "Here are the Genesis Block information:"
  configtxgen -inspectBlock ./channel-artifacts/c${ORG}_genesis.block
}

# function ordererChannelList(){
#   #To list all channels the orderer has joined.
#   infoln "Here are the all the channels the orderer has joined."
# osnadmin channel list -o localhost:7053 --ca-file=$ORDERER_CA --client-cert=$ORDERER_ADMIN_TLS_SIGN_CERT --client-key=$ORDERER_ADMIN_TLS_PRIVATE_KEY
# }



## Call the script to package the chaincode
function packageChaincode() {

  infoln "Packaging chaincode"

  scripts/packageCC.sh $CC_NAME $CC_SRC_PATH $CC_SRC_LANGUAGE $CC_VERSION true

  if [ $? -ne 0 ]; then
    fatalln "Packaging the chaincode failed"
  fi

}

function deployCC() {

  # scripts/deployCC.sh $CHANNEL_NAME $CC_NAME $CC_SRC_PATH $CC_SRC_LANGUAGE $CC_VERSION $CC_SEQUENCE $CC_INIT_FCN $CC_END_POLICY $CC_COLL_CONFIG $CLI_DELAY $MAX_RETRY $VERBOSE $AS_ORG
  scripts/deployCC.sh \
    "$CHANNEL_NAME" \
    "$CC_NAME" \
    "$CC_SRC_PATH" \
    "$CC_SRC_LANGUAGE" \
    "$CC_VERSION" \
    "$CC_SEQUENCE" \
    "$CC_INIT_FCN" \
    "$CC_END_POLICY" \
    "$CC_COLL_CONFIG" \
    "$CLI_DELAY" \
    "$MAX_RETRY" \
    "$VERBOSE" \
    "$AS_ORG"

  if [ $? -ne 0 ]; then
    fatalln "Deploying chaincode failed"
  fi
}

## Call the script to list installed and committed chaincode on a peer
function listChaincode() {
  AS_ORG = $ORG
  export FABRIC_CFG_PATH=${PWD}/../config

  . scripts/envVar.sh
  . scripts/ccutils.sh

  setGlobals $ORG

  println
  queryInstalledOnPeer
  println

  listAllCommitted

}

## Call the script to invoke 
function invokeChaincode() {

  export FABRIC_CFG_PATH=${PWD}/../config

  . scripts/envVar.sh
  . scripts/ccutils.sh

  setGlobals $ORG

  chaincodeInvoke $ORG $CHANNEL_NAME $CC_NAME $CC_INVOKE_CONSTRUCTOR

}

## Call the script to query chaincode 
function queryChaincode() {

  export FABRIC_CFG_PATH=${PWD}/../config
  
  . scripts/envVar.sh
  . scripts/ccutils.sh

  setGlobals $ORG

  chaincodeQuery $ORG $CHANNEL_NAME $CC_NAME $CC_QUERY_CONSTRUCTOR

}

#for script permissions
chmod 755 ./scripts/createChannel.sh
chmod 755 ./scripts/setAnchorPeer.sh
chmod 755 ./scripts/deployCC.sh
chmod 755 ./organizations/ccp-generate.sh


if [[ $# -lt 1 ]] ; then
  # printHelp
  echo "Please enter valid arguments."
  exit 0
else
  MODE=$1
  shift
fi

# parse subcommands if used
if [[ $# -ge 1 ]] ; then
  key="$1"
  # check for the createChannel subcommand
  if [[ "$key" == "createChannel" ]]; then
      export MODE="createChannel"
      shift
  # check for the cc command
  elif [[ "$MODE" == "cc" ]]; then
    if [ "$1" != "-h" ]; then
      export SUBCOMMAND=$key
      shift
    fi
  fi
fi
# DATABASE=$3



#CHAINCODE FLAGS
while [[ $# -ge 1 ]] ; do
  key=$1
  case $key in
  
  -c )
    CHANNEL_NAME="$2"
    shift
    ;;
  -ccl )
    CC_SRC_LANGUAGE="$2"
    shift
    ;;
  -ccn )
    CC_NAME="$2"
    shift
    ;;
  -ccv )
    CC_VERSION="$2"
    shift
    ;;
  -ccs )
    CC_SEQUENCE="$2"
    shift
    ;;
  -ccp )
    CC_SRC_PATH="$2"
    shift
    ;;
  -ccep )
    CC_END_POLICY="$2"
    shift
    ;;
  -cccg )
    CC_COLL_CONFIG="$2"
    shift
    ;;
  -cci )
    CC_INIT_FCN="$2"
    shift
    ;;
  -ccic )
    CC_INVOKE_CONSTRUCTOR="$2"
    shift
    ;;
  -ccqc )
    CC_QUERY_CONSTRUCTOR="$2"
    shift
    ;;
  -asOrg )
    AS_ORG="$2"
    shift
    ;;
  -s )
    DATABASE="$2"
    shift
    ;;
  -verbose )
    VERBOSE=true
    ;;
  * )
    esac
    shift
  done

COMPOSE_FILE_BASE=compose-test-net.yaml
SOCK="${DOCKER_HOST:-/var/run/docker.sock}"
DOCKER_SOCK="${SOCK##unix://}"
COMPOSE_FILE_COUCH=compose-couch.yaml

# MODE=$1
# CHANNEL_NAME=$2

if [ "$MODE" == "up" ]; then
  infoln "Starting nodes with CLI timeout of '${MAX_RETRY}' tries and CLI delay of '${CLI_DELAY}' seconds and using database '${DATABASE}' ${CRYPTO_MODE}"
  networkUp
elif [ "$MODE" == "createChannel" ]; then
  createChannel
elif [ "$MODE" == "down" ]; then
  networkDown

# elif [ "$MODE" == "ordererChannels" ]; then
#   ordererChannelList

elif [ "$MODE" == "genesisInfo" ]; then
  genesisInfo


#CHAINCODE COMMANDS
elif [ "$MODE" == "deployCC" ]; then
  infoln "Deploying chaincode on channel '${CHANNEL_NAME}'"
  infoln "using org ${AS_ORG}"
  deployCC
elif [ "$MODE" == "cc" ] && [ "$SUBCOMMAND" == "package" ]; then
  packageChaincode
elif [ "$MODE" == "cc" ] && [ "$SUBCOMMAND" == "list" ]; then
  listChaincode
elif [ "$MODE" == "cc" ] && [ "$SUBCOMMAND" == "invoke" ]; then
  invokeChaincode
elif [ "$MODE" == "cc" ] && [ "$SUBCOMMAND" == "query" ]; then
  queryChaincode
fi







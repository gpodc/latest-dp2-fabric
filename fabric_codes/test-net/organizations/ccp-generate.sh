#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s#\${URL}#$6#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

#----------CCP for Caliper------------
ORG=1
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/org1.iot-fabric.com/tlsca/tlsca.org1.iot-fabric.com-cert.pem
CAPEM=organizations/peerOrganizations/org1.iot-fabric.com/ca/ca.org1.iot-fabric.com-cert.pem
URL=localhost

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $URL)" > organizations/peerOrganizations/org1.iot-fabric.com/connection-org1.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/org1.iot-fabric.com/connection-org1.yaml

ORG=2
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/org2.iot-fabric.com/tlsca/tlsca.org2.iot-fabric.com-cert.pem
CAPEM=organizations/peerOrganizations/org2.iot-fabric.com/ca/ca.org2.iot-fabric.com-cert.pem
URL=localhost

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $URL)" > organizations/peerOrganizations/org2.iot-fabric.com/connection-org2.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/org2.iot-fabric.com/connection-org2.yaml

ORG=3
P0PORT=11051
CAPORT=11054
PEERPEM=organizations/peerOrganizations/org3.iot-fabric.com/tlsca/tlsca.org3.iot-fabric.com-cert.pem
CAPEM=organizations/peerOrganizations/org3.iot-fabric.com/ca/ca.org3.iot-fabric.com-cert.pem
URL=localhost

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $URL)" > organizations/peerOrganizations/org3.iot-fabric.com/connection-org3.json
echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/org3.iot-fabric.com/connection-org3.yaml


#---------------------CCP for node-app---------------------------
ORG=1
P0PORT=7051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/org1.iot-fabric.com/tlsca/tlsca.org1.iot-fabric.com-cert.pem
CAPEM=organizations/peerOrganizations/org1.iot-fabric.com/ca/ca.org1.iot-fabric.com-cert.pem
URL=peer0.org1.iot-fabric.com

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $URL)" > organizations/peerOrganizations/org1.iot-fabric.com/connection-app-org1.json

ORG=2
P0PORT=9051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/org2.iot-fabric.com/tlsca/tlsca.org2.iot-fabric.com-cert.pem
CAPEM=organizations/peerOrganizations/org2.iot-fabric.com/ca/ca.org2.iot-fabric.com-cert.pem
URL=peer0.org2.iot-fabric.com

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $URL)" > organizations/peerOrganizations/org2.iot-fabric.com/connection-app-org2.json

ORG=3
P0PORT=11051
CAPORT=11054
PEERPEM=organizations/peerOrganizations/org3.iot-fabric.com/tlsca/tlsca.org3.iot-fabric.com-cert.pem
CAPEM=organizations/peerOrganizations/org3.iot-fabric.com/ca/ca.org3.iot-fabric.com-cert.pem
URL=peer0.org3.iot-fabric.com

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $URL)" > organizations/peerOrganizations/org3.iot-fabric.com/connection-app-org3.json

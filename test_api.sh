#!/bin/bash
#
# This script is used to test the API - it performs a CURL sign-in and prints the 
# result reading the .env for configuration. Then it refershes the token, and finally
#

# 
# read configuration and secrets
source .env

#
# jq is needed
if ! command -v jq &> /dev/null; then
  echo "jq could not be found, please install it"
  exit 1
fi

#
# if VERBOSE is set to "-v" then CURL print the verbose output. 
# "-s" is silent mode.
VERBOSE="-s"

#
# remove the proxy
VITE_SWIFT_SENSORS_API_URL="${VITE_SWIFT_SENSORS_API_HOST}/api/client/v1/sign-in"

#
# show the parameters
echo "user: ${VITE_SWIFT_SENSORS_USER}"
echo "password: ${VITE_SWIFT_SENSORS_PASSWORD:0:5}..."
echo "url: ${VITE_SWIFT_SENSORS_API_URL}"
echo "api-key: ${VITE_SWIFT_SENSORS_API_KEY:0:5}..."

#
# Make the singn-in API call
RESP=$( curl ${VERBOSE} -X POST "${VITE_SWIFT_SENSORS_API_URL}" \
  -H "X-API-Key: ${VITE_SWIFT_SENSORS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${VITE_SWIFT_SENSORS_USER}\",\
       \"password\":\"${VITE_SWIFT_SENSORS_PASSWORD}\",\
       \"language\": \"en\"}" )
echo "${RESP}" | jq
ACCESSTOKEN=$( echo "${RESP}" | jq -r '.access_token' )
REFRESHTOKEN=$( echo "${RESP}" | jq -r '.refresh_token' )
ACCOUNTID=$( echo "${RESP}" | jq -r '.account_id' )
echo "access_token: ${ACCESSTOKEN}"  
echo "refresh_token: ${REFRESHTOKEN}"  
echo "account_id: ${ACCOUNTID}"
echo
sleep 5

#
# Make the refresh 
VITE_SWIFT_SENSORS_API_URL="${VITE_SWIFT_SENSORS_API_HOST}/api/token/v2/refresh"
echo "Making the refresh API call: ${VITE_SWIFT_SENSORS_API_URL}"
RESP=$( curl ${VERBOSE} -X POST "${VITE_SWIFT_SENSORS_API_URL}" \
  -H "X-API-Key: ${VITE_SWIFT_SENSORS_API_KEY}" \
  -H "Content-Type: text/plain" \
  -H "Authorization: Bearer ${ACCESSTOKEN}" \
  -d "${REFRESHTOKEN}" )   
echo "${RESP}" | jq
ACCESSTOKEN2=$( echo "${RESP}" | jq -r '.access_token' )
REFRESHTOKEN2=$( echo "${RESP}" | jq -r '.refresh_token' )
echo "access_token: ${ACCESSTOKEN2}"  
echo "refresh_token: ${REFRESHTOKEN2}"  
echo

#
# trying to reuse the old access token
sleep 5
echo "Trying to reuse the old refresh token to refresh again"
RESP=$( curl ${VERBOSE} -X POST "${VITE_SWIFT_SENSORS_API_URL}" \
  -H "X-API-Key: ${VITE_SWIFT_SENSORS_API_KEY}" \
  -H "Content-Type: text/plain" \
  -H "Authorization: Bearer ${ACCESSTOKEN}" \
  -d "${REFRESHTOKEN}" )    # OLD TOKEN, SHOULD NOT WORK ANYMORE
echo "${RESP}" | jq
ACCESSTOKEN3=$( echo "${RESP}" | jq -r '.access_token' )
REFRESHTOKEN3=$( echo "${RESP}" | jq -r '.refresh_token' )
echo "access_token: ${ACCESSTOKEN3}"  
echo "refresh_token: ${REFRESHTOKEN3}"  

echo
if [ "${ACCESSTOKEN3}" != "" ]; then
  echo "the refresh token can be reused"
else
  echo "the refresh token cannot be reused"
fi

echo
sleep 5

#
# Make the treeupdate API call
VITE_SWIFT_SENSORS_API_URL="${VITE_SWIFT_SENSORS_API_HOST}/api/client/v1/accounts/${ACCOUNTID}/treeupdate"
echo "Making the treeupdate API call: ${VITE_SWIFT_SENSORS_API_URL}"
RESP=$( curl ${VERBOSE} -X GET "${VITE_SWIFT_SENSORS_API_URL}" \
  -H "X-API-Key: ${VITE_SWIFT_SENSORS_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESSTOKEN}" )
echo "${RESP}" | jq
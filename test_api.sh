#!/bin/bash
#
# This script is used to test the API - it performs a CURL sign-in and prints the 
# result reading the .env for configuration. Then it refershes the token, and finally

#

# 
# read configuration and secrets
source .env

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
echo "${RESP}"
ACCESSTOKEN=$( echo "${RESP}" | jq -r '.access_token' )
REFRESHTOKEN=$( echo "${RESP}" | jq -r '.refresh_token' )
echo "access_token: ${ACCESSTOKEN}"  
echo "refresh_token: ${REFRESHTOKEN}"  
echo
sleep 5

#
# Make the refresh 
echo "Making the refresh API call: ${VITE_SWIFT_SENSORS_API_URL}"
VITE_SWIFT_SENSORS_API_URL="${VITE_SWIFT_SENSORS_API_HOST}/api/token/v2/refresh"
RESP=$( curl ${VERBOSE} -X POST "${VITE_SWIFT_SENSORS_API_URL}" \
  -H "X-API-Key: ${VITE_SWIFT_SENSORS_API_KEY}" \
  -H "Content-Type: text/plain" \
  -H "Authorization: Bearer ${ACCESSTOKEN}" \
  -d "${REFRESHTOKEN}" )   
echo "${RESP}"
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
echo "${RESP}"
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


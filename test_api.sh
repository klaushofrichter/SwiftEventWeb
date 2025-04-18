#!/bin/bash
#
# This script is used to test the API - it performs a CURL sign-in and prints the 
# result reading the .env for configuration.
#

# 
# read configuration and secrets
source .env

#
# remove the proxy
VITE_SWIFT_SENSORS_API_URL="${VITE_SWIFT_SENSORS_API_HOST}/${VITE_SWIFT_SENSORS_PROXY_API_URL:5}/v1/sign-in"

#
# show the parameters
echo "user: ${VITE_SWIFT_SENSORS_USER}"
echo "password: ${VITE_SWIFT_SENSORS_PASSWORD:0:5}..."
echo "url: ${VITE_SWIFT_SENSORS_API_URL}"
echo "api-key: ${VITE_SWIFT_SENSORS_API_KEY:0:5}..."

#
# Make the singn-in API call
RESP=$( curl -v -X POST "${VITE_SWIFT_SENSORS_API_URL}" \
  -H "X-API-Key: ${VITE_SWIFT_SENSORS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${VITE_SWIFT_SENSORS_USER}\",\
       \"password\":\"${VITE_SWIFT_SENSORS_PASSWORD}\",\
       \"language\": \"en\"}" )
echo "${RESP}"
REFRESHTOKEN=$( echo "${RESP}" | jq -r '.refresh_token' )
echo "refresh_token: ${REFRESHTOKEN}"  
sleep 5

#
# Make the refresh 
#VITE_SWIFT_SENSORS_API_URL="${VITE_SWIFT_SENSORS_API_HOST}/api/token/v2/refresh"
#curl -v -X POST "${VITE_SWIFT_SENSORS_API_URL}" \
#   -H "X-API-Key: ${VITE_SWIFT_SENSORS_API_KEY}" \
#  -H "Content-Type: text/plain" \
#  -d "${REFRESHTOKEN}" 

#
# Make the API call
curl -v -X POST https://api.swiftsensors.net/api/token/v2/refresh \
  -H "X-API-Key: ${VITE_SWIFT_SENSORS_API_KEY}" \
  -H "Content-Type: text/plain" \
  -d "${REFRESHTOKEN}" 

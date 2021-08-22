#!/bin/bash

PATH=/sbin:/snap/bin:/bin:/usr/local/bin
export CERTPATH=/etc/letsencrypt/live/glassspades.ddns.net
export URL=https://glassspades.ddns.net
export ENCRYPTED_ADMIN_PASSWORD=$2b$10$BjUi4HaHXBuUfNsi39nGKOCAAD42g9hllA236Z3robSR1cQdCHyrW
export DB_USERNAME=Glass-Spades
export DB_PASSWORD=Glassspades1m
export DB_HOST=34.75.41.15
export DB_PORT=27017
export TOKEN_KEY=Glassspades1m
export GOOGLE_APPLICATION_CREDENTIALS="/home/richard/glass-spades/glass-spades-service-account.json"
export MAPS_API_KEY=AIzaSyDrVByoterVaoQyeLZ_ZmFvDBHcJJInQ84
export GMAIL_APP_PASSWORD="nnqy jrrp wifm hmro"
export PORT=443
export HTTP_PORT=80

cd /home/richard/glass-spades
node index.js

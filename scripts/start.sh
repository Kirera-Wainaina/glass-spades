#!/bin/bash

export CERTPATH=/etc/letsencrypt/live/glassspades.ddns.net
export URL=https://glassspades.ddns.net
export ENCRYPTED_ADMIN_PASSWORD=$2b$10$BjUi4HaHXBuUfNsi39nGKOCAAD42g9hllA236Z3robSR1cQdCHyrW
export DB_USERNAME=Glass-Spades
export DB_PASSWORD=Glassspades1m
export DB_HOST=34.139.164.249
export DB_PORT=27017
export TOKEN_KEY=Glassspades1m
export GOOGLE_APPLICATION_CREDENTIALS="/home/richard/glass-spades/glass-spades-service-account.json"
export MAPS_API_KEY=AIzaSyDrVByoterVaoQyeLZ_ZmFvDBHcJJInQ84
export GMAIL_APP_PASSWORD="nnqy jrrp wifm hmro"
export PORT=443
export HTTP_PORT=80
export PATH="/home/richard/google-cloud-sdk/bin:/home/richard/.pyenv/shims:/home/richard/.pyenv/bin:/home/richard/.cargo/bin:/home/richard/.local/bin:/home/richard/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/richard/.rvm/bin:/home/richard/.rvm/bin"

node /home/richard/glass-spades/index2.js
# node /home/richard/glass-spades/database/models.js

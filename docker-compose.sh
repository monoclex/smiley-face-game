#!/bin/sh

# This is a script that wraps around the usage of docker-compose in production.
COMPOSE_PROJECT_NAME="sfg" \
    docker-compose \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    "$@"
 
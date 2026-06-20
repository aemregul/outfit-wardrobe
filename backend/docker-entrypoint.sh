#!/bin/sh
set -e

# Read Docker secrets into env vars — Spring Boot does not natively support _FILE convention
[ -f "${DB_PASSWORD_FILE:-}" ]            && export DB_PASSWORD=$(cat "$DB_PASSWORD_FILE")
[ -f "${ANTHROPIC_API_KEY_FILE:-}" ]      && export ANTHROPIC_API_KEY=$(cat "$ANTHROPIC_API_KEY_FILE")
[ -f "${OPENWEATHERMAP_API_KEY_FILE:-}" ] && export OPENWEATHERMAP_API_KEY=$(cat "$OPENWEATHERMAP_API_KEY_FILE")

exec "$@"

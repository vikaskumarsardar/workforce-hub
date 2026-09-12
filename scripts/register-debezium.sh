#!/usr/bin/env bash

DEBEZIUM_URL="http://localhost:8083/connectors"

echo "⏳ Registering Debezium PostgreSQL CDC Connector..."

curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
  $DEBEZIUM_URL -d '{
  "name": "workforce-outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "plugin.name": "pgoutput",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "postgrespassword",
    "database.dbname": "workforce_pulse",
    "database.server.name": "workforce_cdc",
    "table.include.list": "leave.outbox_events,payroll.outbox_events",
    "tombstones.on.delete": "false",
    "topic.prefix": "workforce_cdc"
  }
}'

echo ""
echo "✅ Debezium CDC Connector registered successfully!"

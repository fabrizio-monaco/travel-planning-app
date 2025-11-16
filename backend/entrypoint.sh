#!/bin/sh
set -e

echo "Running migrations…"
pnpm db:migrate

echo "Starting app…"
pnpm start

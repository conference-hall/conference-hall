#!/bin/bash
timeout 90s bash -c "until docker exec ch_postgres pg_isready; do sleep 5 ; done"

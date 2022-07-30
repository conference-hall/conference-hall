#!/bin/bash
timeout 90s bash -c "until docker exec ch_postgres pg_isready -d 'postgresql://postgres@localhost:5432/conference-hall-test'; do sleep 5 ; done"

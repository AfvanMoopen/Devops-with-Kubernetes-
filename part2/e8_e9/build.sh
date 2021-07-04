#!/bin/sh
docker build -t docker.io/mcfizh/dwk-part1:p2e8-frontend frontend
docker build -t docker.io/mcfizh/dwk-part1:p2e8-backend backend
docker build -t docker.io/mcfizh/dwk-part1:p2e9-cron cronjob
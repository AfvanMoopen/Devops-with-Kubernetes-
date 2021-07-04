#!/bin/sh
docker build -t docker.io/mcfizh/dwk-part1:p4e02-frontend frontend
docker build -t docker.io/mcfizh/dwk-part1:p4e02-backend backend
docker build -t docker.io/mcfizh/dwk-part1:p4e02-cron cronjob
docker build -t docker.io/mcfizh/dwk-part1:p4e06-bcast broadcaster
echo "-----------------------------------------------------"
echo "docker push docker.io/mcfizh/dwk-part1:p4e02-frontend"
echo "docker push docker.io/mcfizh/dwk-part1:p4e02-backend"
echo "docker push docker.io/mcfizh/dwk-part1:p4e02-cron"
echo "docker push docker.io/mcfizh/dwk-part1:p4e06-bcast"

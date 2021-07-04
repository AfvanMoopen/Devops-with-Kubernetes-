#!/bin/sh
docker build -t docker.io/mcfizh/dwk-part1:p4e01-main-a -f ./mainapp/Dockerfile_a mainapp
docker build -t docker.io/mcfizh/dwk-part1:p4e01-main-b -f ./mainapp/Dockerfile_b mainapp
docker build -t docker.io/mcfizh/dwk-part1:p4e01-pong pingpong

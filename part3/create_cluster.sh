#!/bin/sh
gcloud container clusters create dwk-cluster --num-nodes 2 --zone=europe-north1-a
kubectl create namespace mainapp-ns
kubectl create namespace project-ns

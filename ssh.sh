#! /bin/sh

sudo socat TCP-LISTEN:80,fork,reuseaddr TCP:localhost:8080 &

ssh $1

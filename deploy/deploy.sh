#!/bin/bash

workDir="$(dirname "$(readlink -f "$0")")"
port=8085

image_name="timeclock-img"
container_name="timeclock"

docker stop $container_name
docker rm $container_name
docker run -d -i -p $port:8080  \
  -e TZ=America/Los_Angeles \
  -v $workDir/config:/app/config  \
  --name $container_name $image_name


echo "Deploy successful!"
echo "Please visit: http://$(hostname | cut -d' ' -f1):$port/"

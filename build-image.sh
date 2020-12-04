#!/bin/bash

workDir="$(dirname "$(readlink -f "$0")")"
port=8085

image_name="timeclock-img"
container_name="timeclock"

name_exist=`docker images | grep $image_name`
if [[ -n "$name_exist" ]]; then
  docker rm -f $image_name
fi

docker build -f docker/Dockerfile -t $image_name $workDir


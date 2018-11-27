#!/bin/sh

while sleep 60; do
   DATE=$(date +"%Y-%m-%d")
   FILE="plot2-"$DATE".txt"
   PINGTIME="$(ping -c 1 www.xs4all.nl | sed -ne '/.*time=/{;s///;s/\..*//;p;}')"
   echo $(date +"%Y%m%d")"T"$(date +"%H%M%S")" "$PINGTIME >> $FILE
done &

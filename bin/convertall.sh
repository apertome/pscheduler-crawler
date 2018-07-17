#!/bin/bash


for file in `ls results_*.json && ls tasks_*.json`; do
    echo file: $file
    convert="time ../json2lines.js $file > ${file}l"
    echo command: $convert - converting ...
    eval $convert
done

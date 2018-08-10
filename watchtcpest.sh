#!/bin/bash
while sleep 1; do ss -nrt | grep \:8090 | grep ESTAB | wc -l;  done
#while sleep 1; do ss -nrt | grep \:443 | grep ESTAB | wc -l; done

#!/bin/bash
FILE="/home/mj82/pscheduler-runs-indices.txt"

#INDEX=$1
#echo "INDEX: $INDEX"
echo "DANGEROUS OPERATION; EXITING"
exit



while IFS="" read -r p || [ -n "$p" ]
do
  printf '%s\n' "$p"
  INDEX=$p
  URL="http://localhost:9200/$INDEX/_delete_by_query" #?requests_per_second=300"
  echo "URL: $URL"

curl -XPOST -H 'Content-Type: application/json' $URL -d '{
    "query" : {
        "match_all" : {}
    }
}'

  #eval $COMMAND
  sleep 10

done < $FILE 





#!/bin/bash
curl -H 'Content-Type: application/json' 'http://localhost:9200/results/_search?pretty' -d '{
   "from": 0, "size": 5,
   "query": {
        "bool": {
                "must": [
                  { "match": { "state": "nonstart" } }
        ]
    }
  }
}'


exit

curl 'http://localhost:9200/_search?pretty' -d '{
   "from": 0, "size": 5,
   "query": {
        "bool": {
                "must": [
                  { match: { "meta.flow_type": "tstat" } }
        ]
    }
  }
}'



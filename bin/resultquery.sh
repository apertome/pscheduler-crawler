#!/bin/bash
curl -H 'Content-Type: application/json' 'http://localhost:9200/_all/_search?pretty' -d '{
   "from": 0, "size": 50,
   "query": {
        "bool": {
                "must": [
                  { "match": { "crawler.pscheduler-host.keyword": "ps-4-0.qalab.geant.net" } }
        ]
    }
  }
}'


exit
                  
# { "match": { "state": "nonstart" } }

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



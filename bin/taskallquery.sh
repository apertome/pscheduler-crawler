#!/bin/bash
curl -H 'Content-Type: application/json' 'http://localhost:9200/tasks/_search?pretty' -d '{
   "from": 0, "size": 5,
   "query": {
        "match_all": {}
  }
}'



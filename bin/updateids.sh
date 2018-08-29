#!/bin/bash
FILE="/home/mj82/pscheduler-runs-indices.txt"

#INDEX=$1
#echo "INDEX: $INDEX"


while IFS="" read -r p || [ -n "$p" ]
do
  printf '%s\n' "$p"
  INDEX=$p
  URL="http://localhost:9200/$INDEX/_update_by_query?requests_per_second=300"
  QUERY='
{
  "script": {
    "source": "ctx._source.crawler.id = ctx._source.crawler.href",
    "lang": "painless"
  },
  "query": {
               "bool": {
                "must": {
                    "script": {
                        "script" : {
                            "source": "doc['\''crawler.id.keyword'\''] != doc['\''crawler.href.keyword'\'']"

                        }
                    }


                }

    }
  }
}
'

  echo "URL: $URL"
  echo "QUERY: $QUERY"
  COMMAND="curl -X POST -H 'Content-Type: application/json' $URL -d '$QUERY'"
  echo "COMMAND: $COMMAND"
  curl -X POST -H 'Content-Type: application/json' $URL -d '
{
  "script": {
    "source": "ctx._source.crawler.id = ctx._source.crawler.href",
    "lang": "painless"
  },
  "query": {
               "bool": {
                "must": {
                    "script": {
                        "script" : {
                            "source": "doc['\''crawler.id.keyword'\''] != doc['\''crawler.href.keyword'\'']"

                        }
                    }


                }

    }
  }
}


'
  #eval $COMMAND
  sleep 10

done < $FILE 





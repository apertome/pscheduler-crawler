#!/bin/bash

# reindex
curl -XPOST -H 'Content-Type: application/json' localhost:9200/_reindex -d '
{
  "source": {
    "index": "pscheduler-runs-2018.08.23"
  },
  "dest": {
    "index": "test_pscheduler-runs-2018.08.23"
  }
}
'

# create index
exit

curl -XPUT -H 'Content-Type: application/json' localhost:9200/test_pscheduler-runs-2018.08.23 -d '{
 "settings": {
    "index.mapping.total_fields.limit": 2000,
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mapping": {
  "doc": { 
     "properties": {
        "@timestamp": {
          "type": "date"
        },
        "@version": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "added": {
          "type": "date"
        },
        "archivings": {
          "properties": {
            "archived": {
              "type": "boolean"
            },
            "archiver": {
              "properties": {
                "description": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "maintainer": {
                  "properties": {
                    "email": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "href": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "name": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    }
                  }
                },
                "name": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "schema": {
                  "type": "long"
                },
                "version": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                }
              }
            },
            "archiver_data": {
              "properties": {
                "measurement-agent": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "retry-policy": {
                  "properties": {
                    "attempts": {
                      "type": "long"
                    },
                    "wait": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    }
                  }
                },
                "summaries": {
                  "properties": {
                    "event-type": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "summary-type": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "summary-window": {
                      "type": "long"
                    }
                  }
                },
                "url": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                }
              }
            },
            "completed": {
              "type": "boolean"
            },
            "diags": {
              "properties": {
                "return-code": {
                  "type": "long"
                },
                "stderr": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "stdout": {
                  "properties": {
                    "error": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "retry": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "succeeded": {
                      "type": "boolean"
                    }
                  }
                },
                "time": {
                  "type": "date"
                }
              }
            },
            "last_attempt": {
              "type": "date"
            }
          }
        },
        "clock-survey": {
          "properties": {
            "offset": {
              "type": "float"
            },
            "reference": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "source": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "synchronized": {
              "type": "boolean"
            },
            "time": {
              "type": "date"
            }
          }
        },
        "crawler": {
          "properties": {
            "archive-errors": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "archive-failures": {
              "type": "long"
            },
            "archive-success": {
              "type": "long"
            },
            "href": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "id": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "pscheduler-host": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "pscheduler-url": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            },
            "result-merged": {
              "properties": {
                "diags": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "duplicates": {
                  "type": "long"
                },
                "error": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "intervals": {
                  "properties": {
                    "streams": {
                      "properties": {
                        "end": {
                          "type": "float"
                        },
                        "omitted": {
                          "type": "boolean"
                        },
                        "retransmits": {
                          "type": "long"
                        },
                        "rtt": {
                          "type": "long"
                        },
                        "sent": {
                          "type": "long"
                        },
                        "start": {
                          "type": "long"
                        },
                        "stream-id": {
                          "type": "long"
                        },
                        "tcp-window-size": {
                          "type": "long"
                        },
                        "throughput-bits": {
                          "type": "float"
                        },
                        "throughput-bytes": {
                          "type": "long"
                        }
                      }
                    },
                    "summary": {
                      "properties": {
                        "end": {
                          "type": "float"
                        },
                        "omitted": {
                          "type": "boolean"
                        },
                        "retransmits": {
                          "type": "long"
                        },
                        "sent": {
                          "type": "long"
                        },
                        "start": {
                          "type": "long"
                        },
                        "throughput-bits": {
                          "type": "float"
                        },
                        "throughput-bytes": {
                          "type": "long"
                        }
                      }
                    }
                  }
                },
                "loss": {
                  "type": "long"
                },
                "lost": {
                  "type": "long"
                },
                "max": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "max-clock-error": {
                  "type": "float"
                },
                "mean": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "min": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "mss": {
                  "type": "long"
                },
                "mtu": {
                  "type": "long"
                },
                "packets-duplicated": {
                  "type": "long"
                },
                "packets-lost": {
                  "type": "long"
                },
                "packets-received": {
                  "type": "long"
                },
                "packets-reordered": {
                  "type": "long"
                },
                "packets-sent": {
                  "type": "long"
                },
                "paths": {
                  "properties": {
                    "as": {
                      "properties": {
                        "number": {
                          "type": "long"
                        },
                        "owner": {
                          "type": "text",
                          "fields": {
                            "keyword": {
                              "type": "keyword",
                              "ignore_above": 256
                            }
                          }
                        }
                      }
                    },
                    "error": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "hostname": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "ip": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "rtt": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    }
                  }
                },
                "received": {
                  "type": "long"
                },
                "reorders": {
                  "type": "long"
                },
                "roundtrips": {
                  "properties": {
                    "hostname": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "ip": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "length": {
                      "type": "long"
                    },
                    "rtt": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "seq": {
                      "type": "long"
                    },
                    "ttl": {
                      "type": "long"
                    }
                  }
                },
                "schema": {
                  "type": "long"
                },
                "sent": {
                  "type": "long"
                },
                "stddev": {
                  "type": "text",
                  "fields": {
                    "keyword": {
                      "type": "keyword",
                      "ignore_above": 256
                    }
                  }
                },
                "succeeded": {
                  "type": "boolean"
                },
                "summary": {
                  "properties": {
                    "streams": {
                      "properties": {
                        "end": {
                          "type": "float"
                        },
                        "jitter": {
                          "type": "float"
                        },
                        "lost": {
                          "type": "long"
                        },
                        "retransmits": {
                          "type": "long"
                        },
                        "rtt": {
                          "type": "long"
                        },
                        "sent": {
                          "type": "long"
                        },
                        "start": {
                          "type": "long"
                        },
                        "stream-id": {
                          "type": "long"
                        },
                        "tcp-window-size": {
                          "type": "long"
                        },
                        "throughput-bits": {
                          "type": "float"
                        },
                        "throughput-bytes": {
                          "type": "long"
                        }
                      }
                    },
                    "summary": {
                      "properties": {
                        "end": {
                          "type": "float"
                        },
                        "jitter": {
                          "type": "float"
                        },
                        "lost": {
                          "type": "long"
                        },
                        "retransmits": {
                          "type": "long"
                        },
                        "sent": {
                          "type": "long"
                        },
                        "start": {
                          "type": "long"
                        },
                        "stream-id": {
                          "type": "text",
                          "fields": {
                            "keyword": {
                              "type": "keyword",
                              "ignore_above": 256
                            }
                          }
                        },
                        "tcp-window-size": {
                          "type": "long"
                        },
                        "throughput-bits": {
                          "type": "float"
                        },
                        "throughput-bytes": {
                          "type": "long"
                        }
                      }
                    }
                  }
                },
                "tcp-window-size": {
                  "type": "long"
                }
              }
            },
            "test-type": {
              "type": "text",
              "fields": {
                "keyword": {
                  "type": "keyword",
                  "ignore_above": 256
                }
              }
            }
          }
        },
        "duration": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "end-time": {
          "type": "date"
        },
        "errors": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "host": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "href": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "participant": {
          "type": "long"
        },
        "participant-data": {
          "properties": {
            "data_port_start": {
              "type": "long"
            },
            "server_port": {
              "type": "long"
            }
          }
        },
        "participant-data-full": {
          "properties": {
            "data_port_start": {
              "type": "long"
            },
            "server_port": {
              "type": "long"
            }
          }
        },
        "participants": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "path": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "result": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "result-full": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "result-href": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "result-merged": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "run-succeeded": {
          "type": "boolean"
        },
        "start-time": {
          "type": "date"
        },
        "state": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "state-display": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "task-href": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        },
        "type": {
          "type": "text",
          "fields": {
            "keyword": {
              "type": "keyword",
              "ignore_above": 256
            }
          }
        }
      }
}


  }
}
'


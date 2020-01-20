# HTTP API to load records in to Aleph

## Usage
### Example request
```
$ curl -L -XPOST \
-u "$API_KEY:" \
-H 'Content-Type: text/plain' \
--data-binary @records.seq \
"https://foo.bar/aleph-record-load-api/?library=FOO&method=NEW&fixRoutine=BAR&cataloger=$CATALOGER"
["000000001FOO", "000000001FOO"]
```

### Environment variables
| Name             | Mandatory | Description                                                                           | String formating* |
|------------------|-----------|---------------------------------------------------------------------------------------|-------------------|
| LOAD_COMMAND     | Yes       | Path of the record load command,                                                      | No                |
|                  |           | e.g. */exlibris/aleph/a23_3/aleph/proc/p_manage_18*                                   |                   |
| LOAD_COMMAND_ENV | Yes       | path of the enviromental variable file for record load command,                       | No                |
|                  |           | e.g. */exlibris/aleph/a23_3/alephm/.cshrc*                                            |                   |
| API_KEYS         | Yes       | A string array list of API keys which are authorized to use the API,                  | No                |
|                  |           | e.g. *["Api_key"]*                                                                    |                   |
| TEMP_FILE_PATH   | Yes       | Path of the temporay input data file and error log file,                              | Yes               |
|                  |           | e.g. */exlibris/aleph/u23_3/%s/scratch/record-load-api/%s* (library, filename)        |                   |
| RESULT_FILE_PATH | Yes       | Path of the p_manage_18 result output file,                                           | Yes               |
|                  |           | e.g. */exlibris/aleph/u23_3/alephe/scratch/record-load-api/%s* (file)                 |                   |
| HTTP_PORT        | No        | Http port that program will be listenning,                                            | No                |
|                  |           | e.g. *8080* Defaults to 8080                                                          |                   |
| OFFLINE_PERIOD   | No        | Starting hour and length of offline period. Format is `'START_HOUR,LENGTH_IN_HOURS'`, | No                |
|                  |           | e.g. *'23,3'* Defaults to '0,0'                                                       |                   |
*Formate values are shown as %s and explanations can be found in () in order.

### Query parameters
| Name             | Mandatory | Default value | Description                                             |
|------------------|-----------|---------------|---------------------------------------------------------|
| cataloger        | Yes       |               | Value which is written to *CAT* fields                  |
| library          | Yes       |               | Library to use                                          |
| method           | Yes       |               | Method of operation. Either *NEW* or *OLD*              |
| catalogerLevel   | No        |               | Cataloger lever                                         |
| charConversion   | No        |               | Character conversion to apply                           |
| fixRoutine       | No        |               | Fix routine to use                                      |
| indexing         | No        | FULL          | Indexing action                                         |
| indexingPriority | No        |               | Override indexing priority                              |
| mergeRoutine     | No        |               | Merge/Preferred routine                                 |
| mode             | No        | M             | User mode. Either *M* (Multi-user) or *S* (Single-user) |
| updateAction     | No        | APP           | Update action                                           |

### Example Installation location
```
Directory "/exlibris/linnea/aleph-record-load-api"
Set enviromental variables
```

## License and copyright

Copyright (c) 2018-2019 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **Apache License 2.0**.

# HTTP API to load records in to Aleph

## Usage
### Example request
```
$ curl -L -XPOST \
-u "$API_KEY:" \
-H 'Content-Type: text/plain' \
--data-binary @records.seq \
"https://foo.bar/node-aleph-record-load-api/?library=FOO&method=NEW&fixRoutine=BAR&cataloger=$CATALOGER"
["000000001FOO", "000000001FOO"]
```

### Environment variables
| Name             | Mandatory | Description                                                                    | String formating* |
|------------------|-----------|--------------------------------------------------------------------------------|-------------------|
| LOAD_COMMAND     | Yes       | Path of the record load command,                                               | No                |
|                  |           | e.g. */exlibris/aleph/a23_3/aleph/proc/p_manage_18*                            |                   |
| LOAD_COMMAND_ENV | Yes       | path of the enviromental variable file for record load command,                | No                |
|                  |           | e.g. */exlibris/aleph/a23_3/alephm/.cshrc*                                     |                   |
| API_KEYS         | Yes       | A string array list of API keys which are authorized to use the API,           | No                |
|                  |           | e.g. *["Api_key"]*                                                             |                   |
| TEMP_FILE_PATH   | Yes       | Path of the temporay input data file and error log file,                       | Yes               |
|                  |           | e.g. */exlibris/aleph/u23_3/%s/scratch/record-load-api/%s* (library, filename) |                   |
| RESULT_FILE_PATH | Yes       | Path of the p_manage_18 result output file,                                    | Yes               |
|                  |           | e.g. */exlibris/aleph/u23_3/alephe/scratch/record-load-api/%s* (file)          |                   |
| HTTP_PORT        | No        | Http port that program will be listenning,                                     | No                |
|                  |           | e.g. *8080* Defaults to 8080                                                   |                   |
| OFFLINE_PERIOD   | No        | Starting hour and length of offline period.                                    | No                |
|                  |           | e.g. *'23,3'* Defaults to '0,0'                                                |                   |
| LOG_LEVEL        | No        | Level of logged information                                                    | no                |
|                  |           | e.g. 'debug'                                                                   |                   |
*Formate values are shown as %s and explanations can be found in () in order.

### Query parameters
| Name              | Mandatory | Default value | Description                                             |
|-------------------|-----------|---------------|---------------------------------------------------------|
| pActiveLibrary    | Yes       | `params`      | Library to use                                          |
| pInputFile        | No        | `generated`   | Source file location                                    |
| pRejectFile       | No        | `generated`   | Log file for rejected records                           |
| pLogFile          | No        | `generated`   | Log file for updated/created record ids                 |
| pOldNew           | Yes       | `params`      | Method of operation. Either *NEW* or *OLD*              |
| pFixType          | No        | API           | Fix routine to use                                      |
| pCheckReferences  | No        |               |                                                         |
| pUpdateF          | No        | FULL          | Indexing action                                         |
| pUpdateType       | No        | REP           | Update action                                           |
| pUpdateMode       | No        | M             | User mode. Either *M* (Multi-user) or *S* (Single-user) |
| pCharConv         | No        |               | Character conversion to apply                           |
| pMergeType        | No        |               | Merge/Preferred routine                                 |
| pCatalogerIn      | Yes       | `params`      | Value which is written to *CAT* fields                  |
| pCatalogerLevelX  | No        |               | Cataloger lever                                         |
| pZ07PriorityYear  | No        |               | Override indexing priority                              |
| pRedirectionField | No        |               |                                                         |

### Example Installation location
```
Directory "/home/user/node-aleph-record-load-api/app"
Set enviromental variables
```

## License and copyright

Copyright (c) 2018-2019 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **Apache License 2.0**.

# HTTP API to load records in to Aleph

## Usage
### Example request
```
$ curl -L -XPOST \
-u "$API_KEY:" \
-H 'Content-Type: text/plain' \
--data-binary @records.seq \
"https://foo.bar/aleph-record-load-api/library=FOO&method=NEW&fixRoutine=BAR&cataloger=$CATALOGER"
["000000001FOO", "000000001FOO"]
```
### Environment variables
| Name             | Mandatory | Description                                                                                       | String formating* |
|------------------|-----------|---------------------------------------------------------------------------------------------------|-------------------|
| ALEPH_VERSION    | Yes       | Version of the Aleph instance, e.g. *23_3*                                                        | No                |
| LOAD_COMMAND     | Yes       | Path of the record load command,                                                                  | Yes               |
|                  |           | e.g. */exlibris/aleph/a%s/aleph/proc/p_manage_18* (version)                                       |                   |
| LOAD_COMMAND_ENV | Yes       | path of the enviromental variable file for record load command,                                   | Yes               |
|                  |           | e.g. */exlibris/aleph/a%s/alephm/.cshrc* (version)                                                |                   |
| API_KEYS         | Yes       | A comma-separated list of API keys which are authorized to use the API                            | No                |
| HTTP_PORT        | No        | Http port that program will be listenning (Defaults to '3000')                                    | No                |
| IP_FILTER        | No        | RegExp presentation of allowed IP addresses i.e. default value '["128.214.0.0/16"]'               | No                |
| OFFLINE_PERIOD   | No        | Starting hour and length of offline period. Format is `{START_HOUR,LENGTH_IN_HOURS}`, e.g. '0,0'  | No                |
| TEMP_FILE_PATH   | Yes       | Path of the temporay input data file and error log file,                                          | Yes               |
|                  |           | e.g. */exlibris/aleph/u%s/%s/scratch/record-load-api/%s%s* (version, library, filename, filetype) |                   |
| LOG_FILE_PATH    | Yes       | Path of the input operation log file,                                                             | Yes               |
|                  |           | e.g. */exlibris/aleph/u%s/alephe/scratch/record-load-api/* (version, file)                        |                   |
*Formate values are shown as %s and explanations can be found in () in order.

### Query parameters
| Name             | Mandatory | Default value | Description                                                  |
|------------------|-----------|---------------|--------------------------------------------------------------|
| library          | Yes       |               | Library to use                                               |
| method           | Yes       |               | Method of operation. Either *NEW* or *OLD*                   |
| cataloger        | Yes       |               | Value which is written to *CAT* fields                       |
| fixRoutine       | No        |               | Fix routine to use                                           |
| indexing         | No        | FULL          | Indexing action                                              |
| updateAction     | No        | APP           | Update action                                                |
| mode             | No        | M             | User mode. Either *M* (Multi-user) or *S* (Single-user)      |
| charConversion   | No        |               | Character conversion to apply                                |
| mergeRoutine     | No        |               | Merge/Preferred routine                                      |
| catalogerLevel   | No        |               | Cataloger lever                                              |
| indexingPriority | No        |               | Override indexing priority                                   |
| QUEUEID          | No        |               | Used to notify client when priority queued record is created |

### Example Apache configuration block
```
<Directory "/exlibris/aleph/u23_3/alephe/apache/htdocs/aleph-record-load-api">
  Options ExecCGI FollowSymLinks
  AddHandler cgi-script .cgi
  DirectoryIndex index.cgi
  AddDefaultCharset UTF-8

  RewriteEngine on
  RewriteCond %{HTTP:Authorization} ^(.*)
  RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]

  SetEnv ALEPH_VERSION 23_3
  SetEnv API_KEYS <API_KEYS>
  SetEnv LOAD_COMMAND /exlibris/aleph/a%s/aleph/proc/p_manage_18
  SetEnv LOAD_COMMAND_ENV /exlibris/aleph/a%s/alephm/.cshrc
  SetEnv OFFLINE_PERIOD '{"start": 23, "duration": 3}'
  SetEnv TEMP_FILE_PATH /exlibris/aleph/u%s/%s/scratch/record-load-api/%s%s
  SetEnv LOG_FILE_PATH /exlibris/aleph/u%s/alephe/scratch/record-load-api/
</Directory>
```
### Using a different Python parser (index.cgi)
```
#!/bin/bash
export LD_LIBRARY_PATH=''
/opt/python/bin/python2.7 index.py
```
## License and copyright

Copyright (c) 2018-2019 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **Apache License 2.0**.

# courier-plugin-sdk-nodejs

Nodejs SDK for Plugin development for Paytm Logistics Courier Service. This plugin can be used to test the plugin that courier needs to develop. The plugin will contain code required for dynamic AWB fetching, order cancellation, order maniphest, etc.

### What is the idea behind plugin?
Plugin is a nice plug and play type of feature to integrate with any Courier provider. A courier provides provides many services like manifest(order creation), tracking and cancellation. For each courier, we do a certain set of tasks which basically involves creating http options to be requested to the courier, parsing the reponse received from their end and then taking some actions on the basis of it. We abstracted this whole process in the form of `plugin`. A plugin can run in two form - either just by writing config for a courier(like url endpoint, request method) etc or by creating a plugin. Plugin is generally created for those cases, where the default flow(config dirven) is not able to run.

### Where is the sample plugin ?
Sample plugin can be found at `plugin-skeleton-for-reference` folder.

### How to decide which functions to override ?
Detailed documentation can be found below in separate headings. The exposed functions for each type of requirement can be found below.

### How to test plugin and use this SDK ?
 - Put Plugin code in `put-plugin-code-here-to-test` folder.
 - Run `npm test --grep "manifest"`  . The SDK will test the plugin against its test cases

### where should I keep the settings for my Plugin?
The settings can be kept in `manifest.json` file in `settings` key. The settings can also be specified in plugin manager gui on production system. The settings specified

### Where to submit Queries/issues ?
Issues related to courier operations/ plugin sdk must be submitted to Paytm's courier operations team/ techops team.

### Before you proceed

* With each plugin, a `manifest.json` will be included. The contents of this will be available in plugin as `getSettings()`. Lets consider, for example sample `manifest.json` file is something like

```
{
  "version": "0.0.1",
  "settings" : {
    "pullFetchUrl" : "http://example.com"
  }
}
```

To access it,

```
console.log(this.getSettings());
{ pullFetchUrl: 'http://example.com' }
```

* Also each plugin will have `contextObj` which will be used to store values pertaining to that plugin. Examples includes setting authorization header token valid for X hours, etc.
* Function marked with `**` will be rarely overridden, like `pullTrackDetails**`
* Functions marked with `*` will be mostly overridden.

# Order Creation

### Call Tree ( 17 functions )

```
1. createOrderInit
├─ 2. initContext
    └─ 3. getHttpRequestOpts
│     ├─ 4. getRequestUrl
│     ├─ 5. getRequestMethod
│     ├─ 6. getRequestTimeout
│     ├─ 7. getRequestHeaders
│     ├─ 8. getRequestBody
│     ├─ 9. getRequestForm
│     ├─ 10. getRequestJson
│     ├─ 11. getRequestQueryString
│     └─ 12. getPostHttpExtraOpts
│
├─ 13. hitHttpApi
│
└─ 14. parseHttpResponse
   ├─ 15. failureOrderCreation
   |  └─ 17. orderCreationOver
   |
   └─ 16. successOrderCreation
      └─ 17. orderCreationOver

```

### Function signature

1) __createOrderInit(orderCreationData)__**:

This function will be the main entry point for plugin system. Logically it is the top most level
function available, It can also be overridden(though overriding it would mean over riding the complete
flow).

2) __initContext(callback)__*:

This function is a place to do all the asynchronous task. Task like requesting dynamic headers from the courier can be easily done here.

3) __getHttpRequestOpts(cb, orderCreationData)__**:

This function will be the top level function for creating request data. It will internally call micro level functions
to get details for object like request method, url, headers, timeout and the most important thing request body. These micro functions can be overridden as and when required. Also this function will take callback as sometimes, function like generating crypt or hash are required.

4) __getRequestUrl()__*:

This extracts `createOrderUrl` key from `this.getSettings()` and returns the value of it. If you want to specify any other key like `myAwesomeKey`, override this function. Ideally overriding this function just for changing key name is not preferred.

5) __getRequestMethod()__*:

This extracts a key named `createOrderRequestMethod` in `this.getSettings()` object. Default value is _POST_ if no such key is specified.

6) __getRequestTimeout()__*:

This extracts a key named as `createOrderRequestTimeout` in the `this.getSettings()` object. By default it returns a timeout of _30 seconds(30 * 1000)_.

7) __getRequestHeaders()__*:

This expects a settings object with a key `createOrderHeaders` and returns the value of it. To specify any other key just override this function

8) __getRequestBody(orderCreationData)__*:

This take as argument the complete manifest data that is passed initially to the `createOrderInit()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `body` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

9) __getRequestForm(orderCreationData)__*:

This take as argument the complete manifest data that is passed initially to the `createOrderInit()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `form` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

10) __getRequestJson(orderCreationData)__*:

This take as argument the complete pull data that is passed initially to the `createOrderInit()`. It sets a key named `json` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

11) __getRequestQueryString(orderCreationData)__*:

This take as argument the complete pull data that is passed initially to the `createOrderInit()`. It sets a key named `qs` on the request options __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

12) __getPostHttpExtraOpts()__*:

This function will be used when certain additional keys are required to be set on the reqOpts,
For eg ::

```
    {
        json: true
    }
```
By default it will return null, meaning that no extra keys are required to be set on the reqOpts.
Since it returns a object, `getHttpRequestOpts` will iterate over the keys of the returned object and for each key it will set a value in the main reqOpts.

13) __hitHttpApi(orderCreationData, reqOpts)__**:

The only work that this function will do is hit the shipper at the requested url. It will be given a complete requestOpts. This function is not taking any callback, because of the same reasons for which `createOrderInit` is not taking any callback. After requesting with the shipper, it will call `parseHttpResponse` with error, response and body as the arguments.

14) __parseHttpResponse(orderCreationData, error, response, body)__*:

This is called when the request from shipper is completed. It will be the main function for deciding whether the response received is a success or failure one. The most basic approach to decide success and failure will be something on the lines of

* response code is __200__ and there is no error, signifies that is __SUCCESS__. BUT there are cases    when the manifest with the AWB already exists and response code is still 200. It is then purely subjective on us to decide whether it is success or failure

* Everything else will go in Error case.

On success it calls `successOrderCreation` and for failure it calls `failureOrderCreation`.

This function will generally be __overridden__ by each shipper.

15) __failureOrderCreation(orderCreationData, statusCode, error)__**:

It will be called from `parseHttpResponse` when there is failure. This function in turn calls `orderCreationOver` with `isOrderSuccessfullyCreated` as false.

16) __successOrderCreation(orderCreationData, statusCode, body)__**:

It will be called from `parseHttpResponse` when there is success. This function in turn calls `orderCreationOver` with `isOrderSuccessfullyCreated` as true.

17) __orderCreationOver(isOrderSuccessfullyCreated, orderCreationData, code, body)__:

This takes as its first argument a flag, which indicates whether the manifest was successfully created with the courier or not.


# Reverse Order Creation

### Call Tree ( 17 functions )

```
1. createRevOrderInit
├─ 2. initContext
    └─ 3. getHttpRequestOpts
│     ├─ 4. getRequestUrl
│     ├─ 5. getRequestMethod
│     ├─ 6. getRequestTimeout
│     ├─ 7. getRequestHeaders
│     ├─ 8. getRequestBody
│     ├─ 9. getRequestForm
│     ├─ 10. getRequestJson
│     ├─ 11. getRequestQueryString
│     └─ 12. getPostHttpExtraOpts
│
├─ 13. hitHttpApi
│
└─ 14. parseHttpResponse
   ├─ 15. failureOrderCreation
   |  └─ 17. orderCreationOver
   |
   └─ 16. successOrderCreation
      └─ 17. orderCreationOver

```

### Function signature

1) __createRevOrderInit(revOrderCreationData)__**:

This function will be the main entry point for plugin system. Logically it is the top most level
function available, It can also be overridden(though overriding it would mean over riding the complete
flow).

2) __initContext(callback)__*:

This function is a place to do all the asynchronous task. Task like requesting dynamic headers from the courier can be easily done here.

3) __getHttpRequestOpts(cb, revOrderCreationData)__**:

This function will be the top level function for creating request data. It will internally call micro level functions
to get details for object like request method, url, headers, timeout and the most important thing request body. These micro functions can be overridden as and when required. Also this function will take callback as sometimes, function like generating crypt or hash are required.

4) __getRequestUrl()__*:

This extracts `createRevOrderUrl` key from `this.getSettings()` and returns the value of it. If you want to specify any other key like `myAwesomeKey`, override this function. Ideally overriding this function just for changing key name is not preferred.

5) __getRequestMethod()__*:

This extracts a key named `createRevOrderRequestMethod` in `this.getSettings()` object. Default value is _POST_ if no such key is specified.

6) __getRequestTimeout()__*:

This extracts a key named as `createRevOrderRequestTimeout` in the `this.getSettings()` object. By default it returns a timeout of _30 seconds(30 * 1000)_.

7) __getRequestHeaders()__*:

This expects a settings object with a key `createRevOrderHeaders` and returns the value of it. To specify any other key just override this function

8) __getRequestBody(revOrderCreationData)__*:

This take as argument the complete manifest data that is passed initially to the `createRevOrderInit()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `body` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

9) __getRequestForm(revOrderCreationData)__*:

This take as argument the complete manifest data that is passed initially to the `createRevOrderInit()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `form` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

10) __getRequestJson(revOrderCreationData)__*:

This take as argument the complete pull data that is passed initially to the `createRevOrderInit()`. It sets a key named `json` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

11) __getRequestQueryString(revOrderCreationData)__*:

This take as argument the complete pull data that is passed initially to the `createRevOrderInit()`. It sets a key named `qs` on the request options __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

12) __getPostHttpExtraOpts()__*:

This function will be used when certain additional keys are required to be set on the reqOpts,
For eg ::

```
    {
        json: true
    }
```
By default it will return null, meaning that no extra keys are required to be set on the reqOpts.
Since it returns a object, `getHttpRequestOpts` will iterate over the keys of the returned object and for each key it will set a value in the main reqOpts.

13) __hitHttpApi(revOrderCreationData, reqOpts)__**:

The only work that this function will do is hit the shipper at the requested url. It will be given a complete requestOpts. This function is not taking any callback, because of the same reasons for which `createRevOrderInit` is not taking any callback. After requesting with the shipper, it will call `parseHttpResponse` with error, response and body as the arguments.

14) __parseHttpResponse(revOrderCreationData, error, response, body)__*:

This is called when the request from shipper is completed. It will be the main function for deciding whether the response received is a success or failure one. The most basic approach to decide success and failure will be something on the lines of

* response code is __200__ and there is no error, signifies that is __SUCCESS__. BUT there are cases    when the manifest with the AWB already exists and response code is still 200. It is then purely subjective on us to decide whether it is success or failure

* Everything else will go in Error case.

On success it calls `successOrderCreation` and for failure it calls `failureOrderCreation`.

This function will generally be __overridden__ by each shipper.

15) __failureOrderCreation(revOrderCreationData, statusCode, error)__**:

It will be called from `parseHttpResponse` when there is failure. This function in turn calls `orderCreationOver` with `isOrderSuccessfullyCreated` as false.

16) __successOrderCreation(revOrderCreationData, statusCode, body)__**:

It will be called from `parseHttpResponse` when there is success. This function in turn calls `orderCreationOver` with `isOrderSuccessfullyCreated` as true.

17) __orderCreationOver(isOrderSuccessfullyCreated, revOrderCreationData, code, body)__:

This takes as its first argument a flag, which indicates whether the manifest was successfully created with the courier or not.


# Rpc Order Creation

### Call Tree ( 17 functions )

```
1. createRpcOrderInit
├─ 2. initContext
    └─ 3. getHttpRequestOpts
│     ├─ 4. getRequestUrl
│     ├─ 5. getRequestMethod
│     ├─ 6. getRequestTimeout
│     ├─ 7. getRequestHeaders
│     ├─ 8. getRequestBody
│     ├─ 9. getRequestForm
│     ├─ 10. getRequestJson
│     ├─ 11. getRequestQueryString
│     └─ 12. getPostHttpExtraOpts
│
├─ 13. hitHttpApi
│
└─ 14. parseHttpResponse
   ├─ 15. failureOrderCreation
   |  └─ 17. orderCreationOver
   |
   └─ 16. successOrderCreation
      └─ 17. orderCreationOver

```

### Function signature

1) __createRpcOrderInit(rpcOrderCreationData)__**:

This function will be the main entry point for plugin system. Logically it is the top most level
function available, It can also be overridden(though overriding it would mean over riding the complete
flow).

2) __initContext(callback)__*:

This function is a place to do all the asynchronous task. Task like requesting dynamic headers from the courier can be easily done here.

3) __getHttpRequestOpts(cb, rpcOrderCreationData)__**:

This function will be the top level function for creating request data. It will internally call micro level functions
to get details for object like request method, url, headers, timeout and the most important thing request body. These micro functions can be overridden as and when required. Also this function will take callback as sometimes, function like generating crypt or hash are required.

4) __getRequestUrl()__*:

This extracts `createRpcOrderUrl` key from `this.getSettings()` and returns the value of it. If you want to specify any other key like `myAwesomeKey`, override this function. Ideally overriding this function just for changing key name is not preferred.

5) __getRequestMethod()__*:

This extracts a key named `createRpcOrderRequestMethod` in `this.getSettings()` object. Default value is _POST_ if no such key is specified.

6) __getRequestTimeout()__*:

This extracts a key named as `createRpcOrderRequestTimeout` in the `this.getSettings()` object. By default it returns a timeout of _30 seconds(30 * 1000)_.

7) __getRequestHeaders()__*:

This expects a settings object with a key `createRpcOrderHeaders` and returns the value of it. To specify any other key just override this function

8) __getRequestBody(rpcOrderCreationData)__*:

This take as argument the complete manifest data that is passed initially to the `createRpcOrderInit()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `body` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

9) __getRequestForm(rpcOrderCreationData)__*:

This take as argument the complete manifest data that is passed initially to the `createRpcOrderInit()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `form` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

10) __getRequestJson(rpcOrderCreationData)__*:

This take as argument the complete pull data that is passed initially to the `createRpcOrderInit()`. It sets a key named `json` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

11) __getRequestQueryString(rpcOrderCreationData)__*:

This take as argument the complete pull data that is passed initially to the `createRpcOrderInit()`. It sets a key named `qs` on the request options __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

12) __getPostHttpExtraOpts()__*:

This function will be used when certain additional keys are required to be set on the reqOpts,
For eg ::

```
    {
        json: true
    }
```
By default it will return null, meaning that no extra keys are required to be set on the reqOpts.
Since it returns a object, `getHttpRequestOpts` will iterate over the keys of the returned object and for each key it will set a value in the main reqOpts.

13) __hitHttpApi(rpcOrderCreationData, reqOpts)__**:

The only work that this function will do is hit the shipper at the requested url. It will be given a complete requestOpts. This function is not taking any callback, because of the same reasons for which `createRpcOrderInit` is not taking any callback. After requesting with the shipper, it will call `parseHttpResponse` with error, response and body as the arguments.

14) __parseHttpResponse(rpcOrderCreationData, error, response, body)__*:

This is called when the request from shipper is completed. It will be the main function for deciding whether the response received is a success or failure one. The most basic approach to decide success and failure will be something on the lines of

* response code is __200__ and there is no error, signifies that is __SUCCESS__. BUT there are cases when the manifest with the AWB already exists and response code is still 200. It is then purely subjective on us to decide whether it is success or failure

* Everything else will go in Error case.

On success it calls `successOrderCreation` and for failure it calls `failureOrderCreation`.

This function will generally be __overridden__ by each shipper.

15) __failureOrderCreation(rpcOrderCreationData, statusCode, error)__**:

It will be called from `parseHttpResponse` when there is failure. This function in turn calls `orderCreationOver` with `isOrderSuccessfullyCreated` as false.

16) __successOrderCreation(rpcOrderCreationData, statusCode, body)__**:

It will be called from `parseHttpResponse` when there is success. This function in turn calls `orderCreationOver` with `isOrderSuccessfullyCreated` as true.

17) __orderCreationOver(isOrderSuccessfullyCreated, rpcOrderCreationData, code, body)__:

This takes as its first argument a flag, which indicates whether the manifest was successfully created with the courier or not.


# Track Shipment

### Call Tree ( 22 functions )

```
1. pullTrackDetails
├─ 2. initContext
│   └─ 3. getHttpRequestOpts
│     ├─ 4. getRequestUrl
│     ├─ 5. getRequestMethod
│     ├─ 6. getRequestTimeout
│     ├─ 7. getRequestHeaders
│     ├─ 8. getRequestBody
│     ├─ 9. getRequestForm
│     ├─ 10. getRequestJson
│     ├─ 11. getRequestQueryString
│     └─ 12. getPostHttpExtraOpts
│
├─ 13. hitHttpApi
│
└─ 14. parseHttpResponse
   ├─ 15. failurePullFetch
   │  └─ 22. trackingComplete
   │
   └─ 16. updateStatus
      ├─ 17. getAwbFromResponse
      ├─ 18. getStatusCodeFromResponse
      ├─ 19. getDateFromResponse
      ├─ 20. getTimeFromResponse
      ├─ 21. getDateFormat
      └─ 22. trackingComplete
```



### Function signature

1) __pullTrackDetails(pullData)__**:

This function will be the main entry point for pull plugin system. Logically it is the top most level
function available. Rarely overridden, though overriding this would mean changing the complete flow.

2) __initContext(callback)__*:

This function is a place to do all the asynchronous task. Task like requesting dynamic headers from the courier can be easily done here.

3) __getHttpRequestOpts(cb, pullData)__**:

This function will be the top level function for creating request data to initiate tracking from shipper. It will internally call micro level functions
to get details for object like request method, url, headers, timeout and the most important thing request body. These micro functions can be overridden as and when required. This function expects a callback.

4) __getRequestUrl()__*:

This extracts `pullFetchUrl` key from `this.getSettings()` and returns the value of it. If you want to specify any other key like `myAwesomeKey`, override this function. Ideally overriding this function just for changing key name is not preferred.

5) __getRequestMethod()__*:

This extracts a key named `pullFetchRequestMethod` in `this.getSettings()` object. Default value is _GET_ if no such key is specified.

6) __getRequestTimeout()__*:

This extracts a key named as `pullFetchRequestTimeout` in the `this.getSettings()` object. By default it returns a timeout of _75 seconds(75 * 1000)_.

7) __getRequestHeaders()__*:

This expects a settings object with a key `pullFetchHeaders` and returns the value of it. To specify any other key just override this function

8) __getRequestBody(pullData)__*:

This take as argument the complete pull data that is passed initially to the `pullTrackDetails()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `body` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

9) __getRequestForm(pullData)__*:

This take as argument the complete pull data that is passed initially to the `pullTrackDetails()`. It sets a key named `form` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

10) __getRequestJson(pullData)__*:

This take as argument the complete pull data that is passed initially to the `pullTrackDetails()`. It sets a key named `json` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

11) __getRequestQueryString(pullData)__*:

This take as argument the complete pull data that is passed initially to the `pullTrackDetails()`. It sets a key named `qs` on the request options __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

12) __getPostHttpExtraOpts()__*:

This function will be used when certain additional keys are required to be set on the reqOpts,
For eg ::

```
    {
        json: true
    }
```
By default it will return null, meaning that no extra keys are required to be set on the reqOpts.
Since it returns a object, `getHttpRequestOpts` will iterate over the keys of the returned object and for each key it will set a value in the main reqOpts.

13) __hitHttpApi(pullData, reqOpts)__**:

The only work that this function will do is hit the shipper at the requested url. It will be given a complete requestOpts. This function is not taking any callback, because of the same reasons for which `pullTrackDetails` is not taking any callback. After requesting with the shipper, it will call `parseHttpResponse` with pullData, error, response and body as the arguments.

14) __parseHttpResponse(pullData, error, response, body)__*:

This is called when the request from shipper is completed. It will be the main function for deciding whether the response received is a success or failure one. The most basic approach to decide success and failure will be something on the lines of

* response code is __200__ and there is no error, signifies that is __SUCCESS__. But this can be configured per shipper.

* Everything else will go in Error case.

On success it calls `updateStatus`and for failure it calls `failurePullFetch`.

NOTE::
 - We prefer that _every_ shipper should __override__ this function. This is because response will be different for each shipper and corresponding to it what action needs to be taken is basically controlled by this function.
 - The only thing that this function strictly enforces (design wise) is on __failure__(be it whatever condition), one should call `failurePullFetch` and on __success__ one should call `updateStatus`.
 - Also when `updateStatus` is called, we expect that it is called with the parsed body, which means it takes care of xml or json parsing. Hence parsing will be done in `parseHttpResponse` itself.

15) __failurePullFetch(pullData, statusCode, error)__**:

It will be called from `parseHttpResponse` when there is failure. This function in turn calls `trackingComplete` with `trackingSuccessful` as _false_.

16) __updateStatus(pullData, parsedResponse)__**:

It will be called from `parseHttpResponse` when there is success and status needs to be updated at our end.

17) __getAwbFromResponse(shipment)__*:

After the response is received from shipper, to extract details from it and take required actions, we need certain values. This will be extract __awb__ received from shipper.

18) __getStatusCodeFromResponse(shipment)__*:

After the response is received from shipper, to extract details from it and take required actions, we need certain values. This will be extract __status__ of the shipment received from shipper.

19) __getDateFromResponse(shipment)__*:

After the response is received from shipper, to extract details from it and take required actions, we need certain values. This will be extract __date__ received from shipper.

20) __getTimeFromResponse(shipment)__*:

After the response is received from shipper, to extract details from it and take required actions, we need certain values. This will be extract __time__ received from shipper.

21) __getDateFormat(shipment)__*:

This extracts a key named `pullFetchDateTimeFormat` in `this.getSettings()` object. Default value is _DD-MM-YYYY HH:mm:ss_ if no such key is specified.

22) __trackingComplete(trackingSuccessful, pullData, code, body)__**:

This takes as its first argument a flag, which indicates whether the tracking details was successfully fetched or not.

To see how to override functions, see a sample in `plugin-skeleton-for-reference/pull.js`.

# Track Reverse Shipment

### Call Tree ( 19 functions )

```
1. pullRevTrackDetails
├─ 2. initContext
│   └─ 3. getHttpRequestOpts
│       ├─ 4. getRequestUrl
│       ├─ 5. getRequestMethod
│       ├─ 6. getRequestTimeout
│       ├─ 7. getRequestHeaders
│       ├─ 8. getRequestBody
│       ├─ 9. getRequestForm
│       ├─ 10. getRequestJson
│       ├─ 11. getRequestQueryString
│       └─ 12. getPostHttpExtraOpts
│
├─ 13. hitHttpApi
│
└─ 14. parseHttpResponse
   ├─ 15. failurePullFetch
   │  └─ 19. trackingComplete
   │
   └─ 16. updateStatus
      ├─ 17. getAwbFromResponse
      ├─ 18. getStatusCodeFromResponse
      └─ 19. trackingComplete
```

### Function signature

1) __pullRevTrackDetails(pullRevData)__**:

This function will be the main entry point for pull plugin system. Logically it is the top most level
function available. Rarely overridden, though overriding this would mean changing the complete flow.

2) __initContext(callback)__*:

This function is a place to do all the asynchronous task. Task like requesting dynamic headers from the courier can be easily done here.

3) __getHttpRequestOpts(cb, pullRevData)__**:

This function will be the top level function for creating request data to initiate tracking from shipper. It will internally call micro level functions
to get details for object like request method, url, headers, timeout and the most important thing request body. These micro functions can be overridden as and when required. This function expects a callback.

4) __getRequestUrl()__*:

This extracts `pullRevFetchUrl` key from `this.getSettings()` and returns the value of it. If you want to specify any other key like `myAwesomeKey`, override this function. Ideally overriding this function just for changing key name is not preferred.

5) __getRequestMethod()__*:

This extracts a key named `pullRevFetchRequestMethod` in `this.getSettings()` object. Default value is _GET_ if no such key is specified.

6) __getRequestTimeout()__*:

This extracts a key named as `pullRevFetchRequestTimeout` in the `this.getSettings()` object. By default it returns a timeout of _75 seconds(75 * 1000)_.

7) __getRequestHeaders()__*:

This expects a settings object with a key `pullRevFetchHeaders` and returns the value of it. To specify any other key just override this function

8) __getRequestBody(pullRevData)__*:

This take as argument the complete pull data that is passed initially to the `pullRevTrackDetails()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `body` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

9) __getRequestForm(pullRevData)__*:

This take as argument the complete pull data that is passed initially to the `pullRevTrackDetails()`. It sets a key named `form` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

10) __getRequestJson(pullRevData)__*:

This take as argument the complete pull data that is passed initially to the `pullRevTrackDetails()`. It sets a key named `json` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

11) __getRequestQueryString(pullRevData)__*:

This take as argument the complete pull data that is passed initially to the `pullRevTrackDetails()`. It sets a key named `qs` on the request options __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

12) __getPostHttpExtraOpts()__*:

This function will be used when certain additional keys are required to be set on the reqOpts,
For eg ::

```
    {
        json: true
    }
```
By default it will return null, meaning that no extra keys are required to be set on the reqOpts.
Since it returns a object, `getHttpRequestOpts` will iterate over the keys of the returned object and for each key it will set a value in the main reqOpts.

13) __hitHttpApi(pullRevData, reqOpts)__**:

The only work that this function will do is hit the shipper at the requested url. It will be given a complete requestOpts. This function is not taking any callback, because of the same reasons for which `pullRevTrackDetails` is not taking any callback. After requesting with the shipper, it will call `parseHttpResponse` with pullRevData, error, response and body as the arguments.

14) __parseHttpResponse(pullRevData, error, response, body)__*:

This is called when the request from shipper is completed. It will be the main function for deciding whether the response received is a success or failure one. The most basic approach to decide success and failure will be something on the lines of

* response code is __200__ and there is no error, signifies that is __SUCCESS__. But this can be configured per shipper.

* Everything else will go in Error case.

On success it calls `updateStatus`and for failure it calls `failurePullFetch`.

NOTE::
 - We prefer that _every_ shipper should __override__ this function. This is because response will be different for each shipper and corresponding to it what action needs to be taken is basically controlled by this function.
 - The only thing that this function strictly enforces (design wise) is on __failure__(be it whatever condition), one should call `failurePullFetch` and on __success__ one should call `updateStatus`.
 - Also when `updateStatus` is called, we expect that it is called with the parsed body, which means it takes care of xml or json parsing. Hence parsing will be done in `parseHttpResponse` itself.

15) __failurePullFetch(pullRevData, statusCode, error)__**:

It will be called from `parseHttpResponse` when there is failure. This function in turn calls `trackingComplete` with `trackingSuccessful` as _false_.

16) __updateStatus(pullRevData, parsedResponse)__**:

It will be called from `parseHttpResponse` when there is success and status needs to be updated at our end.

17) __getAwbFromResponse(shipment)__*:

After the response is received from shipper, to extract details from it and take required actions, we need certain values. This will be extract __awb__ received from shipper.

18) __getStatusCodeFromResponse(shipment)__*:

After the response is received from shipper, to extract details from it and take required actions, we need certain values. This will be extract __status__ of the shipment received from shipper.

19) __trackingComplete(trackingSuccessful, pullRevData, code, body)__**:

This takes as its first argument a flag, which indicates whether the tracking details was successfully fetched or not.

To see how to override functions, see a sample in `plugin-skeleton-for-reference/pullReverse.js`.


# Order Cancellation

### Call Tree ( 17 functions )

```
1. notifyCancel
├─ 2. initContext
    └─ 3. getHttpRequestOpts
│     ├─ 4. getRequestUrl
│     ├─ 5. getRequestMethod
│     ├─ 6. getRequestTimeout
│     ├─ 7. getRequestHeaders
│     ├─ 8. getRequestBody
│     ├─ 9. getRequestForm
│     ├─ 10. getRequestJson
│     ├─ 11. getRequestQueryString
│     └─ 12. getPostHttpExtraOpts
│
├─ 13. hitHttpApi
│
└─ 14. parseHttpResponse
   ├─ 15. failureNotifyCancel
   |  └─ 17. cancelNotificationOver
   |
   └─ 16. successNotifyCancel
      └─ 17. cancelNotificationOver

```

### Function signature

1) __notifyCancel(cancelData)__**:

This function will be the main entry point for plugin system. Logically it is the top most level
function available, It can also be overridden(though overriding it would mean over riding the complete
flow).

2) __initContext(callback)__*:

This function is a place to do all the asynchronous task. Task like requesting dynamic headers from the courier can be easily done here.

3) __getHttpRequestOpts(cb, cancelData)__**:

This function will be the top level function for creating request data. It will internally call micro level functions
to get details for object like request method, url, headers, timeout and the most important thing request body. These micro functions can be overridden as and when required. Also this function will take callback as sometimes, function like generating crypt or hash are required.

4) __getRequestUrl()__*:

This extracts `cancelNotifyUrl` key from `this.getSettings()` and returns the value of it. If you want to specify any other key like `myAwesomeKey`, override this function. Ideally overriding this function just for changing key name is not preferred.

5) __getRequestMethod()__*:

This extracts a key named `cancelNotifyRequestMethod` in `this.getSettings()` object. Default value is _POST_ if no such key is specified.

6) __getRequestTimeout()__*:

This extracts a key named as `cancelNotifyRequestTimeout` in the `this.getSettings()` object. By default it returns a timeout of _30 seconds(30 * 1000)_.

7) __getRequestHeaders()__*:

This expects a settings object with a key `cancelNotifyHeaders` and returns the value of it. To specify any other key just override this function

8) __getRequestBody(cancelData)__*:

This take as argument the complete manifest data that is passed initially to the `notifyCancel()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `body` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

9) __getRequestForm(cancelData)__*:

This take as argument the complete manifest data that is passed initially to the `notifyCancel()`. This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `form` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

10) __getRequestJson(cancelData)__*:

This take as argument the complete pull data that is passed initially to the `notifyCancel()`. It sets a key named `json` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

11) __getRequestQueryString(cancelData)__*:

This take as argument the complete pull data that is passed initially to the `notifyCancel()`. It sets a key named `qs` on the request options __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

12) __getPostHttpExtraOpts()__*:

This function will be used when certain additional keys are required to be set on the reqOpts,
For eg ::

```
    {
        json: true
    }
```
By default it will return null, meaning that no extra keys are required to be set on the reqOpts.
Since it returns a object, `getHttpRequestOpts` will iterate over the keys of the returned object and for each key it will set a value in the main reqOpts.

13) __hitHttpApi(cancelData, reqOpts)__**:

The only work that this function will do is hit the shipper at the requested url. It will be given a complete requestOpts. This function is not taking any callback, because of the same reasons for which `notifyCancel` is not taking any callback. After requesting with the shipper, it will call `parseHttpResponse` with error, response and body as the arguments.

14) __parseHttpResponse(cancelData, error, response, body)__*:

This is called when the request from shipper is completed. It will be the main function for deciding whether the response received is a success or failure one. The most basic approach to decide success and failure will be something on the lines of

* response code is __200__ and there is no error, signifies that is __SUCCESS__. It is then purely subjective on us to decide whether it is success or failure

* Everything else will go in Error case.

On success it calls `successNotifyCancel` and for failure it calls `failureNotifyCancel`.

This function will generally be __overridden__ by each shipper.

15) __failureNotifyCancel(cancelData, statusCode, error)__**:

It will be called from `parseHttpResponse` when there is failure. This function in turn calls `cancelNotificationOver` with `isCancelSuccessfullyNotified` as false.

16) __successNotifyCancel(cancelData, statusCode, body)__**:

It will be called from `parseHttpResponse` when there is success. This function in turn calls `cancelNotificationOver` with `isCancelSuccessfullyNotified` as true.

17) __cancelNotificationOver(isCancelSuccessfullyNotified, cancelData, code, body)__:

This takes as its first argument a flag, which indicates whether the cancellation was successful or not.


### How to start writing a Plugin

I have been through the documentation and FAQ. It is great but still I dont know where to start. Then this section is for you.

To make things more simpler, lets us assume some things. Consider that we are planning to write __pull__ plugin for __XYZ__ shipper. `put-plugin-code-here-to-test` is the directory where plugin will live. From here onwards till the end of this section, it is the root directory. Assuming that you have cloned the repository, proceed as follows.

* Copy index.js from `../plugin-skeleton-for-reference`. This file actually helps in requiring various services for a shipper. In the current file(`../plugin-skeleton-for-reference/index.js`), if the plugin is made live, then it will make `createOrder` and `pull` service live for `XYZ` shipper. Our use case is only writing a plugin for `pull` so lets delete that createOrder require line and object creation.

Our `index.js` file will look something like

```
/*jshint multistr: true ,node: true*/
"use strict";

var P             = require('./pull.js');

module.exports = {
    pull : new P()
};

```

* Next is the `manifest.json` file where we will keep various values like `pullFetchUrl` etc. It should be a json.

* Next comes the file for our plugin. Since we are creating a `pull` plugin, so we will copy `pull.js` from `../plugin-skeleton-for-reference`. Had our example been of creating a `createOrder` plugin, we would have copied
`createOrder.js`. Replace `testCourierPull` with the name of your courier(here __XYZ__). The sample plugin contains `getRequestUrl`. It is just for reference. You can remove if not required.

Our `pull.js` file will look something like(keeping getRequestUrl to show a basic example of how to override function)

```

/*jshint multistr: true ,node: true*/
"use strict";

var
    /* Node Intenal */
    REQUEST             = require('request'),
    UTIL                = require('util'),

    /* NPM Third Party */
    _                   = require('lodash'),

    CORE_ORDER_PULL = require('../core/index.js').pull;

function XYZ () {

    var self            = this;

    CORE_ORDER_PULL.call(self);

}

XYZ.prototype.getRequestUrl = function(){

    var
        self            = this ,
        url             = _.get(self.getSettings(), 'settings.Base');

    return url;
};

UTIL.inherits(XYZ, CORE_ORDER_PULL);

module.exports = XYZ;

```

### Don'ts

* Never keep querystring, body or json in `manifest.json` file.
* Plugin should only live in `put-plugin-code-here-to-test`. Dont keep plugin in any other folder. Also dont rename this folder.
* `put-plugin-code-here-to-test` should contain files `index.js`, `manifest.json` at level 1. These files should not be placed within any sub folder. Tree should be like

```
put-plugin-code-here-to-test
  ├── createOrder.js
  ├── index.js
  ├── manifest.json
  └── pull.js
```

* You cannot keep plguin code for more than 1 courier in a single file. Plugin for a courier should be isolated.
* While creating a plugin, we expect that you will first inherit from the core plugin and then start ineriting functions. Assuming that you are writing plugin for pull, your sample `pull.js` should be something like

```
function testCourierPull () {

    var self            = this;

    // calling super class
    CORE_ORDER_PULL.call(self);

}

// this line should be before you start overriding functions.
UTIL.inherits(testCourierPull, CORE_ORDER_PULL);

// after inheriting start overriding functions.
testCourierPull.prototype.getRequestUrl = function(){
    /*
        This overrides `getRequestUrl` and returns the value of `settings.Base` from `manifest.json` file.
    */

    var
        self            = this ,
        url             = _.get(self.getSettings(), 'settings.Base');

    return url;
};
```




### Convention

* We prefer to use [Lodash](https://lodash.com/) for anything related to extracting a certain key value from any object to concatenating arrays.
* We use [Moment](http://momentjs.com/) for date/time related operations.
* As a stylistic convention, we prefer requires in capital, like

```
var REQUEST = require('request');
```
* Use camelCase convention where ever required.


### Frequently Asked Questions

Q. What is __pullData__ and from where it is received ?

A. pullData is input data which is supplied internally by our system to the module dealing with couriers. `pullData` is an array of
objects. Sample pullData can be like

```
pullData = [
    {
    tracking_number: "somevaluehere"
    },
    {
    tracking_number: "somevalueherealso"
    }
]
```

Q. What other names are possible for __Tracking Number__?

A. Tracking number in its most common form is knows as AWB(Airway Bill). Other possible names are docket number, dock number etc.

Q. My request url is `http://www.example.com?awb=123`. Which function should I override?

A. `awb=123` clearly tells us that this is querystring. So the function which should be overridden is `getRequestQueryString`.
This function should return a object. For the above case, object will be like

```
{
    "awb" : "123"
}

```

Another example for url `http://www.example.com?awb=123&token=mytoken`, it will be like

```
{
    "awb"   : "123",
    "token" : "mytoken"
}

```

__Q.__ I want to override `getRequestUrl` just for changing the key value. Is it preferred?

__A.__ Ideally this is not preferred. When the url needs to be created by joining several key values, then this function should be overridden. Like you have a key called `baseUrl` and its tracking end point key is `trackUrl`. In that case override this function to return the combined value of both the keys.

__Q.__ Default timeout value is 75 seconds. What should I do if I dont want to specify timeout value?

__A.__ Timeout of 75 seconds is kept so that even the response is received from the slowest shipper. If you dont want it, leave it as it is.

__Q.__ I need to send a string of awbs to the courier. What is the preferred way?

__A.__ Ideally this should be done by initially pushing all the awbs in to an array and then joining that array over comma(,).

__Q.__ When should I override `getRequestHeaders`?

__A.__ In most of the cases, generally where some static headers are required, this function should not be overridden because we can keep static values in `manifest.json` file. Static here means that these headers will the same for any request per shipper. So the only case where this should be overridden is where you want some dynamic headers, like some header having current date time value.

__Q.__ Can I write long and verbose comments?

__A.__ We like comments a lot. But comments should be only written explaining the reason why a particular code is written unless it is not used for the documentation purpose. Also dont copy the comments blindly from the `core` folder.

__Q.__ I need to integrate a courier which requires me to fetch headers dynamically. These headers are valid for only a limited amount of time. What should I do?

__A.__ This can be easily done by `initContext`and `contextObj`. Lets us make the example situation more clear and understand how we can do it. Consider that a courier requires headers to be generated at run time (by requesting at a particular url) and these headers are valid for a certain amount of time(say 4 hours). To do this `initContext` can be used. Override `initContext` and create request options there for getting headers from courier. Use `REQEUST` module, hit their http api and parse the response. Lets say you have got the token after parsing from the response. Now set this token in `contextObj` as whatever key you like, eg

```
_.set(self.contextObj, 'header-token', 'my-header-token-value-here')
```

Now the question comes, how to deal with token valid for 4 hours thing. This can be easily handled in `parseHttpResponse`. When the token becomes invalid, then response code will be __403__. A separate check for this can be included in `parseHttpResponse` where in if __403__ is received, then it can be set to _null_ in `contextObj`. A check can be included in `initContext` which will only request for token if it is not present in `contextObj`.


__Q.__ I already have written the plugin for one Service. What to do if I want to write another service for the same courier?

__A.__ Lets us assume that you written `pull` plugin for `XYZ` shipper. Now you to write `createOrder` plugin for it, First of all create an entry in `put-plugin-code-here-to-test/index.js` of createOrder being required and its object being created in module.exports, like

```
/*jshint multistr: true ,node: true*/
"use strict";

var
    C             = require('./createOrder.js'),
    P             = require('./pull.js');

module.exports = {

    createOrder : new C(),
    pull        : new P()
}

```

Next step would be to create `createOrder.js` in `put-plugin-code-here-to-test` and then override functions as required. Also `manifest.json` file will be updated

__Q.__ Are there any special libraries which is used while parsing json?

__A.__ We prefer the traditional and best way of parsing json using `JSON.parse`. Dont forget to wrap it inside a try-catch.

__Q.__ How xml parsing is done? Any special convention here?

__A.__ We use [xml2json](https://github.com/buglabs/node-xml2json) with the following options

```
{
    sanitize: true,
    trim: true,
    object: true
}
```

__Q.__ How do I check whether my plugin is correct?

__A.__ We have written a basic test case for each service. You can run all the test cases in one go by

```
mocha test
```

or to run a particular test pass that as an argument in grep like

```
# for pull forward flow
mocha test --grep="forward tracking"
# for pull reverse flow
mocha test --grep="reverse tracking"

# for forward order creation(manifest) flow
mocha test --grep="forward order"
# for reverse order creation(manifest) flow
mocha test --grep="reverse order"
# for rpc order creation(manifest) flow
mocha test --grep="rpc order"
# for cancellation flow
mocha test --grep="forward cancellation"
```

__Q.__ I need to pass sample awb provided by courier to check my complete flow. Where do I pass it?

__A.__ The place where you will place the data is in test folder. Each file in test has a variable called `dummyData` which
is an array of objects like

```
{
    tracking_number: ''
}
```

To pass multiple awbs, create copies of this object in the array.

__Q.__ I am still not clear of how to do dynamic header fetch thing. Can you elaborate more on that?

__A.__ Consider that you are writing plugin for XYZ courier, which requries dynamic token fetching with a validity of 4 hours. In such scenarios, your initContext will look like

```
XYZ.prototype.initContext = function(callback){

  var
      self    = this,
      reqOpts = 'create-req-opts-here-required-for-fetching-token';

  // hit courier only if token is not present in contextObj

  if( _.get(self.contextObj, 'myTokenKeyCanBeAnything', null) === null ){

      REQUEST(reqOpts, function(error, response, body){

          if(error || response.statusCode !== 200){
            self.logger.error('Error in fetching token from XYZ courier');

            // parse the response here and set a key in contextObj
            _.set(self.contextObj, 'myTokenKeyCanBeAnything', 'myTokenValue');

            // call the callback
            return callback();

          }

          return callback();

      });

  }

}
```

Also sample code that should be present in `parseHttpResponse` should look like


```
XYZ.prototype.parseHttpResponse = function (pullData, error, response, body) {

  var self = this;

  if (!error && response && response.statusCode === 403){
      // set `my-token-key` to null, so that it is set in the next execution
      self.contextObj.myTokenKeyCanBeAnything = null;
  }

}

```

To access it in `getRequestHeaders` for example,

```
XYZ.prototype.getRequestHeaders = function () {

  var
      self        = this,
      tokenValue  = null;

  tokenValue = _.get(self.contextObj, 'myTokenKeyCanBeAnything');

}
```

__Q.__ I am not clear on how to use lodash. Can you elaborate with an example?

__A.__ We generally use lodash for key-value pair extraction from a certain obj. For eg, Consider an object like

```
var myObj = {
    myKey1 : 'myValue'
}

# extract value via lodash
# as a good practice we specify default value when key is not available
var myVal1 = _.get(myObj, 'myKey1', null);

var myAnotherObj = {
    myKey1 : {
        myKey2 : {
            myKey3 : 'myValue'
        }
    }
}

var myVal2 = _.get(myAnotherObj, ['myKey1', 'myKey2', 'myKey3'], null)

# to set key b.c to object a,

_.set(a, ['b', 'c'], 'myKeyVal');

```


__Q.__ How do I log error message?

__A.__ Assuming that self is assigned in a function, use `self.logger.error`. Eg

```
self.logger.error('Error in extracting data')
```

### CheckList before submitting a plugin

This is a master list for any type of plugin. Person uploading a plugin should make sure that the following points are met.

* Make sure that all the files are at the same level, plugin structure should like

```
# NOT THIS, BAD NOT ENCOURAGED

└── myPlugin
    ├── createOrder.js
    ├── createOrderReverse.js
    ├── index.js
    ├── manifest.json
    ├── pull.js
    └── pullReverse.js

# GOOD PRACTICE

    ├── createOrder.js
    ├── createOrderReverse.js
    ├── index.js
    ├── manifest.json
    ├── pull.js
    └── pullReverse.js
```

* Make sure that you have used __lodash__ to extract key value pairs

* Conditions in if or while block should check explicitly against values. Eg, to check for a variable if it is null,

```

    // A VERY BAD PRACTICE.
    // NOT AT ALL ENCOURAGED
    if(!myVar){
        // do some action here
    }


    // GOOD PRACTICE, MUST USE THIS ONLY
    if(myVar === null){
        // do some stuff here
    }


```

* Run jshint on all files, before submitting any plugin.

*


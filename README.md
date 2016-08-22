# courier-plugin-sdk-nodejs

Nodejs SDK for Plugin development for Paytm Logistics Courier Service. This plugin can be used to test the plugin that courier needs to develop. The plugin will contain code required for dynamic AWB fetching, order cancellation, order maniphest, etc.

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


# Order Creation

### Call Tree ( 14 functions )

```
1. createOrderInit
├─ 2. getHttpRequestOpts
│  ├─ 3. getRequestUrl
│  ├─ 4. getRequestMethod
│  ├─ 5. getRequestTimeout
│  ├─ 6. getRequestBody
│  ├─ 7. getRequestForm
│  ├─ 8. getRequestHeaders
│  └─ 9. getPostHttpExtraOpts
│
├─ 10. hitHttpApi
│
└─ 11. parseHttpResponse
   ├─ 12. failureOrderCreation
   |  └─ 14. orderCreationOver
   |
   └─ 13. successOrderCreation
      └─ 14. orderCreationOver

```

### Function signature

1) __createOrderInit(orderCreationData)__:

This function will be the main entry point for plugin system. Logically it is the top most level
function available, It can also be overridden(though overriding it would mean over riding the complete
flow). This function will not accept any callback, because idea is to call this function just with the data and then as the order is created with the shipper, it will notify by itself. This work will be done by a function named `orderCreationOver`.

2) __getHttpRequestOpts(cb, orderCreationData)__

This function will be the top level function for creating request data. It will internally call subfunctions
to get details for object like request method, url, headers, timeout and the most important thing request body. These subfunctions can be overriden as and when required. Also this function will take callback as sometimes, function like generating crypt or hash are required.

3) __getRequestUrl()__:

This extracts `createOrderUrl` key from `this.getSettings()` and returns the value of it. If you want to specify any other key like `baseURL + FWOrderURL`, override this function. 

4) __getRequestMethod()__:

This extracts a key named `createOrderRequestMethod` in `this.getSettings()` object. Default value is _POST_ if no such key is specified.

5) __getRequestTimeout()__:

This extracts a key named as `createOrderRequestTimeout` in the `this.getSettings()` object. By default it returns a timeout of _30 seconds(30 * 1000)_.

6) __getRequestBody(orderCreationData)__:

This take as argument the complete manifest data that is passed initially to the createOrderInit(). This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `body` on the request options. __getRequestBody__ and __getRequestForm__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

7) __getRequestForm(orderCreationData)__:

This take as argument the complete manifest data that is passed initially to the createOrderInit(). This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `form` on the request options. __getRequestBody__ and __getRequestForm__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

8) __getRequestHeaders()__:

This expects a settings object with a key `createOrderHeaders` and returns the value of it. To specify any other key just override this function

9) __getPostHttpExtraOpts()__ :

This function will be used when certain additional keys are required to be set on the reqOpts,
For eg ::

```
    {
        json: true
    }
```
By default it will return null, meaning that no extra keys are required to be set on the reqOpts.
Since it returns a object, `getHttpRequestOpts` will iterate over the keys of the returned object and for each key it will set a value in the main reqOpts.

10) __hitHttpApi(reqOpts)__:

The only work that this function will do is hit the shipper at the requested url. It will be given a complete requestOpts. This function is not taking any callback, because of the same reasons for which `createOrderInit` is not taking any callback. After requesting with the shipper, it will call `parseHttpResponse` with error, response and body as the arguments.

11) __parseHttpResponse(error, response, body)__:

This is called when the request from shipper is completed. It will be the main function for deciding whether the response received is a success or failure one. The most basic approach to decide success and failure will be something on the lines of

* response code is __200__ and there is no error, signifies that is __SUCCESS__. BUT there are cases    when the manifest with the AWB already exists and response code is still 200. It is then purely subjective on us to decide whether it is success or failure

* Everything else will go in Error case.

On success it calls `successOrderCreation` and for failure it calls `failureOrderCreation`.

This function will generally be __overridden__ by each shipper.

12) __failureOrderCreation(orderCreationData, statusCode, error)__:

It will be called from `parseHttpResponse` when there is failure. This function in turn calls `manifestOver` with `isOrderSuccessfullyCreated` as false.

13) __successOrderCreation(orderCreationData, statusCode, body)__:

It will be called from `parseHttpResponse` when there is success. This function in turn `manifestOver` with `isOrderSuccessfullyCreated` as true.

14) __orderCreationOver(isOrderSuccessfullyCreated, orderCreationData, code, body)__:

This takes as its first argument a flag, which indicates whether the manifest was successfully created with the shipper or not.


# Track Shipment

### Call Tree ( 20 functions )

```
1. pullTrackDetails
├─ 2. getHttpRequestOpts
│  ├─ 3. getRequestUrl
│  ├─ 4. getRequestMethod
│  ├─ 5. getRequestTimeout
│  ├─ 6. getRequestHeaders
│  ├─ 7. getRequestBody
│  ├─ 8. getRequestForm
│  ├─ 9. getRequestJson
│  ├─ 10. getRequestQueryString
│  └─ 11. getPostHttpExtraOpts
│
├─ 12. hitHttpApi
│
└─ 13. parseHttpResponse
   ├─ 14. failurePullFetch
   |  └─ 20. trackingComplete
   |
   ├─ 15. markShipped
   ├─ 16. markDelivered
   ├─ 17. returnPicked
   ├─ 18. returnDelivered
   ├─ 19. rtoInitiated
      └─ 20. trackingComplete

```

### Function signature

1) __pullTrackDetails(pullData)__:

This function will be the main entry point for plugin system. Logically it is the top most level
function available, It can also be overridden(though overriding it would mean over riding the complete
flow). This function will not accept any callback, because idea is to call this function just with the data and then as the order is created with the shipper, it will notify by itself. This work will be done by a function named `trackingComplete`.

2) __getHttpRequestOpts(cb, pullData)__

This function will be the top level function for creating request data. It will internally call subfunctions
to get details for object like request method, url, headers, timeout and the most important thing request body. These subfunctions can be overriden as and when required. Also this function will take callback as sometimes, function like generating crypt or hash are required.

3) __getRequestUrl()__:

This extracts `pullFetchUrl` key from `this.getSettings()` and returns the value of it. If you want to specify any other key like `baseURL + pullURL`, override this function. 

4) __getRequestMethod()__:

This extracts a key named `pullFetchRequestMethod` in `this.getSettings()` object. Default value is _POST_ if no such key is specified.

5) __getRequestTimeout()__:

This extracts a key named as `pullFetchRequestTimeout` in the `this.getSettings()` object. By default it returns a timeout of _30 seconds(30 * 1000)_.

6) __getRequestHeaders()__:

This expects a settings object with a key `pullFetchHeaders` and returns the value of it. To specify any other key just override this function

7) __getRequestBody(pullData)__:

This take as argument the complete manifest data that is passed initially to the pullTrackDetails(). This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `body` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

8) __getRequestForm(pullData)__:

This take as argument the complete manifest data that is passed initially to the pullTrackDetails(). This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `form` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

9) __getRequestJson(pullData)__:

This take as argument the complete manifest data that is passed initially to the pullTrackDetails(). This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `json` on the request options. __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

10) __getRequestQueryString(pullData)__:

This take as argument the complete manifest data that is passed initially to the pullTrackDetails(). This is so because request body requires key value pair specific to shipper sometime, like `authKey`. It sets a key named `qs` on the request options __getRequestBody__, __getRequestForm__, __getRequestJson__ and __getRequestQueryString__ are mutually exclusive. At a time, only one of them can be overridden. By default it returns _null_.

9) __getPostHttpExtraOpts()__ :

This function will be used when certain additional keys are required to be set on the reqOpts,
For eg ::

```
    {
        json: true
    }
```
By default it will return null, meaning that no extra keys are required to be set on the reqOpts.
Since it returns a object, `getHttpRequestOpts` will iterate over the keys of the returned object and for each key it will set a value in the main reqOpts.

10) __hitHttpApi(pullData, reqOpts)__:

The only work that this function will do is hit the shipper at the requested url. It will be given a complete requestOpts. This function is not taking any callback, because of the same reasons for which `pullTrackDetails` is not taking any callback. After requesting with the shipper, it will call `parseHttpResponse` with error, response and body as the arguments.

11) __parseHttpResponse(pullData, error, response, body)__:

This is called when the request from shipper is completed. It will be the main function for deciding whether the response received is a success or failure one. The most basic approach to decide success and failure will be something on the lines of

* response code is __200__ and there is no error, signifies that is __SUCCESS__. But this can be cnfigured per shipper.

* Everything else will go in Error case.

On success it calls `markDelivered`(as of now, can be changed) and for failure it calls `failurePullFetch`.

This function will generally be __overridden__ by each shipper.

12) __failurePullFetch(pullData, statusCode, error)__:

It will be called from `parseHttpResponse` when there is failure. This function in turn calls `trackingComplete` with `trackingSuccessful` as false.

13) __markShipped(pullData, statusCode, body)__:

It will be called from `parseHttpResponse` when there is success and the order needs to be marked as shipped. This function in turn `trackingComplete` with `trackingSuccessful` as true.

14) __markDelivered(pullData, statusCode, body)__:

It will be called from `parseHttpResponse` when there is success and the order needs to be marked as delivered. This function in turn `trackingComplete` with `trackingSuccessful` as true.

15) __returnPicked(pullData, statusCode, body)__:

It will be called from `parseHttpResponse` when there is success and the order needs to be marked as return picked. This function in turn `trackingComplete` with `trackingSuccessful` as true.

16) __returnDelivered(pullData, statusCode, body)__:

It will be called from `parseHttpResponse` when there is success and the order needs to be marked as return delivered. This function in turn `trackingComplete` with `trackingSuccessful` as true.

17) __rtoInitiated(pullData, statusCode, body)__:

It will be called from `parseHttpResponse` when there is success and the order needs to be marked as rto initiated. This function in turn `trackingComplete` with `trackingSuccessful` as true.

18) __trackingComplete(trackingSuccessful, pullData, code, body)__:

This takes as its first argument a flag, which indicates whether the tracking details was successfully fetched or not.

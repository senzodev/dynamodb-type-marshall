# DynamoDB Type Marshall

A library to convert a JSON object into DynamoDB's requested type schema and back again.

This code is forked and updated from the DocumentClient library, which exists in `aws-sdk` v1 and v2, but does not yet exist in the complete re-write for v3 of `aws-sdk`.

The library is available as either a CommonJS module or an ES Module, under different packages.

The library exports 4 methods, `input`, `output`, `marshall` and`unmarshall`. The `input` and `output` methods are intended to be used on individual fields. The `marshall` and `unmarshall` methods are intended to be used on Objects.

CommonJS usage example with  - `dynamodb-type-marshall`

ES Module - `@esmodule/dynamodb-type-marshall`


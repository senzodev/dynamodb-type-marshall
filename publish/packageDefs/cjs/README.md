# DynamoDB Type Marshall

A library to convert a JSON object into DynamoDB's requested type schema and back again.

This code is forked and updated from the original [DocumentClient library's function](https://github.com/aws/aws-sdk-js/blob/master/lib/dynamodb/converter.js) which does the same thing , which exists in `aws-sdk` v1 and v2, but does not yet exist in the complete re-write for v3 of `aws-sdk`.

The library is available as either a CommonJS module or an ES Module, under different packages. This documentation is for the **CommonJS** module.

The library exports 5 methods, `input`, `output`, `marshall`, `unmarshall` and a bonus method `buildUpdateParams`. The `input` and `output` methods are intended to be used on individual values. The `marshall` and `unmarshall` methods are intended to be used on Objects. The `buildUpdateParams` is a helper method that will create the correct parameters to update a complex document in DynamoDB as per the `updateItem` (`aws-sdk` v2) or `updateItemCommand` (`aws-sdk` v3) [spec](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateItem-property).

## Installation

```sh
npm install dynamodb-type-marshall
```

## API Reference

### input

_input_ - Convert an individual field to a DynamoDB type, using DynamoDB type schema

**Parameters**

- data (Any type - required) - The data you need converted in DynamoDB type schema

- options (object - optional)
  - convertEmptyValues (boolean) - Convert empty strings, blobs and sets to `null`.

```js
const stringType = input('This is a string')
console.log(JSON.stringify(stringType))

// prints { 'S': 'This is a String' }
```

_output_ - Convert a field in DynamoDB type schema to normal type

- data (Any type - required) - The data you need converted in DynamoDB type schema

- options (object - optional)
  - convertEmptyValues (boolean) - Convert empty strings, blobs and sets to `null`.

```js
const normalString = output({ S: 'This is a String' })
console.log(normalString)

// prints 'This is a String'
```

## Complex Example

Complex Usage Example with `aws-sdk` v3 DynamoDB client

```js
// your own basic DocumentClient implementation documentClient.js

const {
  input,
  marshall,
  unmarshall,
  buildUpdateParams
} = require('dynamodb-type-marshall')
const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  ScanCommand
} = require('@aws-sdk/client-dynamodb')

class DocumentClient {
  constructor (options) {
    this.documentClient = new DynamoDBClient(options)
  }

  async create ({ table, item }) {
    // marshall used to convert a normal JSON object to the required DynamoDB type schema
    const params = {
      TableName: table,
      Item: marshall(item)
    }

    const command = new PutItemCommand(params)
    const response = await this.documentClient.send(command)
    // unmarshall used to convert the returned response in DynamoDB type schema to a normal JSON object
    return unmarshall(response.Item, { v3: true })
  }

  async read ({ table, item }) {
    // marshall used to convert a normal JSON object to the required DynamoDB type schema
    const params = {
      TableName: table,
      Item: marshall(item)
    }

    const command = new GetItemCommand(params)
    const response = await this.documentClient.send(command)
    // unmarshall used to convert the returned response in DynamoDB type schema to a normal JSON object
    return unmarshall(response.Item, { v3: true })
  }

  async query ({ table, ...args }) {
    let KeyConditionExpression = ''
    let ExpressionAttributeValues = {}
    let i = 0

    for (const key in args) {
      if (args.hasOwnProperty(key)) {
        const { keyName, keyValue } = args[key]
        if (keyName && keyValue) {
          if (i === 0) {
            KeyConditionExpression = `${keyName} = :${keyName}`
            // input used in line below because a single value needs to be converted to a DynamoDB type
            ExpressionAttributeValues[`:${keyName}`] = input(keyValue)
          } else {
            KeyConditionExpression += ` and ${keyName} = :${keyName}`
            // input used in line below because a single value needs to be converted to a DynamoDB type
            ExpressionAttributeValues[`:${keyName}`] = input(keyValue)
          }
          i++
        }
      }
    }

    const params = {
      TableName: table,
      KeyConditionExpression,
      ExpressionAttributeValues
    }
    const command = new QueryCommand(params)

    const response = await this.documentClient.send(command)
    // unmarshall used to convert the returned response in DynamoDB type schema to a normal JSON object
    return unmarshall(response.Items, { v3: true })
  }

  async queryIndex ({ table, index, ...args }) {
    let KeyConditionExpression = ''
    let ExpressionAttributeValues = {}
    let i = 0
    for (const key in args) {
      if (args.hasOwnProperty(key)) {
        const { keyName, keyValue } = args[key]
        if (keyName && keyValue) {
          if (i === 0) {
            KeyConditionExpression = `${keyName} = :${keyName}`
            // input used in line below because a single value needs to be converted to a DynamoDB type
            ExpressionAttributeValues[`:${keyName}`] = input(keyValue)
          } else {
            KeyConditionExpression += ` and ${keyName} = :${keyName}`
            // input used in line below because a single value needs to be converted to a DynamoDB type
            ExpressionAttributeValues[`:${keyName}`] = input(keyValue)
          }
          i++
        }
      }
    }

    const params = {
      TableName: table,
      IndexName: index,
      KeyConditionExpression,
      ExpressionAttributeValues
    }

    const command = new QueryCommand(params)

    const response = await this.documentClient.send(command)
    // unmarshall used to convert the returned response in DynamoDB type schema to a normal JSON object
    return unmarshall(response.Items, { v3: true })
  }

  async scan ({ table, key }) {
    const { keyName, keyValue } = key

    const params = {
      TableName: table,
      ScanIndexForward: true,
      FilterExpression: `begins_with(#DEF_keyName, :${keyName})`,
      ExpressionAttributeNames: {
        '#DEF_keyName': `${keyName}`
      },
      ExpressionAttributeValues: {}
    }

    params.ExpressionAttributeValues[`:${keyName}`] = input(keyValue)

    const command = new ScanCommand(params)

    const response = await this.documentClient.send(command)
    // unmarshall used to convert the returned response in DynamoDB type schema to a normal JSON object
    return unmarshall(response.Items, { v3: true })
  }

  async update ({ table, item, args }) {
    const {
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    } = buildUpdateParams(item)

    const key = {}

    for (const updateKey in args) {
      if (args.hasOwnProperty(updateKey)) {
        const { keyName, keyValue } = args[updateKey]
        key[keyName] = input(keyValue)
      }
    }

    const params = {
      TableName: table,
      Key: key,
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: 'UPDATED_NEW'
    }

    const command = new UpdateItemCommand(params)

    const response = await this.documentClient.send(command)
    // unmarshall used to convert the returned response in DynamoDB type schema to a normal JSON object
    return unmarshall(response.Items, { v3: true })
  }

  async delete ({ table, args }) {
    const key = {}

    for (const deleteKey in args) {
      if (args.hasOwnProperty(deleteKey)) {
        const { keyName, keyValue } = args[deleteKey]
        key[keyName] = input(keyValue)
      }
    }

    const params = {
      TableName: table,
      Key: key
    }

    const command = new DeleteItemCommand(params)

    const response = await this.documentClient.send(command)
    // unmarshall used to convert the returned response in DynamoDB type schema to a normal JSON object
    return unmarshall(response.Items, { v3: true })
  }
}

module.exports = DocumentClient
```

Use it like this

```js
const DocumentClient = require('./documentClient.js')

const table = 'myDynamoDBTable'
const region = 'us-east-2'

const documentClient = new DocumentClient({ region })

// create the item
const createItem = async () => {
  try {
    const createDate = new Date()

    const item = {
      pk: 'awesomepartitionkey',
      sk: '01EJCB7X3H5YXPNCEDVEWHM68Z-rangekey-yeah',
      dateAdded: createDate.toISOString(),
      name: {
        firstName: 'Bob',
        lastName: 'Smith'
      },
      email: 'bob@smith.com',
      gsi1: 'awesomeglobalsecondaryindex'
    }

    return documentClient.create({ table, item })
  } catch (error) {
    console.log(error)
  }
}

// query the item
const queryItem = async () => {
  try {
    const partitionKey = {
      keyName: 'pk',
      keyValue: 'awesomepartitionkey'
    }

    // if your table doesn't have a sort key, you can just ignore this
    const sortKey = {
      keyName: 'sk',
      keyValue: '01EJCB7X3H5YXPNCEDVEWHM68Z-rangekey-yeah'
    }

    return documentClient.query({
      collection,
      partitionKey,
      sortKey
    })
  } catch (error) {
    console.log(error)
  }
}

// query the item by global secondary index
const queryItembyIndex = async () => {
  try {
    const index = 'gsi1-index'
    const indexKey = {
      keyName: 'gsi1',
      keyValue: 'awesomeglobalsecondaryindex'
    }

    return documentClient.queryIndex({
      collection,
      index,
      indexKey
    })
  } catch (error) {
    console.log(error)
  }
}

// update the Item
const updateItem = async () => {
  try {

    const key = {
        pk: 'awesomepartitionkey',
        sk: '01EJCB7X3H5YXPNCEDVEWHM68Z-rangekey-yeah',
    }

    const item = {
      email: 'jeff@amazon.com',
      location: {
          street:'2111 7th Ave',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98121',
          country: 'United States'
    }

    await documentClient.update({ table, item, key })
  } catch (error) {
    console.log(error)
  }
}

// delete the item
const deleteItem = async () => {
  try {
    const key = {
        pk: 'awesomepartitionkey',
        sk: '01EJCB7X3H5YXPNCEDVEWHM68Z-rangekey-yeah',
    }

    return documentClient.delete({ table, key})
  } catch (error) {
    console.log(error)
  }
}

const runAll = async () =>{
    const createItemResponse = await createItem()
    console.log(JSON.stringify(createItemResponse,'',2))

    const queryItemResponse = await queryItem()
    console.log(JSON.stringify(queryItemResponse,'',2))

    const queryItembyIndexResponse = await queryItembyIndex()
    console.log(JSON.stringify(queryItembyIndexResponse,'',2))

    const updateItemResponse = await updateItem()
    console.log(JSON.stringify(updateItemResponse,'',2))

    const deleteItemResponse = await deleteItem()
    console.log(JSON.stringify(deleteItemResponse,'',2))
}

runAll()

// maybe I should have done a simpler example...

```

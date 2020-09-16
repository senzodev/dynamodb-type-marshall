import { input, marshall, unmarshall, buildUpdateParams } from '../index.js'

import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  ScanCommand
} from '@aws-sdk/client-dynamodb'

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

export { DocumentClient }

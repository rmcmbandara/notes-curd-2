'use strict';

const DynamoDB = require("aws-sdk/clients/dynamodb")
const documentClient = new DynamoDB.DocumentClient({ region: 'us-east-1' })
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME


const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};

module.exports.createNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop =false

  //Get data from post method body.
  let data = JSON.parse(event.body);
  try {
    var params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(notesId)"
    };
    await documentClient.put(params).promise()
    cb(null, send(201, data))
  } catch (errr) {
    cb(null, send(500, errr.message))
  }

}

module.exports.updateNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop =false
  //API gatway will send the ID in the path parameter. First we need to extract that
  let notesId = event.pathParameters.id
  let data = JSON.parse(event.body)
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: 'set #title = :title, #body = :body',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: 'attribute_exists(notesId)'
    }
    await documentClient.update(params).promise()
    cb(null, send(200, data))

  } catch (err) {
    cb(null, send(500, errr.message))
  }
}

module.exports.deleteNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop =false
  //API gatway will send the ID in the path parameter. First we need to extract that
  let notesId = event.pathParameters.id
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: 'attribute_exists(notesId)'
    }
    await documentClient.delete(params).promise()
    cb(null, send(200, notesId))
  } catch (err) {
    cb(null, send(500, errr.message))
  }
}

module.exports.getAllNotes = async (event,context,cb) => {
  context.callbackWaitsForEmptyEventLoop =false
  try {
    const params = {
      TableName: NOTES_TABLE_NAME
    }
    const notes = await documentClient.scan(params).promise()
    cb(null, send(200, notes))


  } catch (err) {
    cb(null, send(500, errr.message))
  }

}
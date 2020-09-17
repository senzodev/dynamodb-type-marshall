import test from 'ava'
import { input, marshall } from '../../../src/marshall/index.js'

test('input: string input', t => {
  const inputTest = input('This is a String')
  const inputExpected = { S: 'This is a String' }
  t.deepEqual(inputTest, inputExpected)
})

test('marshall: marshall simple object', t => {
  const simpleObject = {
    data: 'some data to update',
    moreData: 'some more data to update'
  }
  const marshallTest = marshall(simpleObject)
  const marshallExpected = {
    data: {
      S: 'some data to update'
    },
    moreData: {
      S: 'some more data to update'
    }
  }
  t.deepEqual(marshallTest, marshallExpected)
})

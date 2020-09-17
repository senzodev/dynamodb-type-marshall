import test from 'ava'
import { output, unmarshall } from '../../../src/unmarshall/index.js'

test('output: string output', t => {
  const outputTest = output({ S: 'This is a String' })
  const outputExpected = 'This is a String'
  t.deepEqual(outputTest, outputExpected)
})

test('unmarshall: unmarshall simple object', t => {
  const simpleObject = {
    data: {
      S: 'some data to update'
    },
    moreData: {
      S: 'some more data to update'
    }
  }
  const unmarshallTest = unmarshall(simpleObject)
  const unmarshallExpected = {
    data: 'some data to update',
    moreData: 'some more data to update'
  }

  t.deepEqual(unmarshallTest, unmarshallExpected)
})

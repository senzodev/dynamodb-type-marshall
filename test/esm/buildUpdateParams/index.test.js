import test from 'ava'
import buildUpdateParams from '../../../src/buildUpdateParams/index.js'

test('buildUpdateParams: Simple object update', t => {
  const simpleObject = {
    data: 'some data to update',
    moreData: 'some more data to update'
  }

  const simpleObjectTestResponse = buildUpdateParams(simpleObject)

  const simpleObjectExpected = {
    UpdateExpression: 'SET #0123 = :258BE, #1357 = :37BFJ',
    ExpressionAttributeNames: {
      '#0123': 'data',
      '#1357': 'moreData'
    },
    ExpressionAttributeValues: {
      ':258BE': {
        S: 'some data to update'
      },
      ':37BFJ': {
        S: 'some more data to update'
      }
    }
  }

  t.deepEqual(simpleObjectTestResponse, simpleObjectExpected)
})

test('buildUpdateParams: Complex object update', t => {
  const complexObject = {
    data: 'some data to update',
    moreData: 'some more data to update',
    anArray: ['this', 'is', 'an', 'array'],
    anObject: {
      somemoreData: 'data in the object',
      arrayinObject: ['an', 'array', 'in', 'the', 'object'],
      arrayofobjects: [{ key1: 'value1' }, { key1: 'value2' }]
    }
  }

  const complexObjectTestResponse = buildUpdateParams(complexObject)

  const complexObjectExpected = {
    UpdateExpression:
      'SET #49EJ = :DRfu7, #5BHN = :ETiyC, #6DKR[0] = :FVm1H, #6DKR[1] = :GXp5M, #6DKR[2] = :HZs9R, #6DKR[3] = :IbvDW, #7FNV.#8HQZ = :JdyHb, #7FNV.#9JTd[0] = :Kf0Lg, #7FNV.#9JTd[1] = :Lh3Pm, #7FNV.#9JTd[2] = :Mk6Tr, #7FNV.#9JTd[3] = :Nm9Xw, #7FNV.#9JTd[4] = :OoCb0, #7FNV.#ALWh[0].#BNZm = :PqFf5, #7FNV.#ALWh[1].#CPcq = :QsIkA',
    ExpressionAttributeNames: {
      '#49EJ': 'data',
      '#5BHN': 'moreData',
      '#6DKR': 'anArray',
      '#7FNV': 'anObject',
      '#8HQZ': 'somemoreData',
      '#9JTd': 'arrayinObject',
      '#ALWh': 'arrayofobjects',
      '#BNZm': 'key1',
      '#CPcq': 'key1'
    },
    ExpressionAttributeValues: {
      ':DRfu7': {
        S: 'some data to update'
      },
      ':ETiyC': {
        S: 'some more data to update'
      },
      ':FVm1H': {
        S: 'this'
      },
      ':GXp5M': {
        S: 'is'
      },
      ':HZs9R': {
        S: 'an'
      },
      ':IbvDW': {
        S: 'array'
      },
      ':JdyHb': {
        S: 'data in the object'
      },
      ':Kf0Lg': {
        S: 'an'
      },
      ':Lh3Pm': {
        S: 'array'
      },
      ':Mk6Tr': {
        S: 'in'
      },
      ':Nm9Xw': {
        S: 'the'
      },
      ':OoCb0': {
        S: 'object'
      },
      ':PqFf5': {
        S: 'value1'
      },
      ':QsIkA': {
        S: 'value2'
      }
    }
  }

  t.deepEqual(complexObjectTestResponse, complexObjectExpected)
})

import TypedJson, { JsonError } from '../src/index'

function isTypedJson (obj: any) {
  expect(obj['rawValue']).toBeDefined()
}

test('Json', () => {
  let jsonString = `
    {
      "astring": "hello world",
      "anint": 12,
      "afloat": 12.12,
      "alist": [1, 2, 3, "hello", "world"],
      "aintlist": [1, 2, 3],
      "amapofint": {
        "yo": 1,
        "lo": 2
      },
      "amap": {
        "hello": "world",
        "yo": 10
      }
    }
  `

  let json = TypedJson.fromString(jsonString)
  isTypedJson(json.get('astring'))
  expect(json.get('astring').string()).toBe('hello world')

  isTypedJson(json.get('anint'))
  expect(json.get('anint').integer()).toBe(12)

  expect(json.get('alist').array()).toBeInstanceOf(Array)
  expect(
    json
      .get('alist')
      .arrayValue()[3]
      .string()
  ).toBe('hello')

  isTypedJson(json.get(['amap', 'hello']))
  expect(json.get(['amap', 'hello']).string()).toBe('world')

  expect(json.get(['amap', 'hello', 'doesnexists']).rawValue).toBeNull()

  expect(json.get(['amap', 'doesnexists']).exception?.error).toBe(
    JsonError.notExist
  )
  expect(json.get(['amap', 'hello', 'doesnexists']).exception?.error).toBe(
    JsonError.wrongType
  )
  expect(json.get(['alist', 1000]).exception?.error).toBe(
    JsonError.indexOutOfBounds
  )
  expect(json.get(['alist', 'hello']).exception?.error).toBe(
    JsonError.wrongType
  )
})

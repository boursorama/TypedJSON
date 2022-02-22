# TypedJSON

[![npm](https://img.shields.io/npm/v/@boursorama/typed-json.svg)](https://npmjs.com/package/@boursorama/typed-json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🚚 A safe and elegant way to deal with Json data in TypeScript inspired by [SwiftyJSON](https://github.com/SwiftyJSON/SwiftyJSON)

## What is it?

Safely interact with Json data by requiring the user to specify what type of data they want to extract.

```typescript
let json = Json.fromString(jsonString)

// Gets the data under `someKey`, if a string returns it otherwise return undefined
json.get('someKey').string()
// Same but provides default empty string if `someKey` does not exists or is not a string
json.get('someKey').stringValue()

// Same exists for all json types
json.get('someKey').boolean()
json.get('someKey').booleanValue() // Will try to coerce the data to bool and returns false if couldn't
json.get('someKey').float()
json.get('someKey').floatValue() // Will try to coerce the data to double and returns 0 if couldn't
json.get('someKey').integer()
json.get('someKey').integerValue() // Will try to coerce the data to int and returns 0 if couldn't

// List items and Map values are wrapped in Json instances, which enables chaining acces to them
json.get('alist').array()
json.get('amap').object()

// If any path element does not exist or is not subscriptable, it'll return undefined
json.get(['you', 'can', 'chain', 'them']).string()

// If you want the unaltered data you can get it with `rawValue`
json.get('some').rawValue

// If you want list and map with unaltered values
json.get('list').arrayRaw()
json.get('map').objectRaw()

// If you get undefined, you can check if its the result of an illegal access
if (json.get('idontexists').exception !== undefined) {
  console.log('something went wrong')
}
```

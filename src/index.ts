export type JsonValue =
  | string
  | number
  | null
  | boolean
  | JsonValue[]
  | { [property: string]: JsonValue }

export type JsonKey = string | number

export enum JsonError {
  /// Type is not json encodable
  unsupportedType,

  /// Out of bound access to list
  indexOutOfBounds,

  /// Unexpected type
  wrongType,

  /// Entry does not exists
  notExist
}

export class JsonException extends Error {
  readonly error: JsonError

  constructor (error: JsonError, reason?: string, stack?: string) {
    super()

    this.error = error
    this.name = JsonError[error]
    this.stack = stack

    switch (error) {
      case JsonError.unsupportedType:
        reason = reason ?? 'JSON Error: not a valid JSON value'
        break
      case JsonError.indexOutOfBounds:
        reason = reason ?? 'JSON Error: index out of bounds'
        break
      case JsonError.wrongType:
        reason =
          reason ??
          'JSON Error: either key is not a index type or value is not indexable'
        break
      case JsonError.notExist:
        reason = reason ?? "JSON Error: key does't not exists"
        break
    }
  }
}

export default class TypedJson {
  readonly rawValue: JsonValue

  readonly exception?: JsonException

  constructor (rawValue: JsonValue, exception?: JsonException) {
    this.rawValue = rawValue
    this.exception = exception
  }

  static fromString (json: string) {
    return new TypedJson(JSON.parse(json))
  }

  get (keyOrPath: JsonKey | Array<JsonKey>): TypedJson {
    if (Array.isArray(keyOrPath)) {
      if (keyOrPath.length == 0) {
        throw new Error("Path can't be empty")
      }

      return keyOrPath.length > 1
        ? this.get(keyOrPath[0]).get(keyOrPath.slice(1))
        : this.get(keyOrPath[0])
    }

    if (Array.isArray(this.rawValue)) {
      const array = this.rawValue as JsonValue[]
      let index: number

      if (typeof keyOrPath === 'string') {
        index = parseInt(keyOrPath)

        if (isNaN(index)) {
          return new TypedJson(
            null,
            new JsonException(
              JsonError.wrongType,
              `JSON Error: index must be a number, string given`
            )
          )
        }
      } else {
        index = (keyOrPath as number) | 0 // Ensure integer
      }

      if (index < 0 || index >= array.length) {
        return new TypedJson(
          null,
          new JsonException(JsonError.indexOutOfBounds)
        )
      }

      return new TypedJson(array[index])
    } else if (typeof this.rawValue === 'object') {
      const map = this.rawValue as { [property: string]: JsonValue }
      let index: string =
        typeof keyOrPath === 'string' ? keyOrPath : `${keyOrPath}`

      let result = new TypedJson(map[index])
      if (!map.hasOwnProperty(index)) {
        return new TypedJson(
          null,
          new JsonException(
            JsonError.notExist,
            `JSON Error: key ${index} does not exists`
          )
        )
      }

      return result
    }

    return new TypedJson(null, new JsonException(JsonError.wrongType))
  }

  exists (key: JsonKey): boolean {
    return this.get(key).exception === undefined
  }

  string (): string | undefined {
    return typeof this.rawValue === 'string' ? this.rawValue : undefined
  }

  stringValue (): string {
    if (typeof this.rawValue === 'string') {
      return this.rawValue
    } else if (['boolean', 'number'].indexOf(typeof this.rawValue) >= 0) {
      return `${this.rawValue}`
    }

    return ''
  }

  boolean (): boolean | undefined {
    return typeof this.rawValue === 'boolean' ? this.rawValue : undefined
  }

  booleanValue (): boolean {
    if (typeof this.rawValue === 'boolean') {
      return this.rawValue
    } else if (typeof this.rawValue === 'number') {
      return this.rawValue === 1
    } else if (typeof this.rawValue === 'string') {
      return (
        ['true', 'y', 't', 'yes', '1'].indexOf(this.rawValue.toLowerCase()) >= 0
      )
    }

    return false
  }

  integer (): number | undefined {
    return typeof this.rawValue === 'number' && Number.isInteger(this.rawValue)
      ? this.rawValue
      : undefined
  }

  integerValue (): number {
    if (typeof this.rawValue === 'number') {
      return Number.isInteger(this.rawValue)
        ? this.rawValue
        : Math.round(this.rawValue)
    } else if (typeof this.rawValue === 'boolean') {
      return this.rawValue ? 1 : 0
    } else if (typeof this.rawValue === 'string') {
      let parsed = parseInt(this.rawValue)
      return isNaN(parsed) ? 0 : parsed
    }

    return 0
  }

  float (): number | undefined {
    return typeof this.rawValue === 'number' && !Number.isInteger(this.rawValue)
      ? this.rawValue
      : undefined
  }

  floatValue (): number {
    if (typeof this.rawValue === 'number') {
      return this.rawValue
    } else if (typeof this.rawValue === 'boolean') {
      return this.rawValue ? 1 : 0
    } else if (typeof this.rawValue === 'string') {
      let parsed = parseFloat(this.rawValue)
      return isNaN(parsed) ? 0 : parsed
    }

    return 0
  }

  array (): TypedJson[] | undefined {
    return Array.isArray(this.rawValue)
      ? this.rawValue.map(value => new TypedJson(value))
      : undefined
  }

  arrayValue (): TypedJson[] {
    return this.array() ?? []
  }

  arrayRaw (): JsonValue[] | undefined {
    return Array.isArray(this.rawValue) ? this.rawValue : undefined
  }

  arrayRawValue (): JsonValue[] {
    return this.arrayRaw() ?? []
  }

  object (): { [property: string]: TypedJson } | undefined {
    if (typeof this.rawValue !== 'object' || Array.isArray(this.rawValue)) {
      return undefined
    }

    let obj: any = {}
    Object.entries(this.rawValue ?? []).forEach(item => {
      obj[item[0]] = new TypedJson(item[1])
    })

    return obj
  }

  objectValue (): { [property: string]: TypedJson } {
    return this.object() ?? {}
  }

  objectRaw (): { [property: string]: JsonValue } | undefined {
    return this.rawValue !== null &&
      typeof this.rawValue === 'object' &&
      !Array.isArray(this.rawValue)
      ? this.rawValue
      : undefined
  }

  objectRawValue (): { [property: string]: JsonValue } {
    return this.objectRaw() ?? {}
  }
}

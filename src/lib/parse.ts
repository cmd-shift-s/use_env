
export function parseStrToArrayJson<T>(str: string, properties: Array<keyof T>) {
  // remove header and lastline
  const list = str.split('\n').slice(1, -1)

  const items: Array<T> = []

  for (const item of list) {
    const json = item
      .replace(/\s+/g, ' ')
      .split(' ')
      .reduce((acc, val, index) => {
        const property = properties[index]
        acc[property] = val
        return acc
      }, {} as any)

    items.push(json)
  }

  return items
}

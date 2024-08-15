// adapted from https://github.com/boblauer/MockDate/blob/master/src/mockdate.ts

const RealDate = Date
let now: null | number = null

const MockDate = class Date extends RealDate {
  constructor()
  constructor(value: any)
  constructor(
    year: number,
    month: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
  )

  constructor(y?: number, m?: number, d?: number, h?: number, M?: number, s?: number, ms?: number) {
    super()

    let date

    switch (arguments.length) {
      case 0:
        if (now !== null) {
          date = new RealDate(now.valueOf())
        } else {
          date = new RealDate()
        }
        break

      case 1:
        // @ts-expect-error
        date = new RealDate(y)
        break

      default: {
        d = typeof d === "undefined" ? 1 : d
        h = h || 0
        M = M || 0
        s = s || 0
        ms = ms || 0
        // @ts-expect-error
        date = new RealDate(y, m, d, h, M, s, ms)
        break
      }
    }

    return date
  }
}

MockDate.UTC = RealDate.UTC

MockDate.now = () => new MockDate().valueOf()

MockDate.parse = (dateString) => RealDate.parse(dateString)

MockDate.toString = () => RealDate.toString()

export function set(date: string): void {
  const dateObj = new Date(date.valueOf())

  if (Number.isNaN(dateObj.getTime())) {
    throw new TypeError(`mockdate: The time set is an invalid date: ${date}`)
  }

  // @ts-expect-error
  Date = MockDate

  now = dateObj.valueOf()
}

export function reset(): void {
  Date = RealDate
}

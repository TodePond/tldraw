/* eslint-disable @typescript-eslint/no-explicit-any */
import { Utils } from '@tldraw/core'
import { TDFile, Tldraw, TldrawApp } from '@tldraw/tldraw'
import Vec from '@tldraw/vec'
import * as React from 'react'

// Change this constant to test different candidates!
const CURRENT_CANDIDATE = 'REDUCE_POINT_READS'

//============//
// CANDIDATES //
//============//
const getCandidate = (candidateName: string, timer: any): any => {
  const candidateFunc = CANDIDATE[candidateName]
  return function (points: number[][], closed = true) {
    const startTime = performance.now()

    const result = candidateFunc(points, closed)

    const endTime = performance.now()
    const totalTime = endTime - startTime
    timer.sumTime += totalTime

    return result
  }
}

const CANDIDATE: any = {
  BASELINE: function (points: number[][], closed = true): string {
    if (!points.length) {
      return ''
    }

    const max = points.length - 1

    return points
      .reduce(
        (acc, point, i, arr) => {
          if (i === max) {
            if (closed) acc.push('Z')
          } else acc.push(point, Vec.med(point, arr[i + 1]))
          return acc
        },
        ['M', points[0], 'Q']
      )
      .join(' ')
      .replaceAll(TRIM_NUMBERS, '$1')
  },
  EXAMPLE_1: function (strokePoints: number[][], closed = true): string {
    if (!strokePoints.length) {
      return ''
    }

    const max = strokePoints.length - 1

    return strokePoints
      .reduce(
        (acc, strokePoint, i, arr) => {
          if (i === max) {
            if (closed) {
              acc.push('Z')
            }
          } else
            acc.push(strokePoint, [
              lerp(strokePoint[0], arr[i + 1][0], 0.5),
              lerp(strokePoint[1], arr[i + 1][1], 0.5),
            ])
          return acc
        },
        ['M', strokePoints[0], 'Q']
      )
      .join(' ')
      .replaceAll(TRIM_NUMBERS, '$1')
  },
  EXAMPLE_2: function (points: number[][], closed = true): string {
    const len = points.length

    if (!len) {
      return ''
    }

    let result = 'M'
    const first = points[0]
    result += first[0].toFixed(3) + ',' + first[1].toFixed(3) + 'Q'

    for (let i = 0, max = len - 1; i < max; i++) {
      const a = points[i]
      const b = points[i + 1]
      result +=
        a[0].toFixed(3) +
        ',' +
        a[1].toFixed(3) +
        ' ' +
        average(a[0], b[0]).toFixed(3) +
        ',' +
        average(a[1], b[1]).toFixed(3) +
        ' '
    }

    if (closed) {
      result += 'Z'
    }

    return result
  },
  INTERPOLATE: function getSvgPathFromStroke(points: number[][]): string {
    const len = points.length

    if (!len) {
      return ''
    }

    const first = points[0]
    let result = `M${first[0].toFixed(3)},${first[1].toFixed(3)}Q`

    for (let i = 0, max = len - 1; i < max; i++) {
      const a = points[i]
      const b = points[i + 1]
      result += `${a[0].toFixed(3)},${a[1].toFixed(3)} ${average(a[0], b[0]).toFixed(3)},${average(
        a[1],
        b[1]
      ).toFixed(3)} `
    }

    result += 'Z'

    return result
  },
  CHEEKY_FIXED: function getSvgPathFromStroke(points: number[][]): string {
    const len = points.length

    if (!len) {
      return ''
    }

    const first = points[0]
    let result = `M${toFixed3(first[0])},${toFixed3(first[1])}Q`

    for (let i = 0, max = len - 1; i < max; i++) {
      const a = points[i]
      const b = points[i + 1]
      result += `${toFixed3(a[0])},${toFixed3(a[1])} ${toFixed3(average(a[0], b[0]))},${toFixed3(
        average(a[1], b[1])
      )} `
    }

    result += 'Z'

    return result
  },
  NO_FIXED: function getSvgPathFromStroke(points: number[][]): string {
    const len = points.length

    if (!len) {
      return ''
    }

    const first = points[0]
    let result = `M${first[0]},${first[1]}Q`

    for (let i = 0, max = len - 1; i < max; i++) {
      const a = points[i]
      const b = points[i + 1]
      result += `${a[0]},${a[1]} ${average(a[0], b[0])},${average(a[1], b[1])} `
    }

    result += 'Z'

    return result
  },
  REDUCE_POINT_READS: function getSvgPathFromStroke(points: number[][]): string {
    const len = points.length

    if (!len) {
      return ''
    }

    const first = points[0]
    let result = `M${first[0].toFixed(3)},${first[1].toFixed(3)}Q`

    let ax = 0
    let ay = 0
    for (let i = 0, max = len - 1; i < max; i++) {
      if (i === 0) {
        const a = points[i]
        ax = a[0]
        ay = a[1]
      }
      const b = points[i + 1]
      const bx = b[0]
      const by = b[1]
      result += `${ax.toFixed(3)},${ay.toFixed(3)} ${average(ax, bx).toFixed(3)},${average(
        ay,
        by
      ).toFixed(3)} `
      ax = bx
      ay = by
    }

    result += 'Z'

    return result
  },
}

//=========//
// HELPERS //
//=========//
const TRIM_NUMBERS = /(\s?[A-Z]?,?-?[0-9]*\.[0-9]{0,2})(([0-9]|e|-)*)/g

const toFixed3 = (n: number): number => {
  return Math.floor(1000 * n) / 1000
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function average(a: number, b: number) {
  return (a + b) / 2
}

export default function BenchmarkPanning() {
  //======//
  // LOAD //
  //======//
  const [file, setFile] = React.useState<TDFile>()
  const [app, setApp] = React.useState<TldrawApp>()

  async function loadFile(): Promise<void> {
    const file = await fetch('benchmark-panning.tldr').then((response) => response.json())
    setFile(file)
  }

  async function setup(app: TldrawApp): Promise<void> {
    await loadFile()
    setTimeout(() => startBenchmark(app), 1000)
  }

  React.useEffect(() => {
    if (app === undefined) return
    setup(app)
  }, [app])

  const handleMount = React.useCallback((app: TldrawApp) => {
    setApp(app)
  }, [])

  const handlePersist = React.useCallback(() => {
    //do nothing
  }, [])

  //======//
  // TEST //
  //======//
  const TEST_COUNT = 100
  const PAN_DISTANCE = 10

  function runTest(app: TldrawApp, { panDirection = 1 }: any) {
    app.pan([PAN_DISTANCE * panDirection, PAN_DISTANCE * panDirection])
  }

  function runTests(app: TldrawApp, timer: any, { count = TEST_COUNT, panDirection = 1 }: any) {
    if (count <= 0) {
      console.log('FINISHED BENCHMARK')
      const result = `${timer.sumTime.toFixed(2)}ms`
      console.log(result)
      alert(`Total time spent in getSvgPathFromStroke:\n\n${result}`)
      return
    }

    runTest(app, { panDirection })

    if (count % 20 === 0) panDirection *= -1
    requestAnimationFrame(() => runTests(app, timer, { count: count - 1, panDirection }))
  }

  const startBenchmark = React.useCallback((app: TldrawApp) => {
    console.log('==================')
    console.log(`CANDIDATE: ${CURRENT_CANDIDATE}`)
    console.log('STARTING BENCHMARK')

    const timer = { sumTime: 0 }
    Utils.getSvgPathFromStroke = getCandidate(CURRENT_CANDIDATE, timer)

    app.resetCamera()
    app.zoomTo(2)
    app.pan([500, 500])

    console.log('RUNNING BENCHMARK...')
    requestAnimationFrame(() => runTests(app, timer, { count: TEST_COUNT }))
  }, [])

  return (
    <div className="tldraw">
      <Tldraw readOnly onMount={handleMount} onPersist={handlePersist} document={file?.document} />
    </div>
  )
}

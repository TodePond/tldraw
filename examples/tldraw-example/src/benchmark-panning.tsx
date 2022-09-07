/* eslint-disable @typescript-eslint/no-explicit-any */
import { Utils } from '@tldraw/core'
import { TDFile, Tldraw, TldrawApp } from '@tldraw/tldraw'
import Vec from '@tldraw/vec'
import * as React from 'react'

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
    console.log('STARTING BENCHMARK')

    const timer = { sumTime: 0 }
    Utils.getSvgPathFromStroke = function (points: number[][], closed = true): string {
      const startTime = performance.now()
      if (!points.length) {
        return ''
      }

      const max = points.length - 1

      const result = points
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
        .replaceAll(this.TRIM_NUMBERS, '$1')

      const endTime = performance.now()
      const totalTime = endTime - startTime
      timer.sumTime += totalTime

      return result
    }

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

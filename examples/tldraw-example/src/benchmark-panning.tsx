/* eslint-disable @typescript-eslint/no-explicit-any */
import { TDFile, TDShapeType, Tldraw, TldrawApp, useFileSystem } from '@tldraw/tldraw'
import * as React from 'react'

declare const window: Window & { app: TldrawApp }

const runBenchmark = (app: TldrawApp) => {
  if (app === undefined) return
  console.log('TESTS SHOULD HAPPEN HERE')
}

export default function BenchmarkPanning() {
  const rTldrawApp = React.useRef<TldrawApp>()

  const handleMount = React.useCallback((app: TldrawApp) => {
    window.app = app
    rTldrawApp.current = app
  }, [])

  const [file, setFile] = React.useState<TDFile>()

  const handlePersist = React.useCallback(() => {
    // noop
  }, [])

  React.useEffect(() => {
    async function loadFile(): Promise<void> {
      const file = await fetch('benchmark-panning.tldr').then((response) => response.json())
      setFile(file)
      runBenchmark(window.app)
    }

    loadFile()
  }, [])

  return (
    <div className="tldraw">
      <Tldraw readOnly onMount={handleMount} onPersist={handlePersist} document={file?.document} />
    </div>
  )
}

import { useState, useEffect } from 'react'

interface Versions {
  node: string
  chrome: string
  electron: string
}

declare global {
  interface Window {
    versions: Versions
  }
}

function Versions(): JSX.Element {
  const [versions, setVersions] = useState<Versions>({
    node: '',
    chrome: '',
    electron: ''
  })

  useEffect(() => {
    setVersions(window.versions)
  }, [])

  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      <span>electron {versions.electron}</span>
      <span>chrome {versions.chrome}</span>
      <span>node {versions.node}</span>
    </div>
  )
}

export default Versions

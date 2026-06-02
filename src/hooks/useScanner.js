// src/hooks/useScanner.js
import { useState, useRef, useCallback, useEffect } from 'react'

export function useScanner({ onResult }) {
  const [active,  setActive]  = useState(false)
  const [error,   setError]   = useState(null)
  const [cameras, setCameras] = useState([])
  const [camIdx,  setCamIdx]  = useState(0)
  const videoRef  = useRef(null)
  const readerRef = useRef(null)
  const streamRef = useRef(null)

  // Charger ZXing dynamiquement (évite de l'inclure dans le bundle initial)
  const loadZXing = useCallback(async () => {
    if (readerRef.current) return readerRef.current
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    readerRef.current = new BrowserMultiFormatReader()
    return readerRef.current
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const reader = await loadZXing()

      // Liste des caméras disponibles
      const devices = await BrowserMultiFormatReader_listDevices()
      setCameras(devices)

      // Préférer la caméra arrière
      const backCam = devices.find(d =>
        /back|rear|environment/i.test(d.label)
      ) || devices[devices.length - 1]

      const deviceId = backCam?.deviceId

      // Démarrer le décodage continu
      await reader.decodeFromVideoDevice(
        deviceId || undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            onResult(result.getText())
            stop()
          }
        }
      )
      setActive(true)
    } catch (e) {
      setError(e.message || 'Impossible d\'accéder à la caméra')
    }
  }, [camIdx, onResult, loadZXing])

  const stop = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setActive(false)
  }, [])

  // Nettoyage au démontage
  useEffect(() => () => stop(), [stop])

  return { videoRef, active, error, cameras, camIdx, setCamIdx, start, stop }
}

// Helper ZXing devices list sans instancier le reader
async function BrowserMultiFormatReader_listDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(d => d.kind === 'videoinput')
  } catch {
    return []
  }
}

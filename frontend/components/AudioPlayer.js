import React, { useEffect, useState } from 'react'

export default function AudioPlayer({ audioHex }) {
  const [audioSrc, setAudioSrc] = useState(null)

  useEffect(() => {
    if(audioHex) {
      const byteArray = new Uint8Array(audioHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
      const blob = new Blob([byteArray], { type: 'audio/mp3' })
      const url = URL.createObjectURL(blob)
      setAudioSrc(url)
    } else {
      setAudioSrc(null)
    }
  }, [audioHex])

  if(!audioSrc) return null

  return (
    <div className="mt-3">
      <audio controls src={audioSrc} />
    </div>
  )
}

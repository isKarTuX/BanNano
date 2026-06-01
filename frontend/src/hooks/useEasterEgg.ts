import { useCallback, useRef } from "react"

interface EasterEggState {
  keynerCount: number
  maryCount: number
  mykCount: number
}

export function useEasterEgg(
  onSecretTrigger: () => void,
  onUwuTrigger: () => void
) {
  const stateRef = useRef<EasterEggState>({
    keynerCount: 0,
    maryCount: 0,
    mykCount: 0,
  })

  const resetSecret = useCallback(() => {
    stateRef.current.keynerCount = 0
    stateRef.current.maryCount = 0
  }, [])

  const resetMyk = useCallback(() => {
    stateRef.current.mykCount = 0
  }, [])

  const handleKeynerClick = useCallback(() => {
    stateRef.current.keynerCount += 1
    console.log("🥚 Keyner clicks:", stateRef.current.keynerCount)

    if (stateRef.current.keynerCount >= 5) {
      console.log("🎉 Easter egg triggered by Keyner!")
      resetSecret()
      onSecretTrigger()
    }
  }, [onSecretTrigger, resetSecret])

  const handleMaryClick = useCallback(() => {
    stateRef.current.maryCount += 1
    console.log("🥚 Mary clicks:", stateRef.current.maryCount)

    if (stateRef.current.maryCount >= 9) {
      console.log("🎉 Easter egg triggered by Mary!")
      resetSecret()
      onSecretTrigger()
    }
  }, [onSecretTrigger, resetSecret])

  const handleMykClick = useCallback(() => {
    stateRef.current.mykCount += 1
    console.log("🥚 MyK clicks:", stateRef.current.mykCount)

    if (stateRef.current.mykCount >= 20) {
      console.log("🎉 UWU triggered by MyK!")
      resetMyk()
      onUwuTrigger()
    }
  }, [onUwuTrigger, resetMyk])

  return { handleKeynerClick, handleMaryClick, handleMykClick }
}

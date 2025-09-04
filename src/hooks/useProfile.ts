// src/hooks/useProfile.ts
import { useEffect, useState } from "react"
import { api } from "../services/api"
import { useAuthStore } from "../store/authStore"

export function useProfile() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isAuthed) return
    setLoading(true)
    setError(null)
    api.getProfile()
      .then((res) => setData(res))
      .catch((e) => setError(e))
      .finally(() => setLoading(false))
  }, [isAuthed])

    

  return { username: data?.username, loading, error }

}

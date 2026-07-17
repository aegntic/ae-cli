"use client"

import { createContext, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "aegntic_api_key"

interface ApiKeyContextValue {
  apiKey: string
  setApiKey: (key: string) => void
}

const ApiKeyContext = createContext<ApiKeyContextValue>({
  apiKey: "",
  setApiKey: () => {},
})

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setKey] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || ""
    setKey(stored)
  }, [])

  const setApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key)
    setKey(key)
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  return useContext(ApiKeyContext)
}

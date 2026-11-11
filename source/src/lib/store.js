import { createContext, useContext } from 'react'

export const AppContext = createContext({ toast: () => {} })
export const useApp = () => useContext(AppContext)

/** True only for the page that is on screen while the intro plays (its charts wait for the intro). */
export const IntroContext = createContext(false)

let n = 0
export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(n++).toString(36)}`


import * as React from "react"

// Updated breakpoints
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1400,
}

export type Breakpoint = keyof typeof BREAKPOINTS

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.md)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// New hook to check if screen is smaller than a specific breakpoint
export function useBreakpoint(breakpoint: Breakpoint) {
  const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`)
    const onChange = () => {
      setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint])
    }
    mql.addEventListener("change", onChange)
    setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint])
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isBelow
}

// New hook to get the current active breakpoint
export function useActiveBreakpoint() {
  const [activeBreakpoint, setActiveBreakpoint] = React.useState<Breakpoint>("xs")

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width >= BREAKPOINTS["2xl"]) {
        setActiveBreakpoint("2xl")
      } else if (width >= BREAKPOINTS.xl) {
        setActiveBreakpoint("xl")
      } else if (width >= BREAKPOINTS.lg) {
        setActiveBreakpoint("lg")
      } else if (width >= BREAKPOINTS.md) {
        setActiveBreakpoint("md")
      } else if (width >= BREAKPOINTS.sm) {
        setActiveBreakpoint("sm")
      } else {
        setActiveBreakpoint("xs")
      }
    }

    window.addEventListener("resize", updateBreakpoint)
    updateBreakpoint()
    return () => window.removeEventListener("resize", updateBreakpoint)
  }, [])

  return activeBreakpoint
}

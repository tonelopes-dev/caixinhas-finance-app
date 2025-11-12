"use client"

import { useEffect, useState } from "react"

export function useScrollAnimations() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Check which elements are in viewport
      const elements = document.querySelectorAll("[data-animate]")
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        const id = el.getAttribute("data-animate") || ""
        if (rect.top < window.innerHeight * 0.8) {
          setIsVisible((prev) => ({ ...prev, [id]: true }))
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return { scrollY, isVisible }
}

'use client'

import { useEffect, useRef } from 'react'

/** Decodes text from random 0/1 scramble, character by character. */
export function Scramble({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null)
  const ran = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || ran.current) return
    ran.current = true

    let i = 0
    el.textContent = text
      .split('')
      .map((c) => (c === ' ' ? ' ' : Math.random() > 0.5 ? '0' : '1'))
      .join('')

    const iv = setInterval(() => {
      el.textContent = text
        .split('')
        .map((c, j) => (c === ' ' ? ' ' : j < i ? c : Math.random() > 0.5 ? '0' : '1'))
        .join('')
      i++
      if (i > text.length) {
        clearInterval(iv)
        el.textContent = text
      }
    }, 45)
    return () => clearInterval(iv)
  }, [text])

  return (
    <span ref={ref} className={className} style={style}>
      {text}
    </span>
  )
}

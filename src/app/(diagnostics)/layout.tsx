import React from 'react'

export default function DiagnosticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#111', color: '#eee' }}>
        {children}
      </body>
    </html>
  )
}

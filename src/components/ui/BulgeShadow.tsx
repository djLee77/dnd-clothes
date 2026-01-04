import React, { useState, useEffect } from 'react'

export const BulgeShadow = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY })
            setOpacity(1)
        }

        const handleMouseLeave = () => {
            setOpacity(0)
        }

        window.addEventListener('mousemove', handleMouseMove)
        document.body.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            document.body.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    return (
        <div
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
            style={{
                opacity: opacity,
                // Dent/depression effect - darker center fading outward to create sunken appearance
                background: `radial-gradient(circle 350px at ${position.x}px ${position.y}px, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.02) 50%, transparent 100%)`,
                filter: 'blur(20px)'
            }}
        />
    )
}

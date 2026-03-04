import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
}

interface ParticleBackgroundProps {
  attractionRadius?: number
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  attractionRadius = 350 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const colors = ['#000000', '#404040', '#737373', '#a3a3a3', '#e5e5e5'] // Monochrome palette

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const particleCount = canvas.width < 768 ? 40 : 80 // Fewer particles on mobile

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.5, // Increased from 0.5
          vy: (Math.random() - 0.5) * 1.5, // Increased from 0.5
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        // Basic movement
        p.x += p.vx
        p.y += p.vy

        // Mouse interaction - attraction with dead zone to prevent clustering
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDistance = 80 // Dead zone - particles won't go closer than this
        
        if (distance < minDistance && distance > 1) {
            // Repulsion force when too close - push particles outward
            const repulsionForce = (minDistance - distance) / minDistance
            const normalizedDx = dx / distance
            const normalizedDy = dy / distance
            
            // Push away from mouse
            p.vx -= normalizedDx * repulsionForce * 0.8 // Increased from 0.5
            p.vy -= normalizedDy * repulsionForce * 0.8 // Increased from 0.5
            
            // Reduced friction near center for more "bounce"
            p.vx *= 0.95 // Increased from 0.9
            p.vy *= 0.95 // Increased from 0.9
        } else if (distance < attractionRadius && distance >= minDistance) {
            // Gentle attraction
            const force = (attractionRadius - distance) / attractionRadius
            const attractionStrength = 3.0 
            const normalizedDx = dx / distance
            const normalizedDy = dy / distance
            
            // Apply attraction
            p.vx += normalizedDx * force * attractionStrength * 0.02
            p.vy += normalizedDy * force * attractionStrength * 0.02
            
            // Natural friction
            p.vx *= 0.98
            p.vy *= 0.98
        } else {
            // Very light damping
            p.vx *= 0.99
            p.vy *= 0.99
        }

        // Boundary wrap
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.6
        ctx.fill()
        ctx.globalAlpha = 1
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)

    resize()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none"
    />
  )
}

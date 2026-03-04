import { useEffect, useRef } from 'react'

interface GridBackgroundProps {
  interactive?: boolean
  distortionRadius?: number
  distortionStrength?: number // Higher = more distortion
}

export const GridBackground: React.FC<GridBackgroundProps> = ({ 
  interactive = true,
  distortionRadius = 350,
  distortionStrength = 0.5
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const gridSize = 50 // Grid cell size in pixels
    const padding = distortionRadius * 0.4 // Extra drawing area to fill edge gaps during distortion

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      if (!interactive) drawGrid() // Initial draw for static grid
    }

    const getDistortedPoint = (x: number, y: number) => {
      if (!interactive) return { x, y }
      
      const dx = mouseRef.current.x - x
      const dy = mouseRef.current.y - y
      const distanceSq = dx * dx + dy * dy
      const distance = Math.sqrt(distanceSq)

      if (distance < distortionRadius && distance > 0.1) {
        // Gaussian distribution for smooth falloff (sigma controls the spread)
        const sigma = distortionRadius * 0.4
        // Calculate factor using exp(-d^2 / (2 * sigma^2))
        // multiplier ensures we don't move points past the mouse (avoiding knots)
        const factor = Math.exp(-distanceSq / (2 * sigma * sigma)) * distortionStrength
        
        return {
          x: x + dx * factor,
          y: y + dy * factor
        }
      }

      return { x, y }
    }

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Set grid line style
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.lineWidth = 1

      // Draw vertical lines - starting from -padding to cover edges
      for (let x = -Math.ceil(padding / gridSize) * gridSize; x <= canvas.width + padding; x += gridSize) {
        ctx.beginPath()
        
        for (let y = -padding; y <= canvas.height + padding; y += 10) {
          const distorted = getDistortedPoint(x, y)
          
          if (y <= -padding) {
            ctx.moveTo(distorted.x, distorted.y)
          } else {
            ctx.lineTo(distorted.x, distorted.y)
          }
        }
        
        ctx.stroke()
      }

      // Draw horizontal lines - starting from -padding to cover edges
      for (let y = -Math.ceil(padding / gridSize) * gridSize; y <= canvas.height + padding; y += gridSize) {
        ctx.beginPath()
        
        for (let x = -padding; x <= canvas.width + padding; x += 10) {
          const distorted = getDistortedPoint(x, y)
          
          if (x <= -padding) {
            ctx.moveTo(distorted.x, distorted.y)
          } else {
            ctx.lineTo(distorted.x, distorted.y)
          }
        }
        
        ctx.stroke()
      }

      // Removed center highlight circle for cleaner look
    }

    const animate = () => {
      drawGrid()
      if (interactive) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('resize', resize)
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    resize()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none"
    />
  )
}

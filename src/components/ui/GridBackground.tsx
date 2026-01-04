import { useEffect, useRef } from 'react'

export const GridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const gridSize = 50 // Grid cell size in pixels
    const distortionRadius = 350 // Increased radius for larger warped area

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const getDistortedPoint = (x: number, y: number) => {
      const dx = mouseRef.current.x - x
      const dy = mouseRef.current.y - y
      const distanceSq = dx * dx + dy * dy
      const distance = Math.sqrt(distanceSq)

      if (distance < distortionRadius && distance > 0.1) {
        // Gaussian distribution for smooth falloff (sigma controls the spread)
        const sigma = distortionRadius * 0.4
        // Calculate factor using exp(-d^2 / (2 * sigma^2))
        // multiplier ensures we don't move points past the mouse (avoiding knots)
        const factor = Math.exp(-distanceSq / (2 * sigma * sigma)) * 0.5
        
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

      // Draw vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath()
        
        // Reduced sampling density to prevent line tangling (was 5, now 10)
        for (let y = 0; y <= canvas.height; y += 10) {
          const distorted = getDistortedPoint(x, y)
          
          if (y === 0) {
            ctx.moveTo(distorted.x, distorted.y)
          } else {
            ctx.lineTo(distorted.x, distorted.y)
          }
        }
        
        ctx.stroke()
      }

      // Draw horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath()
        
        // Reduced sampling density to prevent line tangling (was 5, now 10)
        for (let x = 0; x <= canvas.width; x += 10) {
          const distorted = getDistortedPoint(x, y)
          
          if (x === 0) {
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

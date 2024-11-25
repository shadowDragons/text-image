'use client'
import { useEffect, useRef, useState } from 'react'

// 添加图片规格选项
const sizeOptions = [
  { width: 1080, height: 1350, label: '1080×1350 (默认)' },
  { width: 1080, height: 1080, label: '1080×1080 (方形)' },
  { width: 1920, height: 1080, label: '1920×1080 (横版)' },
  { width: 800, height: 600, label: '800×600' },
  { width: 500, height: 500, label: '500×500 (小尺寸)' },
]

// 修改模板定义
const templates = [
  {
    id: 1,
    name: '自定义纯色',
    type: 'solid',
    backgroundColor: '#2c3e50', // 默认颜色
    textPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 2,
    name: '渐变模板1',
    type: 'gradient',
    backgroundColor: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    textPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 3,
    name: '渐变模板2',
    type: 'gradient',
    backgroundColor: 'linear-gradient(135deg, #667eea, #764ba2)',
    textPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 4,
    name: '波浪模板',
    type: 'pattern',
    backgroundColor: '#3498db',
    pattern: 'wave',
    textPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 5,
    name: '点阵模板',
    type: 'pattern',
    backgroundColor: '#2ecc71',
    pattern: 'dots',
    textPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 6,
    name: '六边形模板',
    type: 'pattern',
    backgroundColor: '#9b59b6',
    pattern: 'hexagon',
    textPosition: { x: 0.5, y: 0.5 },
  },
]

// 定义马克笔样式选项
const markerStyles = [
  { id: 'none', color: 'none', label: '无效果' },
  { id: 'yellow', color: '#ffd700', label: '黄色马克笔' },
  { id: 'green', color: '#98fb98', label: '绿色马克笔' },
  { id: 'pink', color: '#ffb6c1', label: '粉色马克笔' },
  { id: 'blue', color: '#87cefa', label: '蓝色马克笔' },
]

interface CharacterStyle {
  marker: string // 马克笔样式的 id
}

interface Character {
  char: string
  style: CharacterStyle
}

// 添加字体选项
const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'SimSun', label: '宋体' },
  { value: 'KaiTi', label: '楷体' },
  { value: 'SimHei', label: '黑体' },
  { value: 'STXihei', label: '华文细黑' },
]

interface TextStyle {
  fontSize: number
  fontFamily: string
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontSize: 48,
    fontFamily: 'Arial',
  })
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0])
  const [backgroundColor, setBackgroundColor] = useState('#2c3e50')

  // 当输入文本时，转换为 characters 数组
  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.textContent || ''
    const newCharacters = newText.split('').map(char => ({
      char,
      style: {
        marker: 'none',
      },
    }))
    setCharacters(newCharacters)
  }

  // 处理文本选择
  const handleTextSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection()
    if (!selection) return

    const target = e.currentTarget
    const start = selection.anchorOffset
    const end = selection.focusOffset

    // 计算选中的字符索引
    const indexes = []
    for (let i = Math.min(start, end); i < Math.max(start, end); i++) {
      indexes.push(i)
    }
    setSelectedIndexes(indexes)
  }

  // 应用马克笔样式
  const applyMarker = (markerId: string) => {
    setCharacters(prev => {
      const newCharacters = [...prev]
      selectedIndexes.forEach(index => {
        if (newCharacters[index]) {
          newCharacters[index] = {
            ...newCharacters[index],
            style: {
              marker: markerId,
            },
          }
        }
      })
      return newCharacters
    })
  }

  const wrapText = (context: CanvasRenderingContext2D, characters: Character[], x: number, y: number, maxWidth: number, lineHeight: number) => {
    let currentLine: Character[] = []
    const lines: Character[][] = []

    for (let char of characters) {
      const testLine = [...currentLine, char]
      const testText = testLine.map(c => c.char).join('')
      const metrics = context.measureText(testText)
      const testWidth = metrics.width

      if (testWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine)
        currentLine = [char]
      } else {
        currentLine.push(char)
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine)
    }

    const totalHeight = lines.length * lineHeight
    const startY = y - totalHeight / 2

    lines.forEach((line, lineIndex) => {
      let currentX = x - context.measureText(line.map(c => c.char).join('')).width / 2
      const lineY = startY + lineIndex * lineHeight

      line.forEach(char => {
        context.save()

        // 修改字体设置方式
        const fontString = `${textStyle.fontSize}px "${textStyle.fontFamily}"`
        context.font = fontString

        // 先绘制马克笔效果（如果有）
        if (char.style.marker !== 'none') {
          const markerStyle = markerStyles.find(style => style.id === char.style.marker)
          if (markerStyle) {
            const charWidth = context.measureText(char.char).width
            const markerHeight = textStyle.fontSize * 0.8 // 马克笔高度为字体大小的80%

            // 设置马克笔效果
            context.fillStyle = markerStyle.color
            context.globalAlpha = 0.5 // 设置透明度

            // 绘制马克笔效果（略微倾斜的矩形）
            context.beginPath()
            context.moveTo(currentX, lineY + markerHeight / 2)
            context.lineTo(currentX + charWidth, lineY + markerHeight / 2)
            context.lineTo(currentX + charWidth, lineY - markerHeight / 2)
            context.lineTo(currentX, lineY - markerHeight / 2)
            context.closePath()
            context.fill()

            // 重置透明度
            context.globalAlpha = 1
          }
        }

        // 绘制文字
        context.fillStyle = '#ffffff' // 默认白色文字
        if (selectedTemplate.type === 'solid') {
          // 根据背景颜色的亮度决定文字颜色
          const rgb = hexToRgb(backgroundColor)
          if (rgb) {
            const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
            context.fillStyle = brightness > 128 ? '#000000' : '#ffffff'
          }
        }
        context.fillText(char.char, currentX, lineY)

        currentX += context.measureText(char.char).width
        context.restore()
      })
    })
  }

  const generateImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = selectedSize.width
    canvas.height = selectedSize.height

    // 根据模板类型绘制不同背景
    if (selectedTemplate.type === 'solid') {
      // 纯色背景使用颜色选择器的颜色
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (selectedTemplate.type === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      const colors = selectedTemplate.backgroundColor.match(/#[a-fA-F0-9]{6}/g) || ['#000000', '#ffffff']
      gradient.addColorStop(0, colors[0])
      gradient.addColorStop(1, colors[1])
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (selectedTemplate.type === 'pattern') {
      // 先填充背景色
      ctx.fillStyle = selectedTemplate.backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 根据不同的图案类型绘制
      switch (selectedTemplate.pattern) {
        case 'wave':
          drawWavePattern(ctx, canvas.width, canvas.height)
          break
        case 'dots':
          drawDotsPattern(ctx, canvas.width, canvas.height)
          break
        case 'hexagon':
          drawHexagonPattern(ctx, canvas.width, canvas.height)
          break
      }
    }

    // 设置字体
    const fontString = `${textStyle.fontSize}px "${textStyle.fontFamily}"`
    ctx.font = fontString

    // 设置文字颜色
    if (selectedTemplate.type === 'solid') {
      const rgb = hexToRgb(backgroundColor)
      if (rgb) {
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
        ctx.fillStyle = brightness > 128 ? '#000000' : '#ffffff'
      }
    } else {
      ctx.fillStyle = '#ffffff'
    }

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = ctx.fillStyle

    const textX = canvas.width * selectedTemplate.textPosition.x
    const textY = canvas.height * selectedTemplate.textPosition.y

    wrapText(ctx, characters, textX, textY, canvas.width - canvas.width * 0.2, textStyle.fontSize * 1.2)
  }

  // 添加图案绘制函数
  const drawWavePattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 2

    for (let y = 0; y < height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x < width; x += 10) {
        ctx.lineTo(x, y + Math.sin(x * 0.03) * 10)
      }
      ctx.stroke()
    }
  }

  const drawDotsPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    const size = 4
    const spacing = 20

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  const drawHexagonPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 2
    const size = 30

    for (let y = 0; y < height + size * 2; y += size * 1.5) {
      for (let x = 0; x < width + size * 2; x += size * 2) {
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const px = x + size * Math.cos(angle)
          const py = y + size * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.stroke()
      }
    }
  }

  // 添加颜色转换辅助函数
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  // 实时生成图片
  useEffect(() => {
    generateImage()
  }, [characters, selectedTemplate, textStyle, selectedSize, backgroundColor])

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'generated-image.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  // 修改字体设置函数
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = e.target.value
    setTextStyle(prev => ({ ...prev, fontFamily: newFont }))
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>文字图片生成器</h1>

      {/* 添加尺寸选择 */}
      <div className='mb-4'>
        <label className='block mb-2'>图片尺寸：</label>
        <div className='flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
          {sizeOptions.map((size, index) => (
            <button
              key={index}
              onClick={() => setSelectedSize(size)}
              className={`flex-none px-4 py-2 rounded-lg transition-all ${
                selectedSize === size ? 'bg-blue-500 text-white shadow-lg transform scale-105' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      {/* 模板选择部分 */}
      <div className='mb-4'>
        <label className='block mb-2'>选择模板：</label>
        <div className='relative'>
          <div className='flex overflow-x-auto pb-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
            {templates.map(template => (
              <div
                key={template.id}
                className={`flex-none w-60 cursor-pointer rounded-lg transition-all hover:shadow-lg ${
                  selectedTemplate.id === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div
                  className='w-full h-40 rounded-lg'
                  style={{
                    background: template.backgroundColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {template.pattern && <div className='w-20 h-20 rounded-full' style={{ backgroundColor: '#c0392b' }} />}
                </div>
                <p className='text-center mt-2 pb-2'>{template.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTemplate.type === 'solid' && (
        <div className='mb-4'>
          <label className='block mb-2'>背景颜色：</label>
          <div className='flex items-center gap-4'>
            <input
              type='color'
              value={backgroundColor}
              onChange={e => {
                setBackgroundColor(e.target.value)
                // 不需要手动调用 generateImage，useEffect 会处理
              }}
              className='w-12 h-12 rounded cursor-pointer'
            />
            <span className='text-sm'>{backgroundColor.toUpperCase()}</span>
          </div>
        </div>
      )}

      <div className='mb-4'>
        <label className='block mb-2'>文字样式：</label>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div className='flex flex-wrap gap-2'>
            {markerStyles.map(style => (
              <button
                key={style.id}
                onClick={() => applyMarker(style.id)}
                className={`px-4 py-2 rounded transition-colors ${style.id === 'none' ? 'bg-gray-200 hover:bg-gray-300' : 'text-gray-800 hover:brightness-95'}`}
                style={{
                  backgroundColor: style.id === 'none' ? undefined : style.color,
                }}
              >
                {style.label}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <label>字体：</label>
            <select value={textStyle.fontFamily} onChange={handleFontChange} className='border rounded px-2 py-1'>
              {fontOptions.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <label>字体大小：</label>
          <input
            type='range'
            min='20'
            max='80'
            value={textStyle.fontSize}
            onChange={e => setTextStyle(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
            className='w-48'
          />
          <span>{textStyle.fontSize}px</span>
        </div>
      </div>

      <div className='mb-4'>
        <label className='block mb-2'>输入文字：</label>
        <div
          className='border p-2 w-full rounded-lg min-h-[8rem] whitespace-pre-wrap'
          contentEditable
          onInput={handleTextChange}
          onMouseUp={handleTextSelect}
          style={{ lineHeight: '1.5' }}
        />
      </div>

      <div className='space-x-4 mb-4'>
        <button onClick={downloadImage} className='bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors'>
          下载图片
        </button>
      </div>

      <div className='mt-4'>
        <canvas ref={canvasRef} className='border rounded-lg max-w-full'></canvas>
      </div>
    </div>
  )
}

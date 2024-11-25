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

const templates = [
  {
    id: 1,
    name: '渐变模板',
    backgroundColor: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    textPosition: { x: 0.5, y: 0.5 }, // 改用相对位置（0-1之间的值）
  },
  {
    id: 2,
    name: '纯色模板',
    backgroundColor: '#2c3e50',
    textPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 3,
    name: '条纹模板',
    backgroundColor: 'repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)',
    textPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 4,
    name: '圆形模板',
    backgroundColor: '#e74c3c',
    pattern: true,
    textPosition: { x: 0.5, y: 0.5 },
  },
  {
    id: 5,
    name: '白底模板',
    backgroundColor: '#ffffff',
    textPosition: { x: 0.5, y: 0.5 },
    darkText: true,
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
  { value: '"Microsoft YaHei"', label: '微软雅黑' },
  { value: '"SimSun"', label: '宋体' },
  { value: '"KaiTi"', label: '楷体' },
  { value: '"SimHei"', label: '黑体' },
  { value: '"STXihei"', label: '华文细黑' },
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

        // 设置基础字体
        context.font = `${textStyle.fontSize}px ${textStyle.fontFamily}`

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
        context.fillStyle = selectedTemplate.darkText ? '#000000' : '#ffffff'
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

    // 使用选中的尺寸
    canvas.width = selectedSize.width
    canvas.height = selectedSize.height

    // 绘制背景
    if (selectedTemplate.backgroundColor.includes('gradient')) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      if (selectedTemplate.id === 1) {
        gradient.addColorStop(0, '#ff6b6b')
        gradient.addColorStop(1, '#4ecdc4')
      } else if (selectedTemplate.id === 3) {
        gradient.addColorStop(0, '#606dbc')
        gradient.addColorStop(1, '#465298')
      }
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = selectedTemplate.backgroundColor
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (selectedTemplate.pattern) {
      // 调整圆形大小为画布较小边的30%
      const radius = Math.min(canvas.width, canvas.height) * 0.3
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2)
      ctx.fillStyle = '#c0392b'
      ctx.fill()
    }

    // 更新基础文字样式
    ctx.font = `${textStyle.fontSize}px ${textStyle.fontFamily}`
    ctx.fillStyle = selectedTemplate.darkText ? '#000000' : '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = ctx.fillStyle

    // 使用相对位置计算实际坐标
    const textX = canvas.width * selectedTemplate.textPosition.x
    const textY = canvas.height * selectedTemplate.textPosition.y

    // 绘制文字
    wrapText(ctx, characters, textX, textY, canvas.width - canvas.width * 0.2, textStyle.fontSize * 1.2)
  }

  // 实时生成图片
  useEffect(() => {
    generateImage()
  }, [characters, selectedTemplate, textStyle])

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'generated-image.png'
    link.href = canvas.toDataURL()
    link.click()
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
              className={`flex-none px-4 py-2 rounded-lg transition-colors ${
                selectedSize === size ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
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
            <select
              value={textStyle.fontFamily}
              onChange={e => setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
              className='border rounded px-2 py-1'
            >
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

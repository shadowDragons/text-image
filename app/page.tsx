'use client'
import { useRef, useState } from 'react'

const templates = [
  {
    id: 1,
    name: '模板1',
    url: '/templates/template1.jpg',
    textPosition: { x: 100, y: 100 },
  },
  {
    id: 2,
    name: '模板2',
    url: '/templates/template2.jpg',
    textPosition: { x: 100, y: 150 },
  },
]

export default function Home() {
  const [text, setText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 加载模板图片
    const img = new Image()
    img.src = selectedTemplate.url
    img.onload = () => {
      // 设置画布大小为图片大小
      canvas.width = img.width
      canvas.height = img.height

      // 绘制图片
      ctx.drawImage(img, 0, 0)

      // 设置文字样式
      ctx.font = '32px Arial'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'

      // 绘制文字
      ctx.fillText(text, selectedTemplate.textPosition.x, selectedTemplate.textPosition.y)
    }
  }

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

      <div className='mb-4'>
        <label className='block mb-2'>选择模板：</label>
        <div className='grid grid-cols-2 gap-4'>
          {templates.map(template => (
            <div
              key={template.id}
              className={`border p-2 cursor-pointer ${selectedTemplate.id === template.id ? 'border-blue-500' : ''}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <img src={template.url} alt={template.name} className='w-full' />
              <p className='text-center mt-2'>{template.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='mb-4'>
        <label className='block mb-2'>输入文字：</label>
        <input type='text' value={text} onChange={e => setText(e.target.value)} className='border p-2 w-full' />
      </div>

      <button onClick={generateImage} className='bg-blue-500 text-white px-4 py-2 rounded mr-2'>
        生成图片
      </button>

      <button onClick={downloadImage} className='bg-green-500 text-white px-4 py-2 rounded'>
        下载图片
      </button>

      <div className='mt-4'>
        <canvas ref={canvasRef} className='border'></canvas>
      </div>
    </div>
  )
}

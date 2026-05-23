/**
 * 将 File 对象转为 base64 字符串
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 压缩图片：限制最大宽度，保持比例
 */
export function compressImage(file: File, maxWidth = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(maxWidth / img.width, 1)
      if (ratio >= 1) {
        resolve(file)
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        0.8
      )
    }

    img.onerror = reject
    img.src = url
  })
}

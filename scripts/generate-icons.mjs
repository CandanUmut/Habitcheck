import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const sourcePath = path.join(root, 'public', 'assets', 'app-icon.png')
const outputDir = path.join(root, 'public', 'pwa')

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' }
]

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const run = async () => {
  if (!(await fileExists(sourcePath))) {
    console.error('Missing /public/assets/app-icon.png. Add it before generating icons.')
    process.exit(1)
  }

  await fs.mkdir(outputDir, { recursive: true })

  await Promise.all(
    sizes.map(({ size, name }) =>
      sharp(sourcePath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, name))
    )
  )

  console.log('PWA icons generated in /public/pwa.')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

import sharp from 'sharp'
import { readFile, writeFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const targets = [
  'room-day.png',
  'room-night.png',
  'room-relax-day.png',
  'room-relax-night.png',
  'room.png',
  'auth-day.png',
  'auth-night.png',
  'library-day.png',
  'library-night.png',
  'og-image.png',
]

for (const name of targets) {
  const file = join('public', name)
  let before
  try {
    before = (await stat(file)).size
  } catch {
    console.log(`skip ${name} (not found)`)
    continue
  }
  const input = await readFile(file)
  const output = await sharp(input)
    .png({ palette: true, compressionLevel: 9, effort: 10, quality: 90 })
    .toBuffer()
  if (output.length < before) {
    await writeFile(file, output)
    console.log(`${name}: ${(before / 1e6).toFixed(2)}MB -> ${(output.length / 1e6).toFixed(2)}MB`)
  } else {
    console.log(`${name}: kept original (${(before / 1e6).toFixed(2)}MB)`)
  }
}

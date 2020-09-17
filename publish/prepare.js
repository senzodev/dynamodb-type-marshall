import { mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const prepareDir = () => {
  const packageDir = join(process.cwd(), 'package')
  const esmDir = join(packageDir, 'esm')
  const cjsDir = join(packageDir, 'cjs')

  if (!existsSync(packageDir)) mkdirSync(packageDir)
  if (!existsSync(esmDir)) mkdirSync(esmDir)
  if (!existsSync(cjsDir)) mkdirSync(cjsDir)
}

export { prepareDir }

import { readFileSync, writeFileSync, copyFileSync } from 'fs'
import { join } from 'path'

const copyWritePackageDef = () => {
  const packageDir = join(process.cwd(), 'package')
  const esmDir = join(packageDir, 'esm')
  const cjsDir = join(packageDir, 'cjs')

  const esmPackageDefs = join(process.cwd(), 'publish/packageDefs/esm')
  const cjsPackageDefs = join(process.cwd(), 'publish/packageDefs/cjs')

  const sourcePackageJSON = JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'))
  )

  const esmPackageJSON = JSON.parse(
    readFileSync(join(esmPackageDefs, 'package.json'))
  )

  const cjsPackageJSON = JSON.parse(
    readFileSync(join(cjsPackageDefs, 'package.json'))
  )

  esmPackageJSON.version = sourcePackageJSON.version
  cjsPackageJSON.version = sourcePackageJSON.version

  writeFileSync(
    join(esmDir, 'package.json'),
    JSON.stringify(esmPackageJSON),
    'utf8'
  )

  writeFileSync(
    join(cjsDir, 'package.json'),
    JSON.stringify(cjsPackageJSON),
    'utf8'
  )

  copyFileSync(join(esmPackageDefs, 'README.md'), join(esmDir, 'README.md'))
  copyFileSync(join(cjsPackageDefs, 'README.md'), join(cjsDir, 'README.md'))
}

export { copyWritePackageDef }

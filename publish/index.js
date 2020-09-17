import { prepareDir } from './prepare.js'
import { copyWritePackageDef } from './copy.js'

const preparePackage = () => {
  try {
    prepareDir()
    copyWritePackageDef()
  } catch (error) {
    console.error(error)
  }
}

preparePackage()

import { config as configLocal } from './config/config.local'
import { config as configProd } from './config/config.prod'

export default process.env.NODE_ENV === 'production' ? configProd : configLocal
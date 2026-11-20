import { generateClient } from 'aws-amplify/data'
import { createScoresApi } from './createScoresApi.js'

// Cliente creado una sola vez, a nivel de módulo.
export const scoresApi = createScoresApi(generateClient())

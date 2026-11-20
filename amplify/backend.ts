import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';

/**
 * Backend del juego: solo la tabla de puntajes (sin cuentas de usuario).
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
defineBackend({
  data,
});

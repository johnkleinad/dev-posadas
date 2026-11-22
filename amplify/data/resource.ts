import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Puntajes del juego. Cualquiera con la API key pública puede crear y leer;
 * nadie puede editar ni borrar desde el cliente.
 */
const schema = a.schema({
  Score: a
    .model({
      name: a.string().required(),
      level: a.integer().required(),
      points: a.integer().required(),
      // Tabla del modo de juego ('clasico' | 'fiesta' | …). Opcional: las filas
      // anteriores a los modos no lo tienen y cuentan como 'clasico'.
      mode: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey().to(['create', 'read'])]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});

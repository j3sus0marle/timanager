// @ts-check
import dotenv from 'dotenv';
dotenv.config();
/**
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  use: {
    baseURL: 'http://localhost',
    // Las variables de entorno ya están cargadas por dotenv
  },
};

export default config;

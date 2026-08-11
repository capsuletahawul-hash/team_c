import axios from 'axios';

const MOYASAR_SECRET_KEY = process.env.MOYASAR_SECRET_KEY || '';

if (!MOYASAR_SECRET_KEY) {
  console.warn('⚠️ MOYASAR_SECRET_KEY is not defined in .env');
}

export const moyasarClient = axios.create({
  baseURL: 'https://api.moyasar.com/v1',
  auth: {
    username: MOYASAR_SECRET_KEY, // Moyasar uses Basic Auth with secret key as username
    password: '',
  },
});
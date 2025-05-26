import { config as dotenvConfig } from 'dotenv';    
dotenvConfig();

interface Config {
  port: number;
  baseUrl: string;
  wsUrl: string;
}

function getConfig(): Config {
  const port = parseInt(process.env.PORT || '3000', 10);
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
  
  // Gerar URL do WebSocket baseada na BASE_URL
  let wsUrl: string;
  if (baseUrl.startsWith('https://')) {
    wsUrl = baseUrl.replace('https://', 'wss://');
  } else {
    wsUrl = baseUrl.replace('http://', 'ws://');
  }
  
  return {
    port,
    baseUrl,
    wsUrl
  };
}

export const config = getConfig(); 
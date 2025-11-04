import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const SETTINGS_KEY = 'app_settings';

let cachedBaseUrl: string = 'http://185.120.251.246';

export async function getBaseUrl(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      const port = settings.serverPort === '80' || settings.serverPort === '' 
        ? '' 
        : `:${settings.serverPort}`;
      cachedBaseUrl = `http://${settings.serverUrl}${port}`;
      return cachedBaseUrl;
    }
  } catch (error) {
    console.error('[trpc] Failed to load settings:', error);
  }

  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    cachedBaseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    return cachedBaseUrl;
  }

  return cachedBaseUrl;
}

getBaseUrl();

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpLink({
        url: `${cachedBaseUrl}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await AsyncStorage.getItem('auth_token');
          return {
            authorization: token ? `Bearer ${token}` : '',
          };
        },
        fetch(url, options) {
          console.log('[trpc] Fetch:', url);
          return fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'Content-Type': 'application/json',
            },
          }).then(async (response) => {
            if (!response.ok) {
              const text = await response.text();
              console.error('[trpc] Error response:', response.status, text.substring(0, 500));
              
              if (response.status === 404) {
                throw new Error('سرور در دسترس نیست. لطفا تنظیمات سرور را بررسی کنید.');
              }
              
              throw new Error(`خطای سرور: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('application/json')) {
              const text = await response.text();
              console.error('[trpc] Non-JSON response:', text.substring(0, 500));
              throw new Error('سرور پاسخ صحیحی ارسال نکرد. لطفا تنظیمات سرور را بررسی کنید.');
            }
            
            return response;
          }).catch((error) => {
            console.error('[trpc] Fetch error:', error);
            
            if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
              throw new Error('خطا در اتصال به سرور. لطفا اتصال اینترنت و تنظیمات سرور را بررسی کنید.');
            }
            
            throw error;
          });
        },
      }),
    ],
  });
}

export const trpcClient = createTRPCClient();

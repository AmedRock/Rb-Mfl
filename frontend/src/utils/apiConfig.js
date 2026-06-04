/**
 * Merkezi API temel URL yapılandırması.
 * Production'da VITE_API_URL ortam değişkeni (örn. https://xxx.onrender.com/api) kullanılır.
 * Local geliştirmede tanımlı değilse Vite proxy'sinin devreye girmesi için '/api' fallback'i kullanılır.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

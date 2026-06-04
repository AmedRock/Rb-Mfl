/**
 * Merkezi API temel URL yapılandırması.
 *
 * VITE_API_URL olarak Render base URL'ini girin (örn. https://rb-mfl.onrender.com)
 * /api ekini bu dosya otomatik olarak ekler — Vercel env değişkenine /api yazmana gerek yok.
 *
 * Local geliştirmede VITE_API_URL tanımlı değilse Vite proxy'si devreye girer → /api
 */
const _base = import.meta.env.VITE_API_URL;
export const API_BASE = _base ? `${_base.replace(/\/+$/, '')}/api` : '/api';


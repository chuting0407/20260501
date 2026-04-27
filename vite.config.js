import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/20260501/', // ⚠️ 這一行最重要！必須是你的 GitHub 倉庫名稱，前後都要有斜線
})
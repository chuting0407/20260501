<script setup>
import { ref, computed } from 'vue';

// 狀態管理：start(首頁), quiz(測驗), toolbox(工具箱), news(快訊), result(分數)
const state = ref('start'); 
const currentStep = ref(0);
const score = ref(0);
const showFeedback = ref(false);
const userChoice = ref(null);

/**
 * 💡 關鍵：解決 GitHub Pages 圖片路徑問題
 * 使用 import.meta.env.BASE_URL 會自動對應 vite.config.js 裡的 base 路徑
 * 確保在本地顯示 "/"，在 GitHub 顯示 "/20260501/"
 */
const getPath = (name) => {
  const baseUrl = import.meta.env.BASE_URL;
  // 確保路徑銜接處不會有雙斜線
  return `${baseUrl.replace(/\/$/, '')}/${name.replace(/^\//, '')}`;
};

// --- 模組一：測驗數據 (圖片需放在 public 資料夾下) ---
const questions = ref([
  {
    title: "看到網紅介紹產品宣稱「神奇療效」且連結是一串亂碼，這可能是？",
    image: "q1.png", 
    options: ["撿到便宜了，趕快下單", "這是一頁式詐騙購物網站", "這代表網紅很有影響力"],
    answer: 1,
    feedback: "【教學重點】網址若為亂碼通常是詐騙網站。購物應選擇知名電商平台或官方網站才有保障。"
  },
  {
    title: "收到來自朋友 LINE 傳來「幫我投票」並要求簡訊驗證碼，該？",
    image: "q2.png",
    options: ["朋友的事就是我的事，立刻給", "這是典型的「盜帳號」詐騙", "回傳驗證碼並幫他分享"],
    answer: 1,
    feedback: "【教學重點】驗證碼就像家裡鑰匙，絕不能給任何人！一旦給出，你的帳號就會被盜用。"
  },
  {
    title: "某網紅在影片中推薦課程，卻完全沒提到是否有收廠商的錢，這涉及？",
    image: "q3.png",
    options: ["這沒關係，他只是單純分享", "廣告標露與誠信透明度問題", "代表該產品真的很受歡迎"],
    answer: 1,
    feedback: "【教學重點】業配透明度是數位素養的重要環節。收錢卻沒標註「廣告」會誤導消費者判斷。"
  },
  {
    title: "你在社群媒體看到「免費送咖啡兌換券」要你填寫身分證與電話，這？",
    image: "q4.png",
    options: ["免費的最棒，先填再說", "這是收集個資的釣魚陷阱", "是品牌給粉絲的福利"],
    answer: 1,
    feedback: "【教學重點】這類連結通常是為了收集你的個人隱私資料，轉賣給詐騙集團進行非法用途。"
  },
  {
    title: "看到標題驚悚的健康資訊（如：吃這個會致癌），內文卻沒有醫學出處，該？",
    image: "q5.png",
    options: ["太恐怖了，快分享出去", "這是未經證實的「假訊息」", "寧可信其有，不可信其無"],
    answer: 1,
    feedback: "【教學重點】數位時代要學會「查證事實」。未經證實的醫療資訊容易造成恐慌，轉傳前應先檢查。"
  }
]);

// --- 模組二：工具箱數據 ---
const tools = [
  { name: "165 全民防騙網", desc: "政府官方反詐騙平台，可查詢最新案件。", url: "https://165.npa.gov.tw/" },
  { name: "MyGoPen 真相發現", desc: "專業的假訊息查證網站，提供闢謠服務。", url: "https://www.mygopen.com/" },
  { name: "LINE 訊息查證", desc: "官方查證工具，一鍵辨識假新聞與詐騙。", url: "https://fact-checker.line.me/" }
];

// --- 模組三：最新快訊數據 ---
const news = [
  { tag: "最新", date: "2026/04/27", title: "AI 換臉詐騙正流行", content: "接到親友視訊借錢？小心那是 AI 模擬的！請約定一個秘密暗號來驗證身份。" },
  { tag: "熱門", date: "2026/04/25", title: "假冒政府領補助簡訊", content: "政府不會傳送「.com」的簡訊連結。領取補助請認明官方網址或 App。" }
];

// --- 邏輯函數 ---
const currentQuestion = computed(() => questions.value[currentStep.value]);
const progress = computed(() => ((currentStep.value + 1) / questions.value.length) * 100);

const startModule = (type) => {
  state.value = type;
  currentStep.value = 0;
  score.value = 0;
  showFeedback.value = false;
  userChoice.value = null;
};

const checkAnswer = (idx) => {
  if (showFeedback.value) return;
  userChoice.value = idx;
  showFeedback.value = true;
  if (idx === currentQuestion.value.answer) score.value += 20;
};

const nextStep = () => {
  if (currentStep.value < questions.value.length - 1) {
    currentStep.value++;
    showFeedback.value = false;
    userChoice.value = null;
  } else {
    state.value = 'result';
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#f8fbfe] flex items-center justify-center p-4 font-sans text-gray-700">
    <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 border-4 border-white overflow-hidden">
      
      <div v-if="state === 'start'" class="text-center py-4">
        <div class="text-7xl mb-4">🛡️</div>
        <h1 class="text-3xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-rose-400">
          數位素養小超人
        </h1>
        <p class="text-lg font-bold text-gray-400 mb-10">全民防詐特訓營 ⚠️</p>
        
        <div class="space-y-4">
          <button @click="startModule('quiz')" class="w-full bg-rose-400 text-white text-xl font-bold py-4 rounded-3xl shadow-lg transform hover:scale-105 active:scale-95 transition">
            🎮 開始測驗挑戰
          </button>
          <button @click="state = 'toolbox'" class="w-full bg-sky-400 text-white text-xl font-bold py-4 rounded-3xl shadow-lg transform hover:scale-105 active:scale-95 transition">
            🛠️ 小超人工具箱
          </button>
          <button @click="state = 'news'" class="w-full bg-amber-400 text-white text-xl font-bold py-4 rounded-3xl shadow-lg transform hover:scale-105 active:scale-95 transition">
            🚨 英雄情報站
          </button>
        </div>
      </div>

      <div v-else-if="state === 'quiz'">
        <div class="flex justify-between items-center mb-4 text-sm font-bold text-gray-400 px-1">
          <span class="bg-gray-100 px-3 py-1 rounded-full">題號 {{ currentStep + 1 }} / 5</span>
          <span class="text-rose-400">得分: {{ score }}</span>
        </div>
        
        <div class="w-full h-48 bg-gray-50 rounded-3xl mb-6 overflow-hidden border-2 border-gray-100 flex items-center justify-center shadow-inner">
          <img :src="getPath(currentQuestion.image)" class="max-w-full max-h-full object-contain">
        </div>
        
        <h2 class="text-xl font-bold mb-6 text-gray-800 leading-snug">{{ currentQuestion.title }}</h2>
        
        <div class="space-y-3">
          <button v-for="(opt, index) in currentQuestion.options" @click="checkAnswer(index)"
            class="w-full text-left p-4 border-2 rounded-2xl font-bold transition-all"
            :class="[
              !showFeedback ? 'bg-white border-gray-100 hover:border-sky-300 hover:bg-sky-50' : 
              (index === currentQuestion.answer ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' : 
              (userChoice === index ? 'bg-red-100 border-red-500 text-red-700 shadow-sm' : 'opacity-40 grayscale'))
            ]">
            {{ opt }}
          </button>
        </div>
        
        <div v-if="showFeedback" class="mt-6 p-5 bg-yellow-50 rounded-3xl border-2 border-yellow-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p class="text-sm font-medium text-gray-600 mb-4 leading-relaxed">
            <span class="text-orange-500 font-black mr-1">【解析】</span>{{ currentQuestion.feedback }}
          </p>
          <button @click="nextStep" class="w-full bg-gray-800 text-white py-3 rounded-2xl font-bold hover:bg-black transition-colors">
            {{ currentStep === 4 ? '查看特訓結果' : '前進下一關' }}
          </button>
        </div>
      </div>

      <div v-else-if="state === 'toolbox'" class="space-y-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-black text-sky-600">🛠️ 查證工具箱</h2>
          <button @click="state = 'start'" class="text-gray-300 text-2xl">✕</button>
        </div>
        
        <div v-for="tool in tools" :key="tool.name" class="p-5 border-2 border-sky-50 rounded-[2rem] bg-sky-50/30">
          <h3 class="font-bold text-sky-700 mb-1 text-lg">{{ tool.name }}</h3>
          <p class="text-xs text-gray-500 mb-4">{{ tool.desc }}</p>
          <a :href="tool.url" target="_blank" class="inline-block bg-sky-500 text-white text-xs px-5 py-2 rounded-full font-bold shadow-md hover:bg-sky-600 transition-colors">
            立即前往查證 →
          </a>
        </div>
        <button @click="state = 'start'" class="w-full bg-gray-800 text-white py-4 rounded-3xl font-bold mt-4 shadow-lg">回到首頁</button>
      </div>

      <div v-else-if="state === 'news'" class="space-y-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-black text-amber-500">🚨 英雄情報站</h2>
          <button @click="state = 'start'" class="text-gray-300 text-2xl">✕</button>
        </div>
        
        <div v-for="item in news" :key="item.title" class="p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-100 relative overflow-hidden shadow-sm">
          <div class="flex items-center gap-2 mb-3">
            <span class="bg-amber-400 text-white text-[10px] px-2 py-1 rounded-lg font-bold">{{ item.tag }}</span>
            <span class="text-[10px] text-gray-400 font-medium">{{ item.date }}</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-2 leading-tight">{{ item.title }}</h3>
          <p class="text-xs text-gray-500 leading-relaxed">{{ item.content }}</p>
        </div>
        <button @click="state = 'start'" class="w-full bg-gray-800 text-white py-4 rounded-3xl font-bold mt-4 shadow-lg">回到首頁</button>
      </div>

      <div v-else class="text-center py-6">
        <div class="text-7xl mb-4">🏆</div>
        <h2 class="text-5xl font-black text-blue-500 mb-4">{{ score }} <span class="text-xl text-gray-400">分</span></h2>
        <p class="text-gray-500 font-bold mb-10 leading-relaxed px-4">
          特訓完成！<br>你已經具備對抗數位詐騙的英雄潛力！
        </p>
        <button @click="state = 'start'" class="bg-sky-400 text-white px-12 py-4 rounded-full font-bold shadow-xl transform hover:scale-110 transition">
          重新訓練
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 簡單的按鈕回饋動畫 */
button:active {
  transform: scale(0.95);
}
</style>

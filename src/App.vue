<script setup>
import { ref, computed } from 'vue';

// 狀態管理：start(首頁), quiz(測驗), toolbox(工具箱), news(快訊), result(分數)
const state = ref('start'); 
const currentStep = ref(0);
const score = ref(0);
const showFeedback = ref(false);
const userChoice = ref(null);
const timeLeft = ref(20);
let timer = null;

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
    options: ["這是一頁式詐騙購物網站", "撿到便宜了，趕快下單", "這代表網紅很有影響力"],
    answer: 0,
    feedback: "【教學重點】網址若為亂碼通常是詐騙網站。購物應選擇知名電商平台或官方網站才有保障。"
  },
  {
    title: "收到來自朋友 LINE 傳來「幫我投票」並要求簡訊驗證碼，該？",
    image: "q2.png",
    options: ["朋友的事就是我的事，立刻給", "回傳驗證碼並幫他分享", "這是典型的「盜帳號」詐騙"],
    answer: 2,
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
    title: "網路上流行「測你的前世是什麼動物」的心理測驗，要求授權登入社群帳號，這可能是？",
    image: "q4.png",
    options: ["過度索取權限的個資外洩陷阱", "只是好玩的遊戲，不用擔心", "社群官方推出的新功能"],
    answer: 0,
    feedback: "【教學重點】許多免費心理測驗會要求授權存取社群帳號，藉此收集你的好友名單與個資，請謹慎授權！"
  },
  {
    title: "看到標題驚悚的健康資訊（如：吃這個會致癌），內文卻沒有醫學出處，該？",
    image: "q5.png",
    options: ["太恐怖了，快分享出去", "寧可信其有，不可信其無", "這是未經證實的「假訊息」"],
    answer: 2,
    feedback: "【教學重點】數位時代要學會「查證事實」。未經證實的醫療資訊容易造成恐慌，轉傳前應先檢查。"
  }
]);

// --- 模組二：工具箱數據 ---
const tools = [
  { name: "165 全民防騙網", desc: "政府官方反詐騙平台，可查詢最新案件。", url: "https://165.npa.gov.tw/" },
  { name: "MyGoPen 真相發現", desc: "專業的假訊息查證網站，提供闢謠服務。", url: "https://www.mygopen.com/" },
  { name: "LINE 訊息查證", desc: "官方查證工具，一鍵辨識假新聞與詐騙。", url: "https://fact-check.line.me/" }
];

// --- 模組三：最新快訊數據 ---
const news = [
  { tag: "國際", date: "2023/05/23", title: "AI 生成假五角大廈爆炸圖", content: "網路流傳 AI 生成的五角大廈爆炸圖片，一度引發美股閃跌。眼見不一定為憑，請務必多方查證消息來源！", url: "https://news.tvbs.com.tw/world/2117325" },
  { tag: "科技", date: "2023/06/15", title: "Deepfake 詐騙來襲！", content: "詐騙集團利用 AI 換臉與語音技術模仿親友視訊借錢。遇到此情況請務必約定專屬暗號或切斷後回撥確認！", url: "https://www.bnext.com.tw/article/78325/deepfake-fraud-" },
  { tag: "警訊", date: "2023/03/22", title: "點網址搶領6000元簡訊是假的", content: "收到領取補助的簡訊千萬別點！數位部提醒這是釣魚陷阱，已報警處理。請認明政府官方網址結尾為 .gov.tw。", url: "https://tw.news.yahoo.com/%E9%BB%9E%E7%B6%B2%E5%9D%80-%E6%90%B6%E9%A0%986000%E5%85%83-%E7%B0%A1%E8%A8%8A%E6%98%AF%E5%81%87%E7%9A%84-%E6%95%B8%E4%BD%8D%E9%83%A8%E5%87%BA%E6%89%8B%E4%BA%86-%E5%B7%B2%E5%A0%B1%E8%AD%A6%E8%99%95%E7%90%86-030006003.html" }
];

// --- 邏輯函數 ---
const currentQuestion = computed(() => questions.value[currentStep.value]);
const progress = computed(() => ((currentStep.value + 1) / questions.value.length) * 100);

const startTimer = () => {
  clearInterval(timer);
  timeLeft.value = 20;
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timer);
      checkAnswer(-1); // 超時自動結算，視為答錯
    }
  }, 1000);
};

const startModule = (type) => {
  clearInterval(timer); // 切換模組時先清除計時器，避免背景繼續跑
  state.value = type;
  currentStep.value = 0;
  score.value = 0;
  showFeedback.value = false;
  userChoice.value = null;
  if (type === 'quiz') startTimer();
};

const checkAnswer = (idx) => {
  if (showFeedback.value) return;
  clearInterval(timer); // 答題後停止計時
  userChoice.value = idx;
  showFeedback.value = true;
  if (idx === currentQuestion.value.answer) score.value += 20;
};

const nextStep = () => {
  if (currentStep.value < questions.value.length - 1) {
    currentStep.value++;
    showFeedback.value = false;
    userChoice.value = null;
    startTimer(); // 進入下一題重新計時
  } else {
    state.value = 'result';
  }
};
</script>

<template>
  <!-- 移除 bg-[#f8fbfe] 讓 index.html 的漸層背景可以透出來 -->
  <!-- 首頁佈局：背景是漸層，內容是三個白框 -->
  <div v-if="state === 'start'" class="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 box-border font-sans text-gray-700">
      <div class="text-center mb-4 md:mb-12 mt-2 md:mt-8">
        <div class="text-4xl md:text-7xl mb-1 md:mb-4">🛡️</div>
        <h1 class="text-2xl md:text-5xl font-black mb-1 md:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-rose-400">
          數位素養小超人
        </h1>
        <p class="text-sm md:text-xl font-bold text-gray-800">全民防詐特訓營 ⚠️</p>
      </div>

      <div class="flex flex-col md:flex-row gap-2 md:gap-6 w-full max-w-5xl justify-center mb-2 md:mb-10 px-2 md:px-0">
        <!-- 卡片 1 (手機版改為橫向排列) -->
        <div class="bg-white rounded-xl md:rounded-[2rem] shadow-xl p-3 md:p-8 flex flex-row md:flex-col items-center flex-1 gap-3 md:gap-0">
          <div class="text-3xl md:text-6xl md:mb-4">🎮</div>
          <div class="flex-1 text-left md:text-center">
            <h2 class="text-base md:text-2xl font-black text-rose-500 md:mb-2">測驗挑戰</h2>
            <p class="hidden md:block mb-8 text-base text-gray-500 font-medium leading-relaxed">測試你的數位素養與防詐知識，看看你是否能成為防詐小超人！</p>
          </div>
          <button @click="startModule('quiz')" class="shrink-0 bg-rose-400 text-white text-sm md:text-xl font-bold px-4 py-2 md:w-full md:py-4 md:px-0 rounded-lg md:rounded-3xl shadow-md transform hover:scale-105 active:scale-95 transition">
            開始
          </button>
        </div>
        <!-- 卡片 2 -->
        <div class="bg-white rounded-xl md:rounded-[2rem] shadow-xl p-3 md:p-8 flex flex-row md:flex-col items-center flex-1 gap-3 md:gap-0">
          <div class="text-3xl md:text-6xl md:mb-4">🛠️</div>
          <div class="flex-1 text-left md:text-center">
            <h2 class="text-base md:text-2xl font-black text-sky-500 md:mb-2">小超人工具箱</h2>
            <p class="hidden md:block mb-8 text-base text-gray-500 font-medium leading-relaxed">提供各種實用的防詐騙查詢工具與網站，隨時隨地查證可疑訊息。</p>
          </div>
          <button @click="state = 'toolbox'" class="shrink-0 bg-sky-400 text-white text-sm md:text-xl font-bold px-4 py-2 md:w-full md:py-4 md:px-0 rounded-lg md:rounded-3xl shadow-md transform hover:scale-105 active:scale-95 transition">
            開啟
          </button>
        </div>
        <!-- 卡片 3 -->
        <div class="bg-white rounded-xl md:rounded-[2rem] shadow-xl p-3 md:p-8 flex flex-row md:flex-col items-center flex-1 gap-3 md:gap-0">
          <div class="text-3xl md:text-6xl md:mb-4">🚨</div>
          <div class="flex-1 text-left md:text-center">
            <h2 class="text-base md:text-2xl font-black text-amber-500 md:mb-2">英雄情報站</h2>
            <p class="hidden md:block mb-8 text-base text-gray-500 font-medium leading-relaxed">掌握最新的詐騙手法與國際資安快訊，知己知彼百戰百勝。</p>
          </div>
          <button @click="state = 'news'" class="shrink-0 bg-amber-400 text-white text-sm md:text-xl font-bold px-4 py-2 md:w-full md:py-4 md:px-0 rounded-lg md:rounded-3xl shadow-md transform hover:scale-105 active:scale-95 transition">
            查看
          </button>
        </div>
      </div>
  </div>

  <!-- 其他頁面佈局：背景是漸層，中間有一個白色卡片 -->
  <div v-else class="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 box-border font-sans text-gray-700">
    <div class="max-w-lg w-full bg-white rounded-[2rem] shadow-2xl p-5 md:p-8 overflow-hidden">
      
      <div v-if="state === 'quiz'">
        <div class="flex justify-between items-center mb-3 md:mb-4 text-xs md:text-sm font-bold text-gray-400 px-1">
          <span class="bg-gray-100 px-3 py-1 rounded-full">題號 {{ currentStep + 1 }} / 5</span>
          <span class="text-orange-500 font-black text-base md:text-xl flex items-center gap-1"><span>⏱️</span> {{ timeLeft }}s</span>
          <span class="text-rose-400">得分: {{ score }}</span>
        </div>
        
        <!-- 去除了多餘的邊框背景，並壓縮圖片區域高度以適應手機 -->
        <div class="w-full h-32 md:h-48 bg-transparent rounded-2xl md:rounded-3xl mb-4 overflow-hidden flex items-center justify-center">
          <img :src="getPath(currentQuestion.image)" class="max-w-full max-h-full object-contain">
        </div>
        
        <h2 class="text-lg md:text-xl font-bold mb-4 text-gray-800 leading-snug">{{ currentQuestion.title }}</h2>
        
        <div class="space-y-2 md:space-y-3">
          <button v-for="(opt, index) in currentQuestion.options" @click="checkAnswer(index)"
            class="w-full text-left p-3 md:p-4 border-2 rounded-xl md:rounded-2xl text-sm md:text-base font-bold transition-all"
            :class="[
              !showFeedback ? 'bg-white border-gray-100 hover:border-sky-300 hover:bg-sky-50' : 
              (index === currentQuestion.answer ? 'bg-green-100 border-green-500 text-green-700 shadow-sm' : 
              (userChoice === index ? 'bg-red-100 border-red-500 text-red-700 shadow-sm' : 'opacity-40 grayscale'))
            ]">
            {{ opt }}
          </button>
        </div>
        
        <div v-if="showFeedback" class="mt-4 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p class="text-xs md:text-sm font-medium text-gray-600 mb-3 leading-relaxed">
            <span class="text-orange-500 font-black mr-1">【解析】</span>{{ currentQuestion.feedback }}
          </p>
          <button @click="nextStep" class="w-full bg-gray-800 text-white py-2 md:py-3 rounded-xl md:rounded-2xl font-bold hover:bg-black transition-colors text-sm md:text-base">
            {{ currentStep === 4 ? '查看特訓結果' : '前進下一關' }}
          </button>
        </div>
      </div>

      <div v-else-if="state === 'toolbox'" class="space-y-3 md:space-y-4">
        <div class="flex items-center justify-between mb-2 md:mb-4">
          <h2 class="text-xl md:text-2xl font-black text-sky-600">🛠️ 查證工具箱</h2>
          <button @click="state = 'start'" class="text-gray-300 text-2xl">✕</button>
        </div>
        
        <div v-for="tool in tools" :key="tool.name" class="p-4 md:p-5 border-2 border-sky-50 rounded-2xl md:rounded-[2rem] bg-sky-50/30">
          <h3 class="font-bold text-sky-700 mb-1 text-base md:text-lg">{{ tool.name }}</h3>
          <p class="text-xs text-gray-500 mb-4">{{ tool.desc }}</p>
          <a :href="tool.url" target="_blank" class="inline-block bg-sky-500 text-white text-xs px-5 py-2 rounded-full font-bold shadow-md hover:bg-sky-600 transition-colors">
            立即前往查證 →
          </a>
        </div>
        <button @click="state = 'start'" class="w-full bg-gray-800 text-white py-3 md:py-4 rounded-2xl md:rounded-3xl font-bold mt-2 md:mt-4 shadow-lg text-sm md:text-base">回到首頁</button>
      </div>

      <div v-else-if="state === 'news'" class="space-y-3 md:space-y-4">
        <div class="flex items-center justify-between mb-2 md:mb-4">
          <h2 class="text-xl md:text-2xl font-black text-amber-500">🚨 英雄情報站</h2>
          <button @click="state = 'start'" class="text-gray-300 text-2xl">✕</button>
        </div>
        
        <!-- 將 div 改為 a 標籤，綁定 href 加上 hover 效果讓它看起來可點擊 -->
        <a :href="item.url" target="_blank" v-for="item in news" :key="item.title" class="block p-4 md:p-6 bg-amber-50 rounded-2xl md:rounded-[2rem] border-2 border-amber-100 relative overflow-hidden shadow-sm hover:bg-amber-100 transition-colors">
          <div class="flex items-center gap-2 mb-3">
            <span class="bg-amber-400 text-white text-[10px] px-2 py-1 rounded-lg font-bold">{{ item.tag }}</span>
            <span class="text-[10px] text-gray-400 font-medium">{{ item.date }}</span>
          </div>
          <h3 class="font-bold text-gray-800 mb-2 leading-tight">{{ item.title }}</h3>
          <p class="text-xs text-gray-500 leading-relaxed">{{ item.content }}</p>
        </a>
        <button @click="state = 'start'" class="w-full bg-gray-800 text-white py-3 md:py-4 rounded-2xl md:rounded-3xl font-bold mt-2 md:mt-4 shadow-lg text-sm md:text-base">回到首頁</button>
      </div>

      <div v-else class="text-center py-6">
        <div class="text-6xl md:text-7xl mb-4">🏆</div>
        <h2 class="text-4xl md:text-5xl font-black text-blue-500 mb-4">{{ score }} <span class="text-xl text-gray-400">分</span></h2>
        <p class="text-sm md:text-base text-gray-500 font-bold mb-8 md:mb-10 leading-relaxed px-4">
          特訓完成！<br>你已經具備對抗數位詐騙的英雄潛力！
        </p>
        <button @click="state = 'start'" class="bg-sky-400 text-white px-10 md:px-12 py-3 md:py-4 rounded-full font-bold shadow-xl transform hover:scale-110 transition text-sm md:text-base">
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
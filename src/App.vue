<script setup>
import { ref, computed, onUnmounted } from 'vue';

// 狀態管理
const state = ref('start'); // start, quiz, result
const currentStep = ref(0);
const score = ref(0);
const showFeedback = ref(false);
const userChoice = ref(null);
const isCorrect = ref(false);
const timeLeft = ref(20);
let timer = null;

// 取得 vite.config.js 中設定的 base 路徑
const baseUrl = import.meta.env.BASE_URL;

// --- 關鍵修改點 2：資料陣列裡的 image 欄位現在只存檔名 ---
const questions = ref([
  {
    title: "看到網紅介紹產品宣稱「神奇療效」且連結是一串亂碼，這可能是？",
    image: "q1.png",
    options: ["撿到便宜了，趕快下單", "這是一頁式詐騙購物網站", "這代表網紅很有影響力"],
    answer: 1,
    feedback: "【學習重點】網址若為亂碼通常是詐騙網站。購物應選擇知名電商平台或官方網站才有保障。"
  },
  {
    title: "收到來自朋友 LINE 傳來「幫我投票」並要求簡訊驗證碼，該？",
    image: "q2.png",
    options: ["朋友的事就是我的事，立刻給", "這是典型的「盜帳號」詐騙", "回傳驗證碼並幫他分享"],
    answer: 1,
    feedback: "【學習重點】驗證碼就像家裡鑰匙，絕不能給任何人！一旦給出，你的帳號就會被盜用。"
  },
  {
    title: "某網紅在影片中推薦課程，卻完全沒提到是否有收廠商的錢，這涉及？",
    image: "q3.png",
    options: ["這沒關係，他只是單純分享", "廣告標露與誠信透明度問題", "代表該產品真的很受歡迎"],
    answer: 1,
    feedback: "【學習重點】業配透明度是數位素養的重要環節。收錢卻沒標註「廣告」會誤導消費者判斷。"
  },
  {
    title: "你在社群媒體看到「免費送咖啡兌換券」要你填寫身分證與電話，這？",
    image: "q4.png",
    options: ["免費的最棒，先填再說", "這是收集個資的釣魚陷阱", "是品牌給粉絲的福利"],
    answer: 1,
    feedback: "【學習重點】這類連結通常是為了收集你的個人隱私資料，轉賣給詐騙集團進行非法用途。"
  },
  {
    title: "看到標題驚悚的健康資訊（如：吃這個會致癌），內文卻沒有醫學出處，該？",
    image: "q5.png",
    options: ["太恐怖了，快分享出去", "這是未經證實的「假訊息」", "寧可信其有，不可信其無"],
    answer: 1,
    feedback: "【學習重點】數位時代要學會「查證事實」。未經證實的醫療資訊容易造成控慌，轉傳前應先檢查。"
  }
]);

// --- 計算屬性 ---
const currentQuestion = computed(() => questions.value[currentStep.value]);
const progress = computed(() => ((currentStep.value + 1) / questions.value.length) * 100);
const scoreEmoji = computed(() => score.value >= 80 ? '👑' : score.value >= 60 ? '🛡️' : '🐣');
const rankName = computed(() => score.value >= 80 ? '資安大偵探' : score.value >= 60 ? '數位小尖兵' : '實習小超人');

// --- 邏輯函數 ---
const startTimer = () => {
  timeLeft.value = 20;
  clearInterval(timer);
  timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      checkAnswer(-1); // 時間到自動判定
    }
  }, 1000);
};

const startGame = () => {
  state.value = 'quiz';
  startTimer();
};

const checkAnswer = (idx) => {
  clearInterval(timer);
  userChoice.value = idx;
  showFeedback.value = true;
  isCorrect.value = (idx === currentQuestion.value.answer);
  if (isCorrect.value) score.value += 20; // 總分100
};

const getOptionClass = (index) => {
  if (!showFeedback.value) return 'bg-white hover:bg-blue-50 border-gray-100 hover:border-blue-200 active:scale-95';
  if (index === currentQuestion.value.answer) return 'bg-green-100 border-green-500 text-green-700 shadow-inner';
  if (userChoice.value === index) return 'bg-red-100 border-red-500 text-red-700 shadow-inner';
  return 'opacity-40 grayscale pointer-events-none';
};

const nextStep = () => {
  if (currentStep.value < questions.value.length - 1) {
    currentStep.value++;
    showFeedback.value = false;
    userChoice.value = null;
    startTimer();
  } else {
    state.value = 'result';
  }
};

const reset = () => {
  state.value = 'start';
  currentStep.value = 0;
  score.value = 0;
  showFeedback.value = false;
  clearInterval(timer);
};

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#fbc2eb] to-[#a6c1ee] py-10 px-4 font-sans text-gray-800">
    <div class="max-w-xl mx-auto">
      
      <div v-if="state === 'start'" class="text-center bg-white p-10 rounded-[40px] shadow-2xl border-8 border-white">
        <div class="text-7xl mb-4">🦸‍♂️</div>
        <h1 class="text-4xl font-black mb-4 text-blue-500 leading-tight">數位素養<br>小超人訓練營</h1>
        <p class="mb-8 text-gray-500 text-lg font-medium">挑戰 5 個網路關卡，提升防禦力！</p>
        <button @click="startGame" class="bg-rose-400 hover:bg-rose-500 text-white text-2xl font-bold py-4 px-12 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-lg">
          開始訓練
        </button>
      </div>

      <div v-else-if="state === 'quiz'" class="bg-white p-8 rounded-[40px] shadow-2xl border-8 border-white relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-3 bg-gray-100">
          <div class="h-full bg-emerald-400 transition-all duration-500" :style="{ width: progress + '%' }"></div>
        </div>

        <div class="flex justify-between items-center mb-6 mt-2">
          <span class="bg-blue-100 text-blue-500 px-4 py-1 rounded-full font-bold text-sm">進度 {{ currentStep + 1 }} / 5</span>
          <span class="text-2xl font-black transition-colors" :class="timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-orange-400'">
            ⏱️ {{ timeLeft }}s
          </span>
        </div>

        <!-- ★ 強制加上 inline-style，確保容器和圖片有明確的高度，不會被失效的 CSS 吃掉 ★ -->
        <div class="w-full rounded-3xl overflow-hidden mb-6 border-4 border-gray-100 bg-gray-50 flex items-center justify-center shadow-inner" style="min-height: 220px;">
          <img :src="`${baseUrl}${currentQuestion.image}`" alt="情境圖" class="w-full h-full object-contain" style="display: block; max-height: 220px; margin: 0 auto;">
        </div>

        <h2 class="text-2xl font-bold mb-6 text-gray-700 leading-relaxed">{{ currentQuestion.title }}</h2>
        <div class="space-y-4">
          <button v-for="(opt, index) in currentQuestion.options" 
                  :key="index"
                  @click="checkAnswer(index)"
                  :disabled="showFeedback"
                  class="w-full text-left p-5 border-4 rounded-2xl text-lg font-bold transition-all shadow-sm"
                  :class="getOptionClass(index)">
            {{ opt }}
          </button>
        </div>

        <div v-if="showFeedback" class="mt-8 p-6 rounded-3xl border-4" 
             :class="isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
          <div class="text-2xl font-bold mb-2" :class="isCorrect ? 'text-green-600' : 'text-red-600'">
            {{ isCorrect ? '🌟 答對了！' : '☁️ 答錯了，學起來！' }}
          </div>
          <p class="text-gray-600 leading-relaxed font-medium">
            <strong>【學習重點】：</strong>{{ currentQuestion.feedback }}
          </p>
          <button @click="nextStep" class="mt-6 w-full bg-gray-800 text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors text-xl">
            {{ currentStep < questions.length - 1 ? '下一關 Go!' : '查看訓練總結' }}
          </button>
        </div>
      </div>

      <div v-else class="text-center bg-white p-10 rounded-[40px] shadow-2xl border-8 border-white">
        <div class="text-8xl mb-4">{{ scoreEmoji }}</div>
        <h2 class="text-3xl font-black mb-2 text-gray-800">訓練任務完成！</h2>
        <p class="text-xl text-gray-500 mb-6">獲得等級：<span class="text-rose-500 font-bold underline">{{ rankName }}</span></p>
        <div class="text-7xl font-black text-blue-500 mb-8">{{ score }} <span class="text-2xl text-gray-400">分</span></div>
        <button @click="reset" class="bg-sky-400 text-white px-12 py-4 rounded-full font-bold text-xl hover:bg-sky-500 transition-transform hover:scale-105 shadow-lg">
          再練一次
        </button>
      </div>

    </div>
  </div>
</template>
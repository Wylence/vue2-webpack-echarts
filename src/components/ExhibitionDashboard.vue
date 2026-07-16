<template>
  <div class="screen-shell">
    <div
      ref="screen"
      class="screen-stage"
      :style="stageStyle"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="grid-layer"></div>
      <div class="scan-line"></div>

      <header class="dashboard-header">
        <div class="title-area">
          <div class="title-mark"></div>
          <div>
            <div class="main-title">轮播切换大屏</div>
            <div class="sub-title">运营驾驶舱 · 展厅展示 · 会议汇报</div>
          </div>
        </div>

        <nav class="nav-tabs">
          <button
            v-for="(item, index) in pages"
            :key="item.name"
            class="nav-tab"
            :class="{ active: currentIndex === index }"
            type="button"
            @click="changePage(index)"
          >
            {{ item.name }}
          </button>
        </nav>

        <div class="header-status">
          <div class="time-card">
            <span>当前时间</span>
            <strong>{{ currentTimeText }}</strong>
          </div>
          <div class="time-card">
            <span>数据刷新</span>
            <strong>{{ refreshTimeText }}</strong>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <section v-if="loading" class="state-panel">
          <div class="loading-ring"></div>
          <p>数据加载中</p>
        </section>

        <section v-else-if="errorMessage" class="state-panel">
          <p class="error-text">{{ errorMessage }}</p>
          <button class="primary-btn" type="button" @click="loadData">重试</button>
        </section>

        <section v-else-if="emptyData" class="state-panel">
          <p>暂无数据</p>
          <button class="primary-btn" type="button" @click="loadData">重新加载</button>
        </section>

        <transition v-else name="page-fade" mode="out-in">
          <component
            :is="currentPage.component"
            :key="currentPage.key"
            :data-info="currentPageData"
            class="page-container"
          />
        </transition>
      </main>

      <footer class="dashboard-footer">
        <div class="footer-actions">
          <button class="control-btn" type="button" @click="togglePlay">
            {{ playing ? '暂停' : '播放' }}
          </button>
          <button class="control-btn" type="button" @click="prevPage">上一页</button>
          <button class="control-btn" type="button" @click="nextPage">下一页</button>
        </div>

        <div class="page-dots">
          <button
            v-for="(item, index) in pages"
            :key="item.key"
            class="page-dot"
            :class="{ active: currentIndex === index }"
            type="button"
            @click="changePage(index)"
          >
            {{ index + 1 }}
          </button>
        </div>

        <div class="footer-settings">
          <label class="interval-box">
            <span>轮播时间</span>
            <input
              v-model="intervalInput"
              type="number"
              min="1000"
              step="500"
              @change="applyInterval"
              @keyup.enter="applyInterval"
            />
            <span>毫秒</span>
          </label>
          <label class="interval-box">
            <span>刷新时间</span>
            <input
              v-model="refreshIntervalInput"
              type="number"
              min="3000"
              step="1000"
              @change="applyRefreshInterval"
              @keyup.enter="applyRefreshInterval"
            />
            <span>毫秒</span>
          </label>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import OverviewPage from './pages/OverviewPage.vue';
import TrendPage from './pages/TrendPage.vue';
import ProgressPage from './pages/ProgressPage.vue';
import WarningPage from './pages/WarningPage.vue';
import { fetchDashboardData } from '@/services/mockDashboardData';

var DESIGN_WIDTH = 1920;
var DESIGN_HEIGHT = 1080;
var DEFAULT_INTERVAL = 5000;
var MIN_INTERVAL = 1000;
var DEFAULT_REFRESH_INTERVAL = 15000;
var MIN_REFRESH_INTERVAL = 3000;

export default {
  name: 'ExhibitionDashboard',
  components: {
    OverviewPage: OverviewPage,
    TrendPage: TrendPage,
    ProgressPage: ProgressPage,
    WarningPage: WarningPage
  },
  data: function data() {
    return {
      pages: [
        { key: 'overview', name: '轮播切换大屏', component: 'OverviewPage' },
        { key: 'trend', name: '运营驾驶舱', component: 'TrendPage' },
        { key: 'progress', name: '展厅展示', component: 'ProgressPage' },
        { key: 'warning', name: '会议汇报', component: 'WarningPage' }
      ],
      currentIndex: 0,
      playing: true,
      mousePaused: false,
      intervalTime: DEFAULT_INTERVAL,
      intervalInput: String(DEFAULT_INTERVAL),
      refreshIntervalTime: DEFAULT_REFRESH_INTERVAL,
      refreshIntervalInput: String(DEFAULT_REFRESH_INTERVAL),
      stageScale: 1,
      stageLeft: 0,
      stageTop: 0,
      currentTime: new Date(),
      refreshTime: null,
      loading: false,
      errorMessage: '',
      dashboardData: null,
      progressPercent: 0,
      carouselTimer: null,
      progressTimer: null,
      clockTimer: null,
      refreshTimer: null,
      resizeTimer: null,
      progressStartTime: Date.now()
    };
  },
  computed: {
    stageStyle: function stageStyle() {
      return {
        width: DESIGN_WIDTH + 'px',
        height: DESIGN_HEIGHT + 'px',
        transform: 'translate(' + this.stageLeft + 'px, ' + this.stageTop + 'px) scale(' + this.stageScale + ')'
      };
    },
    currentPage: function currentPage() {
      return this.pages[this.currentIndex] || this.pages[0];
    },
    currentPageData: function currentPageData() {
      if (!this.dashboardData || !this.currentPage) {
        return {};
      }
      return this.dashboardData[this.currentPage.key] || {};
    },
    currentTimeText: function currentTimeText() {
      return this.formatDate(this.currentTime, true);
    },
    refreshTimeText: function refreshTimeText() {
      return this.refreshTime ? this.formatDate(this.refreshTime, true) : '等待刷新';
    },
    emptyData: function emptyData() {
      if (!this.dashboardData) {
        return false;
      }

      var keys = ['overview', 'trend', 'progress', 'warning'];
      return keys.every(function checkKey(key) {
        var item = this.dashboardData[key];
        return !item || Object.keys(item).length === 0;
      }, this);
    }
  },
  mounted: function mounted() {
    this.updateStageScale();
    this.loadData();
    this.startClock();
    this.startRefresh();
    this.startCarousel();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeDestroy: function beforeDestroy() {
    this.clearCarousel();
    this.clearProgress();
    window.clearInterval(this.clockTimer);
    window.clearInterval(this.refreshTimer);
    window.clearTimeout(this.resizeTimer);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    loadData: function loadData() {
      var self = this;
      self.loading = true;
      self.errorMessage = '';

      fetchDashboardData()
        .then(function handleSuccess(result) {
          self.dashboardData = result || {};
          self.refreshTime = result && result.refreshedAt ? result.refreshedAt : new Date();
        })
        .catch(function handleError(error) {
          self.errorMessage = error && error.message ? error.message : '接口请求失败，请稍后重试';
        })
        .finally(function handleFinally() {
          self.loading = false;
        });
    },
    updateStageScale: function updateStageScale() {
      var width = window.innerWidth || DESIGN_WIDTH;
      var height = window.innerHeight || DESIGN_HEIGHT;
      var scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);

      this.stageScale = scale;
      this.stageLeft = Math.max(0, (width - DESIGN_WIDTH * scale) / 2);
      this.stageTop = Math.max(0, (height - DESIGN_HEIGHT * scale) / 2);
      this.$nextTick(function notifyResize() {
        window.dispatchEvent(new Event('dashboard-resize'));
      });
    },
    handleResize: function handleResize() {
      var self = this;
      window.clearTimeout(self.resizeTimer);
      self.resizeTimer = window.setTimeout(function delayResize() {
        self.updateStageScale();
      }, 120);
    },
    startClock: function startClock() {
      var self = this;
      window.clearInterval(self.clockTimer);
      self.clockTimer = window.setInterval(function tickClock() {
        self.currentTime = new Date();
      }, 1000);
    },
    startRefresh: function startRefresh() {
      var self = this;
      window.clearInterval(self.refreshTimer);
      self.refreshTimer = window.setInterval(function tickRefresh() {
        self.loadData();
      }, self.refreshIntervalTime);
    },
    startCarousel: function startCarousel() {
      var self = this;
      self.clearCarousel();
      self.clearProgress();
      self.progressStartTime = Date.now();
      self.progressPercent = 0;

      if (!self.playing || self.mousePaused) {
        return;
      }

      self.progressTimer = window.setInterval(function tickProgress() {
        var cost = Date.now() - self.progressStartTime;
        self.progressPercent = Math.min(100, Math.round((cost / self.intervalTime) * 100));
      }, 80);

      self.carouselTimer = window.setInterval(function tickCarousel() {
        self.nextPage();
      }, self.intervalTime);
    },
    clearCarousel: function clearCarousel() {
      window.clearInterval(this.carouselTimer);
      this.carouselTimer = null;
    },
    clearProgress: function clearProgress() {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    },
    resetCarousel: function resetCarousel() {
      this.startCarousel();
    },
    togglePlay: function togglePlay() {
      this.playing = !this.playing;
      this.resetCarousel();
    },
    handleMouseEnter: function handleMouseEnter() {
      this.mousePaused = true;
      this.clearCarousel();
      this.clearProgress();
    },
    handleMouseLeave: function handleMouseLeave() {
      this.mousePaused = false;
      this.resetCarousel();
    },
    changePage: function changePage(index) {
      if (index < 0 || index >= this.pages.length || index === this.currentIndex) {
        return;
      }

      this.currentIndex = index;
      this.resetCarousel();
    },
    prevPage: function prevPage() {
      var nextIndex = this.currentIndex - 1;
      if (nextIndex < 0) {
        nextIndex = this.pages.length - 1;
      }
      this.currentIndex = nextIndex;
      this.resetCarousel();
    },
    nextPage: function nextPage() {
      this.currentIndex = (this.currentIndex + 1) % this.pages.length;
      this.resetCarousel();
    },
    handleKeydown: function handleKeydown(event) {
      if (!event) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        this.prevPage();
      }
      if (event.key === 'ArrowRight') {
        this.nextPage();
      }
    },
    applyInterval: function applyInterval() {
      var value = Number(this.intervalInput);
      if (!Number.isFinite(value) || value < MIN_INTERVAL) {
        value = DEFAULT_INTERVAL;
      }

      this.intervalTime = Math.floor(value);
      this.intervalInput = String(this.intervalTime);
      this.resetCarousel();
    },
    applyRefreshInterval: function applyRefreshInterval() {
      var value = Number(this.refreshIntervalInput);
      if (!Number.isFinite(value) || value < MIN_REFRESH_INTERVAL) {
        value = DEFAULT_REFRESH_INTERVAL;
      }

      this.refreshIntervalTime = Math.floor(value);
      this.refreshIntervalInput = String(this.refreshIntervalTime);
      this.startRefresh();
    },
    formatDate: function formatDate(date, withSecond) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '--';
      }

      var year = date.getFullYear();
      var month = this.padNumber(date.getMonth() + 1);
      var day = this.padNumber(date.getDate());
      var hour = this.padNumber(date.getHours());
      var minute = this.padNumber(date.getMinutes());
      var second = this.padNumber(date.getSeconds());

      if (withSecond) {
        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
      }
      return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    },
    padNumber: function padNumber(value) {
      return value < 10 ? '0' + value : String(value);
    }
  }
};
</script>

<style lang="less">
@ice: #46e7ff;
@green: #35f2a0;
@amber: #f6c343;
@red: #ff4b55;
@deep: #020817;
@panel: rgba(8, 26, 58, 0.58);

.screen-shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 18% 10%, rgba(70, 231, 255, 0.2), transparent 24%),
    radial-gradient(circle at 86% 72%, rgba(53, 242, 160, 0.14), transparent 24%),
    linear-gradient(145deg, #020817 0%, #071b38 48%, #020817 100%);
}

.screen-stage {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: 0 0;
  color: #e8fcff;
  overflow: hidden;
  padding: 26px 34px;
  background:
    linear-gradient(rgba(70, 231, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(70, 231, 255, 0.06) 1px, transparent 1px),
    linear-gradient(145deg, rgba(3, 11, 28, 0.95), rgba(6, 25, 58, 0.96));
  background-size: 42px 42px, 42px 42px, auto;
}

.grid-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent 0, rgba(70, 231, 255, 0.05) 50%, transparent 100%),
    radial-gradient(circle at center, transparent 0, rgba(2, 8, 23, 0.42) 72%);
  animation: gridMove 12s linear infinite;
}

.scan-line {
  position: absolute;
  left: 0;
  top: -140px;
  width: 100%;
  height: 140px;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(70, 231, 255, 0.1), transparent);
  animation: scanMove 6s linear infinite;
}

.dashboard-header,
.dashboard-main,
.dashboard-footer {
  position: relative;
  z-index: 2;
}

.dashboard-header {
  height: 116px;
  display: grid;
  grid-template-columns: 430px 1fr 570px;
  align-items: center;
  gap: 22px;
  border-bottom: 1px solid rgba(70, 231, 255, 0.18);
}

.title-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-mark {
  width: 18px;
  height: 70px;
  border: 1px solid rgba(70, 231, 255, 0.8);
  box-shadow: 0 0 22px rgba(70, 231, 255, 0.65);
  background: linear-gradient(180deg, @ice, @green);
}

.main-title {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 0;
  color: #f4feff;
  text-shadow: 0 0 18px rgba(70, 231, 255, 0.65);
}

.sub-title {
  margin-top: 10px;
  font-size: 16px;
  color: rgba(221, 250, 255, 0.72);
}

.nav-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.nav-tab,
.control-btn,
.primary-btn,
.page-dot {
  border: 1px solid rgba(70, 231, 255, 0.38);
  color: #dffbff;
  background: rgba(6, 24, 54, 0.72);
  box-shadow: inset 0 0 18px rgba(70, 231, 255, 0.08), 0 0 16px rgba(70, 231, 255, 0.12);
  cursor: pointer;
  transition: 0.2s ease;
}

.nav-tab {
  height: 42px;
  font-size: 16px;
  clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
}

.nav-tab.active,
.control-btn:hover,
.primary-btn:hover,
.page-dot.active {
  color: #03111f;
  border-color: rgba(70, 231, 255, 0.95);
  background: linear-gradient(90deg, @ice, @green);
  box-shadow: 0 0 24px rgba(70, 231, 255, 0.36);
}

.header-status {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.time-card,
.interval-box {
  min-height: 56px;
  padding: 10px 14px;
  border: 1px solid rgba(70, 231, 255, 0.22);
  background: rgba(6, 24, 54, 0.48);
  backdrop-filter: blur(8px);
}

.time-card span,
.interval-box span {
  display: block;
  font-size: 13px;
  color: rgba(217, 248, 255, 0.64);
}

.time-card strong {
  display: block;
  margin-top: 8px;
  font-size: 15px;
  color: @ice;
  font-weight: 500;
}

.dashboard-main {
  height: 844px;
  padding: 24px 0 18px;
}

.page-container {
  width: 100%;
  height: 100%;
}

.dashboard-footer {
  height: 68px;
  display: grid;
  grid-template-columns: 440px 1fr 600px;
  align-items: center;
  gap: 18px;
  border-top: 1px solid rgba(70, 231, 255, 0.18);
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  min-width: 104px;
  height: 38px;
  font-size: 15px;
}

.page-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.page-dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 15px;
}

.footer-settings {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.interval-box {
  display: grid;
  grid-template-columns: 78px 1fr 42px;
  align-items: center;
  gap: 8px;
}

.interval-box input {
  width: 100%;
  height: 34px;
  color: @ice;
  border: 1px solid rgba(70, 231, 255, 0.36);
  background: rgba(1, 10, 25, 0.72);
  outline: none;
  text-align: center;
}

.state-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(70, 231, 255, 0.24);
  background: rgba(4, 17, 39, 0.62);
  backdrop-filter: blur(10px);
  color: rgba(232, 252, 255, 0.82);
  font-size: 22px;
}

.loading-ring {
  width: 76px;
  height: 76px;
  border: 4px solid rgba(70, 231, 255, 0.18);
  border-top-color: @ice;
  border-radius: 50%;
  animation: rotateRing 1s linear infinite;
}

.error-text {
  color: @red;
}

.primary-btn {
  margin-top: 18px;
  height: 40px;
  padding: 0 28px;
  font-size: 16px;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.dashboard-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(70, 231, 255, 0.24);
  background: @panel;
  backdrop-filter: blur(10px);
  box-shadow: inset 0 0 28px rgba(70, 231, 255, 0.08), 0 0 24px rgba(1, 13, 31, 0.48);
}

.dashboard-card::before,
.dashboard-card::after {
  content: "";
  position: absolute;
  width: 22px;
  height: 22px;
  pointer-events: none;
}

.dashboard-card::before {
  left: 0;
  top: 0;
  border-left: 2px solid @ice;
  border-top: 2px solid @ice;
}

.dashboard-card::after {
  right: 0;
  bottom: 0;
  border-right: 2px solid @green;
  border-bottom: 2px solid @green;
}

.card-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  padding: 0 16px;
  color: #ecfeff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(70, 231, 255, 0.14);
}

.card-title span {
  font-size: 12px;
  color: rgba(224, 250, 255, 0.58);
  font-weight: 400;
}

.chart-box {
  width: 100%;
  height: calc(100% - 42px);
}

@keyframes scanMove {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(1220px);
  }
}

@keyframes gridMove {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(42px);
  }
}

@keyframes rotateRing {
  to {
    transform: rotate(360deg);
  }
}
</style>

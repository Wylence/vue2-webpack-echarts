<template>
  <div class="overview-page">
    <section class="metrics-grid">
      <article
        v-for="item in metricList"
        :key="item.name"
        class="dashboard-card metric-card"
      >
        <div class="metric-left">
          <div class="metric-name">{{ item.name }}</div>
          <div class="metric-value">
            <span>{{ animatedValues[item.name] || 0 }}</span>
            <em>{{ item.unit }}</em>
          </div>
          <div class="metric-change" :class="item.status === 'up' ? 'up' : 'down'">
            {{ item.status === 'up' ? '▲' : '▼' }} {{ Math.abs(item.change || 0) }}%
          </div>
        </div>
        <div class="metric-right">
          <span>达成率</span>
          <strong>{{ metricRate(item) }}%</strong>
        </div>
        <div class="metric-extra">
          <span>目标 {{ metricTarget(item) }}{{ item.unit }}</span>
          <strong>{{ metricStatusText(item) }}</strong>
        </div>
        <div class="metric-track">
          <div class="metric-bar" :style="{ width: metricRate(item) + '%' }"></div>
        </div>
      </article>
    </section>

    <section class="overview-body">
      <div class="dashboard-card side-card">
        <div class="card-title">区域热度 <span>实时拥挤指数</span></div>
        <div class="heat-list">
          <div v-for="item in areaHeat" :key="item.name" class="heat-item">
            <div class="heat-row">
              <span>{{ item.name }}</span>
              <strong>{{ item.value }}%</strong>
            </div>
            <div class="heat-track">
              <div class="heat-bar" :style="{ width: item.value + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-card trend-card">
        <div class="card-title">核心趋势 <span>客流 · 转化 · 成交</span></div>
        <div ref="trendChart" class="chart-box"></div>
      </div>

      <div class="dashboard-card side-card">
        <div class="card-title">渠道占比 <span>接待来源结构</span></div>
        <div ref="channelChart" class="chart-box channel-chart"></div>
      </div>
    </section>

    <section class="dashboard-card live-card">
      <div class="card-title">实时动态 <span>展厅运行事件</span></div>
      <div class="live-list">
        <div v-for="(item, index) in liveList" :key="item" class="live-item">
          <span class="live-badge">动态<br />{{ padIndex(index + 1) }}</span>
          <p>{{ item }}</p>
          <em>刚刚</em>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {
  setChartOption,
  resizeChart,
  disposeChart,
  buildTooltip,
  buildGrid,
  buildAxisLine,
  buildAxisLabel
} from '@/utils/echartsHelper';

export default {
  name: 'OverviewPage',
  props: {
    dataInfo: {
      type: Object,
      default: function defaultData() {
        return {};
      }
    }
  },
  data: function data() {
    return {
      animatedValues: {},
      animationFrame: null
    };
  },
  computed: {
    metricList: function metricList() {
      return Array.isArray(this.dataInfo.metrics) ? this.dataInfo.metrics : [];
    },
    areaHeat: function areaHeat() {
      return Array.isArray(this.dataInfo.areaHeat) ? this.dataInfo.areaHeat : [];
    },
    channelList: function channelList() {
      return Array.isArray(this.dataInfo.channelList) ? this.dataInfo.channelList : [];
    },
    trendList: function trendList() {
      return Array.isArray(this.dataInfo.trendList) ? this.dataInfo.trendList : [];
    },
    liveList: function liveList() {
      return Array.isArray(this.dataInfo.liveList) ? this.dataInfo.liveList : [];
    }
  },
  watch: {
    dataInfo: {
      handler: function handler() {
        this.animateNumbers();
        this.renderCharts();
      },
      deep: true
    }
  },
  mounted: function mounted() {
    this.animateNumbers();
    this.renderCharts();
    window.addEventListener('dashboard-resize', this.resizeCharts);
  },
  beforeDestroy: function beforeDestroy() {
    window.cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('dashboard-resize', this.resizeCharts);
    disposeChart(this.$refs.trendChart);
    disposeChart(this.$refs.channelChart);
  },
  methods: {
    animateNumbers: function animateNumbers() {
      var self = this;
      var startTime = Date.now();
      var duration = 650;
      var startValues = {};

      window.cancelAnimationFrame(self.animationFrame);
      self.metricList.forEach(function setStart(item) {
        startValues[item.name] = Number(self.animatedValues[item.name]) || 0;
      });

      function run() {
        var percent = Math.min(1, (Date.now() - startTime) / duration);
        var nextValues = {};

        self.metricList.forEach(function updateValue(item) {
          var target = Number(item.value) || 0;
          var current = startValues[item.name] + (target - startValues[item.name]) * percent;
          nextValues[item.name] = Math.round(current * 10) / 10;
        });

        self.animatedValues = nextValues;
        if (percent < 1) {
          self.animationFrame = window.requestAnimationFrame(run);
        }
      }

      run();
    },
    renderCharts: function renderCharts() {
      this.$nextTick(function waitDom() {
        this.renderTrendChart();
        this.renderChannelChart();
      });
    },
    renderTrendChart: function renderTrendChart() {
      var xData = this.trendList.map(function mapTime(item) {
        return item.time;
      });

      setChartOption(this.$refs.trendChart, {
        color: ['#46e7ff', '#35f2a0', '#f6c343'],
        tooltip: buildTooltip(),
        legend: {
          top: 10,
          right: 16,
          textStyle: { color: 'rgba(224, 250, 255, 0.72)' },
          data: ['客流量', '转化率', '成交金额']
        },
        grid: buildGrid(),
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xData,
          axisLine: buildAxisLine(),
          axisLabel: buildAxisLabel()
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(170, 232, 255, 0.08)' } },
          axisLabel: buildAxisLabel()
        },
        series: [
          {
            name: '客流量',
            type: 'line',
            smooth: true,
            areaStyle: { color: 'rgba(70, 231, 255, 0.12)' },
            data: this.trendList.map(function mapVisitor(item) { return item.visitor || 0; })
          },
          {
            name: '转化率',
            type: 'line',
            smooth: true,
            data: this.trendList.map(function mapRate(item) { return item.rate || 0; })
          },
          {
            name: '成交金额',
            type: 'line',
            smooth: true,
            data: this.trendList.map(function mapDeal(item) { return item.deal || 0; })
          }
        ]
      });
    },
    renderChannelChart: function renderChannelChart() {
      setChartOption(this.$refs.channelChart, {
        color: ['#46e7ff', '#35f2a0', '#f6c343', '#ff4b55'],
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'pie',
            radius: ['46%', '72%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            label: {
              color: '#dffbff',
              formatter: '{b}\n{d}%'
            },
            labelLine: {
              lineStyle: { color: 'rgba(220, 249, 255, 0.35)' }
            },
            data: this.channelList
          }
        ]
      });
    },
    resizeCharts: function resizeCharts() {
      resizeChart(this.$refs.trendChart);
      resizeChart(this.$refs.channelChart);
    },
    metricTarget: function metricTarget(item) {
      var value = Number(item && item.value);
      if (!Number.isFinite(value)) {
        return 0;
      }
      return Math.ceil(value * 1.12);
    },
    metricRate: function metricRate(item) {
      var value = Number(item && item.value);
      var target = this.metricTarget(item);
      if (!Number.isFinite(value) || target <= 0) {
        return 0;
      }
      return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
    },
    metricStatusText: function metricStatusText(item) {
      var rate = this.metricRate(item);
      if (rate >= 95) {
        return '冲刺完成';
      }
      if (rate >= 88) {
        return '稳定达标';
      }
      return '持续跟进';
    },
    padIndex: function padIndex(value) {
      return value < 10 ? '0' + value : String(value);
    }
  }
};
</script>

<style lang="less" scoped>
.overview-page {
  height: 100%;
  display: grid;
  grid-template-rows: 154px 1fr 148px;
  gap: 18px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.metric-card {
  display: grid;
  grid-template-columns: 1fr 82px;
  grid-template-rows: 1fr auto auto;
  column-gap: 12px;
  padding: 16px;
}

.metric-left {
  min-width: 0;
}

.metric-name {
  color: rgba(224, 250, 255, 0.72);
  font-size: 16px;
}

.metric-value {
  margin-top: 12px;
  color: #f6feff;
}

.metric-value span {
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 0 14px rgba(70, 231, 255, 0.6);
}

.metric-value em {
  margin-left: 6px;
  color: rgba(224, 250, 255, 0.66);
  font-style: normal;
}

.metric-change {
  margin-top: 10px;
  font-size: 14px;
}

.metric-change.up {
  color: #35f2a0;
}

.metric-change.down {
  color: #ff4b55;
}

.metric-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 0;
}

.metric-right span {
  color: rgba(224, 250, 255, 0.58);
  font-size: 12px;
}

.metric-right strong {
  margin-top: 8px;
  color: #46e7ff;
  font-size: 30px;
  line-height: 1;
  text-shadow: 0 0 14px rgba(70, 231, 255, 0.72);
}

.metric-extra {
  grid-column: 1 / 3;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  color: rgba(224, 250, 255, 0.58);
  font-size: 12px;
}

.metric-extra strong {
  color: #35f2a0;
  font-weight: 500;
}

.metric-track {
  grid-column: 1 / 3;
  height: 6px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
}

.metric-bar {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #46e7ff, #35f2a0);
  box-shadow: 0 0 10px rgba(70, 231, 255, 0.7);
  transition: width 0.45s ease;
}

.overview-body {
  display: grid;
  grid-template-columns: 360px 1fr 360px;
  gap: 18px;
  min-height: 0;
}

.side-card,
.trend-card,
.live-card {
  min-height: 0;
}

.heat-list {
  padding: 18px;
}

.heat-item {
  margin-bottom: 24px;
}

.heat-row {
  display: flex;
  justify-content: space-between;
  color: rgba(230, 252, 255, 0.84);
  font-size: 15px;
}

.heat-row strong {
  color: #46e7ff;
}

.heat-track {
  height: 9px;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
}

.heat-bar {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #46e7ff, #35f2a0);
  box-shadow: 0 0 14px rgba(70, 231, 255, 0.75);
  transition: width 0.45s ease;
}

.channel-chart {
  height: calc(100% - 42px);
}

.live-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 16px;
}

.live-item {
  display: grid;
  grid-template-columns: 52px 1fr 48px;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(70, 231, 255, 0.16);
  background: rgba(3, 16, 38, 0.58);
}

.live-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 54px;
  color: #333333;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  background: linear-gradient(180deg, #46e7ff 0%, #35f2a0 55%, #f6c343 100%);
  box-shadow: 0 0 18px rgba(70, 231, 255, 0.32);
  clip-path: polygon(0 0, 100% 8px, 100% 100%, 0 calc(100% - 8px));
}

.live-item p {
  height: auto;
  min-height: 38px;
  margin: 0;
  color: rgba(232, 252, 255, 0.82);
  line-height: 19px;
}

.live-item em {
  color: rgba(224, 250, 255, 0.54);
  font-style: normal;
  text-align: right;
}
</style>

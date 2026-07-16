<template>
  <div class="trend-page">
    <section class="dashboard-card main-bar-card">
      <div class="card-title">多维度柱状对比 <span>本周 · 上周 · 目标</span></div>
      <div ref="barChart" class="chart-box"></div>
    </section>

    <section class="matrix-grid">
      <article
        v-for="item in matrixList"
        :key="item.name"
        class="dashboard-card matrix-card"
      >
        <div class="matrix-name">{{ item.name }}</div>
        <div class="matrix-value">{{ item.value }}<span>{{ item.unit }}</span></div>
        <div class="matrix-state" :class="item.status === 'up' ? 'up' : 'down'">
          {{ item.status === 'up' ? '▲ 趋势向好' : '▼ 需要关注' }}
        </div>
      </article>
    </section>

    <section class="bottom-charts">
      <div class="dashboard-card">
        <div class="card-title">渠道综合雷达 <span>能力评分</span></div>
        <div ref="radarChart" class="chart-box"></div>
      </div>
      <div class="dashboard-card">
        <div class="card-title">区域服务堆叠 <span>讲解 · 成交 · 服务</span></div>
        <div ref="stackChart" class="chart-box"></div>
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
  name: 'TrendPage',
  props: {
    dataInfo: {
      type: Object,
      default: function defaultData() {
        return {};
      }
    }
  },
  computed: {
    barList: function barList() {
      return Array.isArray(this.dataInfo.barList) ? this.dataInfo.barList : [];
    },
    matrixList: function matrixList() {
      return Array.isArray(this.dataInfo.matrixList) ? this.dataInfo.matrixList : [];
    },
    radarList: function radarList() {
      return Array.isArray(this.dataInfo.radarList) ? this.dataInfo.radarList : [];
    },
    stackList: function stackList() {
      return Array.isArray(this.dataInfo.stackList) ? this.dataInfo.stackList : [];
    }
  },
  watch: {
    dataInfo: {
      handler: function handler() {
        this.renderCharts();
      },
      deep: true
    }
  },
  mounted: function mounted() {
    this.renderCharts();
    window.addEventListener('dashboard-resize', this.resizeCharts);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('dashboard-resize', this.resizeCharts);
    disposeChart(this.$refs.barChart);
    disposeChart(this.$refs.radarChart);
    disposeChart(this.$refs.stackChart);
  },
  methods: {
    renderCharts: function renderCharts() {
      this.$nextTick(function waitDom() {
        this.renderBarChart();
        this.renderRadarChart();
        this.renderStackChart();
      });
    },
    renderBarChart: function renderBarChart() {
      var names = this.barList.map(function mapName(item) { return item.name; });
      setChartOption(this.$refs.barChart, {
        color: ['#46e7ff', '#35f2a0', '#f6c343'],
        tooltip: buildTooltip(),
        legend: {
          top: 10,
          right: 20,
          textStyle: { color: 'rgba(224, 250, 255, 0.72)' }
        },
        grid: buildGrid(),
        xAxis: {
          type: 'category',
          data: names,
          axisLine: buildAxisLine(),
          axisLabel: buildAxisLabel()
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(170, 232, 255, 0.08)' } },
          axisLabel: buildAxisLabel()
        },
        series: [
          { name: '本周', type: 'bar', barWidth: 16, data: this.barList.map(function map(item) { return item.current || 0; }) },
          { name: '上周', type: 'bar', barWidth: 16, data: this.barList.map(function map(item) { return item.last || 0; }) },
          { name: '目标', type: 'bar', barWidth: 16, data: this.barList.map(function map(item) { return item.target || 0; }) }
        ]
      });
    },
    renderRadarChart: function renderRadarChart() {
      setChartOption(this.$refs.radarChart, {
        color: ['#46e7ff', '#35f2a0'],
        tooltip: { trigger: 'item' },
        legend: {
          bottom: 8,
          textStyle: { color: 'rgba(224, 250, 255, 0.72)' }
        },
        radar: {
          center: ['50%', '48%'],
          radius: '62%',
          indicator: [
            { name: '触达', max: 100 },
            { name: '留资', max: 100 },
            { name: '成交', max: 100 },
            { name: '复访', max: 100 },
            { name: '满意', max: 100 }
          ],
          axisName: { color: '#dffbff' },
          splitLine: { lineStyle: { color: 'rgba(70, 231, 255, 0.16)' } },
          splitArea: { areaStyle: { color: ['rgba(70, 231, 255, 0.04)', 'rgba(53, 242, 160, 0.03)'] } },
          axisLine: { lineStyle: { color: 'rgba(70, 231, 255, 0.18)' } }
        },
        series: [
          {
            type: 'radar',
            areaStyle: { opacity: 0.18 },
            data: this.radarList
          }
        ]
      });
    },
    renderStackChart: function renderStackChart() {
      var names = this.stackList.map(function mapName(item) { return item.name; });
      setChartOption(this.$refs.stackChart, {
        color: ['#46e7ff', '#35f2a0', '#f6c343'],
        tooltip: buildTooltip(),
        legend: {
          top: 8,
          right: 16,
          textStyle: { color: 'rgba(224, 250, 255, 0.72)' }
        },
        grid: buildGrid(),
        xAxis: {
          type: 'category',
          data: names,
          axisLine: buildAxisLine(),
          axisLabel: buildAxisLabel()
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(170, 232, 255, 0.08)' } },
          axisLabel: buildAxisLabel()
        },
        series: [
          { name: '讲解', type: 'bar', stack: 'total', data: this.stackList.map(function map(item) { return item.guide || 0; }) },
          { name: '成交', type: 'bar', stack: 'total', data: this.stackList.map(function map(item) { return item.deal || 0; }) },
          { name: '服务', type: 'bar', stack: 'total', data: this.stackList.map(function map(item) { return item.service || 0; }) }
        ]
      });
    },
    resizeCharts: function resizeCharts() {
      resizeChart(this.$refs.barChart);
      resizeChart(this.$refs.radarChart);
      resizeChart(this.$refs.stackChart);
    }
  }
};
</script>

<style lang="less" scoped>
.trend-page {
  height: 100%;
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  grid-template-rows: 1fr 310px;
  gap: 18px;
}

.main-bar-card {
  min-height: 0;
}

.matrix-grid {
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1fr;
  gap: 14px;
}

.matrix-card {
  padding: 18px;
}

.matrix-name {
  color: rgba(224, 250, 255, 0.68);
  font-size: 15px;
}

.matrix-value {
  margin-top: 16px;
  color: #f6feff;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 0 14px rgba(70, 231, 255, 0.55);
}

.matrix-value span {
  margin-left: 5px;
  color: rgba(224, 250, 255, 0.64);
  font-size: 15px;
  font-weight: 400;
}

.matrix-state {
  margin-top: 18px;
  font-size: 14px;
}

.matrix-state.up {
  color: #35f2a0;
}

.matrix-state.down {
  color: #ff4b55;
}

.bottom-charts {
  grid-column: 1 / 3;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
</style>

<template>
  <div class="warning-page">
    <section class="warning-summary">
      <article
        v-for="item in summaryList"
        :key="item.name"
        class="dashboard-card summary-card"
      >
        <span>{{ item.name }}</span>
        <strong :style="{ color: item.color }">{{ item.value }}</strong>
        <em>条</em>
        <div class="summary-extra">
          <span>{{ summaryText(item) }}</span>
          <b>{{ summaryRate(item) }}%</b>
        </div>
        <div class="summary-track">
          <div
            class="summary-bar"
            :style="{ width: summaryRate(item) + '%', background: item.color }"
          ></div>
        </div>
      </article>
    </section>

    <section class="dashboard-card warning-list-card">
      <div class="card-title">告警滚动列表 <span>异常项实时监测</span></div>
      <div class="warning-table">
        <div class="table-head">
          <span>时间</span>
          <span>区域</span>
          <span>类型</span>
          <span>等级</span>
          <span>状态</span>
        </div>
        <div class="scroll-mask">
          <div class="scroll-list">
            <div
              v-for="(item, index) in doubledWarningList"
              :key="item.time + item.area + index"
              class="warning-row"
              :class="levelClass(item.level)"
            >
              <span>{{ item.time }}</span>
              <span>{{ item.area }}</span>
              <span>{{ item.type }}</span>
              <span>{{ item.level }}</span>
              <span>{{ item.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-card risk-card">
      <div class="card-title">风险分布 <span>异常类型占比</span></div>
      <div ref="riskChart" class="chart-box"></div>
    </section>

    <section class="dashboard-card area-risk-card">
      <div class="card-title">区域风险热力 <span>风险指数</span></div>
      <div class="area-risk-list">
        <div
          v-for="item in areaList"
          :key="item.name"
          class="area-risk-item"
          :class="{ danger: item.level === '高', warn: item.level === '中' }"
        >
          <div class="area-risk-row">
            <span>{{ item.name }}</span>
            <strong>{{ item.value }}</strong>
          </div>
          <div class="area-risk-track">
            <div class="area-risk-bar" :style="{ width: safePercent(item.value) + '%' }"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { setChartOption, resizeChart, disposeChart } from '@/utils/echartsHelper';

export default {
  name: 'WarningPage',
  props: {
    dataInfo: {
      type: Object,
      default: function defaultData() {
        return {};
      }
    }
  },
  computed: {
    summaryList: function summaryList() {
      return Array.isArray(this.dataInfo.summaryList) ? this.dataInfo.summaryList : [];
    },
    warningList: function warningList() {
      return Array.isArray(this.dataInfo.warningList) ? this.dataInfo.warningList : [];
    },
    doubledWarningList: function doubledWarningList() {
      return this.warningList.concat(this.warningList);
    },
    riskList: function riskList() {
      return Array.isArray(this.dataInfo.riskList) ? this.dataInfo.riskList : [];
    },
    areaList: function areaList() {
      return Array.isArray(this.dataInfo.areaList) ? this.dataInfo.areaList : [];
    }
  },
  watch: {
    dataInfo: {
      handler: function handler() {
        this.renderChart();
      },
      deep: true
    }
  },
  mounted: function mounted() {
    this.renderChart();
    window.addEventListener('dashboard-resize', this.resizeCharts);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('dashboard-resize', this.resizeCharts);
    disposeChart(this.$refs.riskChart);
  },
  methods: {
    renderChart: function renderChart() {
      this.$nextTick(function waitDom() {
        setChartOption(this.$refs.riskChart, {
          color: ['#ff4b55', '#f6c343', '#46e7ff', '#35f2a0'],
          tooltip: { trigger: 'item' },
          legend: {
            bottom: 8,
            textStyle: { color: 'rgba(224, 250, 255, 0.72)' }
          },
          series: [
            {
              name: '风险分布',
              type: 'pie',
              radius: ['38%', '70%'],
              center: ['50%', '45%'],
              roseType: 'radius',
              label: {
                color: '#dffbff',
                formatter: '{b}\n{d}%'
              },
              labelLine: {
                lineStyle: { color: 'rgba(220, 249, 255, 0.35)' }
              },
              data: this.riskList
            }
          ]
        });
      });
    },
    resizeCharts: function resizeCharts() {
      resizeChart(this.$refs.riskChart);
    },
    levelClass: function levelClass(level) {
      if (level === '高危') {
        return 'danger';
      }
      if (level === '中危') {
        return 'warn';
      }
      return 'normal';
    },
    safePercent: function safePercent(value) {
      var numberValue = Number(value);
      if (!Number.isFinite(numberValue)) {
        return 0;
      }
      return Math.max(0, Math.min(100, Math.round(numberValue)));
    },
    summaryRate: function summaryRate(item) {
      var maxValue = this.summaryList.reduce(function getMax(max, current) {
        return Math.max(max, Number(current.value) || 0);
      }, 1);
      var value = Number(item && item.value) || 0;
      return Math.max(8, Math.min(100, Math.round((value / maxValue) * 100)));
    },
    summaryText: function summaryText(item) {
      if (!item) {
        return '等待统计';
      }
      if (item.name === '高危数量') {
        return '红色督办';
      }
      if (item.name === '处理中') {
        return '持续跟进';
      }
      if (item.name === '已处理') {
        return '闭环完成';
      }
      return '全量监测';
    }
  }
};
</script>

<style lang="less" scoped>
.warning-page {
  height: 100%;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  grid-template-rows: 150px 1fr 270px;
  gap: 18px;
}

.warning-summary {
  grid-column: 1 / 3;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  padding: 18px;
}

.summary-card span,
.summary-card em,
.summary-card b {
  color: rgba(224, 250, 255, 0.66);
  font-style: normal;
}

.summary-card strong {
  display: inline-block;
  margin: 12px 8px 0 0;
  font-size: 36px;
  text-shadow: 0 0 16px currentColor;
}

.summary-extra {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  font-size: 13px;
}

.summary-extra b {
  font-weight: 400;
  color: #46e7ff;
}

.summary-track {
  height: 7px;
  margin-top: 10px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
}

.summary-bar {
  height: 100%;
  border-radius: 99px;
  box-shadow: 0 0 12px currentColor;
  transition: width 0.45s ease;
}

.warning-list-card {
  grid-row: 2 / 4;
  min-height: 0;
}

.warning-table {
  height: calc(100% - 42px);
  padding: 16px;
}

.table-head,
.warning-row {
  display: grid;
  grid-template-columns: 92px 1fr 1fr 86px 100px;
  gap: 10px;
  align-items: center;
}

.table-head {
  height: 42px;
  color: rgba(224, 250, 255, 0.62);
  border-bottom: 1px solid rgba(70, 231, 255, 0.16);
}

.scroll-mask {
  height: calc(100% - 42px);
  overflow: hidden;
}

.scroll-list {
  animation: warningScroll 14s linear infinite;
}

.warning-row {
  min-height: 52px;
  color: rgba(237, 253, 255, 0.86);
  border-bottom: 1px solid rgba(70, 231, 255, 0.08);
}

.warning-row.danger {
  color: #fff4f4;
  background: linear-gradient(90deg, rgba(255, 75, 85, 0.22), transparent);
}

.warning-row.warn {
  background: linear-gradient(90deg, rgba(246, 195, 67, 0.16), transparent);
}

.risk-card,
.area-risk-card {
  min-height: 0;
}

.area-risk-list {
  padding: 20px;
}

.area-risk-item {
  margin-bottom: 26px;
}

.area-risk-row {
  display: flex;
  justify-content: space-between;
  color: rgba(230, 252, 255, 0.84);
}

.area-risk-row strong {
  color: #46e7ff;
}

.area-risk-item.warn .area-risk-row strong {
  color: #f6c343;
}

.area-risk-item.danger .area-risk-row strong {
  color: #ff4b55;
}

.area-risk-track {
  height: 10px;
  margin-top: 11px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
}

.area-risk-bar {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #46e7ff, #35f2a0);
  transition: width 0.45s ease;
}

.area-risk-item.warn .area-risk-bar {
  background: linear-gradient(90deg, #f6c343, #ffb14a);
}

.area-risk-item.danger .area-risk-bar {
  background: linear-gradient(90deg, #ff4b55, #f6c343);
}

@keyframes warningScroll {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-50%);
  }
}
</style>

<template>
  <div class="progress-page">
    <section class="circle-grid">
      <article
        v-for="item in circleList"
        :key="item.name"
        class="dashboard-card circle-card"
      >
        <div class="circle-info">
          <span>{{ item.name }}</span>
          <strong>{{ safePercent(item.value) }}%</strong>
          <em>{{ circleStatusText(item.value) }}</em>
        </div>
        <div class="circle-wrap">
          <svg viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="52" class="circle-bg"></circle>
            <circle
              cx="75"
              cy="75"
              r="52"
              class="circle-value"
              :stroke-dasharray="circleLength"
              :stroke-dashoffset="circleLength - circleLength * (safePercent(item.value) / 100)"
            ></circle>
          </svg>
          <div class="circle-text">
            <strong>{{ 100 - safePercent(item.value) }}</strong>
            <span>剩余缺口</span>
          </div>
        </div>
        <div class="circle-extra">
          <span>本轮目标</span>
          <strong>100%</strong>
        </div>
      </article>
    </section>

    <section class="dashboard-card rank-card">
      <div class="card-title">处置排行榜 <span>区域责任进度</span></div>
      <div class="rank-list">
        <div
          v-for="(item, index) in rankList"
          :key="item.name"
          class="rank-item"
        >
          <span class="rank-index" :class="{ top: index < 3 }">{{ index + 1 }}</span>
          <div class="rank-content">
            <div class="rank-row">
              <strong>{{ item.name }}</strong>
              <em>{{ item.owner }}</em>
              <b>{{ safePercent(item.value) }}%</b>
            </div>
            <div class="rank-track">
              <div class="rank-bar" :style="{ width: safePercent(item.value) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="dashboard-card task-card">
      <div class="card-title">任务态势 <span>处置状态总览</span></div>
      <div class="task-grid">
        <div
          v-for="item in taskList"
          :key="item.name"
          class="task-item"
          :style="{ borderColor: item.color }"
        >
          <span>{{ item.name }}</span>
          <strong :style="{ color: item.color }">{{ item.value }}</strong>
          <em>项</em>
          <div class="task-track">
            <div
              class="task-bar"
              :style="{ width: taskRate(item) + '%', background: item.color }"
            ></div>
          </div>
          <b>{{ taskText(item) }}</b>
        </div>
      </div>
    </section>

    <section class="dashboard-card work-card">
      <div class="card-title">工单明细 <span>关键事项跟踪</span></div>
      <div class="work-list">
        <div
          v-for="item in workList"
          :key="item.title"
          class="work-item"
          :class="{ danger: item.level === '紧急', warn: item.level === '关注' }"
        >
          <div>
            <strong>{{ item.title }}</strong>
            <span>{{ item.area }}</span>
          </div>
          <em>{{ item.status }}</em>
          <b>{{ item.level }}</b>
          <div class="work-track">
            <div class="work-bar" :style="{ width: workRate(item) + '%' }"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ProgressPage',
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
      circleLength: 326.73
    };
  },
  computed: {
    circleList: function circleList() {
      return Array.isArray(this.dataInfo.circleList) ? this.dataInfo.circleList : [];
    },
    rankList: function rankList() {
      return Array.isArray(this.dataInfo.rankList) ? this.dataInfo.rankList : [];
    },
    taskList: function taskList() {
      return Array.isArray(this.dataInfo.taskList) ? this.dataInfo.taskList : [];
    },
    workList: function workList() {
      return Array.isArray(this.dataInfo.workList) ? this.dataInfo.workList : [];
    }
  },
  methods: {
    safePercent: function safePercent(value) {
      var numberValue = Number(value);
      if (!Number.isFinite(numberValue)) {
        return 0;
      }
      return Math.max(0, Math.min(100, Math.round(numberValue)));
    },
    circleStatusText: function circleStatusText(value) {
      var percent = this.safePercent(value);
      if (percent >= 92) {
        return '状态优秀';
      }
      if (percent >= 85) {
        return '稳定推进';
      }
      return '重点跟进';
    },
    taskRate: function taskRate(item) {
      var maxValue = this.taskList.reduce(function getMax(max, current) {
        var value = Number(current.value) || 0;
        return Math.max(max, value);
      }, 1);
      var currentValue = Number(item && item.value) || 0;
      return Math.max(8, Math.min(100, Math.round((currentValue / maxValue) * 100)));
    },
    taskText: function taskText(item) {
      if (!item || item.name === '超时任务') {
        return '优先压降';
      }
      if (item.name === '已完成') {
        return '闭环完成';
      }
      if (item.name === '处理中') {
        return '持续推进';
      }
      return '等待分派';
    },
    workRate: function workRate(item) {
      if (!item) {
        return 0;
      }
      if (item.status === '已完成') {
        return 100;
      }
      if (item.status === '处理中') {
        return 68;
      }
      if (item.status === '待处理') {
        return 32;
      }
      return 52;
    }
  }
};
</script>

<style lang="less" scoped>
.progress-page {
  height: 100%;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  grid-template-rows: 220px 300px 1fr;
  gap: 18px;
}

.circle-grid {
  grid-column: 1 / 3;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.circle-card {
  display: grid;
  grid-template-columns: 1fr 160px 110px;
  align-items: center;
  gap: 18px;
  padding: 22px 28px;
  overflow: visible;
}

.circle-info span,
.circle-extra span {
  display: block;
  color: rgba(224, 250, 255, 0.66);
  font-size: 15px;
}

.circle-info strong {
  display: block;
  margin-top: 14px;
  color: #f6feff;
  font-size: 38px;
  text-shadow: 0 0 16px rgba(70, 231, 255, 0.55);
}

.circle-info em {
  display: inline-block;
  margin-top: 14px;
  padding: 4px 12px;
  color: #03111f;
  font-style: normal;
  background: linear-gradient(90deg, #46e7ff, #35f2a0);
  box-shadow: 0 0 16px rgba(70, 231, 255, 0.26);
}

.circle-wrap {
  position: relative;
  width: 150px;
  height: 150px;
  overflow: visible;
}

.circle-wrap svg {
  width: 150px;
  height: 150px;
  overflow: visible;
  transform: rotate(-90deg);
}

.circle-bg,
.circle-value {
  fill: none;
  stroke-width: 11;
}

.circle-bg {
  stroke: rgba(255, 255, 255, 0.08);
}

.circle-value {
  stroke: #46e7ff;
  stroke-linecap: round;
  filter: drop-shadow(0 0 10px rgba(70, 231, 255, 0.82));
  transition: stroke-dashoffset 0.55s ease;
}

.circle-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.circle-text strong {
  color: #f6feff;
  font-size: 30px;
  text-shadow: 0 0 14px rgba(70, 231, 255, 0.55);
}

.circle-text span {
  margin-top: 8px;
  color: rgba(224, 250, 255, 0.7);
  font-size: 13px;
}

.circle-extra {
  padding-left: 18px;
  border-left: 1px solid rgba(70, 231, 255, 0.18);
}

.circle-extra strong {
  display: block;
  margin-top: 18px;
  color: #35f2a0;
  font-size: 30px;
  text-shadow: 0 0 12px rgba(53, 242, 160, 0.48);
}

.rank-card {
  grid-column: 2;
  grid-row: 2;
  min-height: 0;
}

.rank-list {
  height: calc(100% - 42px);
  padding: 12px 18px;
  overflow: hidden;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}

.rank-index {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(224, 250, 255, 0.8);
  border: 1px solid rgba(70, 231, 255, 0.24);
  background: rgba(3, 16, 38, 0.62);
}

.rank-index.top {
  color: #03111f;
  background: linear-gradient(135deg, #46e7ff, #35f2a0);
}

.rank-content {
  flex: 1;
  min-width: 0;
}

.rank-row {
  display: grid;
  grid-template-columns: 1fr 130px 70px;
  align-items: center;
  gap: 10px;
}

.rank-row strong {
  color: #f2feff;
  font-size: 16px;
}

.rank-row em {
  color: rgba(224, 250, 255, 0.62);
  font-style: normal;
}

.rank-row b {
  color: #35f2a0;
  text-align: right;
}

.rank-track {
  height: 8px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
}

.rank-bar {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #46e7ff, #35f2a0);
  transition: width 0.45s ease;
}

.task-card {
  grid-column: 1;
  grid-row: 2;
  min-height: 0;
}

.task-grid {
  height: calc(100% - 42px);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding: 18px;
}

.task-item {
  min-width: 0;
  border: 1px solid;
  background: rgba(3, 16, 38, 0.58);
  padding: 16px 12px;
}

.task-item span,
.task-item em,
.task-item b {
  color: rgba(224, 250, 255, 0.64);
  font-style: normal;
}

.task-item strong {
  display: block;
  margin: 12px 0 4px;
  font-size: 32px;
}

.task-track {
  height: 7px;
  margin-top: 14px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
}

.task-bar {
  height: 100%;
  border-radius: 99px;
  box-shadow: 0 0 12px currentColor;
  transition: width 0.45s ease;
}

.task-item b {
  display: block;
  margin-top: 12px;
  font-weight: 400;
  font-size: 13px;
}

.work-card {
  grid-column: 1 / 3;
  grid-row: 3;
  min-height: 0;
}

.work-list {
  height: calc(100% - 42px);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding: 16px;
}

.work-item {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 24px 22px 8px;
  gap: 8px;
  min-height: 0;
  padding: 14px;
  border: 1px solid rgba(70, 231, 255, 0.14);
  background: rgba(3, 16, 38, 0.58);
}

.work-item.danger {
  border-color: rgba(255, 75, 85, 0.72);
  box-shadow: inset 0 0 18px rgba(255, 75, 85, 0.16);
}

.work-item.warn {
  border-color: rgba(246, 195, 67, 0.72);
}

.work-item strong {
  display: block;
  color: #f2feff;
}

.work-item span {
  display: block;
  margin-top: 6px;
  color: rgba(224, 250, 255, 0.58);
}

.work-item em,
.work-item b {
  color: rgba(224, 250, 255, 0.78);
  font-style: normal;
  text-align: left;
}

.work-track {
  height: 7px;
  overflow: hidden;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.08);
}

.work-bar {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #46e7ff, #35f2a0);
  box-shadow: 0 0 10px rgba(70, 231, 255, 0.6);
}

.work-item.warn .work-bar {
  background: linear-gradient(90deg, #f6c343, #ffb14a);
}

.work-item.danger .work-bar {
  background: linear-gradient(90deg, #ff4b55, #f6c343);
}
</style>

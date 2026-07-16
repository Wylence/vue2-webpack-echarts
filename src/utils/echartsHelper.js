import * as echarts from 'echarts';

const chartMap = new WeakMap();

export function initChart(dom) {
  if (!dom) {
    return null;
  }

  var chart = chartMap.get(dom) || echarts.getInstanceByDom(dom);
  if (!chart) {
    chart = echarts.init(dom);
    chartMap.set(dom, chart);
  }
  return chart;
}

export function setChartOption(dom, option) {
  var chart = initChart(dom);
  if (!chart || !option) {
    return null;
  }

  chart.setOption(option, true);
  return chart;
}

export function resizeChart(dom) {
  if (!dom) {
    return;
  }

  var chart = chartMap.get(dom) || echarts.getInstanceByDom(dom);
  if (chart) {
    chart.resize();
  }
}

export function disposeChart(dom) {
  if (!dom) {
    return;
  }

  var chart = chartMap.get(dom) || echarts.getInstanceByDom(dom);
  if (chart) {
    chart.dispose();
  }
  chartMap.delete(dom);
}

export function buildTooltip() {
  return {
    trigger: 'axis',
    backgroundColor: 'rgba(3, 14, 35, 0.92)',
    borderColor: 'rgba(70, 231, 255, 0.5)',
    borderWidth: 1,
    textStyle: {
      color: '#dffbff',
      fontSize: 12
    },
    axisPointer: {
      lineStyle: {
        color: 'rgba(70, 231, 255, 0.7)'
      }
    }
  };
}

export function buildGrid() {
  return {
    left: 36,
    right: 24,
    top: 42,
    bottom: 28,
    containLabel: true
  };
}

export function buildAxisLine() {
  return {
    lineStyle: {
      color: 'rgba(170, 232, 255, 0.22)'
    }
  };
}

export function buildAxisLabel() {
  return {
    color: 'rgba(220, 249, 255, 0.72)',
    fontSize: 11
  };
}

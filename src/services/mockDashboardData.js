function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addWave(value, range) {
  return Math.max(0, value + randomBetween(-range, range));
}

function buildTrendList(base) {
  var hours = ['08时', '10时', '12时', '14时', '16时', '18时', '20时', '22时'];
  return hours.map(function mapTrend(hour, index) {
    return {
      time: hour,
      visitor: addWave(base.visitor + index * 90, 120),
      deal: addWave(base.deal + index * 35, 60),
      rate: Math.max(8, Math.min(40, base.rate + randomBetween(-4, 5)))
    };
  });
}

function buildOverview() {
  return {
    metrics: [
      { name: '今日客流', value: randomBetween(8200, 9800), unit: '人', change: 12.8, status: 'up' },
      { name: '成交金额', value: randomBetween(520, 680), unit: '万元', change: 9.6, status: 'up' },
      { name: '设备在线率', value: randomBetween(965, 991) / 10, unit: '%', change: 2.1, status: 'up' },
      { name: '告警数量', value: randomBetween(8, 18), unit: '条', change: -6.4, status: 'down' },
      { name: '任务完成率', value: randomBetween(884, 962) / 10, unit: '%', change: 5.7, status: 'up' },
      { name: '能耗指数', value: randomBetween(72, 88), unit: '分', change: -3.2, status: 'down' }
    ],
    trendList: buildTrendList({
      visitor: randomBetween(620, 760),
      deal: randomBetween(80, 130),
      rate: randomBetween(18, 25)
    }),
    areaHeat: [
      { name: '序厅接待区', value: randomBetween(86, 98) },
      { name: '数字沙盘区', value: randomBetween(78, 92) },
      { name: '沉浸体验区', value: randomBetween(72, 88) },
      { name: '会议洽谈区', value: randomBetween(64, 82) },
      { name: '成果展示区', value: randomBetween(58, 76) }
    ],
    channelList: [
      { name: '预约参观', value: randomBetween(35, 46) },
      { name: '商务接待', value: randomBetween(18, 28) },
      { name: '会议导入', value: randomBetween(14, 22) },
      { name: '临时到访', value: randomBetween(8, 14) }
    ],
    liveList: [
      '数字沙盘区完成一轮重点讲解',
      '沉浸体验区新增 24 人参观',
      '会议洽谈区完成客户接待登记',
      '成果展示区设备巡检正常',
      '序厅接待区客流峰值已回落'
    ]
  };
}

function buildTrend() {
  var names = ['客流', '转化', '成交', '留资', '复访', '满意度'];
  return {
    barList: names.map(function mapBar(name) {
      var target = randomBetween(80, 120);
      return {
        name: name,
        current: randomBetween(62, 118),
        last: randomBetween(55, 108),
        target: target
      };
    }),
    matrixList: [
      { name: '客流增长', value: randomBetween(8, 18), unit: '%', status: 'up' },
      { name: '成交转化', value: randomBetween(18, 32), unit: '%', status: 'up' },
      { name: '线索留资', value: randomBetween(220, 320), unit: '条', status: 'up' },
      { name: '客户复访', value: randomBetween(42, 68), unit: '批', status: 'up' },
      { name: '讲解覆盖', value: randomBetween(88, 97), unit: '%', status: 'up' },
      { name: '等待时长', value: randomBetween(4, 12), unit: '分', status: 'down' }
    ],
    radarList: [
      { name: '预约', value: [86, 74, 92, 78, 88] },
      { name: '商务', value: [78, 88, 80, 85, 74] }
    ],
    stackList: [
      { name: '序厅', guide: 42, deal: 28, service: 18 },
      { name: '沙盘', guide: 36, deal: 32, service: 16 },
      { name: '体验', guide: 48, deal: 24, service: 20 },
      { name: '会议', guide: 30, deal: 42, service: 15 }
    ]
  };
}

function buildProgress() {
  return {
    circleList: [
      { name: '总体处置', value: randomBetween(82, 94) },
      { name: '工单完成', value: randomBetween(76, 91) },
      { name: '巡检覆盖', value: randomBetween(88, 99) }
    ],
    rankList: [
      { name: '序厅接待区', owner: '接待一组', value: randomBetween(92, 99) },
      { name: '数字沙盘区', owner: '讲解二组', value: randomBetween(86, 96) },
      { name: '沉浸体验区', owner: '运营三组', value: randomBetween(80, 92) },
      { name: '会议洽谈区', owner: '商务一组', value: randomBetween(74, 88) },
      { name: '成果展示区', owner: '保障二组', value: randomBetween(68, 84) }
    ],
    taskList: [
      { name: '待处理', value: randomBetween(8, 16), color: '#f6c343' },
      { name: '处理中', value: randomBetween(18, 30), color: '#46e7ff' },
      { name: '已完成', value: randomBetween(120, 168), color: '#35f2a0' },
      { name: '超时任务', value: randomBetween(2, 7), color: '#ff4b55' }
    ],
    workList: [
      { title: '设备巡检复核', area: '成果展示区', status: '处理中', level: '正常' },
      { title: '客流引导增援', area: '沉浸体验区', status: '待处理', level: '关注' },
      { title: '会议室灯控检查', area: '会议洽谈区', status: '已完成', level: '正常' },
      { title: '大屏音频延迟排查', area: '数字沙盘区', status: '处理中', level: '紧急' }
    ]
  };
}

function buildWarning() {
  return {
    summaryList: [
      { name: '今日告警', value: randomBetween(26, 42), color: '#46e7ff' },
      { name: '已处理', value: randomBetween(18, 32), color: '#35f2a0' },
      { name: '处理中', value: randomBetween(5, 12), color: '#f6c343' },
      { name: '高危数量', value: randomBetween(2, 6), color: '#ff4b55' }
    ],
    warningList: [
      { time: '09:18', area: '沉浸体验区', type: '客流拥堵', level: '高危', status: '处理中' },
      { time: '10:05', area: '数字沙盘区', type: '设备离线', level: '高危', status: '待确认' },
      { time: '11:22', area: '序厅接待区', type: '等待超时', level: '中危', status: '处理中' },
      { time: '13:40', area: '会议洽谈区', type: '环境温度', level: '低危', status: '已派单' },
      { time: '15:08', area: '成果展示区', type: '巡检遗漏', level: '中危', status: '复核中' },
      { time: '16:36', area: '沉浸体验区', type: '音频异常', level: '低危', status: '已处理' }
    ],
    riskList: [
      { name: '设备异常', value: randomBetween(24, 36) },
      { name: '客流拥堵', value: randomBetween(18, 30) },
      { name: '环境异常', value: randomBetween(12, 22) },
      { name: '系统告警', value: randomBetween(8, 18) }
    ],
    areaList: [
      { name: '沉浸体验区', value: randomBetween(78, 94), level: '高' },
      { name: '数字沙盘区', value: randomBetween(68, 86), level: '高' },
      { name: '序厅接待区', value: randomBetween(48, 66), level: '中' },
      { name: '会议洽谈区', value: randomBetween(28, 48), level: '低' }
    ]
  };
}

export function fetchDashboardData(options) {
  var query = options || {};
  var delay = typeof query.delay === 'number' ? query.delay : 650;

  return new Promise(function request(resolve, reject) {
    window.setTimeout(function response() {
      if (query.forceError) {
        reject(new Error('模拟接口请求失败'));
        return;
      }

      if (query.forceEmpty) {
        resolve({
          overview: {},
          trend: {},
          progress: {},
          warning: {},
          refreshedAt: new Date()
        });
        return;
      }

      resolve({
        overview: buildOverview(),
        trend: buildTrend(),
        progress: buildProgress(),
        warning: buildWarning(),
        refreshedAt: new Date()
      });
    }, delay);
  });
}

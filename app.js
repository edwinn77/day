/**
 * app.js — UI 交互控制
 * 负责日期导航、日历渲染、数据更新
 */

(function () {
    'use strict';

    // ============ 状态 ============
    let currentDate = new Date();
    let calendarYear, calendarMonth;

    // ============ DOM 引用 ============
    const $ = id => document.getElementById(id);

    const els = {
        datePicker: $('datePicker'),
        btnToday: $('btnToday'),
        prevDay: $('prevDay'),
        nextDay: $('nextDay'),
        solarYear: $('solarYear'),
        solarMonth: $('solarMonth'),
        solarDay: $('solarDay'),
        weekday: $('weekday'),
        lunarDayBig: $('lunarDayBig'),
        lunarMonthDisplay: $('lunarMonthDisplay'),
        lunarFullDate: $('lunarFullDate'),
        ganzhiDate: $('ganzhiDate'),
        zodiac: $('zodiac'),
        constellation: $('constellation'),
        solarTerm: $('solarTerm'),
        nayin: $('nayin'),
        yiList: $('yiList'),
        jiList: $('jiList'),
        wuxing: $('wuxing'),
        chongsha: $('chongsha'),
        pengzu: $('pengzu'),
        jishen: $('jishen'),
        xiongshen: $('xiongshen'),
        jianchu: $('jianchu'),
        shichenGrid: $('shichenGrid'),
        calTitle: $('calTitle'),
        calDays: $('calDays'),
        prevMonth: $('prevMonth'),
        nextMonth: $('nextMonth'),
        // 综合择吉
        auspiciousCard: $('auspiciousCard'),
        auspiciousBadge: $('auspiciousBadge'),
        auspiciousTitle: $('auspiciousTitle'),
        auspiciousAdvice: $('auspiciousAdvice'),
        auspiciousFactors: $('auspiciousFactors'),
        auspiciousDaTou: $('auspiciousDaTou'),
        huangdao: $('huangdao'),
        // 吉日弹窗
        btnFindLucky: $('btnFindLucky'),
        luckyModal: $('luckyModal'),
        modalClose: $('modalClose'),
        luckyList: $('luckyList'),
        // 说明弹窗
        btnInfo: $('btnInfo'),
        infoModal: $('infoModal'),
        infoModalClose: $('infoModalClose'),
    };

    // ============ 核心更新函数 ============
    function updateAll() {
        const y = currentDate.getFullYear();
        const m = currentDate.getMonth() + 1;
        const d = currentDate.getDate();

        // 获取所有日期信息
        const info = Lunar.getDateInfo(y, m, d);
        if (!info) return;

        const almanac = Almanac.getDayAlmanac(info);
        if (!almanac) return;

        // === 更新顶部日期 ===
        els.solarYear.textContent = y;
        els.solarMonth.textContent = m;
        els.solarDay.textContent = d;
        els.weekday.textContent = info.solar.weekday;

        // === 更新 date picker ===
        els.datePicker.value = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        // === 更新英雄卡片 ===
        els.lunarDayBig.textContent = info.lunar.dayText;
        els.lunarMonthDisplay.textContent = info.lunar.monthText;
        els.lunarFullDate.textContent = info.lunar.fullText;
        els.ganzhiDate.textContent = info.ganzhi.fullText;
        els.zodiac.textContent = info.zodiac.emoji + ' ' + info.zodiac.name;
        els.constellation.textContent = info.constellation.emoji + ' ' + info.constellation.name;
        els.solarTerm.textContent = info.solarTerm || '—';
        els.nayin.textContent = info.nayin;

        // === 更新宜忌 ===
        renderTags(els.yiList, almanac.yi, 'tag');
        renderTags(els.jiList, almanac.ji, 'tag');

        // === 更新详细信息 ===
        els.huangdao.textContent = almanac.huangdao
            ? almanac.huangdao.godType + ' · ' + almanac.huangdao.godName
            : '—';
        els.wuxing.textContent = almanac.wuxing;
        els.chongsha.textContent = almanac.chongSha.text;
        els.pengzu.textContent = almanac.pengzu;
        els.jishen.textContent = almanac.jiShen.join(' ');
        els.xiongshen.textContent = almanac.xiongShen.join(' ');
        els.jianchu.textContent = almanac.jianChu;

        // === 更新时辰 ===
        renderShiChen(almanac.shiChen);

        // === 更新综合择吉 ===
        if (almanac.comprehensive) {
            const comp = almanac.comprehensive;
            const aus = almanac.auspicious;

            // 综合评级徽章
            els.auspiciousBadge.textContent = comp.label;
            els.auspiciousBadge.className = 'auspicious-badge level-' + comp.level;
            els.auspiciousCard.className = 'auspicious-card level-' + comp.level;
            els.auspiciousAdvice.textContent = comp.advice;

            // 因素标签
            els.auspiciousFactors.innerHTML = '';
            comp.factors.forEach(f => {
                const span = document.createElement('span');
                span.className = 'factor-tag';
                span.textContent = f;
                els.auspiciousFactors.appendChild(span);
            });

            // 大偷修日
            if (aus && aus.daTouXiu) {
                els.auspiciousDaTou.classList.remove('hidden');
            } else {
                els.auspiciousDaTou.classList.add('hidden');
            }
        }

        // === 更新日历 ===
        calendarYear = y;
        calendarMonth = m;
        renderCalendar();

        // 添加动画
        animateContent();
    }

    function renderTags(container, items, cls) {
        container.innerHTML = '';
        items.forEach(item => {
            const span = document.createElement('span');
            span.className = cls;
            span.textContent = item;
            container.appendChild(span);
        });
    }

    function renderShiChen(shiChen) {
        els.shichenGrid.innerHTML = '';
        shiChen.forEach(sc => {
            const div = document.createElement('div');
            div.className = 'shichen-item ' + (sc.isJi ? 'ji' : 'xiong');
            div.innerHTML = `
                <span class="shichen-name">${sc.name}</span>
                <span class="shichen-time">${sc.time}</span>
                <span class="shichen-status">${sc.status}</span>
            `;
            els.shichenGrid.appendChild(div);
        });
    }

    // ============ 日历渲染 ============
    function renderCalendar() {
        els.calTitle.textContent = `${calendarYear}年${calendarMonth}月`;

        const firstDay = new Date(calendarYear, calendarMonth - 1, 1);
        const lastDay = new Date(calendarYear, calendarMonth, 0);
        const startDow = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const selStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

        els.calDays.innerHTML = '';

        // 上月填充
        const prevLastDay = new Date(calendarYear, calendarMonth - 1, 0).getDate();
        for (let i = startDow - 1; i >= 0; i--) {
            const day = prevLastDay - i;
            const pm = calendarMonth - 1;
            const py = pm < 1 ? calendarYear - 1 : calendarYear;
            const actualM = pm < 1 ? 12 : pm;
            const lunarInfo = Lunar.solarToLunar(py, actualM, day);
            const el = createCalDay(day, lunarInfo, true, false, false, py, actualM, day);
            els.calDays.appendChild(el);
        }

        // 本月
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${calendarYear}-${calendarMonth}-${d}`;
            const isToday = dateStr === todayStr;
            const isSel = dateStr === selStr;
            const lunarInfo = Lunar.solarToLunar(calendarYear, calendarMonth, d);
            const dow = new Date(calendarYear, calendarMonth - 1, d).getDay();
            const isWeekend = dow === 0 || dow === 6;
            const el = createCalDay(d, lunarInfo, false, isToday, isSel, calendarYear, calendarMonth, d, isWeekend);
            els.calDays.appendChild(el);
        }

        // 下月填充到42天
        const totalCells = startDow + totalDays;
        const remaining = (totalCells <= 35) ? (35 - totalCells) : (42 - totalCells);
        for (let d = 1; d <= remaining; d++) {
            const nm = calendarMonth + 1;
            const ny = nm > 12 ? calendarYear + 1 : calendarYear;
            const actualM = nm > 12 ? 1 : nm;
            const lunarInfo = Lunar.solarToLunar(ny, actualM, d);
            const el = createCalDay(d, lunarInfo, true, false, false, ny, actualM, d);
            els.calDays.appendChild(el);
        }
    }

    function createCalDay(day, lunarInfo, isOther, isToday, isSel, year, month, dayNum, isWeekend) {
        const div = document.createElement('div');
        let cls = 'cal-day';
        if (isOther) cls += ' other-month';
        if (isToday) cls += ' today';
        if (isSel) cls += ' selected';
        if (isWeekend) cls += ' weekend';
        div.className = cls;

        // 农历显示
        let lunarText = '';
        let lunarCls = '';
        if (lunarInfo) {
            const festival = Lunar.getLunarFestival(lunarInfo.month, lunarInfo.day);
            const solarFes = Lunar.getSolarFestival(month, dayNum);
            const term = Lunar.getSolarTermForDate(year, month, dayNum);

            if (festival) {
                lunarText = festival;
                lunarCls = 'lunar festival';
            } else if (term) {
                lunarText = term;
                lunarCls = 'lunar term';
            } else if (solarFes) {
                lunarText = solarFes;
                lunarCls = 'lunar festival';
            } else {
                lunarText = Lunar.lunarDayText(lunarInfo.month, lunarInfo.day, lunarInfo.isLeap);
                lunarCls = 'lunar';
            }
        }

        div.innerHTML = `
            <span class="solar">${day}</span>
            <span class="${lunarCls}">${lunarText}</span>
        `;

        div.addEventListener('click', () => {
            currentDate = new Date(year, month - 1, dayNum);
            updateAll();
        });

        return div;
    }

    // ============ 动画 ============
    function animateContent() {
        const sections = document.querySelectorAll('.hero-card, .yiji-section, .detail-section, .calendar-section');
        sections.forEach(s => {
            s.classList.remove('view-transition');
            // Force reflow
            void s.offsetWidth;
            s.classList.add('view-transition');
        });
    }

    // ============ 吉日列表 ============
    function findUpcomingLuckyDays() {
        const results = [];
        const startDate = new Date(currentDate);
        const maxDays = 90; // 向前扫掐 90 天
        const maxResults = 20;

        for (let i = 1; i <= maxDays && results.length < maxResults; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const dd = d.getDate();

            const info = Lunar.getDateInfo(y, m, dd);
            if (!info) continue;

            const ganzhiMonthInfo = Lunar.getGanZhiMonthInfo(y, m, dd);
            const monthNum = ganzhiMonthInfo ? ganzhiMonthInfo.monthNum : info.lunar.month;
            const yearGanIdx = ganzhiMonthInfo
                ? ((ganzhiMonthInfo.ganzhiYear - 4) % 10 + 10) % 10
                : 0;

            const aus = Almanac.getAuspiciousDay(
                info.ganzhi.dayIdx60, info.ganzhi.dayZhiIdx,
                yearGanIdx, monthNum
            );

            if (aus.isLucky) {
                results.push({
                    date: d,
                    year: y, month: m, day: dd,
                    info,
                    auspicious: aus
                });
            }
        }
        return results;
    }

    function renderLuckyModal() {
        const days = findUpcomingLuckyDays();
        els.luckyList.innerHTML = '';

        if (days.length === 0) {
            els.luckyList.innerHTML = '<div class="lucky-empty">近90天内暂无吉日</div>';
            return;
        }

        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

        days.forEach(item => {
            const row = document.createElement('div');
            row.className = 'lucky-item';

            const dow = item.date.getDay();
            const dateStr = `${item.year}年${item.month}月${item.day}日`;
            const weekStr = `星期${weekdays[dow]}`;
            const daysAway = Math.round((item.date - currentDate) / 86400000);

            row.innerHTML = `
                <div class="lucky-date">
                    <span class="lucky-solar">${dateStr}</span>
                    <span class="lucky-week">${weekStr} · ${daysAway}天后</span>
                </div>
                <div class="lucky-detail">
                    <span class="lucky-lunar">${item.info.lunar.monthText}${item.info.lunar.dayText}</span>
                    <span class="lucky-gz">${item.info.ganzhi.day}日</span>
                </div>
                <div class="lucky-type">
                    <span class="lucky-type-badge">${item.auspicious.nineStar.auspiciousType}</span>
                    ${item.auspicious.daTouXiu ? '<span class="lucky-datou-badge">修</span>' : ''}
                </div>
            `;

            row.addEventListener('click', () => {
                currentDate = new Date(item.year, item.month - 1, item.day);
                updateAll();
                closeLuckyModal();
            });

            els.luckyList.appendChild(row);
        });
    }

    function openLuckyModal() {
        renderLuckyModal();
        els.luckyModal.classList.remove('hidden');
        // 禁止背景滚动
        document.body.style.overflow = 'hidden';
    }

    function closeLuckyModal() {
        els.luckyModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ============ 日期导航 ============
    function goToDate(date) {
        currentDate = date;
        updateAll();
    }

    function prevDay() {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        goToDate(d);
    }

    function nextDay() {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        goToDate(d);
    }

    function goToday() {
        goToDate(new Date());
    }

    function prevMonth() {
        calendarMonth--;
        if (calendarMonth < 1) {
            calendarMonth = 12;
            calendarYear--;
        }
        renderCalendar();
        els.calTitle.textContent = `${calendarYear}年${calendarMonth}月`;
    }

    function nextMonth() {
        calendarMonth++;
        if (calendarMonth > 12) {
            calendarMonth = 1;
            calendarYear++;
        }
        renderCalendar();
        els.calTitle.textContent = `${calendarYear}年${calendarMonth}月`;
    }

    // ============ 事件绑定 ============
    function bindEvents() {
        els.prevDay.addEventListener('click', prevDay);
        els.nextDay.addEventListener('click', nextDay);
        els.btnToday.addEventListener('click', goToday);
        els.prevMonth.addEventListener('click', prevMonth);
        els.nextMonth.addEventListener('click', nextMonth);

        // 吉日弹窗
        els.btnFindLucky.addEventListener('click', openLuckyModal);
        els.modalClose.addEventListener('click', closeLuckyModal);
        els.luckyModal.addEventListener('click', (e) => {
            if (e.target === els.luckyModal) closeLuckyModal();
        });

        // 说明弹窗
        els.btnInfo.addEventListener('click', () => {
            els.infoModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        });
        els.infoModalClose.addEventListener('click', () => {
            els.infoModal.classList.add('hidden');
            document.body.style.overflow = '';
        });
        els.infoModal.addEventListener('click', (e) => {
            if (e.target === els.infoModal) {
                els.infoModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });

        els.datePicker.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                const parts = val.split('-');
                goToDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
            }
        });

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevDay();
            if (e.key === 'ArrowRight') nextDay();
        });
    }

    // ============ 初始化 ============
    function init() {
        bindEvents();
        updateAll();
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// ============ 八卦人体图交互 (全局) ============
const baguaData = {
    qian: { symbol: '☰', name: '乾', parts: '头，大肠，右脚，肠头。' },
    dui: { symbol: '☱', name: '兑', parts: '口，肺，右胳膊，右肋，牙齿，嘴角，咽喉，痰涎，肛门，气管等呼吸系统。' },
    li: { symbol: '☲', name: '离', parts: '眼，心脏，小肠，乳房，三焦，血液等。' },
    zhen: { symbol: '☳', name: '震', parts: '足，肝脏，筋爪，左胳膊，左肋。' },
    xun: { symbol: '☴', name: '巽', parts: '股，胆，左肩背，气管，胸部。' },
    kan: { symbol: '☵', name: '坎', parts: '耳，肾，膀胱，脊背，腰骨，血液等体内液体，肛门等下窍。' },
    gen: { symbol: '☶', name: '艮', parts: '手，胃，关节，骨，脚背，鼻子，乳房，男性生殖器，左脚，颧骨。' },
    kun: { symbol: '☷', name: '坤', parts: '脾胃，腹部，肌肉，肥厚，右肩。' }
};

function showBaguaDetail(el) {
    const key = el.dataset.gua;
    const data = baguaData[key];
    if (!data) return;
    document.getElementById('bdSymbol').textContent = data.symbol;
    document.getElementById('bdName').textContent = data.name;
    document.getElementById('bdBody').textContent = data.parts;
    document.getElementById('baguaDetail').classList.remove('hidden');
}

function closeBaguaDetail() {
    document.getElementById('baguaDetail').classList.add('hidden');
}

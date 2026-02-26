/**
 * lunar.js — 农历计算引擎
 * 提供公历转农历、天干地支、生肖、节气、星座等计算
 */

const Lunar = (() => {
    // ============ 基础数据 ============

    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const shengXiao = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const shengXiaoEmoji = ['🐀', '🐂', '🐯', '🐇', '🐲', '🐍', '🐴', '🐏', '🐒', '🐔', '🐶', '🐷'];

    const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
    const lunarDays = [
        '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];

    // 纳音五行 (60甲子纳音)
    const naYin = [
        '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木',
        '路旁土', '路旁土', '剑锋金', '剑锋金', '山头火', '山头火',
        '涧下水', '涧下水', '城头土', '城头土', '白蜡金', '白蜡金',
        '杨柳木', '杨柳木', '泉中水', '泉中水', '屋上土', '屋上土',
        '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
        '砂石金', '砂石金', '山下火', '山下火', '平地木', '平地木',
        '壁上土', '壁上土', '金箔金', '金箔金', '覆灯火', '覆灯火',
        '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金',
        '桑柘木', '桑柘木', '大溪水', '大溪水', '沙中土', '沙中土',
        '天上火', '天上火', '石榴木', '石榴木', '大海水', '大海水'
    ];

    // 星座
    const constellations = [
        { name: '摩羯座', emoji: '♑', start: [1, 1], end: [1, 19] },
        { name: '水瓶座', emoji: '♒', start: [1, 20], end: [2, 18] },
        { name: '双鱼座', emoji: '♓', start: [2, 19], end: [3, 20] },
        { name: '白羊座', emoji: '♈', start: [3, 21], end: [4, 19] },
        { name: '金牛座', emoji: '♉', start: [4, 20], end: [5, 20] },
        { name: '双子座', emoji: '♊', start: [5, 21], end: [6, 21] },
        { name: '巨蟹座', emoji: '♋', start: [6, 22], end: [7, 22] },
        { name: '狮子座', emoji: '♌', start: [7, 23], end: [8, 22] },
        { name: '处女座', emoji: '♍', start: [8, 23], end: [9, 22] },
        { name: '天秤座', emoji: '♎', start: [9, 23], end: [10, 23] },
        { name: '天蝎座', emoji: '♏', start: [10, 24], end: [11, 22] },
        { name: '射手座', emoji: '♐', start: [11, 23], end: [12, 21] },
        { name: '摩羯座', emoji: '♑', start: [12, 22], end: [12, 31] },
    ];

    // 24节气名
    const solarTermNames = [
        '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
        '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
        '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
        '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
    ];

    // 节气表 (简化: 20世纪公式系数)
    // 使用寿星公式的简化版本计算24节气
    const sTermInfo = [
        0, 21208, 42467, 63836, 85337, 107014,
        128867, 150921, 173149, 195551, 218072, 240693,
        263343, 285989, 308563, 331033, 353350, 375494,
        397447, 419210, 440795, 462224, 483532, 504758
    ];

    // === 农历数据 (1900-2100) ===
    // 每年用一个十六进制数表示:
    // 位[0-3]:   闰月月份(0=无闰月)
    // 位[4-15]:  每月大小月(1=大月30天, 0=小月29天), 从1月到12月
    // 位[16-19]: 闰月大小(1=大月, 0=小月)
    const lunarInfo = [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,//1900-1909
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,//1910-1919
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,//1920-1929
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,//1930-1939
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,//1940-1949
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,//1950-1959
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,//1960-1969
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,//1970-1979
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,//1980-1989
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,//1990-1999
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,//2000-2009
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,//2010-2019
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,//2020-2029
        0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,//2030-2039
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,//2040-2049
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,//2050-2059
        0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,//2060-2069
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,//2070-2079
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,//2080-2089
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,//2090-2099
        0x0d520 //2100
    ];

    // ============ 农历计算函数 ============

    /**
     * 返回农历y年的总天数
     */
    function lYearDays(y) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
        }
        return sum + leapDays(y);
    }

    /**
     * 返回农历y年闰月的天数 若该年没有闰月则返回0
     */
    function leapDays(y) {
        if (leapMonth(y)) {
            return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    }

    /**
     * 返回农历y年闰哪个月 没有闰月返回0
     */
    function leapMonth(y) {
        return lunarInfo[y - 1900] & 0xf;
    }

    /**
     * 返回农历y年m月（非闰月）的总天数
     */
    function monthDays(y, m) {
        if (m > 12 || m < 1) return -1;
        return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
    }

    /**
     * 公历转农历
     */
    function solarToLunar(year, month, day) {
        // 参数验证
        if (year < 1900 || year > 2100) return null;

        let baseDate = new Date(1900, 0, 31);
        let objDate = new Date(year, month - 1, day + 1);
        let offset = Math.floor((objDate - baseDate) / 86400000);

        let lunarYear, lunarMonth, lunarDay;
        let isLeap = false;

        // 计算农历年
        let temp = 0;
        for (lunarYear = 1900; lunarYear < 2101 && offset > 0; lunarYear++) {
            temp = lYearDays(lunarYear);
            offset -= temp;
        }
        if (offset < 0) {
            offset += temp;
            lunarYear--;
        }

        // 闰月
        let leap = leapMonth(lunarYear);

        // 计算农历月
        for (lunarMonth = 1; lunarMonth < 13 && offset > 0; lunarMonth++) {
            // 闰月
            if (leap > 0 && lunarMonth === (leap + 1) && !isLeap) {
                --lunarMonth;
                isLeap = true;
                temp = leapDays(lunarYear);
            } else {
                temp = monthDays(lunarYear, lunarMonth);
            }
            // 解除闰月
            if (isLeap && lunarMonth === (leap + 1)) {
                isLeap = false;
            }
            offset -= temp;
        }

        if (offset === 0 && leap > 0 && lunarMonth === leap + 1) {
            if (isLeap) {
                isLeap = false;
            } else {
                isLeap = true;
                --lunarMonth;
            }
        }

        if (offset < 0) {
            offset += temp;
            --lunarMonth;
        }

        lunarDay = offset + 1;

        return {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay,
            isLeap: isLeap
        };
    }

    /**
     * 获取干支年 — 以立春为界
     * 立春前用上一年,立春当天及之后用当年
     */
    function getGanZhiYear(solarYear, solarMonth, solarDay) {
        const terms = getSolarTerms(solarYear);
        const lichun = terms[2]; // 立春 index=2
        let ganzhiYear = solarYear;
        if (solarMonth < lichun.month || (solarMonth === lichun.month && solarDay < lichun.day)) {
            ganzhiYear--;
        }
        return ganzhiYear;
    }

    /**
     * 天干地支 — 年柱 (以立春为界换年)
     */
    function yearGanZhi(solarYear, solarMonth, solarDay) {
        const ganzhiYear = getGanZhiYear(solarYear, solarMonth, solarDay);
        let ganIdx = (ganzhiYear - 4) % 10;
        let zhiIdx = (ganzhiYear - 4) % 12;
        if (ganIdx < 0) ganIdx += 10;
        if (zhiIdx < 0) zhiIdx += 12;
        return tianGan[ganIdx] + diZhi[zhiIdx];
    }

    /**
     * 获取干支月信息 — 以节(非中气)为界换月
     * 小寒→丑月(12), 立春→寅月(1), 惊蛰→卯月(2), ..., 大雪→子月(11)
     */
    function getGanZhiMonthInfo(solarYear, solarMonth, solarDay) {
        const terms = getSolarTerms(solarYear);
        // 12个节(偶数索引)及对应月份编号
        // 索引:  0=小寒, 2=立春, 4=惊蛰, 6=清明, 8=立夏, 10=芒种
        //       12=小暑, 14=立秋, 16=白露, 18=寒露, 20=立冬, 22=大雪
        const jieSets = [
            { termIdx: 0, monthNum: 12, usesPrevYear: true }, // 小寒 → 丑月
            { termIdx: 2, monthNum: 1, usesPrevYear: false }, // 立春 → 寅月
            { termIdx: 4, monthNum: 2, usesPrevYear: false }, // 惊蛰 → 卯月
            { termIdx: 6, monthNum: 3, usesPrevYear: false }, // 清明 → 辰月
            { termIdx: 8, monthNum: 4, usesPrevYear: false }, // 立夏 → 巳月
            { termIdx: 10, monthNum: 5, usesPrevYear: false }, // 芒种 → 午月
            { termIdx: 12, monthNum: 6, usesPrevYear: false }, // 小暑 → 未月
            { termIdx: 14, monthNum: 7, usesPrevYear: false }, // 立秋 → 申月
            { termIdx: 16, monthNum: 8, usesPrevYear: false }, // 白露 → 酉月
            { termIdx: 18, monthNum: 9, usesPrevYear: false }, // 寒露 → 戌月
            { termIdx: 20, monthNum: 10, usesPrevYear: false }, // 立冬 → 亥月
            { termIdx: 22, monthNum: 11, usesPrevYear: false }, // 大雪 → 子月
        ];

        // 默认: 小寒之前属于上年大雪后的子月(11), 干支年为上一年
        let monthNum = 11;
        let ganzhiYear = solarYear - 1;

        for (const jie of jieSets) {
            const term = terms[jie.termIdx];
            if (solarMonth > term.month || (solarMonth === term.month && solarDay >= term.day)) {
                monthNum = jie.monthNum;
                ganzhiYear = jie.usesPrevYear ? solarYear - 1 : solarYear;
            }
        }

        return { monthNum, ganzhiYear };
    }

    /**
     * 天干地支 — 月柱 (以节气为界换月, 五虎遁公式)
     */
    function monthGanZhi(solarYear, solarMonth, solarDay) {
        const info = getGanZhiMonthInfo(solarYear, solarMonth, solarDay);
        let yearGanIdx = (info.ganzhiYear - 4) % 10;
        if (yearGanIdx < 0) yearGanIdx += 10;
        // 月干 = (年干*2 + 月数 + 1) % 10
        let monthGanIdx = (yearGanIdx * 2 + info.monthNum + 1) % 10;
        // 月支: 寅=月1, 卯=月2, ..., 子=月11, 丑=月12
        let monthZhiIdx = (info.monthNum + 1) % 12;
        return tianGan[monthGanIdx] + diZhi[monthZhiIdx];
    }

    /**
     * 天干地支 — 日柱
     */
    function dayGanZhi(year, month, day) {
        // 日柱计算: 以1900年1月1日为甲戌日 (index=10)
        let baseDate = new Date(1900, 0, 0);
        let curDate = new Date(year, month - 1, day);
        let offset = Math.floor((curDate - baseDate) / 86400000);
        let ganZhiIdx = (offset + 10) % 60;
        if (ganZhiIdx < 0) ganZhiIdx += 60;
        let ganIdx = ganZhiIdx % 10;
        let zhiIdx = ganZhiIdx % 12;
        return {
            text: tianGan[ganIdx] + diZhi[zhiIdx],
            ganIdx,
            zhiIdx,
            idx60: ganZhiIdx
        };
    }

    /**
     * 生肖 (以立春为界)
     */
    function zodiac(solarYear, solarMonth, solarDay) {
        const ganzhiYear = getGanZhiYear(solarYear, solarMonth, solarDay);
        let idx = (ganzhiYear - 4) % 12;
        if (idx < 0) idx += 12;
        return {
            name: shengXiao[idx],
            emoji: shengXiaoEmoji[idx]
        };
    }

    /**
     * 星座
     */
    function constellation(month, day) {
        for (const c of constellations) {
            const afterStart = (month > c.start[0]) || (month === c.start[0] && day >= c.start[1]);
            const beforeEnd = (month < c.end[0]) || (month === c.end[0] && day <= c.end[1]);
            if (afterStart && beforeEnd) {
                return { name: c.name, emoji: c.emoji };
            }
        }
        return { name: '摩羯座', emoji: '♑' };
    }

    /**
     * 节气计算 — 使用寿星公式 C 常数法
     * date = floor(Y * D + C) - L
     * Y=年份后两位, D=0.2422, C=世纪常数, L=闰年修正
     */
    function getSolarTerms(year) {
        const Y = year % 100;
        const century = Math.floor(year / 100) + 1;
        const D = 0.2422;

        // 21世纪 C 常数 (索引对应 solarTermNames)
        const C21 = [
            5.4055, 20.12,    // 小寒, 大寒
            3.87, 18.73,      // 立春, 雨水
            5.63, 20.646,     // 惊蛰, 春分
            4.81, 20.1,       // 清明, 谷雨
            5.52, 21.04,      // 立夏, 小满
            5.678, 21.37,     // 芒种, 夏至
            7.108, 22.83,     // 小暑, 大暑
            7.5, 23.13,       // 立秋, 处暑
            7.646, 23.042,    // 白露, 秋分
            8.318, 23.438,    // 寒露, 霜降
            7.438, 22.36,     // 立冬, 小雪
            7.18, 21.94       // 大雪, 冬至
        ];
        // 20世纪 C 常数
        const C20 = [
            6.11, 20.84,
            4.15, 19.04,
            6.11, 20.84,
            5.59, 20.888,
            6.318, 21.86,
            6.5, 22.2,
            7.928, 23.65,
            8.35, 23.95,
            8.44, 23.822,
            9.098, 24.218,
            8.218, 23.08,
            7.9, 22.6
        ];

        const Carr = (century === 21) ? C21 : C20;
        // 闰年修正
        const L = (century === 21)
            ? Math.floor((Y > 0 ? Y - 1 : 0) / 4)
            : Math.floor(Y / 4);

        const terms = [];
        for (let i = 0; i < 24; i++) {
            const month = Math.floor(i / 2) + 1;
            const C = Carr[i];
            let d = Math.floor(Y * D + C) - L;
            // 特殊修正 (已知的个别年份异常)
            // 2026年小寒实际为1月6日
            if (year === 2026 && i === 0) d = 6;
            terms.push({
                name: solarTermNames[i],
                month: month,
                day: d
            });
        }
        return terms;
    }

    /**
     * 检查某天是否是节气，返回节气名或null
     */
    function getSolarTermForDate(year, month, day) {
        const terms = getSolarTerms(year);
        for (const t of terms) {
            if (t.month === month && t.day === day) {
                return t.name;
            }
        }
        return null;
    }

    /**
     * 纳音五行 (基于日柱60甲子)
     */
    function getNaYin(idx60) {
        return naYin[idx60] || '—';
    }

    /**
     * 农历节日
     */
    function getLunarFestival(lunarMonth, lunarDay) {
        const festivals = {
            '1-1': '春节',
            '1-15': '元宵节',
            '2-2': '龙抬头',
            '5-5': '端午节',
            '7-7': '七夕',
            '7-15': '中元节',
            '8-15': '中秋节',
            '9-9': '重阳节',
            '12-8': '腊八节',
            '12-30': '除夕',
        };
        return festivals[`${lunarMonth}-${lunarDay}`] || null;
    }

    /**
     * 公历节日
     */
    function getSolarFestival(month, day) {
        const festivals = {
            '1-1': '元旦',
            '2-14': '情人节',
            '3-8': '妇女节',
            '3-12': '植树节',
            '4-1': '愚人节',
            '5-1': '劳动节',
            '5-4': '青年节',
            '6-1': '儿童节',
            '7-1': '建党节',
            '8-1': '建军节',
            '9-10': '教师节',
            '10-1': '国庆节',
            '12-25': '圣诞节',
        };
        return festivals[`${month}-${day}`] || null;
    }

    /**
     * 获取农历日期的显示文字 (初一显示月份)
     */
    function lunarDayText(lunarMonth, lunarDay, isLeap) {
        if (lunarDay === 1) {
            return (isLeap ? '闰' : '') + lunarMonths[lunarMonth - 1] + '月';
        }
        return lunarDays[lunarDay - 1];
    }

    /**
     * 综合获取某天所有农历信息
     */
    function getDateInfo(year, month, day) {
        const lunar = solarToLunar(year, month, day);
        if (!lunar) return null;

        // 干支年柱/月柱: 以公历+立春/节气为界
        const gz_year = yearGanZhi(year, month, day);
        const gz_month = monthGanZhi(year, month, day);
        const gz_day = dayGanZhi(year, month, day);
        const zod = zodiac(year, month, day);
        const cons = constellation(month, day);
        const term = getSolarTermForDate(year, month, day);
        const ny = getNaYin(gz_day.idx60);
        const lunarFes = getLunarFestival(lunar.month, lunar.day);
        const solarFes = getSolarFestival(month, day);

        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const dateObj = new Date(year, month - 1, day);

        return {
            // 公历
            solar: { year, month, day, weekday: weekdays[dateObj.getDay()], dayOfWeek: dateObj.getDay() },
            // 农历
            lunar: {
                year: lunar.year,
                month: lunar.month,
                day: lunar.day,
                isLeap: lunar.isLeap,
                monthText: (lunar.isLeap ? '闰' : '') + lunarMonths[lunar.month - 1] + '月',
                dayText: lunarDays[lunar.day - 1],
                displayText: lunarDayText(lunar.month, lunar.day, lunar.isLeap),
                fullText: gz_year + '年 ' + (lunar.isLeap ? '闰' : '') + lunarMonths[lunar.month - 1] + '月 ' + lunarDays[lunar.day - 1]
            },
            // 干支
            ganzhi: {
                year: gz_year,
                month: gz_month,
                day: gz_day.text,
                dayGanIdx: gz_day.ganIdx,
                dayZhiIdx: gz_day.zhiIdx,
                dayIdx60: gz_day.idx60,
                fullText: gz_year + '年 ' + gz_month + '月 ' + gz_day.text + '日'
            },
            // 生肖
            zodiac: zod,
            // 星座
            constellation: cons,
            // 节气
            solarTerm: term,
            // 纳音
            nayin: ny,
            // 节日
            lunarFestival: lunarFes,
            solarFestival: solarFes,
            festival: lunarFes || solarFes || null
        };
    }

    // Public API
    return {
        solarToLunar,
        yearGanZhi,
        monthGanZhi,
        dayGanZhi,
        getGanZhiYear,
        getGanZhiMonthInfo,
        zodiac,
        constellation,
        getSolarTerms,
        getSolarTermForDate,
        getNaYin,
        getLunarFestival,
        getSolarFestival,
        lunarDayText,
        getDateInfo,
        // Data references
        tianGan,
        diZhi,
        shengXiao,
        lunarMonths,
        lunarDays,
        naYin: naYin
    };
})();

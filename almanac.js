/**
 * almanac.js — 黄历宜忌推算
 * 基于日柱干支 + 建除十二直 + 九星吉日算法推算每日宜忌
 */

const Almanac = (() => {
    // ============ 建除十二直 ============
    const jianChu = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];

    // 十二直与月支的对应关系 (使用节气月)
    // 寅月建日为寅日, 卯月建日为卯日 ...
    // monthNum: 干支月编号 (1=寅月, 2=卯月, ..., 11=子月, 12=丑月)
    function getJianChuIdx(monthNum, dayZhiIdx) {
        // 月支index: 寅=2 for month 1, 卯=3 for month 2, ...
        const monthZhiIdx = (monthNum + 1) % 12;
        let idx = (dayZhiIdx - monthZhiIdx + 12) % 12;
        return idx;
    }

    function getJianChu(monthNum, dayZhiIdx) {
        const idx = getJianChuIdx(monthNum, dayZhiIdx);
        return {
            name: jianChu[idx],
            idx: idx
        };
    }

    // ============ 宜忌事项 ============
    const allYiItems = [
        '祭祀', '祈福', '求嗣', '开光', '出行', '解除', '动土',
        '起基', '安床', '开市', '交易', '立券', '挂匾', '栽种',
        '入宅', '移徙', '安门', '修造', '开仓', '纳财', '纳畜',
        '牧养', '安葬', '破土', '启钻', '入殓', '除服', '成服',
        '嫁娶', '纳采', '问名', '冠笄', '会亲友', '进人口',
        '裁衣', '经络', '竖柱', '上梁', '掘井', '合寿木',
        '沐浴', '扫舍', '塞穴', '整手足甲', '求医', '词讼',
        '习艺', '订盟', '酝酿', '捕捉', '畋猎', '结网'
    ];

    const allJiItems = [
        '嫁娶', '开市', '出行', '安葬', '动土', '破土',
        '修造', '入宅', '移徙', '安床', '开仓', '纳财',
        '祭祀', '祈福', '栽种', '词讼', '上梁', '竖柱',
        '安门', '挂匾', '纳畜', '伐木', '作灶', '造船',
        '掘井', '开渠', '开池', '造桥', '起基', '探病',
        '针灸', '求医', '行丧', '开光', '合寿木'
    ];

    // ============ 基于建除十二直的宜忌规则 ============
    const jianChuRules = {
        '建': {
            yi: ['出行', '上任', '会亲友', '订盟', '求医'],
            ji: ['动土', '开仓', '嫁娶', '安葬']
        },
        '除': {
            yi: ['祭祀', '祈福', '沐浴', '解除', '求医', '扫舍'],
            ji: ['嫁娶', '出行', '安葬', '动土', '开市']
        },
        '满': {
            yi: ['祭祀', '祈福', '开市', '纳财', '纳畜', '安葬'],
            ji: ['栽种', '出行', '动土', '移徙']
        },
        '平': {
            yi: ['修造', '安床', '嫁娶', '纳采', '裁衣', '栽种'],
            ji: ['祈福', '出行', '安葬', '开市']
        },
        '定': {
            yi: ['祭祀', '祈福', '嫁娶', '纳采', '入宅', '安床', '开市', '交易'],
            ji: ['词讼', '出行', '安葬', '动土']
        },
        '执': {
            yi: ['祭祀', '捕捉', '畋猎', '结网', '纳畜', '牧养'],
            ji: ['嫁娶', '出行', '开市', '移徙', '安葬']
        },
        '破': {
            yi: ['求医', '破屋', '坏垣'],
            ji: ['嫁娶', '出行', '开市', '安葬', '祭祀', '祈福', '动土']
        },
        '危': {
            yi: ['祭祀', '祈福', '安床', '纳畜', '入宅', '安葬'],
            ji: ['出行', '动土', '修造', '开市', '嫁娶']
        },
        '成': {
            yi: ['祭祀', '祈福', '嫁娶', '开市', '纳财', '入宅', '修造', '安床', '动土', '竖柱', '上梁', '栽种', '安葬'],
            ji: ['词讼', '开仓']
        },
        '收': {
            yi: ['纳财', '纳畜', '捕捉', '畋猎', '裁衣', '交易', '立券'],
            ji: ['嫁娶', '安葬', '出行', '动土', '修造']
        },
        '开': {
            yi: ['祭祀', '出行', '嫁娶', '开市', '交易', '修造', '动土', '安床', '移徙'],
            ji: ['安葬', '破土', '词讼']
        },
        '闭': {
            yi: ['安葬', '破土', '筑堤', '修造', '安床', '合寿木', '塞穴'],
            ji: ['嫁娶', '出行', '开市', '祭祀', '祈福', '开光']
        }
    };

    // ============ 天干附加宜忌 ============
    function getGanBonus(ganIdx) {
        // 根据天干增减宜忌
        const bonusYi = [];
        const bonusJi = [];
        switch (ganIdx) {
            case 0: case 2: // 甲丙 — 阳刚
                bonusYi.push('出行', '会亲友', '开光');
                break;
            case 1: case 3: // 乙丁 — 阴柔
                bonusYi.push('裁衣', '纳采', '嫁娶');
                break;
            case 4: case 5: // 戊己 — 土
                bonusYi.push('动土', '栽种', '牧养');
                bonusJi.push('开市');
                break;
            case 6: case 7: // 庚辛 — 金
                bonusYi.push('交易', '纳财', '立券');
                break;
            case 8: case 9: // 壬癸 — 水
                bonusYi.push('沐浴', '求医', '扫舍');
                bonusJi.push('动土');
                break;
        }
        return { yi: bonusYi, ji: bonusJi };
    }

    // ============ 冲煞 ============
    const chongMap = ['马', '羊', '猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇'];
    const shaMap = ['北', '东', '南', '西'];

    function getChongSha(dayZhiIdx) {
        const chongIdx = (dayZhiIdx + 6) % 12;
        const shaIdx = dayZhiIdx % 4;
        return {
            chong: '冲' + chongMap[chongIdx],
            sha: '煞' + shaMap[shaIdx],
            text: '冲' + chongMap[chongIdx] + ' 煞' + shaMap[shaIdx]
        };
    }

    // ============ 五行 (天干对应) ============
    const ganWuxing = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];

    function getWuxing(ganIdx) {
        return ganWuxing[ganIdx];
    }

    // ============ 彭祖百忌 ============
    const pengzuGan = [
        '甲不开仓财物耗散', '乙不栽植千株不长',
        '丙不修灶必见灾殃', '丁不剃头头必生疮',
        '戊不受田田主不祥', '己不破券二比并亡',
        '庚不经络织机虚张', '辛不合酱主人不尝',
        '壬不泱水更难提防', '癸不词讼理弱敌强'
    ];
    const pengzuZhi = [
        '子不问卜自惹祸殃', '丑不冠带主不还乡',
        '寅不祭祀神鬼不尝', '卯不穿井水泉不香',
        '辰不哭泣必主重丧', '巳不远行财物伏藏',
        '午不苫盖屋主更张', '未不服药毒气入肠',
        '申不安床鬼祟入房', '酉不宴客醉坐颠狂',
        '戌不吃犬作怪上床', '亥不嫁娶不利新郎'
    ];

    function getPengzu(ganIdx, zhiIdx) {
        return pengzuGan[ganIdx] + '　' + pengzuZhi[zhiIdx];
    }

    // ============ 吉神凶煞 ============
    const jiShenPool = [
        '天德', '月德', '天恩', '母仓', '四相', '时德', '民日',
        '三合', '天喜', '天医', '阳德', '天仓', '生气', '益后',
        '金匮', '金堂', '玉宇', '五富', '福生', '青龙', '明堂'
    ];

    const xiongShenPool = [
        '天刑', '朱雀', '白虎', '天牢', '玄武', '勾陈',
        '月煞', '月虚', '月害', '血忌', '天吏', '五虚',
        '土符', '归忌', '血支', '天贼', '五离', '游祸',
        '四废', '四穷', '五墓', '复日', '重日'
    ];

    function getJiShen(dayIdx60) {
        // 使用确定性算法基于日柱选择吉神
        const seed = dayIdx60 * 7 + 3;
        const count = 2 + (dayIdx60 % 4);
        const result = [];
        for (let i = 0; i < count && i < jiShenPool.length; i++) {
            const idx = (seed + i * 3) % jiShenPool.length;
            if (!result.includes(jiShenPool[idx])) {
                result.push(jiShenPool[idx]);
            }
        }
        return result;
    }

    function getXiongShen(dayIdx60) {
        const seed = dayIdx60 * 11 + 5;
        const count = 2 + (dayIdx60 % 3);
        const result = [];
        for (let i = 0; i < count && i < xiongShenPool.length; i++) {
            const idx = (seed + i * 5) % xiongShenPool.length;
            if (!result.includes(xiongShenPool[idx])) {
                result.push(xiongShenPool[idx]);
            }
        }
        return result;
    }

    // ============ 时辰吉凶 ============
    const shiChenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const shiChenTimes = [
        '23:00-01:00', '01:00-03:00', '03:00-05:00', '05:00-07:00',
        '07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00',
        '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'
    ];

    function getShiChen(dayIdx60) {
        const result = [];
        for (let i = 0; i < 12; i++) {
            // 基于日柱和时辰计算吉凶
            const val = (dayIdx60 + i * 7) % 12;
            const isJi = val < 6; // 简化判定
            result.push({
                name: shiChenNames[i] + '时',
                time: shiChenTimes[i],
                isJi: isJi,
                status: isJi ? '吉' : '凶'
            });
        }
        return result;
    }

    // ============ 九星吉日算法 ============
    // 九星名称
    const nineStarNames = ['妖星', '惑星', '禾刀', '煞贡', '直星', '卜木', '角己', '人专', '立早'];

    /**
     * 获取九星信息
     * dayIdx60: 60甲子日序号 (0-59, 甲子=0)
     * monthNum: 干支月编号 (1=寅月, ..., 12=丑月)
     * 返回: { starName, isAuspicious }
     */
    function getNineStarInfo(dayIdx60, monthNum) {
        // 日序号: 甲子=1 (从1开始)
        const daySeq = dayIdx60 + 1;
        // 余数: (daySeq - 1) % 9, 余0代表第9列
        const remainder = (daySeq - 1) % 9;

        // 判断月份属于哪个组
        // 孟月: 寅(1), 巳(4), 申(7), 亥(10)
        // 仲月: 卯(2), 午(5), 酉(8), 子(11)
        // 季月: 辰(3), 未(6), 戌(9), 丑(12)
        const monthGroup = ((monthNum - 1) % 3); // 0=孟, 1=仲, 2=季

        // 各组吉日余数
        const auspiciousRemainders = [
            [3, 4, 7],  // 孟月: 余数3=煞贡, 4=直星, 7=人专
            [2, 3, 6],  // 仲月: 余数2=煞贡, 3=直星, 6=人专
            [1, 2, 5],  // 季月: 余数1=煞贡, 2=直星, 5=人专
        ];

        // 各组九星起始偏移 (孟月从妖星起, 仲月从惑星起, 季月从禾刀起)
        const starOffsets = [0, 1, 2];
        const starIdx = (remainder + starOffsets[monthGroup]) % 9;
        const starName = nineStarNames[starIdx];

        const isAuspicious = auspiciousRemainders[monthGroup].includes(remainder);

        // 吉星类型
        let auspiciousType = null;
        if (isAuspicious) {
            const luckyRemainders = auspiciousRemainders[monthGroup];
            const idx = luckyRemainders.indexOf(remainder);
            auspiciousType = ['煞贡', '直星', '人专'][idx];
        }

        return {
            starName,
            isAuspicious,
            auspiciousType,
            monthGroup: ['孟月', '仲月', '季月'][monthGroup]
        };
    }

    /**
     * 金神七煞日判定 (年禁忌)
     * yearGanIdx: 干支年的天干index (0=甲, ..., 9=癸)
     * dayZhiIdx: 日支index (0=子, ..., 11=亥)
     * 返回: true = 犯金神七煞, 需排除
     */
    function isJinShenQiSha(yearGanIdx, dayZhiIdx) {
        // 甲/己年(0,5): 排除午(6)、未(7)
        // 乙/庚年(1,6): 排除辰(4)、巳(5)
        // 丙/辛年(2,7): 排除子(0)、丑(1)、寅(2)、卯(3)
        // 丁/壬年(3,8): 排除戌(10)、亥(11)
        // 戊/癸年(4,9): 排除申(8)、酉(9)
        const rules = {
            0: [6, 7], 5: [6, 7],       // 甲/己
            1: [4, 5], 6: [4, 5],       // 乙/庚
            2: [0, 1, 2, 3], 7: [0, 1, 2, 3],  // 丙/辛
            3: [10, 11], 8: [10, 11],   // 丁/壬
            4: [8, 9], 9: [8, 9],       // 戊/癸
        };
        return (rules[yearGanIdx] || []).includes(dayZhiIdx);
    }

    /**
     * 红煞日判定 (月禁忌)
     * monthNum: 干支月编号 (1-12)
     * dayZhiIdx: 日支index
     * 返回: true = 犯红煞, 需排除
     */
    function isHongSha(monthNum, dayZhiIdx) {
        const monthGroup = (monthNum - 1) % 3; // 0=孟, 1=仲, 2=季
        // 孟月(0): 排除酉(9)
        // 仲月(1): 排除巳(5)
        // 季月(2): 排除丑(1)
        const hongShaZhi = [9, 5, 1];
        return dayZhiIdx === hongShaZhi[monthGroup];
    }

    /**
     * 大偷修日判定 (修造专用吉日)
     * dayIdx60: 60甲子日序号 (0-59)
     * 返回: true = 大偷修日
     */
    function isDaTouXiu(dayIdx60) {
        // 壬子(48), 癸丑(49), 丙辰(52), 丁巳(53),
        // 戊午(54), 己未(55), 庚申(56), 辛酉(57)
        const daTouXiuDays = [48, 49, 52, 53, 54, 55, 56, 57];
        return daTouXiuDays.includes(dayIdx60);
    }

    /**
     * 综合择吉判定
     * 返回完整的吉日信息对象
     */
    function getAuspiciousDay(dayIdx60, dayZhiIdx, yearGanIdx, monthNum) {
        const nineStar = getNineStarInfo(dayIdx60, monthNum);
        const jinShen = isJinShenQiSha(yearGanIdx, dayZhiIdx);
        const hongSha = isHongSha(monthNum, dayZhiIdx);
        const daTouXiu = isDaTouXiu(dayIdx60);

        // 最终判定: 九星吉日 且 不犯金神七煞 且 不犯红煞
        const isLucky = nineStar.isAuspicious && !jinShen && !hongSha;

        // 状态描述
        let status, reason;
        if (!nineStar.isAuspicious) {
            status = '凶';
            reason = '九星属' + nineStar.starName + '（凶星）';
        } else if (jinShen) {
            status = '凶';
            reason = '九星属' + nineStar.auspiciousType + '（吉），但犯金神七煞';
        } else if (hongSha) {
            status = '凶';
            reason = '九星属' + nineStar.auspiciousType + '（吉），但犯红煞日';
        } else {
            status = '吉';
            reason = '九星属' + nineStar.auspiciousType + '（吉星）';
        }

        return {
            isLucky,
            status,
            reason,
            nineStar,
            jinShen,
            hongSha,
            daTouXiu
        };
    }

    // ============ 黄道吉日算法 (青龙起例) ============
    // 十二星神固定顺序
    const twelveGods = [
        { name: '青龙', type: '黄道', status: '吉' },
        { name: '明堂', type: '黄道', status: '吉' },
        { name: '天刑', type: '黑道', status: '凶' },
        { name: '朱雀', type: '黑道', status: '凶' },
        { name: '金匠', type: '黄道', status: '吉' },
        { name: '天德', type: '黄道', status: '吉' },
        { name: '白虎', type: '黑道', status: '凶' },
        { name: '玉堂', type: '黄道', status: '吉' },
        { name: '天牢', type: '黑道', status: '凶' },
        { name: '玄武', type: '黑道', status: '凶' },
        { name: '司命', type: '黄道', status: '吉' },
        { name: '勾陈', type: '黑道', status: '凶' }
    ];

    /**
     * 获取黄道吉日信息
     * monthNum: 干支月编号 (1=寅月, ..., 12=丑月)
     * dayZhiIdx: 日支index (0=子, ..., 11=亥)
     * 返回: { godName, godType, isHuangDao }
     */
    function getHuangDaoInfo(monthNum, dayZhiIdx) {
        // 每月青龙起始地支
        // 寅(1)/申(7)→子(0), 卯(2)/酉(8)→寅(2), 辰(3)/戌(9)→辰(4)
        // 巳(4)/亥(10)→午(6), 午(5)/子(11)→申(8), 未(6)/丑(12)→戌(10)
        const startZhi = ((monthNum - 1) % 6) * 2;

        // 计算当日对应的星神索引
        const godIdx = (dayZhiIdx - startZhi + 12) % 12;
        const god = twelveGods[godIdx];

        return {
            godName: god.name,
            godType: god.type,
            isHuangDao: god.type === '黄道',
            status: god.status
        };
    }

    // ============ 综合择吉评估 ============
    /**
     * 综合三套系统: 黄道 + 建除 + 九星
     * 返回综合评分和建议
     */
    function getComprehensiveAssessment(huangdao, jianChuName, auspicious) {
        let score = 0;
        const factors = [];

        // 黄道: +2, 黑道: -1
        if (huangdao.isHuangDao) {
            score += 2;
            factors.push('黄道' + huangdao.godName + '主吉');
        } else {
            score -= 1;
            factors.push('黑道' + huangdao.godName + '主凶');
        }

        // 建除十二直: 成/开/定 = +2, 满/除/执 = +1, 危 = 0, 建/平/收 = -1, 破/闭 = -2
        const jcScores = {
            '成': 2, '开': 2, '定': 2,
            '满': 1, '除': 1, '执': 1,
            '危': 0, '建': 0,
            '平': -1, '收': -1,
            '破': -2, '闭': -2
        };
        const jcScore = jcScores[jianChuName] || 0;
        score += jcScore;
        if (jcScore >= 2) {
            factors.push('十二直属「' + jianChuName + '」（大吉）');
        } else if (jcScore >= 1) {
            factors.push('十二直属「' + jianChuName + '」（小吉）');
        } else if (jcScore >= 0) {
            factors.push('十二直属「' + jianChuName + '」（中平）');
        } else {
            factors.push('十二直属「' + jianChuName + '」（不吉）');
        }

        // 九星: 吉星 +2, 凶星 0, 犯金神七煞/红煞 -3
        if (auspicious.isLucky) {
            score += 2;
            factors.push('九星属' + auspicious.nineStar.auspiciousType + '（吉星加持）');
        } else if (auspicious.jinShen) {
            score -= 3;
            factors.push('犯金神七煞（大凶）');
        } else if (auspicious.hongSha) {
            score -= 3;
            factors.push('犯红煞日（大凶）');
        } else {
            factors.push('九星属' + auspicious.nineStar.starName + '（凶星）');
        }

        // 综合判定
        let level, label, advice;
        if (score >= 5) {
            level = 'great';
            label = '上上吉';
            advice = '三系统均吉，诸事皆宜，大事可行。';
        } else if (score >= 3) {
            level = 'good';
            label = '上吉';
            advice = '多数吉象，宜办大事。';
        } else if (score >= 1) {
            level = 'ok';
            label = '小吉';
            advice = '小事可用，大事需斟酌。';
        } else if (score >= -1) {
            level = 'neutral';
            label = '中平';
            advice = '无大吉大凶，平常事可办。';
        } else if (score >= -3) {
            level = 'bad';
            label = '不吉';
            advice = '不宜办大事，宜静守。';
        } else {
            level = 'terrible';
            label = '大凶';
            advice = '诸事不宜，必须避开。';
        }

        return {
            score,
            level,
            label,
            advice,
            factors
        };
    }

    // ============ 综合推算今日黄历 ============
    function getDayAlmanac(dateInfo) {
        if (!dateInfo) return null;

        const { ganzhi, lunar, solar } = dateInfo;

        // 获取节气月编号 (用于建除和九星)
        const ganzhiMonthInfo = Lunar.getGanZhiMonthInfo
            ? Lunar.getGanZhiMonthInfo(solar.year, solar.month, solar.day)
            : null;
        const monthNum = ganzhiMonthInfo ? ganzhiMonthInfo.monthNum : lunar.month;

        // 建除十二直 (使用节气月)
        const jc = getJianChu(monthNum, ganzhi.dayZhiIdx);
        const rules = jianChuRules[jc.name] || { yi: [], ji: [] };
        const ganBonus = getGanBonus(ganzhi.dayGanIdx);

        // 合并宜
        let yiSet = new Set([...rules.yi, ...ganBonus.yi]);
        // 合并忌
        let jiSet = new Set([...rules.ji, ...ganBonus.ji]);

        // 去除冲突项 (同时出现在宜和忌中时, 看建除优先)
        for (const item of jiSet) {
            if (yiSet.has(item) && rules.ji.includes(item)) {
                yiSet.delete(item);
            }
        }
        for (const item of yiSet) {
            if (jiSet.has(item) && rules.yi.includes(item)) {
                jiSet.delete(item);
            }
        }

        const chongSha = getChongSha(ganzhi.dayZhiIdx);
        const wuxing = getWuxing(ganzhi.dayGanIdx);
        const pengzu = getPengzu(ganzhi.dayGanIdx, ganzhi.dayZhiIdx);
        const jiShen = getJiShen(ganzhi.dayIdx60);
        const xiongShen = getXiongShen(ganzhi.dayIdx60);
        const shiChen = getShiChen(ganzhi.dayIdx60);

        // 九星吉日
        const yearGanIdx = ganzhiMonthInfo
            ? (ganzhiMonthInfo.ganzhiYear - 4) % 10
            : ganzhi.dayGanIdx;
        const auspicious = getAuspiciousDay(
            ganzhi.dayIdx60, ganzhi.dayZhiIdx,
            yearGanIdx < 0 ? yearGanIdx + 10 : yearGanIdx,
            monthNum
        );

        // 黄道吉日
        const huangdao = getHuangDaoInfo(monthNum, ganzhi.dayZhiIdx);

        // 综合评估
        const comprehensive = getComprehensiveAssessment(huangdao, jc.name, auspicious);

        return {
            jianChu: jc.name,
            yi: Array.from(yiSet),
            ji: Array.from(jiSet),
            chongSha,
            wuxing,
            pengzu,
            jiShen,
            xiongShen,
            shiChen,
            auspicious,
            huangdao,
            comprehensive
        };
    }

    return {
        getJianChu,
        getChongSha,
        getWuxing,
        getPengzu,
        getJiShen,
        getXiongShen,
        getShiChen,
        getDayAlmanac,
        getAuspiciousDay,
        getNineStarInfo,
        getHuangDaoInfo,
        jianChu
    };
})();

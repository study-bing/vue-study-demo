// 通用图表option选项
export const normalOption = {
    tooltip: {
        trigger: 'axis',
    },
    xAxis: {
        type: 'time',
        axisLabel: {
            formatter: {
                year: '{yyyy}年',
                month: '{M}月',
                day: '{d}日',
                hour: '{HH}:{mm}',
                minute: '{HH}:{mm}',
                second: '{HH}:{mm}:{ss}',
            },
        },
    },
    yAxis: {
        type: 'value',
        boundaryGap: [0, '5%'],
    },
    dataZoom: {
        type: 'inside',
    },
    grid: {
        top: '20%',
        left: '5%',
        right: '5%',
        bottom: '12%',
        containLabel: true,
    },
}
// 地下水图表option选项
export const dxOption = {
    grid: {
        top: '5%',
        left: '5%',
        right: '5%',
        bottom: 24,
        containLabel: true,
    },
    dataZoom: {
        type: 'inside',
    },
    tooltip: {
        trigger: 'axis',
    },
    xAxis: {
        type: 'time',
        axisLabel: {
            formatter: {
                year: '{yyyy}年',
                month: '{M}月',
                day: '{d}日',
                hour: '{HH}:{mm}',
                minute: '{HH}:{mm}',
                second: '{HH}:{mm}:{ss}',
            },
        },
    },
    yAxis: {
        type: 'value',
        boundaryGap: [0, '5%'],
    },
}
// 非常非常多的颜色
export const manyColors = [
    '#F56D6D',
    '#F5876D',
    '#F5A76D',
    '#C4E581',
    '#81E5C1',
    '#81D3E5',
    '#8191E5',
    '#9B81E5',
    '#D181E5',
    '#E581B7',
    '#FA7676',
    '#FA7684',
    '#FAAD76',
    '#B8DC4D',
    '#4DDCA9',
    '#4DCBDC',
    '#4D86DC',
    '#7582FA',
    '#AF75FA',
    '#F775FA',
    '#EF4D4D',
    '#E27046',
    '#E2A446',
    '#A8CF5D',
    '#5DCF9F',
    '#5DB4CF',
    '#5D98CF',
    '#5D7DCF',
    '#815DCF',
    '#CF5DB6',
    '#FE8686',
    '#EB5778',
    '#EBC257',
    '#6AD24F',
    '#70EBB0',
    '#70C6EB',
    '#7092EB',
    '#707CEB',
    '#C370EB',
    '#EB70DE',
    '#EB7676',
    '#EB9576',
    '#EBDF76',
    '#5BC862',
    '#5BC8B4',
    '#5BB4C8',
    '#6D99DB',
    '#5B73C8',
    '#BA6FDD',
    '#DD6FB1',
    '#FA7676',
    '#DE615A',
    '#DED15A',
    '#69C897',
    '#69C8C2',
    '#69A6C8',
    '#6989C8',
    '#B88FEC',
    '#D48FEC',
    '#EC8FC7',
    '#F15E5E',
    '#DF5B6F',
    '#FED97B',
    '#6CC558',
    '#58C5B1',
    '#73B1DD',
    '#7283DA',
    '#AA83EA',
    '#EA83E6',
    '#EA83C0',
    '#E08080',
    '#E08084',
    '#E4E843',
    '#66DDA3',
    '#66DDC8',
    '#66B9DD',
    '#6696DD',
    '#A171F1',
    '#D771F1',
    '#F171D5',
    '#F66161',
    '#E35A63',
    '#E3C55A',
    '#B1E0C8',
    '#B1E0D5',
    '#B1D8E0',
    '#BDB1E0',
    '#E5B2F6',
    '#F6B2EB',
    '#F6B2D7',
    '#FFA8A8',
    '#E8778B',
    '#FFE090',
    '#62CEA7',
    '#62BBCE',
    '#629ACE',
    '#878CEF',
    '#B47DEC',
    '#E37DEC',
    '#EC7DBF',
]
// 编成一个总数为num、范围（0-99）、随机且不重复的数组
export const colorIndexArr = (num) => {
    const arr = []
    for (let i = 0; i < num; i++) {
        const a = Math.trunc(Math.random() * 100)
        if (arr.includes(a)) {
            i--
        } else {
            arr.push(a)
        }
    }
    return arr
}

let calcBtn = document.querySelector('.extra-options__calc');
let table = document.querySelector('.rad-str');

//Авто-ввод для охвата населения газоснабжением + ограничения
let paramZ = document.querySelectorAll('.inputParamZ');
let paramY = document.querySelector('.inputParamY');

let oldParamZ = 0;
for (let i = 0; i < paramZ.length - 1; i++) {
    paramZ[i].addEventListener("input", () => {
        let sumZ = 0;

        if (paramZ[i].value > 100) {
            paramZ[i].value = 100;
        } else if (paramZ[i].value < 0) {
            paramZ[i].value = 0;
        }

        for (let j = 0; j < paramZ.length - 1; j++) {
            sumZ += Number(paramZ[j].value);

        }
        if (sumZ <= 100 && sumZ >= 0) {
            oldParamZ = paramZ[i].value

            paramZ[paramZ.length - 1].value = 100 - sumZ;
            paramY.value = sumZ;
        } else {
            paramZ[i].value = oldParamZ;
        }
    });
}
//Авто-ввод для состава топлива + ограничения
let paramGas = document.querySelectorAll('.inputGas');

let oldParamGas = 0;
for (let i = 0; i < paramGas.length; i++) {
    paramGas[i].addEventListener("input", () => {
        let sumZ = 0;

        if (paramGas[i].value > 100) {
            paramGas[i].value = 100;
        } else if (paramGas[i].value < 0) {
            paramGas[i].value = 0;
        }
    });
}
//Ограничения для поля с колличеством дней
let days = document.querySelector('.extra-options__day');

days.addEventListener("input", () => {
    if (days.value.length > 2) {
        days.value = Number(`${days.value[0]}` + `${days.value[1]}`);
    }
    if (days.value > 45) {
        days.value = 45;
    } else if (days.value < 1) {
        days.value = '';
    }
});
//Константы
let variables = {};
const ConstArr = {
    "Qk_tb": 17,
    "T_vn": 20,      "T_sro": -7,    "T_ro": -35,    "T_rv": -35,    "T_hl": 15,     "T_hz": 5,
    "F_n": 18,
    "Qn_CH4": 35.84, "Qn_C2H6": 63.78,
    "Q_k1": 4100,    "Q_k2": 10000,  "Q_k3": 1900,
    "Beta_sh": 1.13, "Q_sh": 30,     "Q_tn": 300,    "V_sh": .8,      "Eta_0": .85, 
    "Q_us": 30,
    "Z_p": 40,       "Q_p": 18800,   "Q_d": 2240,
    "Z_b": 40,       "Q_b": 50,
    "Z_s": 40,       "Q_s": 8.4,
    "Q_mp": 12400,
    "Q_gv": 1.47,    "N_0": 220,     "Beta_gvs": .8, 
    "K_1": .25,      "K_2": .4,      "Z": 16,        "Q_ov": .62,                   
    "Sigma": 557,    "G_075": 49.73,
    "n": [250, 350, 365, 280, 220, 350, 300, 260, 350, 220]                                        
}
//Константы для общих расчетных формул
let Q_tno = 0;
let Q_tv = 0;
let Q_tb = 0;
let F_zh = 0
let Qp_n = 0;

let result = {
    "Q": [],
    "V_year": [],
    "K": [],
    "V_hour": []
}
//Получение данных с таблицы "Исходные данные"
function getingData() {
    let getData = document.querySelectorAll('.itit-data__input');

    variables = {
        "Methane": Number(getData[0].value),
        "Ethan": Number(getData[1].value),
        "Nitrogen": Number(getData[2].value),
        "N": Number(getData[3].value),
        "Z1": Number(getData[4].value),
        "Z2": Number(getData[5].value),
        "Z3": Number(getData[6].value),
        "Y": Number(getData[7].value)
    };
}
//Проверка введенных данных
function checkData() {
    let sum_gas = variables.Methane + variables.Ethan + variables.Nitrogen;
    if (sum_gas.toFixed(2) != 100) {
        alert("Сумма процентного соотношения состава топлива должна ровняться 100%");
        return false;
    }
    let sum_Z = variables.Z1 + variables.Z2 + variables.Z3
    if (sum_Z != 100) {
        alert("Сумма долей (Z) должна быть ровна 100");
        return false;
    }
    return true;
}
//Общие расчетные формулы
function calc_common_variables() {
    F_zh = roundResult(ConstArr.F_n * variables.N, 5, "rnd");
    Q_tno = roundResult(20 / .54 * (ConstArr.T_vn - ConstArr.T_sro), 5, "rnd");
    Q_tv = roundResult(.84 * F_zh * 1.25 * (ConstArr.T_vn - ConstArr.T_sro) / 10, 5, "rnd");
    Q_tb = roundResult(ConstArr.Qk_tb * F_zh / 10, 5, "rnd");
    Qp_n = roundResult(.01 * (ConstArr.Qn_CH4 * variables.Methane + ConstArr.Qn_C2H6 * variables.Ethan), 5, "rnd");
}
//Функции расчета годового расхода тепла
function calc_all_Q() {
    result.Q = [];
    result.Q.push(roundResult(variables.Y / 100 * variables.N * (ConstArr.Q_k1 * variables.Z1 / 100 + ConstArr.Q_k2 * variables.Z2 / 100 + ConstArr.Q_k3 * variables.Z3 / 100)));
    result.Q.push(roundResult(ConstArr.Beta_sh * variables.N / 100 * ConstArr.Q_sh * (Q_tno + Q_tv - (Q_tb + ConstArr.Q_tn) * ConstArr.V_sh * ConstArr.Eta_0)));
    result.Q.push(roundResult(ConstArr.Q_us * F_zh * (ConstArr.T_vn - ConstArr.T_sro))/10);
    result.Q.push(roundResult(100 * ConstArr.Z_p / 100 * variables.Y / 100 * variables.N / 100 * (ConstArr.Q_p + ConstArr.Q_d)));
    result.Q.push(roundResult(ConstArr.Z_b / 100 * variables.Y / 100 * variables.N * 52 * ConstArr.Q_b));
    result.Q.push(roundResult(360 * ConstArr.Z_s / 100 * variables.Y / 100 * variables.N * ConstArr.Q_s));
    result.Q.push(roundResult((12 * variables.Y / 100 * ConstArr.Q_mp) / 1000 * variables.N));
    result.Q.push(roundResult(.005 * result.Q[0]));
    result.Q.push(roundResult(24 * ConstArr.Q_gv * variables.N * (ConstArr.N_0 + (350 - ConstArr.N_0) * (60 - ConstArr.T_hl) / (60 - ConstArr.T_hz) * ConstArr.Beta_gvs) * (1 / ConstArr.Eta_0)));
    result.Q.push(roundResult((24 * (1 + ConstArr.K_1) * ((ConstArr.T_vn - ConstArr.T_sro) / (ConstArr.T_vn - ConstArr.T_ro)) + ConstArr.Z * ConstArr.K_1 * ConstArr.K_2 * ((ConstArr.T_vn - ConstArr.T_sro) / (ConstArr.T_vn - ConstArr.T_rv))) * (ConstArr.Q_ov * F_zh * ConstArr.N_0 / 2*ConstArr.Eta_0)));
}
//Функции расчета годового расхода газа
function calc_all_V_year() {
    result.V_year = [];
    for (let i = 0; i < result.Q.length; i++) {
        result.V_year.push(roundResult(result.Q[i] / Qp_n));
    }
}
//Функции расчета коэффицентов часового максимума
function calc_all_K() {
    result.K = [];
    for (let i = 0; i < 11; i++) {
        result.K.push(roundResult(1/(24 * ConstArr.n[i] * (ConstArr.T_vn - ConstArr.T_sro) / (ConstArr.T_vn - ConstArr.T_ro)), 6));
    }
}
//Функция вычисления расчетного расхода газа
function calc_all_V_hour() {
    result.V_hour = [];
    for (let i = 0; i < result.V_year.length; i++) {
        result.V_hour.push(roundResult(result.V_year[i] * result.K[i], 2));
    }
}
//Округление данных
function roundResult(numForRound, accuracy = 0, type = true) {
    let quantityZero = Math.pow(10, accuracy)
    if (type) {
        numForRound = Math.ceil(numForRound * quantityZero) / quantityZero;
    } else if ("rnd") {
        numForRound = Math.round(numForRound * quantityZero) / quantityZero;
    } else {
        numForRound = Math.floor(numForRound * quantityZero) / quantityZero;
    }
    return numForRound;
}
let rows = document.querySelectorAll('.output-data-row');
//Вывод данных о потребителях в таблицу "Выходные данные"
function updateOutputDataTable() {
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].childNodes[1].childNodes[1].checked) {
            rows[i].childNodes[5].innerHTML = Math.ceil(result.Q[i]);
            rows[i].childNodes[7].innerHTML = result.V_year[i];
            rows[i].childNodes[9].innerHTML = result.K[i];
            rows[i].childNodes[11].innerHTML = result.V_hour[i];

        } else {
            rows[i].childNodes[5].innerHTML = "-";
            rows[i].childNodes[7].innerHTML = "-";
            rows[i].childNodes[9].innerHTML = "-";
            rows[i].childNodes[11].innerHTML = "-";
        }
    }
}
//Вывод суммы в таблицу "Выходные данные"
let cells_sum = document.querySelectorAll('.cells-sum');

let sumResult = {
    "Q": 0,
    "V_year": 0,
    "V_hour": 0
}

function calc_sum_data() {
    sumResult.Q = 0
    sumResult.V_year = 0
    sumResult.V_hour = 0
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].childNodes[1].childNodes[1].checked) {
            sumResult.Q += Number(result.Q[i]);
            sumResult.V_year += Number(result.V_year[i]);
            sumResult.V_hour += Number(result.V_hour[i]);
        }
    }
    cells_sum[0].innerHTML = roundResult(sumResult.Q);
    cells_sum[1].innerHTML = roundResult(sumResult.V_year);
    cells_sum[2].innerHTML = "-";
    cells_sum[3].innerHTML = roundResult(sumResult.V_hour, 2);
}
//Расчет объема и количества криогенных резервуаров СПГ и времени автономного функционирования
let numOfTanks;

function calc_V_cryogenic_tanks() {
    let V_table_dataCells = document.querySelectorAll('.V-table__data-cells');
    let Talfa;
    let V_LNG
    let timeOperation;
    let allV;
    let allVh = 0;

    for (let i = 0; i < result.V_hour.length; i++) {allVh += result.V_hour[i];}
    allV = sumResult.V_hour / ConstArr.Sigma;
    Talfa = ConstArr.G_075 / allV;
    if (!days.value) {
        numOfTanks = 1;
        V_LNG = ConstArr.G_075;
        timeOperation = roundResult(Talfa, 1, false);
    } else {
        V_LNG = allV * days.value * 24;
        numOfTanks = roundResult(V_LNG / ConstArr.G_075);
        timeOperation = days.value * 24;
    }
    V_table_dataCells[0].innerHTML = roundResult(V_LNG, 2, false); 
    V_table_dataCells[1].innerHTML = numOfTanks;
    V_table_dataCells[2].innerHTML = roundResult(timeOperation, 1);
}
//Расчеты для графиков
let abscissaConsumers = [['Все потребители'],
                         ['Штаб,\nУзел связи\nКвартиры','\nГВС,\nОтопление и вентиляция'],
                         ['Штаб,\nКвартиры','\nУзел связи'],
                         'Штаб',
                         ['Текущие потребители']];
//График 1 (Время автономного функционирования при изменении потребителей) - отсутствие режима автономного функционирования
function calc_graf() {
    let dataForGraf = []
    let allConsumerV_hour = 0;

    for (let i = 0; i < result.V_hour.length; i++) {allConsumerV_hour += result.V_hour[i];}

    let allVh = [(allConsumerV_hour),
    (result.V_hour[0] + result.V_hour[1] + result.V_hour[2] + result.V_hour[8] + result.V_hour[9]),
    (result.V_hour[0] + result.V_hour[1] + result.V_hour[2]),
    (result.V_hour[1]),
    (sumResult.V_hour)]
    let allV = 0;
    let resultForGraf = 0;

    for (let i = 0; i < allVh.length; i++) {
        allV = allVh[i] / ConstArr.Sigma;
        resultForGraf = ConstArr.G_075 / allV
        dataForGraf.push(resultForGraf);
    }
    drowGraf('myChart', dataForGraf, abscissaConsumers, ['Время автономного функционирования', 'при изменении потребителей'], 'Потребители', 'Та, ч');
}
//График 2 (Время автономного функционирования при изменении количества резервуаров СПГ) - отсутствие режима автономного функционирования
function calc_graf2() {
    let dataForGraf = []
    let abscissa = ['1', '2', '3', '4', '5'];

    for (let i = 0; i < abscissa.length; i++) {
        resultForGraf = (i + 1) * ConstArr.G_075 / (sumResult.V_hour / ConstArr.Sigma)
        dataForGraf.push(resultForGraf);
    }
    drowGraf2('myChart2', dataForGraf, abscissa, ['Время автономного функционирования', 'при изменении количества резервуаров СПГ РЦВ-63/0.5'], 'Количество резервуаров', 'Та, ч');
}
//График 3 (Количество резервуаров СПГ для различных потребителей для поддержания заданного режима автономного функционирования) - режим автономного функционирования
function calc_graf3() {
    let dataForGraf = []
    let allVh = 0
    let allV = 0
    let resultForGraf = 0

    for (let i = 0; i < result.V_hour.length; i++) {allVh += result.V_hour[i];}

    //Все потребители
    allV = allVh / ConstArr.Sigma;
    resultForGraf = allV * days.value*24 / ConstArr.G_075;
    dataForGraf.push(Math.ceil(resultForGraf));
    //Штаб, Узел связи, Квартиры, ГВС, Отопление
    allVh = result.V_hour[0] + result.V_hour[1] + result.V_hour[2] + result.V_hour[8] + result.V_hour[9]
    allV = allVh / ConstArr.Sigma;
    resultForGraf = allV * days.value*24 / ConstArr.G_075;
    dataForGraf.push(Math.ceil(resultForGraf));
    //Штаб, Узел связи, Квартиры
    allVh = result.V_hour[0] + result.V_hour[1] + result.V_hour[2]
    allV = allVh / ConstArr.Sigma;
    resultForGraf = allV * days.value*24 / ConstArr.G_075;
    dataForGraf.push(Math.ceil(resultForGraf));
    //Штаб
    allVh = result.V_hour[1]
    allV = allVh / ConstArr.Sigma;
    resultForGraf = allV * days.value*24 / ConstArr.G_075;
    dataForGraf.push(Math.ceil(resultForGraf));
    //Текущие потребители
    allVh = sumResult.V_hour
    allV = allVh / ConstArr.Sigma;
    resultForGraf = allV * days.value*24 / ConstArr.G_075;
    dataForGraf.push(Math.ceil(resultForGraf));
    drowGraf2('myChart3', dataForGraf, abscissaConsumers, ['Количество резервуаров СПГ РЦВ-63/0.5 для различных', 'потребителей для поддержания заданного', 'режима автономного функционирования'], 'Потребители', 'Количество резервуаров');
}
//Кнопка "Расчитать"
function launch() {
    getingData();
    if (checkData()) {
        calc_common_variables();
        calc_all_Q();
        calc_all_V_year();
        calc_all_K();
        calc_all_V_hour();
        updateOutputDataTable();
        calc_sum_data();
        calc_V_cryogenic_tanks();

        let canvas = document.querySelectorAll('.canvas__wrapper');

        for (let i = 0; i < canvas.length; i++) {
            canvas[i].remove();
        }
        if (!days.value) {
            calc_graf()
            calc_graf2()
        } else {
            calc_graf3()
        }
    }
}
calcBtn.onclick = launch;
//Построение графиков
function drowGraf(nameCanvas, getdata, abscissa, title, xName, yName) {
    elsemForAppend = `<div class="canvas__wrapper"><canvas id="${nameCanvas}" class="canvas"></canvas></div>`;
    let canvasWrapper = document.querySelector('.canvas__big-wrapper');
    canvasWrapper.insertAdjacentHTML('beforeend', elsemForAppend);

    var ctx = document.getElementById(nameCanvas).getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: abscissa,
            datasets: [{
                label: yName,
                backgroundColor: '#7444e6',
                borderColor: '#7444e6',
                fill: false,
                data: getdata,
                tension: 0
            }]
        },
        options: {
            title: {
                display: true,
                text: title,
                fontColor: '#000'
            },
            legend: false,
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += Math.round(tooltipItem.yLabel * 10) / 10;
                        return label;
                    }
                },
                titleSpacing: 2,
                bodyFontSize: 12,
                caretSize: 3,
                yPadding: 5,
                xPadding: 5,
                intersect: false,
                displayColors: false
            },
            elements: {
                point: {
                    radius: 5
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yName,
                        fontColor: '#000',
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xName,
                        fontColor: '#000'

                    },
                }]
            }
        }
    });
}
function drowGraf2(nameCanvas, getdata, abscissa, title, xName, yName) {
    elsemForAppend = `<div class="canvas__wrapper"><canvas id="${nameCanvas}" class="canvas"></canvas></div>`;
    let canvasWrapper = document.querySelector('.canvas__big-wrapper');
    canvasWrapper.insertAdjacentHTML('beforeend', elsemForAppend);

    var ctx = document.getElementById(nameCanvas).getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: abscissa,
            datasets: [{
                label: yName,
                backgroundColor: '#7444e6',
                borderColor: '#7444e6',
                fill: false,
                data: getdata,
                tension: 0
            }]
        },
        options: {
            title: {
                display: true,
                text: title,
                fontColor: '#000'
            },
            legend: false,
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += Math.round(tooltipItem.yLabel * 10) / 10;
                        return label;
                    }
                },
                titleSpacing: 2,
                bodyFontSize: 12,
                caretSize: 3,
                yPadding: 5,
                xPadding: 5,
                intersect: false,
                displayColors: false
            },
            elements: {
                point: {
                    radius: 5
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yName,
                        fontColor: '#000',
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xName,
                        fontColor: '#000'

                    },
                }]
            }
        }
    });
}
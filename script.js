document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const display = document.getElementById('display');
    const themeToggle = document.getElementById('themeToggle');
    const loadingScreen = document.getElementById('loading-screen');
    let currentExpression = '';
    let memory = 0;

    // Loading screen logic
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
    }

    // Button functionality
    document.querySelectorAll('#calculator button').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent.trim();
            if (value !== 'Toggle Theme') {
                handleInput(value);
            }
        });
    });

    function handleInput(value) {
        switch (value) {
            case 'C':
                clear();
                break;
            case '±':
                toggleSign();
                break;
            case '%':
                addPercent();
                break;
            case '=':
                calculate();
                break;
            case 'MC':
                memory = 0;
                break;
            case 'MR':
                currentExpression += memory;
                break;
            case 'M+':
                memory += parseFloat(currentExpression) || 0;
                break;
            case 'M-':
                memory -= parseFloat(currentExpression) || 0;
                break;
            case 'DEL':
                deleteLastChar();
                break;
            case 'sin':
            case 'cos':
            case 'tan':
            case 'log':
            case 'ln':
            case '√':
                currentExpression += value + '(';
                break;
            case 'x²':
                currentExpression += '^2';
                break;
            case 'x³':
                currentExpression += '^3';
                break;
            case 'xʸ':
                currentExpression += '^';
                break;
            case 'π':
                currentExpression += 'π';
                break;
            case 'e':
                currentExpression += 'e';
                break;
            case 'Unit':
                openUnitConversionModal();
                return; // Don't update display
            case 'Graph':
                openGraphModal();
                return; // Don't update display
            case 'Save':
                saveCalculation();
                return; // Don't update display
            case 'Recall':
                recallCalculation();
                break;
            default:
                appendToExpression(value);
        }
        updateDisplay();
    }

    function appendToExpression(value) {
        if (value === '.' && currentExpression.includes('.')) {
            return; // Prevent multiple decimal points
        }
        currentExpression += value;
    }

    function clear() {
        currentExpression = '';
    }

    function toggleSign() {
        if (currentExpression.startsWith('-')) {
            currentExpression = currentExpression.slice(1);
        } else {
            currentExpression = '-' + currentExpression;
        }
    }

    function addPercent() {
        const value = parseFloat(currentExpression);
        if (!isNaN(value)) {
            currentExpression = (value / 100).toString();
        }
    }

    function deleteLastChar() {
        currentExpression = currentExpression.slice(0, -1);
    }

    function calculate() {
        try {
            let expression = currentExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/(\d+\.?\d*)%/g, '($1/100)')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/√\(/g, 'Math.sqrt(')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/(\d+\.?\d*)\^(\d+\.?\d*)/g, 'Math.pow($1, $2)');
            
            currentExpression = eval(expression).toString();
        } catch (error) {
            currentExpression = 'Error';
        }
    }

    function updateDisplay() {
        display.value = currentExpression || '0';
    }

    function openUnitConversionModal() {
        document.getElementById('unitConversion').style.display = 'block';
        populateUnitDropdowns();
    }

    function openGraphModal() {
        document.getElementById('graphModal').style.display = 'block';
    }

    function saveCalculation() {
        if (currentExpression) {
            localStorage.setItem('savedCalculation', currentExpression);
            alert('Calculation saved!');
        } else {
            alert('No calculation to save!');
        }
    }

    function recallCalculation() {
        const savedCalc = localStorage.getItem('savedCalculation');
        if (savedCalc) {
            currentExpression = savedCalc;
        } else {
            alert('No saved calculation found!');
        }
    }

    // Unit Conversion Logic
    const unitConversions = {
        length: {
            meters: 1,
            feet: 3.28084,
            inches: 39.3701,
            kilometers: 0.001
        },
        weight: {
            kg: 1,
            lbs: 2.20462,
            oz: 35.274,
            g: 1000
        },
        temperature: {
            Celsius: 'C',
            Fahrenheit: 'F',
            Kelvin: 'K'
        }
    };

    function populateUnitDropdowns() {
        const conversionType = document.getElementById('conversionType');
        const fromUnit = document.getElementById('fromUnit');
        const toUnit = document.getElementById('toUnit');
        
        const units = Object.keys(unitConversions[conversionType.value]);
        fromUnit.innerHTML = toUnit.innerHTML = units.map(unit => `<option value="${unit}">${unit}</option>`).join('');
    }

    document.getElementById('conversionType').addEventListener('change', populateUnitDropdowns);

    document.getElementById('convertBtn').addEventListener('click', () => {
        const fromValue = parseFloat(document.getElementById('fromValue').value);
        const fromUnit = document.getElementById('fromUnit').value;
        const toUnit = document.getElementById('toUnit').value;
        const conversionType = document.getElementById('conversionType').value;

        let result;
        if (conversionType === 'temperature') {
            result = convertTemperature(fromValue, fromUnit, toUnit);
        } else {
            const baseValue = fromValue / unitConversions[conversionType][fromUnit];
            result = baseValue * unitConversions[conversionType][toUnit];
        }

        document.getElementById('conversionResult').textContent = `${fromValue} ${fromUnit} = ${result.toFixed(4)} ${toUnit}`;
    });

    function convertTemperature(value, from, to) {
        if (from === to) return value;
        if (from === 'Celsius') {
            if (to === 'Fahrenheit') return (value * 9/5) + 32;
            if (to === 'Kelvin') return value + 273.15;
        }
        if (from === 'Fahrenheit') {
            if (to === 'Celsius') return (value - 32) * 5/9;
            if (to === 'Kelvin') return (value - 32) * 5/9 + 273.15;
        }
        if (from === 'Kelvin') {
            if (to === 'Celsius') return value - 273.15;
            if (to === 'Fahrenheit') return (value - 273.15) * 9/5 + 32;
        }
    }

    // Graphing Logic
    document.getElementById('plotBtn').addEventListener('click', () => {
        const functionInput = document.getElementById('functionInput').value;
        const xValues = [];
        const yValues = [];

        for (let x = -10; x <= 10; x += 0.1) {
            xValues.push(x);
            try {
                yValues.push(eval(functionInput.replace(/x/g, x)));
            } catch (error) {
                alert('Invalid function. Please check your input.');
                return;
            }
        }

        Plotly.newPlot('graphContainer', [{
            x: xValues,
            y: yValues,
            type: 'scatter'
        }], {
            title: `y = ${functionInput}`,
            xaxis: { title: 'x' },
            yaxis: { title: 'y' }
        });
    });

    // Close modals when clicking outside
    window.onclick = (event) => {
        if (event.target.className === 'modal') {
            event.target.style.display = "none";
        }
    };

    // Close modals when clicking the close button
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = () => {
            closeBtn.closest('.modal').style.display = "none";
        };
    });

    // Initialize display
    updateDisplay();
});

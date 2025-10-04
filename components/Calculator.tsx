
import React, { useState } from 'react';

const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({ onClick, className = '', children }) => (
    <button onClick={onClick} className={`bg-gray-200 hover:bg-gray-300 text-2xl font-bold rounded-lg transition-colors ${className}`}>
        {children}
    </button>
);

export const Calculator: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [currentValue, setCurrentValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };
    
    const inputDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setCurrentValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (currentValue === null) {
            setCurrentValue(inputValue);
        } else if (operator) {
            const result = calculate(currentValue, inputValue, operator);
            setCurrentValue(result);
            setDisplay(String(result));
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };
    
    const calculate = (firstOperand: number, secondOperand: number, op: string) => {
        switch (op) {
            case '+': return firstOperand + secondOperand;
            case '-': return firstOperand - secondOperand;
            case '*': return firstOperand * secondOperand;
            case '/': return firstOperand / secondOperand;
            case '=': return secondOperand;
            default: return secondOperand;
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">آلة حاسبة</h1>
            <div className="max-w-xs mx-auto bg-gray-900 text-white p-4 rounded-lg shadow-2xl">
                <div className="bg-gray-800 text-right p-4 rounded-md mb-4 text-5xl font-mono overflow-x-auto">
                    {display}
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <Button onClick={clear} className="bg-red-500 hover:bg-red-600 text-white col-span-2">AC</Button>
                    <Button onClick={() => setDisplay(String(parseFloat(display) * -1))}>+/-</Button>
                    <Button onClick={() => performOperation('/')} className="bg-yellow-500 hover:bg-yellow-600">÷</Button>
                    
                    <Button onClick={() => inputDigit('7')}>7</Button>
                    <Button onClick={() => inputDigit('8')}>8</Button>
                    <Button onClick={() => inputDigit('9')}>9</Button>
                    <Button onClick={() => performOperation('*')} className="bg-yellow-500 hover:bg-yellow-600">×</Button>

                    <Button onClick={() => inputDigit('4')}>4</Button>
                    <Button onClick={() => inputDigit('5')}>5</Button>
                    <Button onClick={() => inputDigit('6')}>6</Button>
                    <Button onClick={() => performOperation('-')} className="bg-yellow-500 hover:bg-yellow-600">-</Button>

                    <Button onClick={() => inputDigit('1')}>1</Button>
                    <Button onClick={() => inputDigit('2')}>2</Button>
                    <Button onClick={() => inputDigit('3')}>3</Button>
                    <Button onClick={() => performOperation('+')} className="bg-yellow-500 hover:bg-yellow-600">+</Button>

                    <Button onClick={() => inputDigit('0')} className="col-span-2">0</Button>
                    <Button onClick={inputDecimal}>.</Button>
                    <Button onClick={() => performOperation('=')} className="bg-green-500 hover:bg-green-600 text-white">=</Button>
                </div>
            </div>
        </div>
    );
};
   
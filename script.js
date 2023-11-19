document.addEventListener("DOMContentLoaded", function () {
  const screen = document.querySelector(".screen");
  const numberButtons = document.querySelectorAll("[data-number]");
  const clearButton = document.querySelector("[data-all-clear]");
  const operationButtons = document.querySelectorAll("[data-operation]");
  const equalsButton = document.querySelector("[data-equals]");
  const plusMinusButton = document.querySelector("[data-negative-positive]");
  const percentButton = document.querySelector("[data-percent]");

  let currentOperand = "";
  let currentOperation = null;
  let previousOperand = "";
  let numberPressed = false;
  let performOperation = false;
  let decimalPressed = false;
  const maxDisplayDigits = 9;
  let operationPressed = false;

  numberButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (currentOperand === "0" || performOperation) {
        currentOperand = button.innerText;
        performOperation = false;
      } else {
        if (button.innerText === "." && decimalPressed) {
          return;
        }
        numberPressed = true;
        currentOperand += button.innerText;
        if (button.innerText === ".") {
          decimalPressed = true;
        }
      }
      toggleClearButton();
      updateScreenFormatted();
      adjustDisplaySize();
    });
  });

  // Xử lý sự kiện khi click vào nút AC
  clearButton.addEventListener("click", function () {
    clearScreen();
    enableNumberButtons();
  });

  operationButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (!numberPressed) {
        currentOperand = "0";
      }
      numberPressed = false;
      selectOperation(button);
      operationPressed = true;
      enableNumberButtons();
    });
  });

  // Xử lý sự kiện khi click vào nút "="
  equalsButton.addEventListener("click", function () {
    calculate();
    enableNumberButtons();
  });

  // Xử lý sự kiện khi click vào nút +/-
  plusMinusButton.addEventListener("click", function () {
    toggleNegativePositive();
    enableNumberButtons();
  });

  // Xử lý sự kiện khi click vào nút %
  percentButton.addEventListener("click", function () {
    calculatePercentage();
    screen.classList.add("small-textp");
    enableNumberButtons();
  });

  function updateScreen() {
    screen.innerText = currentOperand !== "" ? currentOperand : "0";
  }

  function clearScreen() {
    currentOperand = "";
    currentOperation = null;
    previousOperand = "";
    numberPressed = false;
    decimalPressed = false;
    screen.classList.remove("small-text1");
    screen.classList.remove("small-text2");
    screen.classList.remove("small-text");
    toggleClearButton();
    updateScreen();
    resetOperationButtons();
  }

  function toggleClearButton() {
    if (currentOperand !== "") {
      clearButton.innerText = "C";
    } else {
      clearButton.innerText = "AC";
    }
  }

  function selectOperation(button) {
    currentOperation = button.innerText;
    previousOperand = currentOperand;
    currentOperand = "";
    decimalPressed = false;
    resetOperationButtons();
    button.classList.add("active-operation");
  }

  function calculate() {
    if (currentOperand === "") {
      currentOperand = "0";
    } else if (previousOperand !== "" && currentOperation !== null) {
      const operand1 = parseFloat(previousOperand);
      const operand2 = parseFloat(currentOperand);

      switch (currentOperation) {
        case "+":
          currentOperand = (operand1 + operand2).toString();
          break;
        case "-":
          currentOperand = (operand1 - operand2).toString();
          break;
        case "x":
          currentOperand = (operand1 * operand2).toString();
          break;
        case "/":
          if (operand2 !== 0) {
            currentOperand = (operand1 / operand2).toString();
          } else {
            currentOperand = "Error";
          }
          break;
        default:
          break;
      }

      // Làm tròn kết quả đến số chữ số thập phân cần thiết
      const decimalPlaces = getDecimalPlaces(currentOperand);
      currentOperand = formatResult(currentOperand, Math.min(4, decimalPlaces));
      currentOperand = removeTrailingZeros(currentOperand);
      adjustDisplaySizeForCalculation(currentOperand);

      // Reset các giá trị để chuẩn bị cho tính toán tiếp theo
      previousOperand = "";
      currentOperation = null;
      decimalPressed = false;
      updateScreenFormatted();
      resetOperationButtons();
    }
  }

  // Hàm để lấy số chữ số thập phân sau dấu chấm
  function getDecimalPlaces(numberString) {
    const decimalIndex = numberString.indexOf(".");
    return decimalIndex === -1 ? 0 : numberString.length - decimalIndex - 1;
  }

  // Đặt lại trạng thái của tất cả các nút phép toán
  function resetOperationButtons() {
    operationButtons.forEach((button) => {
      button.classList.remove("active-operation");
    });
  }

  // Chuyển đổi giữa số âm và số dương
  function toggleNegativePositive() {
    if (currentOperand !== "") {
      currentOperand = (parseFloat(currentOperand) * -1).toString();
      updateScreen();
    }
  }

  // Tính toán phần trăm
  function calculatePercentage() {
    if (currentOperand !== "") {
      const previousValue = parseFloat(currentOperand);
      currentOperand = (previousValue / 100).toString();

      const threshold = 0.000001;
      if (Math.abs(currentOperand - previousValue / 100) < threshold) {
        currentOperand = (previousValue / 100).toFixed(10);
      }

      currentOperand = limitNumberLength(currentOperand, maxDisplayDigits);
      currentOperand = removeTrailingZeros(currentOperand);
      updateScreenFormatted();
    }
  }
  function getTotalDigits(numberString) {
    const decimalIndex = numberString.indexOf(".");
    const integerPart =
      decimalIndex !== -1
        ? numberString.substring(0, decimalIndex)
        : numberString;
    const decimalPart =
      decimalIndex !== -1 ? numberString.substring(decimalIndex + 1) : "";
    return integerPart.length + decimalPart.length;
  }

  // Hàm để làm tròn số đến số chữ số thập phân cần thiết và kiểm tra đơn vị e
  function formatResult(numberString, decimalPlaces) {
    const number = parseFloat(numberString);

    if (number >= 1e6) {
      return number.toExponential(0);
    } else {
      const roundedNumber = number.toFixed(decimalPlaces);
      return roundedNumber.toString();
    }
  }

  // Hàm kiểm tra và giảm kích thước nội dung trên màn hình
  function adjustDisplaySize() {
    const totalDigits = getTotalDigits(currentOperand);
    const currentNumber = parseFloat(currentOperand);
    if (!isNaN(currentNumber)) {
      const absoluteValue = Math.abs(currentNumber);
      const numDigits = Math.floor(Math.log10(absoluteValue)) + 1;

      if (numDigits > 6) {
        screen.classList.add("small-text1");
      }
      if (numDigits > 7) {
        screen.classList.add("small-text2");
      }
      if (numDigits >= maxDisplayDigits) {
        screen.classList.add("small-text");
        disableNumberButtons();
      } else {
        screen.classList.remove("small-text");
        enableNumberButtons();
      }
    }
  }

  function removeTrailingZeros(numberString) {
    const parts = numberString.split(".");
    if (parts.length > 1) {
      const integerPart = parts[0];
      let decimalPart = parts[1];
      decimalPart = decimalPart.replace(/0+$/, "");
      if (decimalPart.length > 0) {
        return `${integerPart}.${decimalPart}`;
      } else {
        return integerPart;
      }
    } else {
      return numberString;
    }
  }

  function limitNumberLength(numberString, maxLength) {
    if (numberString.includes(".")) {
      const parts = numberString.split(".");
      const integerPart = parts[0];
      let decimalPart = parts[1];

      decimalPart = decimalPart.slice(0, maxLength - integerPart.length - 1);

      return `${integerPart}.${decimalPart}`;
    } else {
      return numberString.slice(0, maxLength);
    }
  }

  function adjustDisplaySizeForCalculation(result) {
    const totalDigits = getTotalDigits(result);
    if (totalDigits > 6) {
      screen.classList.add("small-text-1");
    } else if (totalDigits > 7) {
      screen.classList.add("small-text-2");
    } else if (totalDigits >= maxDisplayDigits) {
      screen.classList.add("small-text");
    } else {
      screen.classList.remove("small-text");
    }
  }

  // Hàm để định dạng số với dấu chấm ngăn cách
  function formatNumberWithCommas(numberString) {
    const parts = numberString.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
  }

  function updateScreenFormatted() {
    screen.innerText =
      currentOperand !== "" ? formatNumberWithCommas(currentOperand) : "0";
  }

  function disableNumberButtons() {
    numberButtons.forEach((button) => {
      button.disabled = true;
    });
  }

  function enableNumberButtons() {
    numberButtons.forEach((button) => {
      button.disabled = false;
    });
  }
});

var budgetController = (function () {
  function Expense(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  function Income(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  function calculateTotal(type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  }

  var data = {
    allItems: {
      inc: [],
      exp: [],
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, desc, val) {
      var newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === 'exp') {
        newItem = new Expense(ID, desc, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, desc, val);
      }

      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map(function (cur) {
        return cur.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // 1. calculate the total income and total expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // 2. calculate the budget (total income - total expense)
      data.budget = data.totals.inc - data.totals.exp;

      // 3. calculate the percentage (expenses / income) * 100
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });

      return allPerc;
    },

    testing: function () {
      console.log(data);
    },
  };
})();

var UIController = (function () {
  var DomStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    addButton: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    totalIncomeLabel: '.budget__income--value',
    totalExpensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    monthLabel: '.budget__title--month',
  };

  function formatNumber(num, type) {
    var numSplit, int, dec;
    /**
     * '+' or '-' sign befor num
     * 2 decimal value
     * comma separaton for thousands
     */

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  }

  function nodeListForEach(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  }

  return {
    getInputData: function () {
      return {
        type: document.querySelector(DomStrings.inputType).value,
        description: document.querySelector(DomStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DomStrings.inputValue).value),
      };
    },

    addItemsList: function (obj, type) {
      var html, newHtml, element;

      // 1. Create a html string with placeholder
      if (type === 'inc') {
        element = DomStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DomStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // 2. replace placeholder with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // 3. insert html string to DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DomStrings.inputDescription + ',' + DomStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, arr) {
        current.value = '';
      });

      fields[0].focus();
    },

    dispalyBudget: function (obj) {
      var type = obj.budget > 0 ? 'inc' : 'exp';

      document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(
        DomStrings.totalIncomeLabel
      ).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(
        DomStrings.totalExpensesLabel
      ).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DomStrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DomStrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DomStrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayDate: function () {
      var now, months, month, year;

      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DomStrings.monthLabel).textContent =
        months[month] + ' ' + year;
    },

    changedType: function () {
      var fields;

      fields = document.querySelectorAll(
        DomStrings.inputType +
          ',' +
          DomStrings.inputDescription +
          ',' +
          DomStrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DomStrings.addButton).classList.toggle('red');
    },

    getDomStrings: function () {
      return DomStrings;
    },
  };
})();

var appController = (function (budgetCtrl, UICtrl) {
  function setupEventListners() {
    var DOM = UICtrl.getDomStrings();
    document
      .querySelector(DOM.addButton)
      .addEventListener('click', addItemCtrl);

    document.addEventListener('keypress', function (e) {
      if (e.keyCode == 13 || e.which == 13) {
        addItemCtrl();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', deleteItemCtrl);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);
  }

  function updateBudget() {
    // 1. Calculate the Budget
    budgetCtrl.calculateBudget();

    // 2. return the Budget
    var budget = budgetCtrl.getBudget();

    // 3. Display calculated budget on UI
    UICtrl.dispalyBudget(budget);
  }

  function updatePercentage() {
    // 1. Calculate the Percentage of all expense
    budgetCtrl.calculatePercentages();

    // 2. return all the Percentage
    var percentages = budgetCtrl.getPercentages();

    // 3. display calculated Percentage on UI
    UICtrl.displayPercentages(percentages);
  }

  function addItemCtrl() {
    // 1. Get user input data
    var inputData = UICtrl.getInputData();

    if (
      inputData.description !== '' &&
      !isNaN(inputData.value) &&
      inputData.value > 0
    ) {
      // 2. Add the item to budgetController
      var newItem = budgetCtrl.addItem(
        inputData.type,
        inputData.description,
        inputData.value
      );

      // 3. Display added item on UI
      UICtrl.addItemsList(newItem, inputData.type);

      // 4. Clear input field
      UICtrl.clearFields();

      // 5. calculate and update budget
      updateBudget();

      // 6. calculate and update expense percentage
      updatePercentage();
    }
  }

  function deleteItemCtrl(e) {
    var itemId, splitId, type, ID;
    itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      // inc-1
      splitId = itemId.split('-');
      type = splitId[0];
      ID = parseInt(splitId[1]);

      //1. delete the item from data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. delete the item from UI
      UICtrl.deleteListItem(itemId);

      // 3. update and show new budget
      updateBudget();

      // 4. calculate and update expense percentage
      updatePercentage();
    }
  }

  return {
    init: function () {
      console.log('***Application has started***');
      UICtrl.displayDate();
      UICtrl.dispalyBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });

      setupEventListners();
    },
  };
})(budgetController, UIController);

appController.init();

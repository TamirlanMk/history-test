var answ_result = {};
var wrong_answers = [];

let cout_q = 0;
let min_q = 0;
let max_q = 0;

let jsonDataFailQ = [];

let start_test = false;

document.addEventListener("DOMContentLoaded", function () {
  //clearCookie("data")

  /*
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = xhr.responseText;
          console.log('Получены данные:', data);
          // Обработка данных после успешной загрузки
          const par = data.split(';');
          cout_q = parseInt(par[0])
          min_q = parseInt(par[1])
          max_q = parseInt(par[2])

          loadCards();

        } else {
          console.error('Произошла ошибка:', xhr.status);
          // Обработка ошибки
        }
      }
    };
    xhr.open('GET', 'load_settings.php'); // URL вашего PHP-скрипта
    xhr.send();
    */

  cout_q =
    getDataFromCookie("allQInput") != ""
      ? parseInt(getDataFromCookie("allQInput"))
      : 20;
  min_q =
    getDataFromCookie("minQInput") != ""
      ? parseInt(getDataFromCookie("minQInput"))
      : 1;
  max_q =
    getDataFromCookie("maxQInput") != ""
      ? parseInt(getDataFromCookie("maxQInput"))
      : 997;

  console.log(cout_q, min_q, max_q);

  loadCards();

  loadToCookies();
});

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция для генерации уникальных случайных индексов
function generateUniqueIndices(count, min, max) {
  var indices = [];

  // Заполняем массив значениями от min до max
  for (var i = min; i <= max; i++) {
    indices.push(i);
  }

  // Перемешиваем массив
  for (var i = indices.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }

  // Возвращаем указанное количество уникальных индексов
  return indices.slice(0, count);
}

// Функция для загрузки данных из JSON и создания карточек
async function loadCards() {
  try {
    // Загружаем данные из JSON-файла
    const response = await fetch("json/questions.json");
    const data = await response.json();

    var cards = [];

    data.forEach((question) => {
      const card = document.createElement("div");
      card.classList.add("card", "mb-3");

      // Генерируем HTML-код для вариантов ответов
      var answers = [];
      Object.keys(question["answers"]).forEach((key) => {
        const answer = question["answers"][key];
        answers.push(
          `<button class="btn btn-secondary" onclick="checkAnswer(this)">${answer}</button>`
        );
      });

      for (var i = 0; i < answers.length; i++) {
        const index = getRandomNumber(0, answers.length - 1);
        [answers[i], answers[index]] = [answers[index], answers[i]];
      }

      let answersHTML = "";
      for (var i = 0; i < answers.length; i++) {
        answersHTML += answers[i];
      }

      card.innerHTML = `
              <div class="card-body">
                <h5 class="card-title">${question.title}</h5>
                <p class="card-text">${question.description}</p>
                <div class="d-grid gap-2">
                  ${answersHTML}
                </div>
                <div class="result mt-3"></div>
              </div>`;

      card.answer = question.right_answers;
      card.answer_count = question.right_answers.length;
      card.answer_enter = [];

      cards.push(card);
    });

    // Создаем карточки на основе данных
    const cardsContainer = document.getElementById("cardsContainer");

    /*for (var cardId in cards) {
            cardsContainer.appendChild(cards[cardId]);
        }*/

    var uniqueIndices = generateUniqueIndices(cout_q, min_q - 1, max_q - 1);
    //var uniqueIndices = generateUniqueIndices(cout_q, 0, 250); //!!!!
    console.log(uniqueIndices);
    for (var i in uniqueIndices) {
      cardsContainer.appendChild(cards[uniqueIndices[i]]);
    }
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
}

// Функция для проверки ответа на вопросы
function checkAnswer(button) {
  if (button.block) return;

  button.block = true;
  const card = button.closest(".card");
  const cardBody = button.closest(".card-body");
  const question = cardBody.querySelector(".card-title").innerText;
  const userAnswer = button.innerText;
  // const correctAnswer = cardBody.querySelector(".correct-answer").innerText;
  const resultDiv = cardBody.querySelector(".result");

  /*
        card.answer = question.right_answers
        card.answer_count = question.right_answers.length
        card.answer_enter = []
    */

  // Сравниваем ответ пользователя с правильным ответом
  if (card.answer.includes(userAnswer)) {
    //resultDiv.innerHTML = '<div class="alert alert-success" role="alert">Правильно!</div>';
    button.classList.add("btn-success");
  } else {
    //resultDiv.innerHTML = '<div class="alert alert-danger" role="alert">Неправильно!</div>';
    button.classList.add("btn-danger");
  }

  card.answer_enter.push(userAnswer);
  answ_result[question] = false;

  if (card.answer_count == card.answer_enter.length) {
    let result = true;
    for (var i = 0; i < card.answer_count; i++) {
      if (!card.answer.includes(card.answer_enter[i])) {
        result = false;
        break;
      }
    }

    answ_result[question] = result;
  }
}

// Функция для проверки ответа на вопросы
function showResult(btn) {
  if (!start_test) {
    showTestResult(btn);
  } else {
    resetTest();
  }
}

function showTestResult(btn) {
  let result = 0;
  for (var i in answ_result) {
    if (answ_result[i]) result++;
  }

  btn.innerText = "Пройти тест заного?";
  btn.className = "btn btn-warning";
  document.getElementById("result-test").innerHTML =
    '<div class="alert alert-primary mt-3" role="alert" id="info-result">Правильно: ' +
    result +
    "/" +
    cout_q +
    "</div>";

  start_test = true;
  // saveToServer();
  saveToCookies();
}

function resetTest() {
  location.reload();
}

function loadToCookies() {
  let loadData = getDataFromCookie("data");

  if (loadData != "") {
    jsonDataFailQ = JSON.parse(loadData);
  } else {
    jsonDataFailQ = [];
  }

  console.log("Data:", jsonDataFailQ);
}

function saveToCookies() {
  document.getElementById("info-result").innerHTML +=
    "<br>Данные успешно сохранены на сервере.";
  document.getElementById("result-test").innerHTML +=
    '<button type="button" class="btn btn-info" id="showReport" onclick="show_report()" style="width: 300px;">Просмотреть отчет</button>';

  // Цикл для добавления объектов в массив
  for (var ans in answ_result) {
    if (!answ_result[ans]) {
      addParam(jsonDataFailQ, get_id_question(ans));
    }
  }

  saveDataToCookie("data", JSON.stringify(jsonDataFailQ), 30);
}

function saveToServer() {
  // var name = document.getElementById('nameInput').value;
  var data = []; // Создаем пустой массив

  // Цикл для добавления объектов в массив
  for (var i = 0; i < answ_result.length; i++) {
    var obj = { id: get_id_question(wrong_answers[i]) }; // Создаем объект с нужными свойствами
    data.push(obj); // Добавляем объект в массив
  }

  var jsonData = JSON.stringify(data); // Преобразуем массив в строку JSON

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "save.php"); // Путь к скрипту на сервере, который будет сохранять файл
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      // alert("Данные успешно сохранены на сервере.");
      document.getElementById("info-result").innerHTML +=
        "<br>Данные успешно сохранены на сервере.";
      document.getElementById("result-test").innerHTML +=
        '<button type="button" class="btn btn-info" id="showReport" onclick="show_report()" style="width: 300px;">Просмотреть отчет</button>';
    }
  };
  xhr.send(jsonData);
}

function get_id_question(str) {
  // Регулярное выражение для поиска числа после слова "Вопрос"
  var regex = /Вопрос (\d+)/;

  // Выполнение поиска с помощью регулярного выражения
  var match = str.match(regex);

  // Если найдено совпадение, получаем число из группы совпадения
  if (match) {
    var questionNumber = parseInt(match[1]); // Преобразуем найденное число в целое число
    return questionNumber; // Выводим результат в консоль
  }

  return 0;
}

function show_report() {
  // Изменяем URL-адрес текущего окна на нужную ссылку
  window.location.href = "report.html";
}

// Обработчик события отправки формы
document
  .getElementById("settingsForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    var allQ = document.getElementById("allQInput").value;
    var minQ = document.getElementById("minQInput").value;
    var maxQ = document.getElementById("maxQInput").value;

    saveDataToCookie("allQInput", allQ, 30);
    saveDataToCookie("minQInput", minQ, 30);
    saveDataToCookie("maxQInput", maxQ, 30);

    resetTest();
    /*
    var data = { "all": allQ, "min": minQ, "max": maxQ };
   
    var jsonData = JSON.stringify(data); // Преобразуем массив в строку JSON

    console.log('Отправляем имя на сервер:', jsonData);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "settings.php"); // Путь к скрипту на сервере, который будет сохранять файл
    xhr.setRequestHeader("Content-Type", 'application/json; charset=utf-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //alert("Данные успешно сохранены на сервере.");
            resetTest();
        }
    };
    xhr.send(jsonData);
    */
  });

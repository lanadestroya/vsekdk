document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Отменяем стандартную отправку формы

    const formData = {
        login: document.getElementById("email").value, // Получаем email
        password: document.getElementById("password").value // Получаем пароль
    };

    try {
        const response = await fetch('http://localhost:5000/api/user/login', { // Отправляем запрос на сервер
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData) // Превращаем данные в JSON-строку
        });

        const data = await response.json(); // Получаем ответ от сервера
        console.log('Response:', data);

        if (data.token) {
            localStorage.setItem("token", data.token); // Сохраняем токен в localStorage
            alert("Авторизация успешна!");
            window.location.href = 'index.html'; // Изменено с '/client/index.html' на 'index.html'
        } else {
            alert("Ошибка: " + data.message);
        }

    } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка, попробуйте позже.");
    }
});
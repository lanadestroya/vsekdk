document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Отменяем стандартную отправку формы

    const formData = {
        login: document.getElementById("email").value, // Получаем email
        password: document.getElementById("password").value // Получаем пароль
    };

    const submitBtn = document.querySelector('#loginForm input[type="submit"]');
    const errorBlock = document.getElementById('login-error') || (() => {
        const p = document.createElement('p');
        p.id = 'login-error';
        p.style.color = 'red';
        p.style.marginTop = '10px';
        document.getElementById('loginForm').appendChild(p);
        return p;
    })();
    errorBlock.textContent = '';
    submitBtn.disabled = true;
    submitBtn.value = 'Вход...';

    try {
        const response = await fetch('/api/user/login', { // Отправляем запрос на сервер
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData) // Превращаем данные в JSON-строку
        });

        const data = await response.json(); // Получаем ответ от сервера
        console.log('Response:', data);

        if (response.ok) {
            // Сохраняем токен
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            submitBtn.value = 'Успешно!';
            errorBlock.style.color = 'green';
            errorBlock.textContent = 'Вход выполнен! Сейчас вы будете перенаправлены...';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);
        } else {
            errorBlock.style.color = 'red';
            errorBlock.textContent = data.message || 'Ошибка при входе';
            submitBtn.value = 'Войти';
        }
    } catch (error) {
        console.error("Ошибка:", error);
        errorBlock.style.color = 'red';
        errorBlock.textContent = 'Ошибка при отправке запроса. Проверьте консоль для деталей.';
        submitBtn.value = 'Войти';
    } finally {
        submitBtn.disabled = false;
    }
});
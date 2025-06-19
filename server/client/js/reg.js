document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById("name").value,
        login: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const submitBtn = document.querySelector('#registerForm input[type="submit"]');
    const errorBlock = document.getElementById('reg-error') || (() => {
        const p = document.createElement('p');
        p.id = 'reg-error';
        p.style.color = 'red';
        p.style.marginTop = '10px';
        document.getElementById('registerForm').appendChild(p);
        return p;
    })();
    errorBlock.textContent = '';
    submitBtn.disabled = true;
    submitBtn.value = 'Регистрация...';

    try {
        const response = await fetch('/api/user/registration', {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData)
        });
 
        const data = await response.json();
        console.log('Response:', data);
        
        if (response.ok) {
            // Сохраняем токен
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            submitBtn.value = 'Успешно!';
            errorBlock.style.color = 'green';
            errorBlock.textContent = 'Регистрация успешна! Сейчас вы будете перенаправлены...';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);
        } else {
            errorBlock.style.color = 'red';
            errorBlock.textContent = data.message || 'Произошла ошибка при регистрации';
            submitBtn.value = 'Регистрация';
        }
    } catch (error) {
        console.error("Ошибка:", error);
        errorBlock.style.color = 'red';
        errorBlock.textContent = 'Произошла ошибка при отправке запроса. Проверьте консоль для деталей.';
        submitBtn.value = 'Регистрация';
    } finally {
        submitBtn.disabled = false;
    }
});
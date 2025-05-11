document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const formData = {
        login: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

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
            alert("Регистрация успешна!");
            window.location.href = 'index.html';
        } else {
            alert("Ошибка: " + (data.message || 'Произошла ошибка при регистрации'));
        }
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при отправке запроса. Проверьте консоль для деталей.");
    }
});
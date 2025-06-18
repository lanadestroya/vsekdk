// Функция для получения всех событий
async function getEvents() {
    try {
        const response = await fetch('/api/event');
        if (!response.ok) {
            throw new Error('Ошибка при получении событий');
        }
        const events = await response.json();
        return events;
    } catch (error) {
        console.error('Ошибка:', error);
        return [];
    }
}

// Функция для отображения событий на странице
async function displayEvents() {
    const eventsContainer = document.querySelector('.events-container');
    if (!eventsContainer) return;

    const events = await getEvents();
    
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">Нет доступных мероприятий</p>';
        return;
    }

    eventsContainer.innerHTML = events.map(event => `
        <div class="event-card">
            <img src="${event.pic}" alt="${event.title}" class="event-image">
            <div class="event-info">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-date">${new Date(event.date).toLocaleDateString()}</p>
                <p class="event-description">${event.text}</p>
                <button class="buy-ticket-btn" onclick="buyTicket(${event.id})">Купить билет</button>
            </div>
        </div>
    `).join('');
}

// Функция для покупки билета
async function buyTicket(eventId) {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Пожалуйста, войдите в систему для покупки билета');
        window.location.href = '/auth.html';
        return;
    }

    // Перенаправляем на страницу покупки билета с ID события
    window.location.href = `/buy.html?eventId=${eventId}`;
}

// Проверка роли пользователя и отображение кнопки для админа
function showAdminCreateButton() {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Декодируем payload JWT (без проверки подписи)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.roleId === 2) { // 2 - это id роли ADMIN
            document.getElementById('admin-create-event-block').style.display = 'block';
        }
    } catch (e) {
        // Если не удалось декодировать токен, ничего не делаем
    }
}

// Открытие/закрытие модального окна
function setupCreateEventModal() {
    const openBtn = document.getElementById('open-create-event-modal');
    const modal = document.getElementById('create-event-modal');
    const closeBtn = document.getElementById('close-create-event-modal');
    if (openBtn && modal && closeBtn) {
        openBtn.onclick = () => { modal.style.display = 'block'; };
        closeBtn.onclick = () => { modal.style.display = 'none'; };
        window.onclick = (event) => {
            if (event.target === modal) modal.style.display = 'none';
        };
    }
}

// Обработка формы создания события
function setupCreateEventForm() {
    const form = document.getElementById('create-event-form');
    if (!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Необходима авторизация администратора');
            return;
        }

        const imageFile = document.getElementById('event-image').files[0];
        if (!imageFile) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        // Конвертируем изображение в Base64
        const reader = new FileReader();
        reader.onload = async function(e) {
            const base64Image = e.target.result;

            const eventData = {
                title: document.getElementById('event-title').value,
                date: document.getElementById('event-date').value + 'T' + document.getElementById('event-time').value,
                price: document.getElementById('event-price').value,
                text: document.getElementById('event-description').value,
                pic: base64Image
            };

            try {
                const response = await fetch('/api/event', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventData)
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.message || 'Ошибка при создании события');
                }
                document.getElementById('create-event-modal').style.display = 'none';
                form.reset();
                await displayEvents();
                alert('Событие успешно создано!');
            } catch (error) {
                alert(error.message);
            }
        };
        reader.readAsDataURL(imageFile);
    };
}

// Функция для выхода из системы
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth.html';
}

document.addEventListener('DOMContentLoaded', () => {
    displayEvents();
    showAdminCreateButton();
    setupCreateEventModal();
    setupCreateEventForm();
    
    // Добавляем обработчик для кнопки выхода
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
}); 

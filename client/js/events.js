// Функция для получения всех событий
async function getEvents() {
    try {
        const response = await fetch('http://localhost:5000/api/event');
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
            <img src="http://localhost:5000/uploads/${event.pic}" alt="${event.title}" class="event-image">
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
        if (payload.roleName === 'ADMIN') {
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
        const formData = new FormData();
        formData.append('title', document.getElementById('event-title').value);
        // Объединяем дату и время в ISO-строку
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        formData.append('date', date + 'T' + time);
        formData.append('price', document.getElementById('event-price').value);
        formData.append('text', document.getElementById('event-description').value);
        formData.append('image', document.getElementById('event-image').files[0]);
        try {
            const response = await fetch('http://localhost:5000/api/event', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Ошибка при создании события');
            }
            // Закрываем модалку, очищаем форму, обновляем афишу
            document.getElementById('create-event-modal').style.display = 'none';
            form.reset();
            await displayEvents();
            alert('Событие успешно создано!');
        } catch (error) {
            alert(error.message);
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    displayEvents();
    showAdminCreateButton();
    setupCreateEventModal();
    setupCreateEventForm();
}); 
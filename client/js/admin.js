document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем, является ли пользователь администратором
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Необходима авторизация');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка авторизации');
        }

        const user = await response.json();
        if (!user.isAdmin) {
            alert('У вас нет прав администратора');
            window.location.href = 'index.html';
            return;
        }
    } catch (error) {
        alert(error.message);
        window.location.href = 'login.html';
        return;
    }

    // Загружаем список мероприятий
    loadEvents();

    // Обработчики кнопок
    const createEventBtn = document.getElementById('create-event-btn');
    const cancelEventBtn = document.getElementById('cancel-event-btn');
    const eventForm = document.getElementById('event-form');
    const createEventForm = document.getElementById('create-event-form');

    createEventBtn.addEventListener('click', () => {
        eventForm.style.display = 'block';
    });

    cancelEventBtn.addEventListener('click', () => {
        eventForm.style.display = 'none';
        createEventForm.reset();
    });

    // Обработка создания мероприятия
    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('date', document.getElementById('date').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('image', document.getElementById('image').files[0]);

        try {
            const response = await fetch('/api/event', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Не удалось создать мероприятие');
            }

            alert('Мероприятие успешно создано');
            eventForm.style.display = 'none';
            createEventForm.reset();
            loadEvents(); // Перезагружаем список мероприятий
        } catch (error) {
            alert(error.message);
        }
    });
});

// Функция для загрузки списка мероприятий
async function loadEvents() {
    try {
        const response = await fetch('/api/event');
        const events = await response.json();

        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML = events.map(event => `
            <div class="event-item">
                <div class="event-info">
                    <h4>${event.title}</h4>
                    <p>Дата: ${new Date(event.date).toLocaleString()}</p>
                    <p>Цена: ${event.price} руб.</p>
                </div>
                <div class="event-actions">
                    <button onclick="editEvent('${event._id}')" class="edit-button">Редактировать</button>
                    <button onclick="deleteEvent('${event._id}')" class="delete-button">Удалить</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Ошибка при загрузке мероприятий:', error);
        alert('Не удалось загрузить список мероприятий');
    }
}

// Функция для редактирования мероприятия
async function editEvent(eventId) {
    // TODO: Реализовать редактирование мероприятия
    alert('Функция редактирования в разработке');
}

// Функция для удаления мероприятия
async function deleteEvent(eventId) {
    if (!confirm('Вы уверены, что хотите удалить это мероприятие?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/event/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось удалить мероприятие');
        }

        alert('Мероприятие успешно удалено');
        loadEvents(); // Перезагружаем список мероприятий
    } catch (error) {
        alert(error.message);
    }
} 
// Проверяем существование элементов перед добавлением обработчиков
const btnOpen = document.querySelector('.btn_open');
const btnClose = document.querySelector('.btn_close');
const menuList = document.querySelector('.wrapper_poster--6');

if (btnOpen && btnClose && menuList) {
    btnOpen.addEventListener('click', () => {
        menuList.classList.add('wrapper_poster--6-active');
    });

    btnClose.addEventListener('click', () => {
        menuList.classList.remove('wrapper_poster--6-active');
    });
}

// Функция для форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('ru', { month: 'short' });
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return {
        day: day,
        month: month,
        time: `${hours}:${minutes}`
    };
}

// Функция для создания карточки события
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    // Форматируем дату и время
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Проверяем роль пользователя
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole && userRole.trim().toUpperCase() === 'ADMIN';
    
    card.innerHTML = `
        <div class="event-image">
            <img src="/uploads/${event.pic}" alt="${event.title}">
        </div>
        <div class="event-content">
            <h3 class="event-title">${event.title}</h3>
            <div class="event-date">${formattedDate}</div>
            <div class="event-time">${formattedTime}</div>
            <div class="event-price">${event.price} руб.</div>
            <p class="event-description">${event.text}</p>
            <button class="buy-ticket-btn" onclick="buyTicket(${event.id})">
                Купить билет
            </button>
            ${isAdmin ? `
                <div class="admin-controls">
                    <button class="edit-event-btn" onclick="editEvent(${event.id})">
                        Редактировать
                    </button>
                    <button class="delete-event-btn" onclick="deleteEvent(${event.id})">
                        Удалить
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Функция для покупки билета
function buyTicket(eventId) {
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

// Функция для редактирования события
async function editEvent(eventId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Необходимо авторизоваться');
            return;
        }

        // Загружаем данные события
        const response = await fetch(`/api/event/${eventId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось загрузить данные события');
        }

        const event = await response.json();
        
        // Заполняем форму редактирования
        document.getElementById('edit-event-id').value = event.id;
        document.getElementById('edit-event-title').value = event.title;
        document.getElementById('edit-event-text').value = event.text;
        document.getElementById('edit-event-price').value = event.price;
        
        // Форматируем дату и время для полей ввода
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toISOString().split('T')[0];
        const timeStr = eventDate.toTimeString().split(' ')[0].substring(0, 5);
        
        document.getElementById('edit-event-date').value = dateStr;
        document.getElementById('edit-event-time').value = timeStr;
        
        // Показываем модальное окно редактирования
        document.getElementById('edit-event-modal').style.display = 'block';
        
    } catch (error) {
        console.error('Ошибка при загрузке события:', error);
        alert('Ошибка при загрузке данных события');
    }
}

// Функция для удаления события
async function deleteEvent(eventId) {
    if (!confirm('Вы уверены, что хотите удалить это событие?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Необходимо авторизоваться');
            return;
        }

        const response = await fetch(`/api/event/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Не удалось удалить событие');
        }

        alert('Событие успешно удалено');
        loadEvents(); // Перезагружаем список событий
        
    } catch (error) {
        console.error('Ошибка при удалении события:', error);
        alert('Ошибка при удалении события');
    }
}

// Функция для загрузки и отображения событий
async function loadEvents() {
    try {
        console.log('Начинаю загрузку событий...');
        const response = await fetch('/api/event');
        console.log('Получен ответ от сервера:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const events = await response.json();
        console.log('Получены события:', events);
        
        // Получаем существующий контейнер для событий
        const eventsContainer = document.querySelector('.events-container');
        console.log('Найден контейнер событий:', eventsContainer);
        
        if (!eventsContainer) {
            console.error('Контейнер событий не найден');
            return;
        }
        
        // Очищаем контейнер
        eventsContainer.innerHTML = '';
        
        // Проверяем, есть ли события
        if (events.length === 0) {
            eventsContainer.innerHTML = '<div class="no-events">Событий пока нет</div>';
            return;
        }
        
        // Добавляем каждое событие
        events.forEach(event => {
            console.log('Создаю карточку для события:', event);
            const eventCard = createEventCard(event);
            eventsContainer.appendChild(eventCard);
        });
        
    } catch (error) {
        console.error('Ошибка при загрузке событий:', error);
        const eventsContainer = document.querySelector('.events-container');
        if (eventsContainer) {
            eventsContainer.innerHTML = '<div class="no-events">Ошибка при загрузке событий</div>';
        }
    }
}

// Новый асинхронный инициализатор
document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем, есть ли роль в localStorage
    if (!localStorage.getItem('userRole')) {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await fetch('/api/user', { headers: { Authorization: 'Bearer ' + token } });
                const user = await res.json();
                if (user.role && user.role.name) {
                    localStorage.setItem('userRole', user.role.name);
                }
            } catch (e) {
                // Не удалось получить роль, ничего не делаем
            }
        }
    }
    // Теперь вызываем рендер событий
    loadEvents();
});

// Обработчик для формы редактирования события
document.addEventListener('DOMContentLoaded', () => {
    const editEventForm = document.getElementById('edit-event-form');
    if (editEventForm) {
        editEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Необходимо авторизоваться');
                    return;
                }

                const eventId = document.getElementById('edit-event-id').value;
                const formData = new FormData();
                
                formData.append('title', document.getElementById('edit-event-title').value);
                formData.append('text', document.getElementById('edit-event-text').value);
                formData.append('price', document.getElementById('edit-event-price').value);
                formData.append('date', document.getElementById('edit-event-date').value + 'T' + document.getElementById('edit-event-time').value);
                
                // Добавляем изображение, если оно было выбрано
                const imageFile = document.getElementById('edit-event-image').files[0];
                if (imageFile) {
                    formData.append('image', imageFile);
                }

                const response = await fetch(`/api/event/${eventId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Не удалось обновить событие');
                }

                alert('Событие успешно обновлено');
                document.getElementById('edit-event-modal').style.display = 'none';
                loadEvents(); // Перезагружаем список событий
                
            } catch (error) {
                console.error('Ошибка при обновлении события:', error);
                alert('Ошибка при обновлении события');
            }
        });
    }

    // Обработчик для закрытия модального окна редактирования
    const closeEditModal = document.querySelector('.close-edit-modal');
    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => {
            document.getElementById('edit-event-modal').style.display = 'none';
        });
    }

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('edit-event-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
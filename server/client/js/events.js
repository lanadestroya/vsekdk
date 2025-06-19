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
    if (!eventsContainer) {
        console.error('Контейнер событий не найден');
        return;
    }

    const events = await getEvents();
    
    if (events.length === 0) {
        eventsContainer.innerHTML = '<p class="no-events">Нет доступных мероприятий</p>';
        return;
    }

    // Проверяем роль пользователя
    const userRole = localStorage.getItem('userRoleId');
    const isAdmin = userRole === '2';

    eventsContainer.innerHTML = events.map(event => {
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

        return `
            <div class="event-card">
                <img src="/uploads/${event.pic}" alt="${event.title}" class="event-image">
                <div class="event-info">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-date">${formattedDate}</p>
                    <p class="event-time">${formattedTime}</p>
                    <p class="event-description">${event.text}</p>
                    <button class="buy-ticket-btn" onclick="buyTicket(${event.id})">Купить билет</button>
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
            </div>
        `;
    }).join('');
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
        displayEvents(); // Перезагружаем список событий
        
    } catch (error) {
        console.error('Ошибка при удалении события:', error);
        alert('Ошибка при удалении события');
    }
}

// Элементы модального окна
const modal = document.getElementById('create-event-modal');
const openModalBtn = document.getElementById('open-create-event-modal');
const closeModalBtn = document.getElementById('close-create-event-modal');
const createEventForm = document.getElementById('create-event-form');

// Открытие модального окна
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
});

// Закрытие модального окна
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Возвращаем скролл
});

// Закрытие модального окна при клике вне его
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Закрытие модального окна по Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Обработка отправки формы
createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        // Показываем индикатор загрузки
        const submitBtn = createEventForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Создание...';
        submitBtn.disabled = true;
        
        // Получаем данные формы
        const formData = new FormData(createEventForm);
        
        // Объединяем дату и время
        const date = formData.get('date');
        const time = formData.get('time');
        formData.set('date', `${date}T${time}`);
        
        // Получаем токен для авторизации
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Необходима авторизация');
        }
        
        const response = await fetch('/api/event', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Событие создано:', result);
        
        // Показываем сообщение об успехе
        alert('Событие успешно создано!');
        
        // Закрываем модальное окно
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Очищаем форму
        createEventForm.reset();
        
        // Перезагружаем страницу для отображения нового события
        window.location.reload();
        
    } catch (error) {
        console.error('Ошибка при создании события:', error);
        alert('Ошибка при создании события: ' + error.message);
    } finally {
        // Возвращаем кнопку в исходное состояние
        const submitBtn = createEventForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Создать событие';
        submitBtn.disabled = false;
    }
});

// Функция для проверки прав администратора и показа кнопки создания
async function checkAdminRights() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Токен не найден');
            return;
        }
        
        console.log('Проверяю права администратора...');
        const response = await fetch('/api/user/auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Ответ от сервера:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('Данные пользователя:', userData);
            
            if (userData.roleId === 2) { // 2 - это id роли ADMIN
                console.log('Пользователь является администратором, показываю кнопку');
                document.getElementById('admin-create-event-block').style.display = 'block';
            } else {
                console.log('Пользователь не является администратором, roleId:', userData.roleId);
            }
        } else {
            console.log('Ошибка при проверке прав:', response.status);
        }
    } catch (error) {
        console.error('Ошибка при проверке прав администратора:', error);
    }
}

// Проверяем права администратора при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, проверяю права администратора...');
    
    // Проверяем, есть ли токен
    const token = localStorage.getItem('token');
    console.log('Токен в localStorage:', token ? 'есть' : 'нет');
    
    if (token) {
        console.log('Токен найден, проверяю права...');
        checkAdminRights();
    } else {
        console.log('Токен не найден, пользователь не авторизован');
    }
});

// Функция для выхода из системы
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/auth.html';
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

// Обработчик для формы редактирования события
document.addEventListener('DOMContentLoaded', () => {
    const editEventForm = document.getElementById('edit-event-form');
    console.log(editEventForm)
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
                displayEvents(); // Перезагружаем список событий
                
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
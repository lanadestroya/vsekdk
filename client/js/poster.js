const btnOpen = document.querySelector('.btn_open');
const btnClose = document.querySelector('.btn_close');
const menuList = document.querySelector('.wrapper_poster--6');

btnOpen.addEventListener('click', () => {
    menuList.classList.add('wrapper_poster--6-active');
});

btnClose.addEventListener('click', () => {
    menuList.classList.remove('wrapper_poster--6-active');
});

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
    
    // Форматируем дату
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    card.innerHTML = `
        <div class="event-image">
            <img src="/uploads/${event.pic}" alt="${event.title}">
        </div>
        <div class="event-content">
            <div class="event-date">${formattedDate}</div>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.text}</p>
            <a href="#" class="event-link">
                <span>Подробнее</span>
                <div class="arrow arrow-right"></div>
            </a>
        </div>
    `;
    
    return card;
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
        
        // Получаем контейнер для событий
        const container = document.querySelector('.container');
        console.log('Найден контейнер:', container);
        
        // Создаем секцию для событий
        const eventsSection = document.createElement('section');
        eventsSection.className = 'section_poster--2';
        
        // Создаем контейнер для карточек
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'container';
        
        // Создаем сетку для карточек
        const eventsGrid = document.createElement('div');
        eventsGrid.className = 'events-grid';
        
        // Добавляем каждое событие
        events.forEach(event => {
            console.log('Создаю карточку для события:', event);
            const eventCard = createEventCard(event);
            eventsGrid.appendChild(eventCard);
        });
        
        // Собираем структуру
        eventsContainer.appendChild(eventsGrid);
        eventsSection.appendChild(eventsContainer);
        
        // Добавляем секцию после существующей секции
        const existingSection = document.querySelector('.section_poster--1');
        console.log('Найдена существующая секция:', existingSection);
        existingSection.after(eventsSection);
    } catch (error) {
        console.error('Ошибка при загрузке событий:', error);
        alert('Не удалось загрузить события: ' + error.message);
    }
}

// Загружаем события при загрузке страницы
document.addEventListener('DOMContentLoaded', loadEvents);



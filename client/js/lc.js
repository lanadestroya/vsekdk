// Функция для выхода из системы
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'auth.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    // Добавляем обработчик для кнопки выхода
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    try {
        // Загрузка информации о пользователе
        const userResponse = await fetch('/api/user/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Не удалось загрузить информацию о пользователе');
        }

        const userData = await userResponse.json();
        // Показываем имя пользователя
        const userInfoBlock = document.querySelector('.user-info');
        if (userInfoBlock) {
            userInfoBlock.innerHTML = `<p><strong>Имя:</strong> <span id="user-name">${userData.name || ''}</span>`;
        }

        // Загрузка билетов пользователя
        const ticketsResponse = await fetch('/api/ticket/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!ticketsResponse.ok) {
            throw new Error('Не удалось загрузить билеты');
        }

        const tickets = await ticketsResponse.json();
        const ticketsContainer = document.getElementById('tickets-container');

        if (tickets.length === 0) {
            ticketsContainer.innerHTML = '<div class="no-tickets">У вас пока нет купленных билетов</div>';
            return;
        }

        // Загрузка информации о мероприятиях для каждого билета
        const ticketsWithEvents = await Promise.all(tickets.map(async (ticket) => {
            const eventResponse = await fetch(`/api/event/${ticket.eventId}`);
            if (!eventResponse.ok) {
                throw new Error('Не удалось загрузить информацию о мероприятии');
            }
            const event = await eventResponse.json();
            return { ...ticket, event };
        }));

        // Отображение билетов
        ticketsContainer.innerHTML = ticketsWithEvents.map(ticket => {
            const quantity = ticket.quantity || 1;
            const price = ticket.event.price || 0;
            return `
                <div class="ticket-card">
                    <div class="ticket-header">
                        <h3 class="ticket-title">${ticket.event.title}</h3>
                        <span class="ticket-id">№${ticket.id}</span>
                    </div>
                    <div class="ticket-info">
                        <p><strong>Дата:</strong> ${new Date(ticket.event.date).toLocaleDateString('ru-RU')}</p>
                        <p><strong>Время:</strong> ${new Date(ticket.event.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Количество билетов:</strong> ${quantity}</p>
                    </div>
                    
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Ошибка:', error);
        alert(error.message);
    }
});

function getStatusText(status) {
    switch (status) {
        case 'ACTIVE':
            return 'Активен';
        case 'USED':
            return 'Использован';
        case 'CANCELLED':
            return 'Отменен';
        default:
            return status;
    }
} 
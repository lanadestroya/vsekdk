document.addEventListener('DOMContentLoaded', async () => {
    // Получаем ID мероприятия из URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (!eventId) {
        alert('Не удалось определить мероприятие');
        window.location.href = 'poster.html';
        return;
    }

    try {
        // Загружаем информацию о мероприятии
        const response = await fetch(`http://localhost:5000/api/event/${eventId}`);
        if (!response.ok) {
            throw new Error('Не удалось загрузить информацию о мероприятии');
        }

        const event = await response.json();
        
        // Заполняем информацию о мероприятии
        document.querySelector('.event_title').textContent = event.title;
        document.getElementById('event-pic').src = `http://localhost:5000/uploads/${event.pic}`;
        document.getElementById('event-date').textContent = new Date(event.date).toLocaleDateString('ru-RU');
        document.getElementById('event-time').textContent = new Date(event.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('event-price').textContent = `${event.price} руб.`;
        document.getElementById('event-description').textContent = event.text;

        // Форматирование номера карты
        const cardNumber = document.getElementById('card-number');
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            e.target.value = value.replace(/(\d{4})/g, '$1 ').trim();
        });

        // Форматирование срока действия карты
        const cardExpiry = document.getElementById('card-expiry');
        cardExpiry.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });

        // Форматирование CVV
        const cardCvv = document.getElementById('card-cvv');
        cardCvv.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) value = value.slice(0, 3);
            e.target.value = value;
        });

        // Обработка формы покупки билета
        const form = document.getElementById('ticket-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                eventId: eventId,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                quantity: parseInt(document.getElementById('quantity').value),
                cardNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
                cardExpiry: document.getElementById('card-expiry').value,
                cardCvv: document.getElementById('card-cvv').value,
                cardHolder: document.getElementById('card-holder').value
            };

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Для покупки билета необходимо авторизоваться');
                    window.location.href = 'auth.html';
                    return;
                }

                const response = await fetch('http://localhost:5000/api/ticket', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error('Не удалось купить билет');
                }

                const result = await response.json();
                alert('Билет успешно куплен! Номер билета: ' + result.ticketId);
                window.location.href = 'lc.html';
            } catch (error) {
                alert(error.message);
            }
        });
    } catch (error) {
        alert(error.message);
        window.location.href = 'poster.html';
    }
}); 
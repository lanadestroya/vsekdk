const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/ticket', ticketRoutes); 
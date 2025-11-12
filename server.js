require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`🚀 BossBudget API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'Cargado correctamente' : '❌ No definido'}`);
});
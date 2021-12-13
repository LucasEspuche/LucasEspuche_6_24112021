const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Importation des différentes routes.
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

// Lecture des variables d'environnement.
require('dotenv').config();

// Connexion à la base de données.
mongoose.connect(process.env.DB_LOGIN,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// Définition du partage des ressources entre origines multiples (CORS).
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
const Sauce = require('../models/Sauce');
const fs = require('fs');

// Création d'une sauce.
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

// Modification d'une sauce.
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }));
};

// Suppression d'une sauce.
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// Afficher une sauce.
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Afficher la liste des sauces.
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// Gestion de la notation des sauces.
exports.userNotation = (req, res, next) => {
    // Appréciation positive.
    if (req.body.like === 1) {
        Sauce.updateOne(
            { _id: req.params.id },
            {
                $push: { usersLiked: req.body.userId },
                $inc: { likes: +1 }
            })
            .then(() => res.status(200).json({ message: 'Like envoyé !' }))
            .catch(error => res.status(400).json({ error }));
    }
    // Appréciation négative.
    if (req.body.like === -1) {
        Sauce.updateOne(
            { _id: req.params.id },
            {
                $push: { usersDisliked: req.body.userId },
                $inc: { dislikes: +1 }
            })
            .then(() => res.status(200).json({ message: 'Dislike envoyé !' }))
            .catch(error => res.status(400).json({ error }));
    }
    // Retrait des appréciations.
    if (req.body.like === 0) {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                // Retrait d'une appréciation positive.
                if (sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne(
                        { _id: req.params.id },
                        {
                            $pull: { usersLiked: req.body.userId },
                            $inc: { likes: -1 }
                        })
                        .then(() => res.status(200).json({ message: 'Like annulé !' }))
                        .catch(error => res.status(400).json({ error }));
                }
                // Retrait d'une appréciation négative.
                if (sauce.usersDisliked.includes(req.body.userId)) {
                    Sauce.updateOne(
                        { _id: req.params.id },
                        {
                            $pull: { usersDisliked: req.body.userId },
                            $inc: { dislikes: -1 }
                        })
                        .then(() => res.status(200).json({ message: 'Dislike annulé !' }))
                        .catch(error => res.status(400).json({ error }));
                }
            })
            .catch((error) => res.status(404).json({ error }))
    }
};
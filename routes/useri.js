const express = require('express');
const { sequelize, Users } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config();

const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));
const id = 0;

function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.status(401).json({ msg: err });
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        if (err) return res.status(403).json({ msg: err });
    
        req.user = user;
    
        next();
    });
}

route.use(authToken);

route.get('/users', (req, res) => {
    Users.findAll()
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

route.post('/modUser', (req, res) => {
    
    Users.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.admin) {
                Users.findOne({where:{ name: req.body.name}})
                    .then( rez => {
                        //console.log("Nasaooo");
                        rez.name = req.body.newname;
                        rez.admin = req.body.admin;
                        rez.moderator = req.body.moderator;
                     
                        rez.save()
                            .then( rows => res.json(rows) )
                            .catch( err => res.status(500).json(err) );
                    } )
                    .catch( err => res.status(500).json(err) );

            } else {
                res.status(403).json({ msg: "No permission"});
            }
        })
        .catch( err => res.status(500).json(err) );
        
});
route.post('/delUser', (req, res) => {
    
    Users.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.admin) {
                Users.findOne({ where: { name: req.body.name }, include: ['rentfilms'] })
                     .then( rez => {

                            rez.destroy()
                                .then( rows => res.json(rows) )
                                .catch( err => res.status(500).json(err) );
                }) 
        .catch( err => res.status(500).json(err) );
            

            } else {
                res.status(403).json({ msg: "No permission"});
            }
        })
        .catch( err => res.status(500).json(err) );
        
});
route.post('/match', (req, res) => {
    Users.findOne({ where: { id: req.user.userId } })
    .then( usr => {
        if (usr.admin) {
                Users.findOne({ where: { name: req.body.name } })
                    .then( usr => {
                        //console.log("radiii");
                        usr.password =  bcrypt.hashSync(req.body.newpassword, 10);
                
                        usr.save()
                            .then( rows => res.json(rows) )
                            .catch( err => res.status(500).json(err) );

                        // console.log("usao je u check");    
                          //  res.json(usr);
                    })
                    .catch( err => res.status(500).json(err) );
             } else {
                    res.status(403).json({ msg: "No permission"});
            }
         })
         .catch( err => res.status(500).json(err) );
});

module.exports = route;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', (req, res, next)=>{
    User.find({email: req.body.email}).exec().then(user=>{
        if(user.length > 0){
            return res.status(409).json({
                message: 'User exists'
            })
        } else{
            bcrypt.hash(req.body.password, 10, (err, hash)=>{
                if(err){
                    res.status(500).json({
                        error: err
                    });
                } else{
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    })
                    user.save().then(result=>{
                        res.status(201).json({
                            message: 'User created',
                            user: result
                        });
                    }).catch(err=>{
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
        
    });
})

router.post('/login', (req, res, next)=>{
    User.find({email: req.body.email}).exec().then(user=>{
        if(user.length < 1){
            return res.status(401).json({
                message: 'Authenticaltion Failed'  //Not printing user not found because then attackers will know which emails exist and which don't
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, response)=>{
            if(err){
                return res.status(401).json({
                    message: 'Authenticaltion Failed'  //Not printing user not found because then attackers will know which emails exist and which don't
                })
            }
            if(response){
                const token = jwt.sign({
                    email: user[0].email,
                    id: user[0]._id
                }, 'secretKey', {
                    expiresIn: '1h'
                });
                return res.status(200).json({
                    message: 'Auth successful',
                    token: token
                })
            }
            return res.status(401).json({
                message: 'Authenticaltion Failed'  //Not printing user not found because then attackers will know which emails exist and which don't
            })
        })
        
    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    });
});

router.delete('/:userId', (req, res, next)=>{
    User.remove({_id: req.params.userId}).exec().then(result=>{
        res.status(200).json({
            message: 'User deleted'
        })
    }).catch(err=>{
        res.status(500).json({
            error: err
        });
    });
})

module.exports = router;
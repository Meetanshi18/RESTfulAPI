const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

const Order = require('../models/order');
const Product = require('../models/product');

router.get('/',checkAuth , (req, res, next)=>{
    Order.find().populate("product").exec().then(docs=>{
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc=>{
                return {
                    _id: doc._id,
                    quantity: doc.quantity,
                    product: doc.product,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc._id 
                    }
                }
            })

        });
    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    });
})

router.post('/',checkAuth , (req, res, next)=>{
    //ensure that the product we are ordering exists first
    Product.findById(req.body.productId).exec().then(product=>{        
        // wrong productId gives null and not an error therefore the then block is executed so checking here again
        if(product === null){
            return res.status(500).json({
                message: "Product not found"
            })
        }

        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        });
    
        order.save().then(result=>{
            res.status(201).json({
                message: "Order saved",
                order: result
            });
        }).catch(err=>{
            res.status(500).json({
                error: err,
                message: "Order could not be saved"
            })
        });

    }).catch(err=>{
        res.status(500).json({
            error: err
        })
    });
    
    
})

router.get('/:orderId',checkAuth , (req, res, next)=>{
    Order.findById(req.params.orderId).populate("product").exec().then(order=>{
        if(!order){
            return res.status(404).json({
                message: "Order not found"
            });
        }
        res.status(200).json(order);
    }).catch(err=>{
        error: err
    });    
     
})

router.delete('/:orderId',checkAuth , (req, res, next)=>{
    Order.remove({_id: req.params.orderId}).exec().then(result=>{
        res.status(200).json({
            message: "Order deleted",
            result: result
        })
    }).catch(err=>{
        res.status(500).json({
            error: err,
            message: "Could not delete"
        })
    });
})

module.exports = router;
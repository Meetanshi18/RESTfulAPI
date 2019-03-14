const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');  // parses form-data
const checkAuth = require('../middleware/check-auth');


const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage, limits: {
    fileSize: 1024*1024*5 // 5MB size
}});

const Product = require('../models/product');

router.get('/', (req, res, next)=>{
    //.find().select('name price _id').exec().then().catch();
    Product.find().exec().then(docs =>{
        const response = {
            count: docs.length,
            products: docs.map(doc=>{
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products' + doc._id
                    }
                }
            })
        }
        console.log(docs);
        //if(docs.length > 0){
        res.status(200).json(response);  // I could directly pass docs instead of response
        // } else{
        //     res.status(404).json({
        //         message: "No entries found"
        //     })
        // }
        
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
})

router.post('/',checkAuth ,upload.single('productImage') ,(req, res, next)=>{
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    }); 
    
    product.save().then(result=>{
        console.log(result);
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name: result.name,
                price: result.price,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products' + result._id
                }
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    });


    
})

router.get('/:productId', (req, res, next)=>{
    const id = req.params.productId;
    Product.findById(id).exec().then(doc=>{
        console.log(doc);
        if(doc){
            res.status(200).json(doc);
        } else{
            res.status(404).json({
                message: "No entry found for provided ID"
            });
        }
        
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})

router.patch('/:productId',checkAuth , (req, res, next)=>{
    const id = req.params.productId;

    
    const updateOps = {};

    //how req.body looks like
    // [
    //     {"propName": "name", "value": "newName"}
    // ]

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    //updateOps looks something like 
    // {
    //     req.body.name: req.body.newName,
    //     req.body.price: req.body.newPrice
    // }
    Product.update({_id: id}, {$set: updateOps}).exec().then(result =>{
        res.status(200).json(result);
    }).catch(err=>{
        res.status(500).json({
            error: err
        });
    });

})

router.delete('/:productId', checkAuth , (req, res, next)=>{
    const id = req.params.productId;
    Product.remove({_id: id}).exec().then(result =>{
        res.status(200).json(result);
    }).catch(err=>{
        res.status(500).json({
            error: err
        });
    });
})

module.exports = router;
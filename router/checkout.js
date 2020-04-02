const express = require('express')
const router = express.Router()
const User = require("../models/user")
const verifyToken = require("./verify")
const Product = require("../models/product")
const stripe = require('stripe')(process.env.Stripe_Secret_key)
router.get("/checkout", verifyToken, async (req, res) => {

    let products = []

    const user = await User.findOne({
        _id: req.body.user._id
    })

    for (let i = 0; i < user.cart.length; i++) {

        let product = await Product.findOne({
            _id: user.cart[i].productId
        })
        product.quantity = user.cart[i].quantity
        products.push(product)

    }

    return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: user.cart.map( element => {
            return {
                name: element.name,
                amount: element.price*100,
                quantity: element.quantity,
                currency:"sek"
            }
        }),
        success_url:req.protocol + "://" + req.get("Host") + "/",
        cancel_url:req.protocol + "://" + req.get("Host") + "/cart"

    }).then( (session) => {
        res.render("shop/checkout.ejs", { products, sessionId:session.id })
    })
    
})

router.post("/checkout", verifyToken, (req, res) => {

    res.redirect("/thankyou")
})

module.exports = router
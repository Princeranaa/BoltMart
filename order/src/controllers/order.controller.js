const orderModel = require("../models/order.model");
const axios = require("axios");

exports.createOrder = async (req, res) => {
   const user = req.user;
    const token = req.cookies?.token || (req.headers.authorization ? req.headers.authorization.split(" ")[1] : null);

        if (!token) {
            return res.status(401).json({ message: "Missing authentication token" });
        }    

    try {

        // fetch user cart from cart service
        const cartResponse = await axios.get(`http://localhost:3003/api/cart`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const products = await Promise.all(cartResponse.data.cart.items.map(async (item) => {

            return (await axios.get(`http://localhost:3001/api/products/${item.productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })).data.data

        }))

        let priceAmount = 0;

        const orderItems = cartResponse.data.cart.items.map((item, index) => {


            const product = products.find(p => p._id === item.productId)

            // if not in stock, does not allow order creation

            if (product.stock < item.quantity) {
                throw new Error(`Product ${product.title} is out of stock or insufficient stock`)
            }

            const itemTotal = product.price.amount * item.quantity;
            priceAmount += itemTotal;

            return {
                product: item.productId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency
                }
            }
        })

        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: "PENDING",
            totalPrice: {
                amount: priceAmount,
                currency: "INR" // assuming all products are in USD for simplicity
            },
            shippingAddress: {
                street: req.body.shippingAddress.street,
                city: req.body.shippingAddress.city,
                state: req.body.shippingAddress.state,
                zip: req.body.shippingAddress.pincode,
                country: req.body.shippingAddress.country,
            }
        })


        // await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", order)

        res.status(201).json({ order })

    } catch (err) {
        res.status(500).json({ message: "Internal server error", error: err.message })
    }
};


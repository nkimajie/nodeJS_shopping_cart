const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

// routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// import model
const Product = require('./models/product');
const User = require('./models/user');
const cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Cart = require('./models/cart');


// midleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// user login
app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
        
});



app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);



// One to many relationship/association
Product.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE'
});
User.hasMany(Product);
User.hasOne(cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });


// telling sequelize to create the database tables
sequelize.sync()
// sequelize.sync({ force: true })
    .then(result => {
        return User.findByPk(1);
    })
    .then(user => {
        if(!user) {
           return User.create({ firstname: 'Max', lastname: 'Max', email: 'nkimajie2@gmail.com', password: 'ABab12.,'});
        }
        return user;
    })
    .then(user => {
        return user.createCart();   
    })
    .then(cart => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });



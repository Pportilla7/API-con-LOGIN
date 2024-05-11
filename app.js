const express=require('express');
const app=express();
const routes=require('./routes.js');

const session=require('express-session');
const body=require('body-parser');

const tokenV=require('./authMiddleware.js')

app.use(body.json());
app.use(body.urlencoded({extended:true}));

app.use(session({
    secret:'tu_secreto',
    resave:false,
    saveUnitialized:true,
    cookie:{secure:false}
}))

app.use('/', routes);

app.listen(3000, ()=>{
    console.log('Server listening...');
})
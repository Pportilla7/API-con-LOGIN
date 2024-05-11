const express=require('express');
const router=express.Router();

const users=require('./usuarios.js');

const bcrypt=require('bcrypt');

const axios=require('axios');

const {generationToken, validateToken}=require('./authMiddleware.js')

router.get('/', (req, res)=>{
    if (req.session.user) {
        res.redirect('/search');
    } else {
        const loginForm = `
            <h1>Iniciar sesión</h1>
            <form action="/login" method="post">
                <label for="username">Nombre de usuario:</label><br>
                <input type="text" id="username" name="username"><br>
                <label for="password">Contraseña:</label><br>
                <input type="password" id="password" name="password"><br><br>
                <input type="submit" value="Iniciar sesión">
            </form>
        `;
        res.send(loginForm); 
    }
})

router.post('/login', (req, res)=>{
    const {username, password}=req.body;
    console.log(username,password);
    console.log(users);
    const user=users.find(u => u.username===username);
    console.log(user, 'este es el usuario');
    if(user){
        bcrypt.compare(password,user.password, function(err, result){
            if(result){
                console.log('la contraseña es correcta');
                const token=generationToken(user);
                req.session.token=token;
                res.redirect('/search');
            }
            else{
                res.status(401).json({error:'Contraseña incorrecta'});
            }
        }) 
    }
    else{
        res.status(401).json({error:'No existe usuario con esa contraseña'});
    }
})

router.get('/search', validateToken, (req, res)=>{
    res.send(`<form action="/search" method="post">
    <label for="nameCharacter">Nombre de personaje:</label><br>
    <input type="text" id="nameCharacter" name="nameCharacter"><br>
    <input type="submit" value="Buscar">
</form>
<form action="/characters" method="post"> <button type="submit">Buscar todos los personajes</button> </form>
<form action="/logout" method="post"> <button type="submit">Cerrar sesión</button> </form>`);
})

router.post('/search', (req, res)=>{
    const {nameCharacter}=req.body;
    res.redirect(`/characters/${nameCharacter}`);
})

router.get('/characters/:name', async (req, res)=>{
    const name=req.params.name;
    console.log(name);
    const url=`https://rickandmortyapi.com/api/character/?name=${name}`;
    console.log(url);
    let HTML='';
    try{
        const response = await axios.get(url);
        const {results} = response.data;
        
        results.forEach((personaje)=>{
            console.log(personaje);
            HTML+= `<h3>${personaje.name}</h3>
            <img src="${personaje.image}" alt="${personaje.name}">`
        })
        res.send(HTML)
    }
    catch{
        res.status(401).json({error:'No se pudo obtener el personajes'});
    }
})

router.post('/characters', async (req, res)=>{
    let urlPages='https://rickandmortyapi.com/api/character';
    try{
        const response = await axios.get(urlPages);
        const {info:{pages}}=response.data;
        let characters=[];
        for (let i=1;i<=pages;i++){
            let url=`https://rickandmortyapi.com/api/character/?page=${i}`
            console.log(i,url);
            try{
                const response = await axios.get(url);
                const {results} = response.data;
                for (let result of results){
                    const {id, name, species, image}=result;
                    const newCharacter={
                        id: id,
                        name:name,
                        species:species,
                        img: image
                    }
                    characters.push(newCharacter);
                } 
            }
            catch{
                res.status(401).json({error:'No se puedieron obtener los personajes'});
            }
        }
        res.json({characters});
    }
    catch{
        res.status(401).json({error:'No se puedieron obtener los personajes'});
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

module.exports=router;



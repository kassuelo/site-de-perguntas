const express = require("express");
const app = express();
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//traduz os dados enviados pelo formulário em uma estrutura q o back-end do node js entende
const bodyParser = require("body-parser");

//Database
connection
.authenticate()
.then(() =>{
    console.log("Conexão feita com o banco de dados!")
})
.catch((msgErro) => {
    console.log(msgErro);
})
//estou dizendo para o express para usar o ejs como view engine
app.set('view engine','ejs');

//todos arquivos estaticos como css e imagens vao ficar na pasta public
app.use(express.static('public'));

//BodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Rotas
app.get("/",(req,res) => {
    Pergunta.findAll({raw:true, order:[
        ['id','DESC'] //DESC decrescente ASC crescente
    ]}).then(perguntas =>{
        res.render("index",{
            perguntas:perguntas
        });
    });

});

app.get("/perguntar",(req,res) =>{
    res.render("perguntar");
});

app.post("/salvarpergunta",(req,res) => {
    var titulo = req.body.titulo;  
    var descricao = req.body.descricao;
    Pergunta.create({
        titulo:titulo,
        descricao:descricao
    }).then(() => {
        res.redirect("/");
    });
});

app.get("/pergunta/:id", (req,res) => {
    var id = req.params.id;
    Pergunta.findOne({
        where: {id: id}
    }).then(pergunta => {
        if(pergunta != undefined){ //pergunta encontrada

            Resposta.findAll({
                where: {
                    perguntaId:pergunta.id
                },
                order: [
                    ['id','DESC']
                ]
            }).then(respostas => {
                res.render("pergunta",{
                    pergunta:pergunta,
                    respostas: respostas
                });
            });


            

        }else{ //não encontrada
            res.redirect("/");
        }

    });
});

app.post("/responder", (req,res) => {
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;
    Resposta.create({
        corpo:corpo,
        perguntaId: perguntaId
    }).then(() => {
        res.redirect("/pergunta/"+ perguntaId);
    });
});

app.listen(80,() =>{console.log("App rodando...");});
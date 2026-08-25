const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const porta = 3000;

// Configurações para ler os dados do formulário HTML
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Permite que o servidor mostre os arquivos HTML, CSS e imagens
app.use(express.static(__dirname));

// Conectando ao Banco de Dados
const db = new sqlite3.Database('./banco.sqlite', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso!');
        
        // O serialize cria uma "fila" obrigatória. O Node não vai se apressar!
        db.serialize(() => {
            // 1. Primeiro cria a tabela
            db.run(`CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                senha TEXT
            )`);
            
            // 2. Só DEPOIS de criar a tabela, ele insere o usuário
            db.run(`INSERT OR IGNORE INTO usuarios (email, senha) VALUES ('teste@fap.com', '123456')`);
        });
    }
});

// Rota de Login
app.post('/login', (req, res) => {
    const emailDigitado = req.body.email;
    const senhaDigitada = req.body.senha;

    const sql = `SELECT * FROM usuarios WHERE email = ? AND senha = ?`;
    
    db.get(sql, [emailDigitado, senhaDigitada], (err, row) => {
        if (err) {
            return res.status(500).send("Erro interno do servidor.");
        }
        
        if (row) {
            // Se encontrou o usuário no banco, manda para a tela de opções!
            res.redirect('/src/pages/opcoes.html');
        } else {
            // Se errou e-mail ou senha
            res.status(401).send(`
                <h1>E-mail ou senha incorretos. 😢</h1> 
                <a href="javascript:history.back()">Voltar e tentar novamente</a>
            `);
        }
    });
});

// Ligando o servidor
app.listen(porta, () => {
    console.log(`Servidor rodando na porta http://localhost:${porta}`);
});
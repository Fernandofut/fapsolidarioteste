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
            db.run(`CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT,
                email TEXT UNIQUE,
                senha TEXT,
                tipo TEXT DEFAULT 'Comum'
            )`);
            
            db.run(`INSERT OR IGNORE INTO usuarios (nome, email, senha, tipo) VALUES ('Usuário Teste', 'teste@fap.com', '123456', 'Comum')`);

            db.run(`CREATE TABLE IF NOT EXISTS estoque (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_item TEXT,
                categoria TEXT,
                quantidade INTEGER,
                empresa_nome TEXT,
                data_validade TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_item INTEGER,
                usuario_email TEXT,
                quantidade_pedida INTEGER,
                data_pedido TEXT
            )`);
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

// Rota de Cadastro
app.post('/cadastrar', (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).send(`<h1>Preencha todos os campos obrigatórios.</h1><a href="javascript:history.back()">Voltar</a>`);
    }

    const sql = `INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)`;

    db.run(sql, [nome, email, senha, tipo], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).send(`
                    <h1>Este e-mail já está cadastrado.</h1>
                    <a href="javascript:history.back()">Voltar e tentar novamente</a>
                `);
            }
            return res.status(500).send("Erro interno do servidor.");
        }
        res.redirect('/index.html');
    });
});

// Rota para adicionar item ao estoque
app.post('/adicionar-estoque', (req, res) => {
    const { nome_item, categoria, quantidade, empresa_nome, data_validade } = req.body;

    if (!nome_item || !categoria || !quantidade || !empresa_nome) {
        return res.status(400).send(`<h1>Preencha todos os campos obrigatórios.</h1><a href="javascript:history.back()">Voltar</a>`);
    }

    const sql = `INSERT INTO estoque (nome_item, categoria, quantidade, empresa_nome, data_validade) VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [nome_item, categoria, parseInt(quantidade), empresa_nome, data_validade || null], function(err) {
        if (err) {
            return res.status(500).send("Erro ao adicionar item ao estoque.");
        }
        res.redirect('/src/pages/estoque.html');
    });
});

// API para consultar estoque em JSON
app.get('/api/estoque', (req, res) => {
    const sql = `SELECT * FROM estoque`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao consultar estoque." });
        }
        res.json(rows);
    });
});

// API Dashboard: dados agregados para analytics
app.get('/api/dashboard', (req, res) => {
    const sqlPorCategoria = `SELECT categoria, SUM(quantidade) as total FROM estoque GROUP BY categoria ORDER BY total DESC`;
    const sqlRanking = `SELECT empresa_nome, SUM(quantidade) as total_doado FROM estoque GROUP BY empresa_nome ORDER BY total_doado DESC`;

    db.all(sqlPorCategoria, [], (err, categorias) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao consultar dashboard." });
        }
        db.all(sqlRanking, [], (err, ranking) => {
            if (err) {
                return res.status(500).json({ erro: "Erro ao consultar dashboard." });
            }
            res.json({ categorias, ranking });
        });
    });
});

// Rota para pedir um item do estoque (baixa automática com transaction)
app.post('/pedir-item', (req, res) => {
    const { id_item, quantidade_pedida, usuario_email } = req.body;
    const qtd = parseInt(quantidade_pedida);

    if (!id_item || !qtd || qtd <= 0) {
        return res.status(400).json({ sucesso: false, mensagem: "Dados inválidos." });
    }

    db.get(`SELECT * FROM estoque WHERE id = ?`, [id_item], (err, item) => {
        if (err) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro interno." });
        }
        if (!item) {
            return res.status(404).json({ sucesso: false, mensagem: "Item não encontrado." });
        }
        if (item.quantidade < qtd) {
            return res.status(400).json({ sucesso: false, mensagem: `Estoque insuficiente. Disponível: ${item.quantidade}` });
        }

        const dataPedido = new Date().toISOString().split('T')[0];
        const sqlPedido = `INSERT INTO pedidos (id_item, usuario_email, quantidade_pedida, data_pedido) VALUES (?, ?, ?, ?)`;
        const sqlBaixa = `UPDATE estoque SET quantidade = quantidade - ? WHERE id = ? AND quantidade >= ?`;

        db.serialize(() => {
            db.run(sqlPedido, [id_item, usuario_email || 'anonimo@test.com', qtd, dataPedido], function(err) {
                if (err) {
                    return res.status(500).json({ sucesso: false, mensagem: "Erro ao registrar pedido." });
                }
                db.run(sqlBaixa, [qtd, id_item, qtd], function(err) {
                    if (err || this.changes === 0) {
                        return res.status(500).json({ sucesso: false, mensagem: "Erro ao dar baixa no estoque." });
                    }
                    const novaQtd = item.quantidade - qtd;
                    res.json({ sucesso: true, mensagem: `Pedido realizado! ${qtd}x "${item.nome_item}" retirado(s). Estoque restante: ${novaQtd}` });
                });
            });
        });
    });
});

// Ligando o servidor
app.listen(porta, () => {
    console.log(`Servidor rodando na porta http://localhost:${porta}`);
});
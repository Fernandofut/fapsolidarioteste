# 🤝 FAP Solidário

> 🎓 Projeto desenvolvido para a disciplina de **Projeto e Desenvolvimento de Sistemas**.

## 📌 Sobre o Projeto
O **FAP Solidário** é uma plataforma web desenvolvida para facilitar e incentivar doações. O sistema visa conectar pessoas e empresas que desejam doar (dinheiro, alimentos, roupas, móveis, etc.) a campanhas de arrecadação, tornando o processo de ajuda transparente, rápido e acessível para todos.

## 🚀 Status e Funcionalidades
O sistema conta com **Front-end completo**, **Back-end com autenticação** e **banco de dados SQLite** integrados.

* **✅ Concluído:** Telas de navegação, categorias de doação (alimentos, roupas, higiene, etc.), interface do usuário (UI), tela de **Login/Autenticação**, modelagem e conexão com o **Banco de Dados**.
* **⏳ Próximos Passos:** Cadastro de novos usuários, registro de doações realizadas e painel administrativo.

## 🛠️ Tecnologias Utilizadas
* **HTML5 e CSS3:** Estruturação semântica e estilização completa das páginas.
* **Node.js e Express:** Back-end e rotas de autenticação (`POST /login`).
* **SQLite3:** Banco de dados local (`banco.sqlite`) com a tabela `usuarios`.

## 🧭 Fluxo de Navegação
```
Tela de Login (/)  ──►  POST /login  ──►  Menu de Opções (src/pages/opcoes.html)
                                              │
                    ┌───────────────┬──────────┴───────────────┐
                    ▼               ▼                          ▼
             FAZER DOAÇÕES    RECEBER DOAÇÕES          MAIS INFORMAÇÕES
             (doar.html)      (receberdoacao.html)      (informaçoes.html)
```

## 📁 Estrutura de Pastas
```
fapsolidario/
├── index.html                    # Tela de Login (porta de entrada do sistema)
├── server.js                     # Back-end Express + SQLite
├── package.json                  # Dependências e scripts do Node
├── node_modules/                 # Dependências instaladas (não vai pro Git)
├── banco.sqlite                  # Banco de dados gerado automaticamente
│
├── src/
│   └── pages/                    # Todas as páginas internas do sistema
│       ├── opcoes.html           # Menu principal com as opções de navegação
│       ├── doar.html             # Escolha do tipo de doação (roupas, alimentos, etc.)
│       ├── receberdoacao.html    # Página para receber doações
│       ├── roupas.html           # Detalhes de doação de roupas e acessórios
│       ├── alimentos.html        # Detalhes de doação de alimentos
│       ├── dinheiro.html         # Detalhes de doação em dinheiro
│       ├── moveisehigiene.html   # Doação de móveis, higiene e cultura
│       ├── informaçoes.html      # Contatos, localização e mapa da sede
│       └── css/
│           ├── style_home.css    # Estilos da tela de opções
│           ├── styledoar.css     # Estilos da página de doação
│           ├── style.css         # Estilos da página de receber doação
│           ├── stylealimentos.css
│           ├── styledinheiro.css
│           ├── styleroupas.css
│           ├── stylemoveisehigiene.css
│           ├── style_info.css
│           └── assets/
│               └── fap.jpeg      # Logo do projeto
│
└── Docs/                         # Documentação e requisitos do sistema
    ├── documento_requisitos.md
    ├── perfisdeusuario
    ├── regrasdenegocio
    ├── requisitosdeusuario
    ├── requisitosfuncionais
    └── requisitosnaofuncionais
```

## ⚙️ Como executar o projeto
Pré-requisito: **Node.js** instalado na máquina.

1. Clone este repositório na sua máquina.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   # ou: node server.js
   ```
4. Acesse no navegador: **http://localhost:3000**

A aplicação abre na **tela de Login**. Use o usuário de teste:
* **E-mail:** `teste@fap.com`
* **Senha:** `123456`

Após o login, você é redirecionado para o **menu de opções** (`src/pages/opcoes.html`).

## 📂 Documentação e Requisitos
Toda a documentação técnica exigida pelo professor, contendo o escopo e o mapeamento do sistema, encontra-se na pasta `Docs`.

* [📄 Acessar Documento de Requisitos](./Docs/documento_requisitos.md)

## 👨‍💻 Equipe de Desenvolvimento
* Fernando Nunes Lopes
* João Victor Bueno Ribeiro
* Pedro Henrique Anicesio Alves
* Pedro Henrique Silva Fontenele
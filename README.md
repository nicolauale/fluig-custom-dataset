# TOTVS Fluig - Custom Dataset & Queries

Execute suas queries diretamente na base de dados do ERP (Protheus, Datasul, Logix, SAP, ...) sem a necessidade de utilização de WebService.


## Preparação

Copie os arquivos "db_generic_dataset.js" e "db_generic_sqldataset.js" para a pasta "datasets" do seu projeto Fluig dentro do Eclipse e exporte para seu servidor Fluig.

```bash
db_generic_dataset.js = Arquivo Javascript para criação de datasets customizados e apenas para "select", utilizando os padrões de dataset do Fluig.

db_generic_sqldataset.js = Arquivo Javascripr para criação de datasets customizados e execução de quaisquer queries (select, insert, update, delete, execute, ...), utilizando padrão SQL de acordo com seu gerenciador de banco de dados (Oracle, MS SQL, MySQL, etc).
```

## Como utilizar db_generic_dataset.js

Nesse exemplo acessaremos o cadastro de clientes do TOTVS Protheus, pelo Fluig, sem necessidade de utilizar um WebService, colocando o código dentro da rotina na qual precisamos acessar os dados ou pode ser criado um novo arquivo .js de nome, por exemplo, "cliente.js".

```javascript

// Cria um array com os parâmetros de acesso, tabela e campos
var fieldArray = new Array("/jdbc/FluigDSRO", "PROTHEUS.SA1010", "A1_COD", "A1_NOME", "A1_CGC");
	
// Cria uma consraint de "like"
var c1 = DatasetFactory.createConstraint("A1_NOME", "%NICOLAU%", "%NICOLAU%", ConstraintType.MUST);
c1.setLikeSearch(true);
var constra = new Array(c1);
// ---

// Cria o dataset com o retorno do "select" 
var dsTranslator = DatasetFactory.getDataset("db_generic_dataset", fieldArray, constra, null);

```


## Como utilizar db_generic_sqldataset.js

Nesse exemplo acessaremos o cadastro de fornecedores do TOTVS Protheus, pelo Fluig, sem necessidade de utilizar um WebService, colocando o código dentro da rotina na qual precisamos acessar os dados ou pode ser criado um novo arquivo .js de nome, por exemplo, "fornecedor.js".

```javascript

var fieldArray = new Array("/jdbc/FluigDSRO", "select * FROM PROTHEUS.SA2010 ");
		
var dsTranslator = DatasetFactory.getDataset("db_generic_sqldataset", fieldArray, null, null);

```

Ou para executar um comando de "update", para o caso de comandos diferentes de "select" o retorno será a quantidade de linhas afetadas pelo comando SQL.

```javascript

var fieldArray = new Array("/jdbc/FluigDSRO", "update PROTHEUS.SA2010 set A2_NOME = 'ALEXANDRE NICOLAU' where A1_FILIAL = '01' and A2_COD = '001'");
		
var dsTranslator = DatasetFactory.getDataset("db_generic_sqldataset", fieldArray, null, null);

```


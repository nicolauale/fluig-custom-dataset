function createDataset(fields, constraints, sortFields) {
	/* +-------------------------------------------------------------------------+
	 * | Script padrão para seleção de dados em datasets internos ou externos do |
	 * | do Fluig.                                                               |
	 * +-------------------------------------------------------------------------+
	 * | Desenvolvido por Alexandre Nicolau.                                     |
	 * +-------------------------------------------------------------------------+
	 * | Parâmetros:                                                             |
	 * |                                                                         |
	 * | - fields                                                                |
	 * |   [0] = Enviar o nome do datasource a ser utilizado para conexão aos    |
	 * |         dados. Exemplo: "/jdbc/FluigDSRO"                               |
	 * |                                                                         |
	 * |   [1] = Enviar o nome do tabela a ser utilizada no sql.                 |
	 * |         Exemplo: "SA1010" ou "Protheus.dbo.SA1010".                     |
	 * |                                                                         |
	 * |   [2...x] = Nome dos campos a serem selecionados no sql. Caso não seja  |
	 * |         enviado nenhum campo será assumido "*" (todos).                 |
	 * |         Exemplo: "A1_COD", ...                                          |
	 * |                                                                         |
	 * | Demais parâmetros devem ser utilizados com o padrão Fluig.              |
	 * |                                                                         |
	 * +-------------------------------------------------------------------------+
	 */
	
	
	// cria o dataset
	var newDataset = DatasetBuilder.newDataset();
	
	// verifica se foi informada a tabela e campos
	if (fields == null) {
		newDataset.addColumn("INFO");
		newDataset.addRow(["Informe a tabela e campos a serem selecionados!"]);
		return newDataset;
	}
	// ---

	try {
		// cria os campos de tabela e campos
		var strBase = "";
		var strTabela = "";
		var strCampos = "";
		// ---

		// loop para armazenar o nome da tabela e campos
		for (var iX = 0; iX < fields.length; iX++) {

			// switch de identificação do campo a ser preenchido
			switch (iX) {
			case 0:
				strBase = fields[iX];
				break;
			case 1:
				strTabela = fields[iX];
				break;
			default:
				if (strCampos == "") {
					strCampos += fields[iX];
				} else {
					strCampos += "," + fields[iX];
				}
			}
			// ---
		}
		// ---

		// verifica se deve retornar todos os campos da tabela
		if (strCampos == "") {
			strCampos = "*";
		}
		// ---

		// cria a variável do comando sql
		var strQuery = "SELECT " + strCampos + " FROM " + strTabela;

		// verifica se foram informadas constraints
		if (constraints != null) {
			// inicializa as variáveis de controle de constraints
			var boolPrimeira = true;
			var mapIn = new java.util.HashMap();
			// ---

			// loop nas constraints para montar o sql
			for (var iX = 0; iX < constraints.length; iX++) {
	
				// verifica a opção do tipo de constraint para "should"
				if (constraints[iX].constraintType == "SHOULD") {
					// verifica se já existe a opção
					if (mapIn.containsKey(constraints[iX].fieldName)) {
						var valor = mapIn.get(constraints[iX].fieldName);
						mapIn.remove(constraints[iX].fieldName);
						
						valor += ", '" + constraints[iX].initialValue + "'";
						mapIn.put(constraints[iX].fieldName, valor);
					} else {
						mapIn.put(constraints[iX].fieldName, "'"+constraints[iX].initialValue+"'");
					}
					// ---
				} else {
					// verifica se é a primeira cláusula
					if (boolPrimeira) {
						strQuery += " WHERE (";
						boolPrimeira = false;
					} else {
						strQuery += "   AND (";
					}
					// ---
					
					// adiciona o nome do campo no sql
					strQuery += constraints[iX].fieldName;
					
					// verifica se foi utilizada a opção "like"
					if (constraints[iX].likeSearch) {
						// trata o valor da busca "like"
						var sTextoLike = constraints[iX].initialValue;
						
						if (sTextoLike.search("%") == -1) {
							sTextoLike = "%" + sTextoLike + "%";
						}
						// ---						
						
						// verifica a opção o tipo da constraint
						if (constraints[iX].constraintType == "MUST") {
							strQuery += " LIKE '" + sTextoLike + "'";  
						} else {
							strQuery += " NOT LIKE '" + sTextoLike + "'";  
						}
						// ---
					} else {
						// verifica a opção o tipo da constraint
						if (constraints[iX].constraintType == "MUST") {
							// verifica se os campos são diferentes
							if (constraints[iX].initialValue != constraints[iX].finalValue) {
								strQuery += " BETWEEN '" + constraints[iX].initialValue + "' AND '" + constraints[iX].finalValue + "'";
							} else {
								strQuery += " = '" + constraints[iX].initialValue + "'"; 
							}
							// ---
						} else {
							// verifica se os campos são diferentes
							if (constraints[iX].initialValue != constraints[iX].finalValue) {
								strQuery += " NOT BETWEEN '" + constraints[iX].initialValue + "' AND '" + constraints[iX].finalValue + "'"; 
							} else {
								strQuery += " <> '" + constraints[iX].initialValue + "'"; 
							}
							// ---
						}
						// ---
					}
					// -- (fim do bloco verifica se foi utilizada a opção "like")
					
					// finaliza a cláusula da query
					strQuery += ")";
				}
				// --- (fim do bloco verifica a opção do tipo de constraint para "should")
			}
			// --- (fim do bloco loop nas constraints para montar o sql)
			
			// verifica se existe cláusula "should"
			if (mapIn.size() != 0) {
				// loop no hashmap
				for (var mapKey in mapIn) {
					// verifica se é a primeira cláusula
					if (boolPrimeira) {
						strQuery += " WHERE (";
						boolPrimeira = false;
					} else {
						strQuery += "   AND (";
					}
					// ---
					
					// adiciona a cláusula no sql
					strQuery += mapKey + " IN (" + mapIn[mapKey] + ")";				
				}
				// ---
				
				// limpa o objeto de mapeamento
				mapIn.clear();
			}
			// ---
		}
		// --- (fim do bloco verifica se foram informadas constraints)

		// verifica se existem índices solicitados
		if (sortFields != null) {
			strQuery += " ORDER BY ";
			
			// loop para armazenar os índices da query
			for (var iX = 0; iX < sortFields.length; iX++) {
				if (iX == 0) {
					strQuery += sortFields[iX];
				} else {
					strQuery += ", " + sortFields[iX];
				}
			}
			// ---
		}
		// --- (fim do bloco verifica se existem índices solicitados)
	
		// adiciona o sql no LOG
		log.info("DYNAMIC QUERY:\n" + strQuery);
		
		// ### Bloco de manipulação da base de dados
		var dataSource = strBase;
		var ic = new javax.naming.InitialContext();
		var ds = ic.lookup(dataSource);
		var created = false;

		var conn = ds.getConnection();
		var stmt = conn.createStatement();
		var rs = stmt.executeQuery(strQuery);
		var columnCount = rs.getMetaData().getColumnCount();
		
		
		while(rs.next()) {
			
			if(!created) {
				for(var i=1;i<=columnCount; i++) {
					newDataset.addColumn(rs.getMetaData().getColumnName(i));
				}
				created = true;
			}
			
			var Arr = new Array();
			
			for(var i=1;i<=columnCount; i++) {
				var obj = rs.getObject(rs.getMetaData().getColumnName(i));
				if (null!=obj) {
					Arr[i-1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
				}
				else {
					Arr[i-1] = "null";
				}
			}
			
			newDataset.addRow(Arr);
		}
		// ### Fim do bloco de manipulação da base de dados
	} catch(e) {
		log.error("DYNAMIC QUERY ERROR:\n" + e.message);
	} finally {
		if(stmt != null) stmt.close();
		if(conn != null) conn.close();		
	}

	// retorna o resultado da query
	return newDataset;	
}
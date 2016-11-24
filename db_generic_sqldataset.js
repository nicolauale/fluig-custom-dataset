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
	 * |   [1] = Enviar o comando SQL a ser executado no dataset.                |
	 * |         Exemplo: "SELECT ..." ou "UPDATE ..." ou "DELETE ..."           |
	 * |                                                                         |
	 * | Demais parâmetros serão ignorados pelo dataset.                         |
	 * |                                                                         |
	 * +-------------------------------------------------------------------------+
	 */
	
	
	// cria o dataset
	var newDataset = DatasetBuilder.newDataset();
	
	// verifica se foi informada a tabela e campos
	if (fields == null) {
		newDataset.addColumn("INFO");
		newDataset.addRow(["Informe a tabela e SQL a ser executado!"]);
		return newDataset;
	}
	// ---

	try {
		// cria os campos de tabela e campos
		var strBase  = "";
		var strQuery = "";
		// ---

		// loop para armazenar o nome da tabela e campos
		for (var iX = 0; iX < fields.length; iX++) {

			// switch de identificação do campo a ser preenchido
			switch (iX) {
			case 0:
				strBase = fields[iX];
				break;
			case 1:
				strQuery = fields[iX];
				break;
			}
			// ---
		}
		// ---

		// verifica se deve retornar todos os campos da tabela
		if (strQuery == "") {
			newDataset.addColumn("INFO");
			newDataset.addRow(["Informe a tabela e SQL a ser executado!"]);
			return newDataset;
		}
		// ---
	
		// modifica o comando SQL para uppercase
		// strQuery = strQuery.toUpperCase();
		
		// adiciona o sql no LOG
		log.info("DYNAMIC QUERY:\n" + strQuery);
		
		// ### Bloco de manipulação da base de dados
		var dataSource = strBase;
		var ic = new javax.naming.InitialContext();
		var ds = ic.lookup(dataSource);
		var created = false;

		var conn = ds.getConnection();
		var stmt = conn.createStatement();
		// ---
		
		// verifica se o comando enviado é um SELECT
		if (strQuery.search(/select/i) != -1) {
			// executa a query de "select" 
			var rs = stmt.executeQuery(strQuery);
			var result = rs.getMetaData();
			var columnCount = rs.getMetaData().getColumnCount();
			// ---
			
			// loop nos registros da query  
			while(rs.next()) {
				// verifica se não foram criadas as colunas
				if(!created) {
					for(var i = 1; i <= columnCount; i++) {
						newDataset.addColumn(rs.getMetaData().getColumnName(i));
					}
					
					created = true;
				}
				// ---
				
				var Arr = new Array();
				
				for(var i = 1; i <= columnCount; i++) {
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
			// --- fim do loop
		} else {
			var rs = stmt.executeUpdate(strQuery);
			
			newDataset.addColumn("RowsAffected");
			newDataset.addRow([rs.toString()]);
		}
		// --- (fim do bloco verifica se o comando enviado é um SELECT)
	} catch(e) {
		log.error("DYNAMIC QUERY ERROR:\n" + e.message);
	} finally {
		if(stmt != null) stmt.close();
		if(conn != null) conn.close();		
	}

	// retorna o resultado da query
	return newDataset;	
}
package com.evansong.backend.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/** Igual que en el ejemplo de la tarea (DriverManager.getConnection), pero centralizado
 *  para no repetir url/usuario/contraseña en cada Route, y para soportar MySQL o PostgreSQL
 *  según config.properties. */
public final class ConnectionManager {

    private ConnectionManager() {}

    public static Connection getConnection() throws SQLException {
        String tipo = AppConfig.dbType();
        String url;

        if (tipo.equals("postgresql") || tipo.equals("postgres")) {
            url = "jdbc:postgresql://" + AppConfig.dbHost() + ":" + AppConfig.dbPort() + "/" + AppConfig.dbName();
        } else {
            
        url = "jdbc:mysql://" + AppConfig.dbHost() + ":" + AppConfig.dbPort() + "/" + AppConfig.dbName()
        + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8"
        + "&connectTimeout=5000&socketTimeout=8000";
        }

        return DriverManager.getConnection(url, AppConfig.dbUser(), AppConfig.dbPassword());
    }
}

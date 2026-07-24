package com.evansong.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {

    // Cambia estos datos por los tuyos
    private static final String URL = "jdbc:mysql://localhost:3306/evansong";
    private static final String USER = "r";
    private static final String PASSWORD = "b";

    static {
        try {

            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("Driver MySQL cargado correctamente.");

        } catch (ClassNotFoundException e) {
            throw new RuntimeException("No se encontró el Driver de MySQL.");
        }
    }

    public static Connection getConnection() throws SQLException {

        return DriverManager.getConnection(
                URL,
                USER,
                PASSWORD

        );
    }
}

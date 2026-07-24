package com.evansong.backend.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

/** Lee config.properties (en la raíz del proyecto, junto al pom.xml). */
public final class AppConfig {

    private static final Properties PROPS = new Properties();

    static {
        try {
            Path path = Path.of("config.properties");
            if (Files.exists(path)) {
                try (InputStream is = Files.newInputStream(path)) {
                    PROPS.load(is);
                }
            } else {
                try (InputStream is = AppConfig.class.getClassLoader().getResourceAsStream("config.properties")) {
                    if (is != null) PROPS.load(is);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("No se pudo leer config.properties", e);
        }
    }

    private AppConfig() {}

    /**
     * Busca primero en variables de entorno (ideal para AWS: EC2, Elastic Beanstalk,
     * ECS, etc, donde configuras esto en la consola sin tocar archivos), y si no
     * existe cae al config.properties, y si tampoco existe usa el valor por defecto.
     * Ejemplo: db.host -> variable de entorno DB_HOST
     */
    public static String get(String key, String porDefecto) {
        String envKey = key.toUpperCase().replace('.', '_');
        String envValor = System.getenv(envKey);
        if (envValor != null && !envValor.isBlank()) return envValor;
        return PROPS.getProperty(key, porDefecto);
    }

    public static String dbType() { return get("db.type", "mysql").toLowerCase(); }
    public static String dbHost() { return get("db.host", "localhost"); }
    public static String dbPort() { return get("db.port", dbType().equals("postgresql") ? "5432" : "3306"); }
    public static String dbName() { return get("db.name", "evansong"); }
    public static String dbUser() { return get("db.user", "root"); }
    public static String dbPassword() { return get("db.password", ""); }
    public static int serverPort() { return Integer.parseInt(get("server.port", "3000")); }

    public static String jwtSecret() { return get("jwt.secret", "clave-temporal-insegura-cambiar"); }
    public static int jwtExpiracionHoras() { return Integer.parseInt(get("jwt.expiracion.horas", "12")); }

    public static String[] corsOrigenes() {
        String valor = get("cors.origenes", "http://localhost:5173");
        return valor.split(",");
    }
}

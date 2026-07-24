package com.evansong.backend;

import com.evansong.backend.config.AppConfig;
import com.evansong.backend.routes.*;
import com.evansong.backend.util.AuthMiddleware;
import io.javalin.Javalin;

public class Main {

    public static void main(String[] args) {

        Javalin app = Javalin.create(config -> {
            // --- CORS: permite que el frontend (otro origen) llame a esta API ---
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(rule -> {
                    for (String origen : AppConfig.corsOrigenes()) {
                        rule.allowHost(origen.trim());
                    }
                });
            });
        });

        // --- Filtro global de autenticacion: exige JWT valido en todas las
        //     rutas excepto /auth/login y /auth/registro ---
        app.before(AuthMiddleware.filtroGlobal());

        // --- Autenticación ---
        AuthRoutes.register(app);

        // --- Whitelist de correos de coordinador (protegida dentro de sus rutas) ---
        CorreoCoordinadorRoutes.register(app);

        // --- Usuarios (protegida dentro de sus rutas) ---
        UsuarioRoutes.register(app);

        // --- Finanzas: solo Coordinador puede ver o modificar movimientos ---
        app.before("/finanzas", ctx -> AuthMiddleware.exigirRol(ctx, "Coordinador"));
        app.before("/finanzas/*", ctx -> AuthMiddleware.exigirRol(ctx, "Coordinador"));

        // --- Catálogos y contenido (cualquier usuario autenticado) ---
        TiempoLiturgicoRoutes.register(app);
        MomentoMisaRoutes.register(app);
        CantoRoutes.register(app);
        ListaRoutes.register(app);
        ListaCantoRoutes.register(app);
        EsquemaRoutes.register(app);
        DetalleEsquemaRoutes.register(app);
        EventoRoutes.register(app);
        AsistenciaRoutes.register(app);
        PublicacionRoutes.register(app);
        InventarioRoutes.register(app);
        FinanzaRoutes.register(app);

        int port = AppConfig.serverPort();
        app.start(port);

        System.out.println("======================================================");
        System.out.println(" Evansong Backend (Javalin)");
        System.out.println(" Escuchando en: http://localhost:" + port);
        System.out.println(" Base de datos: " + AppConfig.dbType() + "://" + AppConfig.dbHost() + ":" + AppConfig.dbPort() + "/" + AppConfig.dbName());
        System.out.println("======================================================");
    }
}

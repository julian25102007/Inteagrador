package com.evansong;

import com.evansong.routes.AuthRoutes;
import io.javalin.Javalin;

public class App {

    public static void main(String[] args) {

        Javalin app = Javalin.create(config -> {

            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.anyHost();
                });
            });

        });

        // Ruta principal
        app.get("/", ctx -> {
            ctx.result("EVANSONG API funcionando correctamente.");
        });

        // Rutas de autenticación
        AuthRoutes.register(app);

        // Iniciar servidor
        app.start(7000);

        System.out.println("------------------------------------");
        System.out.println(" EVANSONG API iniciada");
        System.out.println(" http://localhost:7000");
        System.out.println("------------------------------------");

    }

}
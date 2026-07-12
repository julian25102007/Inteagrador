package com.evansong.routes;

import com.evansong.controllers.AuthController;
import io.javalin.Javalin;

public class AuthRoutes {

    public static void register(Javalin app) {

        AuthController authController = new AuthController();

        app.post("/api/auth/login", authController::login);

        app.post("/api/auth/register", authController::register);

    }

}
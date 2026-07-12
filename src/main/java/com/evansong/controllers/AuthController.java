package com.evansong.controllers;

import com.evansong.dtos.user.LoginUserDto;
import com.evansong.dtos.user.RegisterUserDto;
import com.evansong.dtos.user.UserResponseDto;
import com.evansong.services.AuthService;
import io.javalin.http.Context;

public class AuthController {

    private final AuthService authService;

    public AuthController() {
        this.authService = new AuthService();
    }

    /**
     * POST /register
     */
    public void register(Context ctx) {

        RegisterUserDto dto = ctx.bodyAsClass(RegisterUserDto.class);
        UserResponseDto response = authService.register(dto);

        if (response.isSuccess()) {

            ctx.status(201);
        } else {

            ctx.status(400);
        }

        ctx.json(response);

    }

    /**
     * POST /login
     */
    public void login(Context ctx) {

        LoginUserDto dto = ctx.bodyAsClass(LoginUserDto.class);

        UserResponseDto response = authService.login(dto);

        if (response.isSuccess()) {

            ctx.status(200);
        } else {

            ctx.status(401);
        }

        ctx.json(response);

    }

}
package com.evansong.utils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;

import java.util.Date;

public class JwtUtil {

    private static final String SECRET =
            "EVANSONG_SECRET_KEY";

    private static final long EXPIRATION =
            3600000;

    /**
     * Generar Token
     */
    public static String generateToken(

            Integer idUsuario,

            String correo,

            String rol

    ) {

        return JWT.create()

                .withSubject(correo)

                .withClaim("id", idUsuario)

                .withClaim("rol", rol)

                .withIssuedAt(new Date())

                .withExpiresAt(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION
                        )
                )

                .sign(
                        Algorithm.HMAC256(SECRET)
                );

    }

}
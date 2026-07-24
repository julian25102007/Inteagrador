package com.evansong.backend.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.evansong.backend.config.AppConfig;

import java.util.Date;

/**
 * Genera y valida los JWT usados para autenticar a los usuarios.
 * El token guarda: idUsuario, correo y rol (Coordinador | Corista).
 */
public final class JwtUtil {

    private JwtUtil() {}

    private static Algorithm algoritmo() {
        return Algorithm.HMAC256(AppConfig.jwtSecret());
    }

    public static String generarToken(int idUsuario, String correo, String rol) {
        long horas = AppConfig.jwtExpiracionHoras();
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + horas * 60L * 60L * 1000L);

        return JWT.create()
                .withSubject(String.valueOf(idUsuario))
                .withClaim("correo", correo)
                .withClaim("rol", rol)
                .withIssuedAt(ahora)
                .withExpiresAt(expira)
                .sign(algoritmo());
    }

    /** Lanza JWTVerificationException si el token es invalido o expiro. */
    public static DecodedJWT validarToken(String token) throws JWTVerificationException {
        return JWT.require(algoritmo()).build().verify(token);
    }

    public static int idUsuario(DecodedJWT jwt) {
        return Integer.parseInt(jwt.getSubject());
    }

    public static String correo(DecodedJWT jwt) {
        return jwt.getClaim("correo").asString();
    }

    public static String rol(DecodedJWT jwt) {
        return jwt.getClaim("rol").asString();
    }
}

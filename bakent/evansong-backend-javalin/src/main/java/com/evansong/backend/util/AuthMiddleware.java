package com.evansong.backend.util;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.javalin.http.Context;
import io.javalin.http.Handler;
import io.javalin.http.UnauthorizedResponse;
import io.javalin.http.ForbiddenResponse;

import java.util.List;
import java.util.Set;

/**
 * Filtro global de autenticacion.
 *
 * - Las rutas en RUTAS_PUBLICAS no requieren token (login y registro).
 * - Cualquier otra ruta requiere un header "Authorization: Bearer <token>" valido.
 * - Si el token es valido, se guardan idUsuario/correo/rol como atributos del
 *   contexto para que las rutas los puedan usar (ctx.attribute("rol"), etc).
 */
public final class AuthMiddleware {

    private AuthMiddleware() {}

    public static final String ATTR_ID_USUARIO = "idUsuario";
    public static final String ATTR_CORREO = "correo";
    public static final String ATTR_ROL = "rol";

    // Rutas que cualquiera puede llamar sin haber iniciado sesion
    private static final List<String> RUTAS_PUBLICAS = List.of(
            "/auth/login",
            "/auth/registro"
    );

    /** Registrar como "before" global en Main.java, antes de las demas rutas. */
    public static Handler filtroGlobal() {
        return ctx -> {
            // Deja pasar el preflight de CORS sin exigir token
            if (ctx.method().name().equals("OPTIONS")) return;

            if (esRutaPublica(ctx.path())) return;

            String header = ctx.header("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                throw new UnauthorizedResponse("Debes iniciar sesión para acceder a este recurso.");
            }

            String token = header.substring("Bearer ".length()).trim();
            try {
                DecodedJWT jwt = JwtUtil.validarToken(token);
                ctx.attribute(ATTR_ID_USUARIO, JwtUtil.idUsuario(jwt));
                ctx.attribute(ATTR_CORREO, JwtUtil.correo(jwt));
                ctx.attribute(ATTR_ROL, JwtUtil.rol(jwt));
            } catch (JWTVerificationException e) {
                throw new UnauthorizedResponse("Sesión inválida o expirada. Inicia sesión de nuevo.");
            }
        };
    }

    private static boolean esRutaPublica(String path) {
        return RUTAS_PUBLICAS.contains(path);
    }

    /** Llamar al inicio de una ruta para exigir uno de los roles indicados. */
    public static void exigirRol(Context ctx, String... rolesPermitidos) {
        String rol = ctx.attribute(ATTR_ROL);
        Set<String> permitidos = Set.of(rolesPermitidos);
        if (rol == null || !permitidos.contains(rol)) {
            throw new ForbiddenResponse("No tienes permisos para realizar esta acción.");
        }
    }

    public static int idUsuarioActual(Context ctx) {
        Integer id = ctx.attribute(ATTR_ID_USUARIO);
        if (id == null) throw new UnauthorizedResponse("No autenticado.");
        return id;
    }

    public static String rolActual(Context ctx) {
        return ctx.attribute(ATTR_ROL);
    }
}

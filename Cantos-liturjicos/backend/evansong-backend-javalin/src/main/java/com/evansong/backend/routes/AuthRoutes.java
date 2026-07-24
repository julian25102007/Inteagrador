package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Usuario;
import com.evansong.backend.util.AuthMiddleware;
import com.evansong.backend.util.JwtUtil;
import com.evansong.backend.util.PasswordUtil;
import io.javalin.Javalin;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;

/**
 * AUTENTICACIÓN
 * POST /auth/registro  -> crea un usuario; solo pide nombre, correo y contraseña.
 *                         El rol se calcula en el servidor: si el correo está en
 *                         la whitelist correo_coordinador (y no ha sido usado),
 *                         el usuario queda como Coordinador; si no, como Corista
 *                         (registro libre, sin whitelist para Corista).
 * POST /auth/login     -> verifica correo + contraseña
 */
public class AuthRoutes {

    public static void register(Javalin app) {

        app.post("/auth/registro", ctx -> {
            Usuario u = ctx.bodyAsClass(Usuario.class);

            if (u.getNombreCompleto() == null || u.getNombreCompleto().isBlank()) {
                ctx.status(400).result("nombreCompleto es obligatorio.");
                return;
            }
            if (u.getNombreCompleto().trim().length() > 15) {
                ctx.status(400).result("nombreCompleto no puede superar los 15 caracteres.");
                return;
            }
            if (u.getCorreo() == null || u.getCorreo().isBlank()) {
                ctx.status(400).result("correo es obligatorio.");
                return;
            }
            if (!u.getCorreo().matches("^[^\\s@]+@[^\\s@]+\\.[a-zA-Z]{2,}$")) {
                ctx.status(400).result("correo debe tener una extensión válida (ej. .com, .mx).");
                return;
            }
            if (u.getContrasena() == null || u.getContrasena().length() != 8) {
                ctx.status(400).result("contrasena debe tener exactamente 8 caracteres.");
                return;
            }
            // Nota: el cliente ya NO envía "rol" ni "telefono"; el rol se decide
            // abajo consultando correo_coordinador, y telefono queda opcional.

            try (Connection conexion = ConnectionManager.getConnection()) {
                conexion.setAutoCommit(false);
                try {
                    // 1) Verificar que el correo no esté ya registrado
                    try (PreparedStatement ps = conexion.prepareStatement(
                            "SELECT 1 FROM usuario WHERE LOWER(correo) = LOWER(?)")) {
                        ps.setString(1, u.getCorreo());
                        try (ResultSet rs = ps.executeQuery()) {
                            if (rs.next()) {
                                conexion.rollback();
                                ctx.status(400).result("Ya existe una cuenta con ese correo.");
                                return;
                            }
                        }
                    }

                    // 2) ¿El correo está en la whitelist de coordinadores y sin usar?
                    //    Si sí -> rol Coordinador. Si no -> rol Corista (libre, sin whitelist).
                    Integer idCorreoCoordinador = null;
                    String rolAsignado = "Corista";
                    try (PreparedStatement ps = conexion.prepareStatement(
                            "SELECT id_correo, utilizado FROM correo_coordinador WHERE LOWER(correo) = LOWER(?)")) {
                        ps.setString(1, u.getCorreo());
                        try (ResultSet rs = ps.executeQuery()) {
                            if (rs.next() && !rs.getBoolean("utilizado")) {
                                idCorreoCoordinador = rs.getInt("id_correo");
                                rolAsignado = "Coordinador";
                            }
                        }
                    }

                    // 3) Insertar el usuario con la contraseña hasheada
                    int idUsuario;
                    try (PreparedStatement ps = conexion.prepareStatement(
                            "INSERT INTO usuario (nombre_completo, correo, telefono, contrasena, rol) VALUES (?,?,?,?,?)",
                            Statement.RETURN_GENERATED_KEYS)) {
                        ps.setString(1, u.getNombreCompleto());
                        ps.setString(2, u.getCorreo());
                        ps.setString(3, u.getTelefono()); // puede ser null, la columna ya lo permite
                        ps.setString(4, PasswordUtil.hash(u.getContrasena()));
                        ps.setString(5, rolAsignado);
                        ps.executeUpdate();
                        try (ResultSet keys = ps.getGeneratedKeys()) {
                            keys.next();
                            idUsuario = keys.getInt(1);
                        }
                    }

                    // 4) Si venía de correo_coordinador, marcarlo como utilizado
                    if (idCorreoCoordinador != null) {
                        try (PreparedStatement ps = conexion.prepareStatement(
                                "UPDATE correo_coordinador SET utilizado = TRUE WHERE id_correo = ?")) {
                            ps.setInt(1, idCorreoCoordinador);
                            ps.executeUpdate();
                        }
                    }

                    conexion.commit();
                    Map<String, Object> usuarioRespuesta = obtenerUsuarioSinContrasena(conexion, idUsuario);
                    String token = JwtUtil.generarToken(idUsuario, u.getCorreo(), rolAsignado);
                    Map<String, Object> respuesta = new HashMap<>();
                    respuesta.put("usuario", usuarioRespuesta);
                    respuesta.put("token", token);
                    ctx.status(201).json(respuesta);
                } catch (Exception e) {
                    conexion.rollback();
                    throw e;
                }
            } catch (Exception e) {
                ctx.status(500).result("Error al registrar: " + e.getMessage());
            }
        });

        app.post("/auth/login", ctx -> {
            Usuario datos = ctx.bodyAsClass(Usuario.class);
            if (datos.getCorreo() == null || datos.getContrasena() == null) {
                ctx.status(400).result("correo y contrasena son obligatorios.");
                return;
            }

            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement("SELECT * FROM usuario WHERE LOWER(correo) = LOWER(?)")) {
                ps.setString(1, datos.getCorreo());
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        ctx.status(400).result("Correo o contraseña incorrectos.");
                        return;
                    }
                    String hashGuardado = rs.getString("contrasena");
                    if (!PasswordUtil.verify(datos.getContrasena(), hashGuardado)) {
                        ctx.status(400).result("Correo o contraseña incorrectos.");
                        return;
                    }
                    int idUsuario = rs.getInt("id_usuario");
                    String rol = rs.getString("rol");
                    Map<String, Object> usuarioRespuesta = obtenerUsuarioSinContrasena(conexion, idUsuario);
                    String token = JwtUtil.generarToken(idUsuario, datos.getCorreo(), rol);
                    Map<String, Object> respuesta = new HashMap<>();
                    respuesta.put("usuario", usuarioRespuesta);
                    respuesta.put("token", token);
                    ctx.json(respuesta);
                }
            } catch (Exception e) {
                ctx.status(500).result("Error al iniciar sesión: " + e.getMessage());
            }
        });

        // GET /auth/me -> devuelve el perfil del usuario dueño del token (requiere estar logueado)
        app.get("/auth/me", ctx -> {
            int idUsuario = AuthMiddleware.idUsuarioActual(ctx);
            try (Connection conexion = ConnectionManager.getConnection()) {
                ctx.json(obtenerUsuarioSinContrasena(conexion, idUsuario));
            } catch (Exception e) {
                ctx.status(500).result("Error al obtener el perfil: " + e.getMessage());
            }
        });
    }

    private static Map<String, Object> obtenerUsuarioSinContrasena(Connection conexion, int idUsuario) throws SQLException {
        try (PreparedStatement ps = conexion.prepareStatement("SELECT * FROM usuario WHERE id_usuario = ?")) {
            ps.setInt(1, idUsuario);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                Map<String, Object> u = new HashMap<>();
                u.put("idUsuario", rs.getInt("id_usuario"));
                u.put("nombreCompleto", rs.getString("nombre_completo"));
                u.put("correo", rs.getString("correo"));
                u.put("telefono", rs.getString("telefono"));
                u.put("rol", rs.getString("rol"));
                u.put("fotoPerfil", rs.getString("foto_perfil"));
                Timestamp fecha = rs.getTimestamp("fecha_registro");
                u.put("fechaRegistro", fecha != null ? fecha.toString().replace(' ', 'T') : null);
                u.put("observacion", rs.getString("observacion"));
                // contrasena NUNCA se incluye en la respuesta
                return u;
            }
        }
    }
}

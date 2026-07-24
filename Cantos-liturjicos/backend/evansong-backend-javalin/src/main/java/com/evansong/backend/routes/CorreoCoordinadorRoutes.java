package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.CorreoCoordinador;
import com.evansong.backend.util.AuthMiddleware;
import io.javalin.Javalin;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: CORREO_COORDINADOR (whitelist de correos autorizados para registrarse como Coordinador)
 */
public class CorreoCoordinadorRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/correos-coordinador  (solo Coordinador)
        app.get("/correos-coordinador", ctx -> {
            AuthMiddleware.exigirRol(ctx, "Coordinador");
            String sql = "SELECT * FROM correo_coordinador ORDER BY id_correo";
            List<CorreoCoordinador> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer correos de coordinador: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/correos-coordinador  (invitar)
        app.post("/correos-coordinador", ctx -> {
            AuthMiddleware.exigirRol(ctx, "Coordinador");
            CorreoCoordinador c = ctx.bodyAsClass(CorreoCoordinador.class);
            String sqlExiste = "SELECT 1 FROM correo_coordinador WHERE LOWER(correo) = LOWER(?)";
            String sqlInsert = "INSERT INTO correo_coordinador (correo, utilizado) VALUES (?, FALSE)";
            try (Connection conexion = ConnectionManager.getConnection()) {
                try (PreparedStatement ps = conexion.prepareStatement(sqlExiste)) {
                    ps.setString(1, c.getCorreo());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            ctx.status(400).result("Este correo ya está en la lista de invitados.");
                            return;
                        }
                    }
                }
                try (PreparedStatement ps = conexion.prepareStatement(sqlInsert, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, c.getCorreo());
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        keys.next();
                        c.setIdCorreo(keys.getInt(1));
                    }
                }
                c.setUtilizado(false);
                ctx.status(201).json(c);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/correos-coordinador/1
        // Si ese correo ya había sido usado para registrar una cuenta como
        // Coordinador, además de quitarlo de la whitelist, esa cuenta se
        // degrada de vuelta a Corista (si no, "quitar" no revocaba el acceso
        // de nadie que ya se hubiera registrado).
        app.delete("/correos-coordinador/{id}", ctx -> {
            AuthMiddleware.exigirRol(ctx, "Coordinador");
            int id = Integer.parseInt(ctx.pathParam("id"));
            try (Connection conexion = ConnectionManager.getConnection()) {
                conexion.setAutoCommit(false);
                try {
                    String correo = null;
                    boolean utilizado = false;
                    try (PreparedStatement ps = conexion.prepareStatement(
                            "SELECT correo, utilizado FROM correo_coordinador WHERE id_correo = ?")) {
                        ps.setInt(1, id);
                        try (ResultSet rs = ps.executeQuery()) {
                            if (!rs.next()) {
                                conexion.rollback();
                                ctx.status(404).result("No se encontró ese correo con ID " + id);
                                return;
                            }
                            correo = rs.getString("correo");
                            utilizado = rs.getBoolean("utilizado");
                        }
                    }

                    try (PreparedStatement ps = conexion.prepareStatement(
                            "DELETE FROM correo_coordinador WHERE id_correo = ?")) {
                        ps.setInt(1, id);
                        ps.executeUpdate();
                    }

                    if (utilizado) {
                        try (PreparedStatement ps = conexion.prepareStatement(
                                "UPDATE usuario SET rol = 'Corista' WHERE LOWER(correo) = LOWER(?) AND rol = 'Coordinador'")) {
                            ps.setString(1, correo);
                            ps.executeUpdate();
                        }
                    }

                    conexion.commit();
                    ctx.result("Correo eliminado" + (utilizado ? " y la cuenta asociada ya no tiene rol de Coordinador." : "."));
                } catch (Exception e) {
                    conexion.rollback();
                    ctx.status(500).result("Error al eliminar: " + e.getMessage());
                }
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static CorreoCoordinador mapear(ResultSet rs) throws SQLException {
        CorreoCoordinador c = new CorreoCoordinador();
        c.setIdCorreo(rs.getInt("id_correo"));
        c.setCorreo(rs.getString("correo"));
        c.setUtilizado(rs.getBoolean("utilizado"));
        Timestamp fecha = rs.getTimestamp("fecha_creacion");
        c.setFechaCreacion(fecha != null ? fecha.toString().replace(' ', 'T') : null);
        return c;
    }
}

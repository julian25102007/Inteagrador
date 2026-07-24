package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Esquema;
import io.javalin.Javalin;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: ESQUEMA
 */
public class EsquemaRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/esquemas  (?idUsuario= para filtrar)
        app.get("/esquemas", ctx -> {
            String idUsuario = ctx.queryParam("idUsuario");
            String sql = "SELECT * FROM esquema" + (idUsuario != null ? " WHERE id_usuario = ?" : "") + " ORDER BY id_esquema";
            List<Esquema> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                if (idUsuario != null) ps.setInt(1, Integer.parseInt(idUsuario));
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) lista.add(mapear(rs));
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer esquemas: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/esquemas
        app.post("/esquemas", ctx -> {
            Esquema esquema = ctx.bodyAsClass(Esquema.class);
            String sql = "INSERT INTO esquema (nombre, id_usuario) VALUES (?,?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, esquema.getNombre());
                ps.setInt(2, esquema.getIdUsuario());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    esquema.setIdEsquema(keys.getInt(1));
                }
                ctx.status(201).json(esquema);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/esquemas/1
        app.put("/esquemas/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Esquema esquema = ctx.bodyAsClass(Esquema.class);
            String sql = "UPDATE esquema SET nombre = ? WHERE id_esquema = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, esquema.getNombre());
                ps.setInt(2, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Esquema actualizado correctamente.");
                else ctx.status(404).result("No se encontró el esquema.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/esquemas/1
        app.delete("/esquemas/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM esquema WHERE id_esquema = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Esquema con ID " + id + " eliminado correctamente.");
                else ctx.status(404).result("No se encontró el esquema con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static Esquema mapear(ResultSet rs) throws SQLException {
        Esquema e = new Esquema();
        e.setIdEsquema(rs.getInt("id_esquema"));
        e.setNombre(rs.getString("nombre"));
        Timestamp fecha = rs.getTimestamp("fecha_creacion");
        e.setFechaCreacion(fecha != null ? fecha.toString().replace(' ', 'T') : null);
        e.setIdUsuario(rs.getInt("id_usuario"));
        return e;
    }
}

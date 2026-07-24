package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Lista;
import io.javalin.Javalin;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: LISTA
 */
public class ListaRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/listas  (?idUsuario= para filtrar)
        app.get("/listas", ctx -> {
            String idUsuario = ctx.queryParam("idUsuario");
            String sql = "SELECT * FROM lista" + (idUsuario != null ? " WHERE id_usuario = ?" : "") + " ORDER BY id_lista";
            List<Lista> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                if (idUsuario != null) ps.setInt(1, Integer.parseInt(idUsuario));
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) lista.add(mapear(rs));
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer listas: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/listas
        app.post("/listas", ctx -> {
            Lista l = ctx.bodyAsClass(Lista.class);
            String sql = "INSERT INTO lista (nombre, descripcion, id_usuario) VALUES (?,?,?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, l.getNombre());
                ps.setString(2, l.getDescripcion());
                ps.setInt(3, l.getIdUsuario());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    l.setIdLista(keys.getInt(1));
                }
                ctx.status(201).json(l);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/listas/1
        app.put("/listas/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Lista l = ctx.bodyAsClass(Lista.class);
            String sql = "UPDATE lista SET nombre=?, descripcion=? WHERE id_lista = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, l.getNombre());
                ps.setString(2, l.getDescripcion());
                ps.setInt(3, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Lista actualizada correctamente.");
                else ctx.status(404).result("No se encontró la lista.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/listas/1
        app.delete("/listas/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM lista WHERE id_lista = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Lista con ID " + id + " eliminada correctamente.");
                else ctx.status(404).result("No se encontró la lista con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static Lista mapear(ResultSet rs) throws SQLException {
        Lista l = new Lista();
        l.setIdLista(rs.getInt("id_lista"));
        l.setNombre(rs.getString("nombre"));
        l.setDescripcion(rs.getString("descripcion"));
        Timestamp fecha = rs.getTimestamp("fecha_creacion");
        l.setFechaCreacion(fecha != null ? fecha.toString().replace(' ', 'T') : null);
        l.setIdUsuario(rs.getInt("id_usuario"));
        return l;
    }
}

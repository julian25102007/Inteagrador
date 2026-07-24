package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Publicacion;
import io.javalin.Javalin;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: PUBLICACION
 */
public class PublicacionRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/publicaciones
        app.get("/publicaciones", ctx -> {
            String sql = "SELECT * FROM publicacion ORDER BY fecha_publicacion DESC";
            List<Publicacion> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) lista.add(mapear(rs));
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer publicaciones: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/publicaciones
        app.post("/publicaciones", ctx -> {
            Publicacion p = ctx.bodyAsClass(Publicacion.class);
            String sql = "INSERT INTO publicacion (titulo, categoria, descripcion, id_usuario) VALUES (?,?,?,?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, p.getTitulo());
                ps.setString(2, p.getCategoria());
                ps.setString(3, p.getDescripcion());
                ps.setInt(4, p.getIdUsuario());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    p.setIdPublicacion(keys.getInt(1));
                }
                ctx.status(201).json(p);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/publicaciones/1
        app.put("/publicaciones/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Publicacion p = ctx.bodyAsClass(Publicacion.class);
            String sql = "UPDATE publicacion SET titulo=?, categoria=?, descripcion=?, fecha_actualizacion=CURRENT_TIMESTAMP WHERE id_publicacion = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, p.getTitulo());
                ps.setString(2, p.getCategoria());
                ps.setString(3, p.getDescripcion());
                ps.setInt(4, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Publicación actualizada correctamente.");
                else ctx.status(404).result("No se encontró la publicación.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/publicaciones/1
        app.delete("/publicaciones/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM publicacion WHERE id_publicacion = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Publicación con ID " + id + " eliminada correctamente.");
                else ctx.status(404).result("No se encontró la publicación con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static Publicacion mapear(ResultSet rs) throws SQLException {
        Publicacion p = new Publicacion();
        p.setIdPublicacion(rs.getInt("id_publicacion"));
        p.setTitulo(rs.getString("titulo"));
        p.setCategoria(rs.getString("categoria"));
        p.setDescripcion(rs.getString("descripcion"));
        Timestamp fp = rs.getTimestamp("fecha_publicacion");
        p.setFechaPublicacion(fp != null ? fp.toString().replace(' ', 'T') : null);
        Timestamp fa = rs.getTimestamp("fecha_actualizacion");
        p.setFechaActualizacion(fa != null ? fa.toString().replace(' ', 'T') : null);
        p.setIdUsuario(rs.getInt("id_usuario"));
        return p;
    }
}

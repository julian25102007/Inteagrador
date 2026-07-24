package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Inventario;
import io.javalin.Javalin;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: INVENTARIO
 */
public class InventarioRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/inventario  (?nombre= para buscar)
        app.get("/inventario", ctx -> {
            String nombre = ctx.queryParam("nombre");
            String sql = "SELECT * FROM inventario" + (nombre != null ? " WHERE nombre LIKE ?" : "") + " ORDER BY id_articulo";
            List<Inventario> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                if (nombre != null) ps.setString(1, "%" + nombre + "%");
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) lista.add(mapear(rs));
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer inventario: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/inventario
        app.post("/inventario", ctx -> {
            Inventario i = ctx.bodyAsClass(Inventario.class);
            String sql = "INSERT INTO inventario (nombre, categoria, estado, modelo, id_usuario) VALUES (?,?,?,?,?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, i.getNombre());
                ps.setString(2, i.getCategoria());
                ps.setString(3, i.getEstado());
                ps.setString(4, i.getModelo());
                ps.setInt(5, i.getIdUsuario());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    i.setIdArticulo(keys.getInt(1));
                }
                ctx.status(201).json(i);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/inventario/1
        app.put("/inventario/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Inventario i = ctx.bodyAsClass(Inventario.class);
            String sql = "UPDATE inventario SET nombre=?, categoria=?, estado=?, modelo=? WHERE id_articulo = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, i.getNombre());
                ps.setString(2, i.getCategoria());
                ps.setString(3, i.getEstado());
                ps.setString(4, i.getModelo());
                ps.setInt(5, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Artículo actualizado correctamente.");
                else ctx.status(404).result("No se encontró el artículo.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/inventario/1
        app.delete("/inventario/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM inventario WHERE id_articulo = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Artículo con ID " + id + " eliminado correctamente.");
                else ctx.status(404).result("No se encontró el artículo con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static Inventario mapear(ResultSet rs) throws SQLException {
        Inventario i = new Inventario();
        i.setIdArticulo(rs.getInt("id_articulo"));
        i.setNombre(rs.getString("nombre"));
        i.setCategoria(rs.getString("categoria"));
        i.setEstado(rs.getString("estado"));
        i.setModelo(rs.getString("modelo"));
        i.setIdUsuario(rs.getInt("id_usuario"));
        return i;
    }
}

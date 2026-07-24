package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.DetalleEsquema;
import io.javalin.Javalin;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: DETALLE_ESQUEMA
 */
public class DetalleEsquemaRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/detalle-esquema  (?idEsquema= para filtrar)
        app.get("/detalle-esquema", ctx -> {
            String idEsquema = ctx.queryParam("idEsquema");
            String sql = "SELECT * FROM detalle_esquema" + (idEsquema != null ? " WHERE id_esquema = ?" : "") + " ORDER BY orden";
            List<DetalleEsquema> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                if (idEsquema != null) ps.setInt(1, Integer.parseInt(idEsquema));
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) lista.add(mapear(rs));
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer el detalle del esquema: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/detalle-esquema
        app.post("/detalle-esquema", ctx -> {
            DetalleEsquema d = ctx.bodyAsClass(DetalleEsquema.class);
            String sql = "INSERT INTO detalle_esquema (id_esquema, id_momento, id_canto, orden) VALUES (?,?,?,?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, d.getIdEsquema());
                ps.setInt(2, d.getIdMomento());
                ps.setInt(3, d.getIdCanto());
                ps.setInt(4, d.getOrden());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    d.setIdDetalle(keys.getInt(1));
                }
                ctx.status(201).json(d);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/detalle-esquema/1
        app.put("/detalle-esquema/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            DetalleEsquema d = ctx.bodyAsClass(DetalleEsquema.class);
            String sql = "UPDATE detalle_esquema SET id_esquema=?, id_momento=?, id_canto=?, orden=? WHERE id_detalle = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, d.getIdEsquema());
                ps.setInt(2, d.getIdMomento());
                ps.setInt(3, d.getIdCanto());
                ps.setInt(4, d.getOrden());
                ps.setInt(5, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Detalle de esquema actualizado correctamente.");
                else ctx.status(404).result("No se encontró el detalle de esquema.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/detalle-esquema/1
        app.delete("/detalle-esquema/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM detalle_esquema WHERE id_detalle = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Detalle de esquema con ID " + id + " eliminado correctamente.");
                else ctx.status(404).result("No se encontró el detalle de esquema con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static DetalleEsquema mapear(ResultSet rs) throws SQLException {
        DetalleEsquema d = new DetalleEsquema();
        d.setIdDetalle(rs.getInt("id_detalle"));
        d.setIdEsquema(rs.getInt("id_esquema"));
        d.setIdMomento(rs.getInt("id_momento"));
        d.setIdCanto(rs.getInt("id_canto"));
        d.setOrden(rs.getInt("orden"));
        return d;
    }
}

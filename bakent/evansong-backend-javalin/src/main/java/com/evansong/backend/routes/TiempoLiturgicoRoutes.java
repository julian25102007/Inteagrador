package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.TiempoLiturgico;
import io.javalin.Javalin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: TIEMPO_LITURGICO
 */
public class TiempoLiturgicoRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/tiempos-liturgicos
        app.get("/tiempos-liturgicos", ctx -> {
            String sql = "SELECT * FROM tiempo_liturgico";
            List<TiempoLiturgico> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    TiempoLiturgico t = new TiempoLiturgico();
                    t.setIdTiempo(rs.getInt("id_tiempo"));
                    t.setNombre(rs.getString("nombre"));
                    lista.add(t);
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer tiempos litúrgicos: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/tiempos-liturgicos
        app.post("/tiempos-liturgicos", ctx -> {
            TiempoLiturgico t = ctx.bodyAsClass(TiempoLiturgico.class);
            String sql = "INSERT INTO tiempo_liturgico (nombre) VALUES (?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, t.getNombre());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    t.setIdTiempo(keys.getInt(1));
                }
                ctx.status(201).json(t);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/tiempos-liturgicos/1
        app.put("/tiempos-liturgicos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            TiempoLiturgico t = ctx.bodyAsClass(TiempoLiturgico.class);
            String sql = "UPDATE tiempo_liturgico SET nombre = ? WHERE id_tiempo = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, t.getNombre());
                ps.setInt(2, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Tiempo litúrgico actualizado correctamente.");
                else ctx.status(404).result("No se encontró el tiempo litúrgico.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/tiempos-liturgicos/1
        app.delete("/tiempos-liturgicos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM tiempo_liturgico WHERE id_tiempo = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Tiempo litúrgico con ID " + id + " eliminado correctamente.");
                else ctx.status(404).result("No se encontró el tiempo litúrgico con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }
}

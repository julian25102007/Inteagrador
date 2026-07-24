package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.MomentoMisa;
import io.javalin.Javalin;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: MOMENTO_MISA
 */
public class MomentoMisaRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/momentos-misa
        app.get("/momentos-misa", ctx -> {
            String sql = "SELECT * FROM momento_misa";
            List<MomentoMisa> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    MomentoMisa m = new MomentoMisa();
                    m.setIdMomento(rs.getInt("id_momento"));
                    m.setNombre(rs.getString("nombre"));
                    lista.add(m);
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer momentos de misa: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/momentos-misa
        app.post("/momentos-misa", ctx -> {
            MomentoMisa m = ctx.bodyAsClass(MomentoMisa.class);
            String sql = "INSERT INTO momento_misa (nombre) VALUES (?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, m.getNombre());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    m.setIdMomento(keys.getInt(1));
                }
                ctx.status(201).json(m);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/momentos-misa/1
        app.put("/momentos-misa/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            MomentoMisa m = ctx.bodyAsClass(MomentoMisa.class);
            String sql = "UPDATE momento_misa SET nombre = ? WHERE id_momento = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, m.getNombre());
                ps.setInt(2, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Momento de misa actualizado correctamente.");
                else ctx.status(404).result("No se encontró el momento de misa.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/momentos-misa/1
        app.delete("/momentos-misa/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM momento_misa WHERE id_momento = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Momento de misa con ID " + id + " eliminado correctamente.");
                else ctx.status(404).result("No se encontró el momento de misa con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }
}

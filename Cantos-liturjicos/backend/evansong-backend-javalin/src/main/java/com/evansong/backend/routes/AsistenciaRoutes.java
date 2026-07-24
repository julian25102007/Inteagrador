package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Asistencia;
import io.javalin.Javalin;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: ASISTENCIA
 */
public class AsistenciaRoutes {

    public static void register(Javalin app) {

        // LEER TODAS (GET) -> http://localhost:3000/asistencias
        app.get("/asistencias", ctx -> {
            String sql = "SELECT * FROM asistencia";
            List<Asistencia> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Asistencia a = new Asistencia();
                    a.setIdAsistencia(rs.getInt("id_asistencia"));
                    a.setIdEvento(rs.getInt("id_evento"));
                    a.setIdUsuario(rs.getInt("id_usuario"));
                    a.setAsistira(rs.getBoolean("asistira"));
                    lista.add(a);
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer asistencias: " + e.getMessage());
            }
        });

        // LEER (GET) -> http://localhost:3000/asistencias/evento/1
        app.get("/asistencias/evento/{idEvento}", ctx -> {
            int idEvento = Integer.parseInt(ctx.pathParam("idEvento"));
            listarPor(ctx, "id_evento", idEvento);
        });

        // LEER (GET) -> http://localhost:3000/asistencias/usuario/1
        app.get("/asistencias/usuario/{idUsuario}", ctx -> {
            int idUsuario = Integer.parseInt(ctx.pathParam("idUsuario"));
            listarPor(ctx, "id_usuario", idUsuario);
        });

        // CREAR/ACTUALIZAR (POST) -> http://localhost:3000/asistencias  (confirma o cambia asistencia)
        app.post("/asistencias", ctx -> {
            Asistencia a = ctx.bodyAsClass(Asistencia.class);
            String sqlBuscar = "SELECT id_asistencia FROM asistencia WHERE id_evento = ? AND id_usuario = ?";
            try (Connection conexion = ConnectionManager.getConnection()) {
                Integer idExistente = null;
                try (PreparedStatement ps = conexion.prepareStatement(sqlBuscar)) {
                    ps.setInt(1, a.getIdEvento());
                    ps.setInt(2, a.getIdUsuario());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) idExistente = rs.getInt(1);
                    }
                }

                if (idExistente != null) {
                    try (PreparedStatement ps = conexion.prepareStatement("UPDATE asistencia SET asistira = ? WHERE id_asistencia = ?")) {
                        ps.setBoolean(1, a.isAsistira());
                        ps.setInt(2, idExistente);
                        ps.executeUpdate();
                    }
                    a.setIdAsistencia(idExistente);
                } else {
                    try (PreparedStatement ps = conexion.prepareStatement(
                            "INSERT INTO asistencia (id_evento, id_usuario, asistira) VALUES (?,?,?)",
                            Statement.RETURN_GENERATED_KEYS)) {
                        ps.setInt(1, a.getIdEvento());
                        ps.setInt(2, a.getIdUsuario());
                        ps.setBoolean(3, a.isAsistira());
                        ps.executeUpdate();
                        try (ResultSet keys = ps.getGeneratedKeys()) {
                            keys.next();
                            a.setIdAsistencia(keys.getInt(1));
                        }
                    }
                }
                ctx.status(201).json(a);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/asistencias/1
        app.delete("/asistencias/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM asistencia WHERE id_asistencia = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Asistencia con ID " + id + " eliminada correctamente.");
                else ctx.status(404).result("No se encontró la asistencia con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static void listarPor(io.javalin.http.Context ctx, String columna, int id) {
        String sql = "SELECT * FROM asistencia WHERE " + columna + " = ?";
        List<Asistencia> lista = new ArrayList<>();
        try (Connection conexion = ConnectionManager.getConnection();
             PreparedStatement ps = conexion.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Asistencia a = new Asistencia();
                    a.setIdAsistencia(rs.getInt("id_asistencia"));
                    a.setIdEvento(rs.getInt("id_evento"));
                    a.setIdUsuario(rs.getInt("id_usuario"));
                    a.setAsistira(rs.getBoolean("asistira"));
                    lista.add(a);
                }
            }
            ctx.json(lista);
        } catch (Exception e) {
            ctx.status(500).result("Error al leer asistencias: " + e.getMessage());
        }
    }
}

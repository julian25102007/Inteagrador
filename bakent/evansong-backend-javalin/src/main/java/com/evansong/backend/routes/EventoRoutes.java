package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Evento;
import io.javalin.Javalin;

import java.sql.*;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: EVENTO
 */
public class EventoRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/eventos  (?desde=&hasta=)
        app.get("/eventos", ctx -> {
            String desde = ctx.queryParam("desde");
            String hasta = ctx.queryParam("hasta");
            String sql = "SELECT * FROM evento" + (desde != null && hasta != null ? " WHERE fecha BETWEEN ? AND ?" : "") + " ORDER BY fecha, hora_inicio";
            List<Evento> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                if (desde != null && hasta != null) {
                    ps.setDate(1, Date.valueOf(desde));
                    ps.setDate(2, Date.valueOf(hasta));
                }
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) lista.add(mapear(rs));
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer eventos: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/eventos
        app.post("/eventos", ctx -> {
            Evento ev = ctx.bodyAsClass(Evento.class);
            String sql = "INSERT INTO evento (nombre, fecha, hora_inicio, hora_fin, lugar, descripcion, activar_asistencia, id_usuario) "
                    + "VALUES (?,?,?,?,?,?,?,?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, ev.getNombre());
                ps.setDate(2, Date.valueOf(ev.getFecha()));
                ps.setTime(3, Time.valueOf(normalizarHora(ev.getHoraInicio())));
                ps.setTime(4, Time.valueOf(normalizarHora(ev.getHoraFin())));
                ps.setString(5, ev.getLugar());
                ps.setString(6, ev.getDescripcion());
                ps.setBoolean(7, ev.isActivarAsistencia());
                ps.setInt(8, ev.getIdUsuario());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    ev.setIdEvento(keys.getInt(1));
                }
                ctx.status(201).json(ev);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/eventos/1
        app.put("/eventos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Evento ev = ctx.bodyAsClass(Evento.class);
            String sql = "UPDATE evento SET nombre=?, fecha=?, hora_inicio=?, hora_fin=?, lugar=?, descripcion=?, activar_asistencia=? "
                    + "WHERE id_evento = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, ev.getNombre());
                ps.setDate(2, Date.valueOf(ev.getFecha()));
                ps.setTime(3, Time.valueOf(normalizarHora(ev.getHoraInicio())));
                ps.setTime(4, Time.valueOf(normalizarHora(ev.getHoraFin())));
                ps.setString(5, ev.getLugar());
                ps.setString(6, ev.getDescripcion());
                ps.setBoolean(7, ev.isActivarAsistencia());
                ps.setInt(8, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Evento actualizado correctamente.");
                else ctx.status(404).result("No se encontró el evento.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/eventos/1
        app.delete("/eventos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM evento WHERE id_evento = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Evento con ID " + id + " eliminado correctamente.");
                else ctx.status(404).result("No se encontró el evento con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }

    private static Evento mapear(ResultSet rs) throws SQLException {
        Evento e = new Evento();
        e.setIdEvento(rs.getInt("id_evento"));
        e.setNombre(rs.getString("nombre"));
        e.setFecha(rs.getDate("fecha") != null ? rs.getDate("fecha").toString() : null);
        e.setHoraInicio(rs.getTime("hora_inicio") != null ? rs.getTime("hora_inicio").toString() : null);
        e.setHoraFin(rs.getTime("hora_fin") != null ? rs.getTime("hora_fin").toString() : null);
        e.setLugar(rs.getString("lugar"));
        e.setDescripcion(rs.getString("descripcion"));
        e.setActivarAsistencia(rs.getBoolean("activar_asistencia"));
        e.setIdUsuario(rs.getInt("id_usuario"));
        return e;
    }

    private static String normalizarHora(String hora) {
        return hora.length() == 5 ? hora + ":00" : hora; // acepta "HH:mm" o "HH:mm:ss"
    }
}

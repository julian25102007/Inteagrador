package com.evansong.backend.routes;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.Canto;
import io.javalin.Javalin;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad: CANTO
 */
public class CantoRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/cantos  (?titulo= para buscar)
        app.get("/cantos", ctx -> {
            String titulo = ctx.queryParam("titulo");
            String sql = "SELECT * FROM canto" + (titulo != null ? " WHERE titulo LIKE ?" : "") + " ORDER BY id_canto";
            List<Canto> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                if (titulo != null) ps.setString(1, "%" + titulo + "%");
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) lista.add(mapear(rs));
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer canciones: " + e.getMessage());
            }
        });

        // LEER UNO (GET) -> http://localhost:3000/cantos/1
        app.get("/cantos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "SELECT * FROM canto WHERE id_canto = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) ctx.json(mapear(rs));
                    else ctx.status(404).result("No se encontró la canción con ID " + id);
                }
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/cantos
        app.post("/cantos", ctx -> {
            Canto c = ctx.bodyAsClass(Canto.class);
            String sql = "INSERT INTO canto (titulo, autor, id_tiempo, id_momento, dificultad, letra, url_youtube) "
                    + "VALUES (?,?,?,?,?,?,?)";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, c.getTitulo());
                ps.setString(2, c.getAutor());
                setEnteroONull(ps, 3, c.getIdTiempo());
                setEnteroONull(ps, 4, c.getIdMomento());
                ps.setString(5, c.getDificultad());
                ps.setString(6, c.getLetra());
                ps.setString(7, c.getUrlYoutube());
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    keys.next();
                    c.setIdCanto(keys.getInt(1));
                }
                ctx.status(201).json(c);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ACTUALIZAR (PUT) -> http://localhost:3000/cantos/1
        app.put("/cantos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Canto c = ctx.bodyAsClass(Canto.class);
            String sql = "UPDATE canto SET titulo=?, autor=?, id_tiempo=?, id_momento=?, dificultad=?, letra=?, url_youtube=? "
                    + "WHERE id_canto = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setString(1, c.getTitulo());
                ps.setString(2, c.getAutor());
                setEnteroONull(ps, 3, c.getIdTiempo());
                setEnteroONull(ps, 4, c.getIdMomento());
                ps.setString(5, c.getDificultad());
                ps.setString(6, c.getLetra());
                ps.setString(7, c.getUrlYoutube());
                ps.setInt(8, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Canción actualizada correctamente.");
                else ctx.status(404).result("No se encontró la canción.");
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/cantos/1
        app.delete("/cantos/{id}", ctx -> {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String sql = "DELETE FROM canto WHERE id_canto = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                 PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, id);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Canción con ID " + id + " eliminada correctamente.");
                else ctx.status(404).result("No se encontró la canción con ID " + id);
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar canción: " + e.getMessage());
            }
        });
    }

    private static Canto mapear(ResultSet rs) throws SQLException {
        Canto c = new Canto();
        c.setIdCanto(rs.getInt("id_canto"));
        c.setTitulo(rs.getString("titulo"));
        c.setAutor(rs.getString("autor"));
        c.setIdTiempo((Integer) rs.getObject("id_tiempo"));
        c.setIdMomento((Integer) rs.getObject("id_momento"));
        c.setDificultad(rs.getString("dificultad"));
        c.setLetra(rs.getString("letra"));
        c.setUrlYoutube(rs.getString("url_youtube"));
        Timestamp fecha = rs.getTimestamp("fecha_registro");
        c.setFechaRegistro(fecha != null ? fecha.toString().replace(' ', 'T') : null);
        return c;
    }

    private static void setEnteroONull(PreparedStatement ps, int posicion, Integer valor) throws SQLException {
        if (valor == null) ps.setNull(posicion, Types.INTEGER);
        else ps.setInt(posicion, valor);
    }
}

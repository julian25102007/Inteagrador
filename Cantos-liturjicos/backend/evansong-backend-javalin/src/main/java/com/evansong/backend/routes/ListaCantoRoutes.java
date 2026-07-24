package com.evansong.backend.routes;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.evansong.backend.config.ConnectionManager;
import com.evansong.backend.model.ListaCanto;

import io.javalin.Javalin;

/**
 * Entidad: LISTA_CANTO (tabla puente, llave compuesta id_lista+id_canto)
 */
public class ListaCantoRoutes {

    public static void register(Javalin app) {

        // LEER (GET) -> http://localhost:3000/lista-canto/lista/1  (cantos de una lista, con título/autor)
        app.get("/lista-canto/lista/{idLista}", ctx -> {
            int idLista = Integer.parseInt(ctx.pathParam("idLista"));
            String sql = "SELECT lc.id_lista, lc.id_canto, c.titulo, c.autor "
                    + "FROM lista_canto lc JOIN canto c ON lc.id_canto = c.id_canto WHERE lc.id_lista = ?";
            List<Map<String, Object>> lista = new ArrayList<>();
            try (Connection conexion = ConnectionManager.getConnection();
                PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, idLista);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> fila = new LinkedHashMap<>();
                        fila.put("idLista", rs.getInt("id_lista"));
                        fila.put("idCanto", rs.getInt("id_canto"));
                        fila.put("titulo", rs.getString("titulo"));
                        fila.put("autor", rs.getString("autor"));
                        lista.add(fila);
                    }
                }
                ctx.json(lista);
            } catch (Exception e) {
                ctx.status(500).result("Error al leer la lista de cantos: " + e.getMessage());
            }
        });

        // CREAR (POST) -> http://localhost:3000/lista-canto  (agrega un canto a una lista)
        app.post("/lista-canto", ctx -> {
            ListaCanto lc = ctx.bodyAsClass(ListaCanto.class);
            String sqlExiste = "SELECT 1 FROM lista_canto WHERE id_lista = ? AND id_canto = ?";
            String sqlInsert = "INSERT INTO lista_canto (id_lista, id_canto) VALUES (?,?)";
            try (Connection conexion = ConnectionManager.getConnection()) {
                try (PreparedStatement ps = conexion.prepareStatement(sqlExiste)) {
                    ps.setInt(1, lc.getIdLista());
                    ps.setInt(2, lc.getIdCanto());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) {
                            ctx.status(200).result("Ese canto ya estaba en la lista.");
                            return;
                        }
                    }
                }
                try (PreparedStatement ps = conexion.prepareStatement(sqlInsert)) {
                    ps.setInt(1, lc.getIdLista());
                    ps.setInt(2, lc.getIdCanto());
                    ps.executeUpdate();
                }
                ctx.status(201).json(lc);
            } catch (Exception e) {
                ctx.status(500).result("Error: " + e.getMessage());
            }
        });

        // ELIMINAR (DELETE) -> http://localhost:3000/lista-canto/1/5
        app.delete("/lista-canto/{idLista}/{idCanto}", ctx -> {
            int idLista = Integer.parseInt(ctx.pathParam("idLista"));
            int idCanto = Integer.parseInt(ctx.pathParam("idCanto"));
            String sql = "DELETE FROM lista_canto WHERE id_lista = ? AND id_canto = ?";
            try (Connection conexion = ConnectionManager.getConnection();
                PreparedStatement ps = conexion.prepareStatement(sql)) {
                ps.setInt(1, idLista);
                ps.setInt(2, idCanto);
                int filasAfectadas = ps.executeUpdate();
                if (filasAfectadas > 0) ctx.result("Canción quitada de la lista correctamente.");
                else ctx.status(404).result("No se encontró ese canto en esa lista.");
            } catch (Exception e) {
                ctx.status(500).result("Error al eliminar: " + e.getMessage());
            }
        });
    }
}

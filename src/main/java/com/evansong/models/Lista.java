package com.evansong.models;

import java.sql.Timestamp;

public class Lista {

    private Integer idLista;
    private String nombre;
    private String descripcion;
    private Timestamp createdAt;
    private Integer idUsuario;

    public Lista() {
    }

    public Lista(Integer idLista, String nombre, String descripcion,
                 Timestamp createdAt, Integer idUsuario) {
        this.idLista = idLista;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.createdAt = createdAt;
        this.idUsuario = idUsuario;
    }

    public Integer getIdLista() {
        return idLista;
    }

    public void setIdLista(Integer idLista) {
        this.idLista = idLista;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
}

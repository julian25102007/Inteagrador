package com.evansong.backend.model;

public class Lista {
    private int idLista;
    private String nombre;
    private String descripcion;
    private String fechaCreacion;
    private int idUsuario;

    public Lista() {}

    public int getIdLista() { return idLista; }
    public void setIdLista(int idLista) { this.idLista = idLista; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
}

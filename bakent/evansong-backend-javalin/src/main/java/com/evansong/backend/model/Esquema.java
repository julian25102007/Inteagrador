package com.evansong.backend.model;

public class Esquema {
    private int idEsquema;
    private String nombre;
    private String fechaCreacion;
    private int idUsuario;

    public Esquema() {}

    public int getIdEsquema() { return idEsquema; }
    public void setIdEsquema(int idEsquema) { this.idEsquema = idEsquema; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
}

package com.evansong.models;

public class TiempoLiturgico {

    private Integer idTiempo;
    private String nombre;

    public TiempoLiturgico() {
    }

    public TiempoLiturgico(Integer idTiempo, String nombre) {
        this.idTiempo = idTiempo;
        this.nombre = nombre;
    }

    public Integer getIdTiempo() {
        return idTiempo;
    }

    public void setIdTiempo(Integer idTiempo) {
        this.idTiempo = idTiempo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}

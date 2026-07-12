package com.evansong.models;

public class MomentoMisa {

    private Integer idMomento;
    private String nombre;

    public MomentoMisa() {
    }

    public MomentoMisa(Integer idMomento, String nombre) {
        this.idMomento = idMomento;
        this.nombre = nombre;
    }

    public Integer getIdMomento() {
        return idMomento;
    }

    public void setIdMomento(Integer idMomento) {
        this.idMomento = idMomento;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}

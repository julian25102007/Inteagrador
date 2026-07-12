package com.evansong.models;

public class ListaCanto {

    private Integer idLista;
    private Integer idCanto;

    public ListaCanto() {
    }

    public ListaCanto(Integer idLista, Integer idCanto) {
        this.idLista = idLista;
        this.idCanto = idCanto;
    }

    public Integer getIdLista() {
        return idLista;
    }

    public void setIdLista(Integer idLista) {
        this.idLista = idLista;
    }

    public Integer getIdCanto() {
        return idCanto;
    }

    public void setIdCanto(Integer idCanto) {
        this.idCanto = idCanto;
    }
}
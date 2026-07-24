package com.evansong.models;

public class DetalleEsquema {

    private Integer idDetalle;
    private Integer idEsquema;
    private Integer idMomento;
    private Integer idCanto;
    private Integer orden;

    public DetalleEsquema() {
    }

    public DetalleEsquema(Integer idDetalle, Integer idEsquema,
                          Integer idMomento, Integer idCanto,
                          Integer orden) {
        this.idDetalle = idDetalle;
        this.idEsquema = idEsquema;
        this.idMomento = idMomento;
        this.idCanto = idCanto;
        this.orden = orden;
    }

    public Integer getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Integer idDetalle) {
        this.idDetalle = idDetalle;
    }

    public Integer getIdEsquema() {
        return idEsquema;
    }

    public void setIdEsquema(Integer idEsquema) {
        this.idEsquema = idEsquema;
    }

    public Integer getIdMomento() {
        return idMomento;
    }

    public void setIdMomento(Integer idMomento) {
        this.idMomento = idMomento;
    }

    public Integer getIdCanto() {
        return idCanto;
    }

    public void setIdCanto(Integer idCanto) {
        this.idCanto = idCanto;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }
}
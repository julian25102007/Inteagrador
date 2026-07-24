package com.evansong.backend.model;

public class DetalleEsquema {
    private int idDetalle;
    private int idEsquema;
    private int idMomento;
    private int idCanto;
    private int orden;

    public DetalleEsquema() {}

    public int getIdDetalle() { return idDetalle; }
    public void setIdDetalle(int idDetalle) { this.idDetalle = idDetalle; }
    public int getIdEsquema() { return idEsquema; }
    public void setIdEsquema(int idEsquema) { this.idEsquema = idEsquema; }
    public int getIdMomento() { return idMomento; }
    public void setIdMomento(int idMomento) { this.idMomento = idMomento; }
    public int getIdCanto() { return idCanto; }
    public void setIdCanto(int idCanto) { this.idCanto = idCanto; }
    public int getOrden() { return orden; }
    public void setOrden(int orden) { this.orden = orden; }
}

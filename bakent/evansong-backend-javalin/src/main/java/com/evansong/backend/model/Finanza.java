package com.evansong.backend.model;

import java.math.BigDecimal;

public class Finanza {
    private int idFinanza;
    private String tipo;
    private BigDecimal monto;
    private String fecha;
    private String concepto;
    private int idUsuario;

    public Finanza() {}

    public int getIdFinanza() { return idFinanza; }
    public void setIdFinanza(int idFinanza) { this.idFinanza = idFinanza; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public String getFecha() { return fecha; }
    public void setFecha(String fecha) { this.fecha = fecha; }
    public String getConcepto() { return concepto; }
    public void setConcepto(String concepto) { this.concepto = concepto; }
    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
}

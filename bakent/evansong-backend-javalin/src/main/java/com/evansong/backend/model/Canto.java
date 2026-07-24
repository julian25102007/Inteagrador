package com.evansong.backend.model;

public class Canto {
    private int idCanto;
    private String titulo;
    private String autor;
    private Integer idTiempo;
    private Integer idMomento;
    private String dificultad;
    private String letra;
    private String urlYoutube;
    private String fechaRegistro;

    public Canto() {}

    public int getIdCanto() { return idCanto; }
    public void setIdCanto(int idCanto) { this.idCanto = idCanto; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public Integer getIdTiempo() { return idTiempo; }
    public void setIdTiempo(Integer idTiempo) { this.idTiempo = idTiempo; }
    public Integer getIdMomento() { return idMomento; }
    public void setIdMomento(Integer idMomento) { this.idMomento = idMomento; }
    public String getDificultad() { return dificultad; }
    public void setDificultad(String dificultad) { this.dificultad = dificultad; }
    public String getLetra() { return letra; }
    public void setLetra(String letra) { this.letra = letra; }
    public String getUrlYoutube() { return urlYoutube; }
    public void setUrlYoutube(String urlYoutube) { this.urlYoutube = urlYoutube; }
    public String getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}

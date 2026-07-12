package com.evansong.dtos.canto;

public class UpdateCantoDTO {

    private Integer idCanto;
    private String titulo;
    private String autor;
    private Integer idTiempo;
    private Integer idMomento;
    private String dificultad;
    private String letra;
    private String urlYoutube;

    public UpdateCantoDTO() {
    }

    public UpdateCantoDTO(Integer idCanto, String titulo, String autor,
                          Integer idTiempo, Integer idMomento,
                          String dificultad, String letra,
                          String urlYoutube) {
        this.idCanto = idCanto;
        this.titulo = titulo;
        this.autor = autor;
        this.idTiempo = idTiempo;
        this.idMomento = idMomento;
        this.dificultad = dificultad;
        this.letra = letra;
        this.urlYoutube = urlYoutube;
    }

    public Integer getIdCanto() {
        return idCanto;
    }

    public void setIdCanto(Integer idCanto) {
        this.idCanto = idCanto;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public Integer getIdTiempo() {
        return idTiempo;
    }

    public void setIdTiempo(Integer idTiempo) {
        this.idTiempo = idTiempo;
    }

    public Integer getIdMomento() {
        return idMomento;
    }

    public void setIdMomento(Integer idMomento) {
        this.idMomento = idMomento;
    }

    public String getDificultad() {
        return dificultad;
    }

    public void setDificultad(String dificultad) {
        this.dificultad = dificultad;
    }

    public String getLetra() {
        return letra;
    }

    public void setLetra(String letra) {
        this.letra = letra;
    }

    public String getUrlYoutube() {
        return urlYoutube;
    }

    public void setUrlYoutube(String urlYoutube) {
        this.urlYoutube = urlYoutube;
    }
}
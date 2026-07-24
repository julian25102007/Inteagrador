package com.evansong.dtos.canto;

public class CantoResponseDTO {

    private Integer idCanto;
    private String titulo;
    private String autor;
    private String tiempoLiturgico;
    private String momentoMisa;
    private String dificultad;
    private String letra;
    private String urlYoutube;

    public CantoResponseDTO() {
    }

    public CantoResponseDTO(Integer idCanto,
                            String titulo,
                            String autor,
                            String tiempoLiturgico,
                            String momentoMisa,
                            String dificultad,
                            String letra,
                            String urlYoutube) {

        this.idCanto = idCanto;
        this.titulo = titulo;
        this.autor = autor;
        this.tiempoLiturgico = tiempoLiturgico;
        this.momentoMisa = momentoMisa;
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

    public String getTiempoLiturgico() {
        return tiempoLiturgico;
    }

    public void setTiempoLiturgico(String tiempoLiturgico) {
        this.tiempoLiturgico = tiempoLiturgico;
    }

    public String getMomentoMisa() {
        return momentoMisa;
    }

    public void setMomentoMisa(String momentoMisa) {
        this.momentoMisa = momentoMisa;
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
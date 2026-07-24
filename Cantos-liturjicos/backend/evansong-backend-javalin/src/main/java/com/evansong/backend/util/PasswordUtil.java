package com.evansong.backend.util;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/** Hashea y verifica contraseñas con PBKDF2WithHmacSHA256 (incluido en el JDK). */
public final class PasswordUtil {

    private static final int ITERACIONES = 65536;
    private static final int LONGITUD_BITS = 256;
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordUtil() {}

    public static String hash(String password) {
        try {
            byte[] salt = new byte[16];
            RANDOM.nextBytes(salt);
            byte[] hash = pbkdf2(password.toCharArray(), salt, ITERACIONES, LONGITUD_BITS);
            return ITERACIONES + ":" + Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo hashear la contraseña", e);
        }
    }

    public static boolean verify(String password, String almacenado) {
        try {
            String[] partes = almacenado.split(":");
            int iteraciones = Integer.parseInt(partes[0]);
            byte[] salt = Base64.getDecoder().decode(partes[1]);
            byte[] hashEsperado = Base64.getDecoder().decode(partes[2]);
            byte[] hashCalculado = pbkdf2(password.toCharArray(), salt, iteraciones, hashEsperado.length * 8);
            return MessageDigest.isEqual(hashEsperado, hashCalculado);
        } catch (Exception e) {
            return false;
        }
    }

    private static byte[] pbkdf2(char[] password, byte[] salt, int iteraciones, int longitudBits) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password, salt, iteraciones, longitudBits);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        return factory.generateSecret(spec).getEncoded();
    }
}

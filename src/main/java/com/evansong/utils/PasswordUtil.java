package com.evansong.utils;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    /**
     * Encriptar contraseña
     */
    public static String hashPassword(String password) {

        return BCrypt.hashpw(password, BCrypt.gensalt());

    }

    /**
     * Comparar contraseña
     */
    public static boolean verifyPassword(
            String password,
            String hash
    ) {

        return BCrypt.checkpw(password, hash);

    }

}